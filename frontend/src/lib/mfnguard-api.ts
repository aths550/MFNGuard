import { CompiledMFNGuardContractContract } from 'mfnguard-contract';
import { Contract, pureCircuits, type ComplianceResult, type PriceClass, type Ledger, type DisputeResult } from 'mfnguard-contract';
import { type ContractAddress, fromHex, toHex, type ChargedState, type StateValue } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import { findDeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import {
  type MidnightProvider,
  type PrivateStateProvider,
  type ProofProvider,
  type PublicDataProvider,
  type WalletProvider,
  type ZKConfigProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Transaction, type FinalizedTransaction, type Binding, type Proof, type SignatureEnabled, type TransactionId } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';

export type MFNGuardProviders = {
  readonly privateStateProvider: PrivateStateProvider;
  readonly publicDataProvider: PublicDataProvider;
  // TS2344: Type 'unknown' does not satisfy the constraint 'string'.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly zkConfigProvider: ZKConfigProvider<any>;
  readonly proofProvider: ProofProvider;
  readonly walletProvider: WalletProvider;
  readonly midnightProvider: MidnightProvider;
};

// TS2769: No overload matches this call. Argument of type 'MFNGuardProviders' is not assignable to parameter of type 'ContractProviders<Contract<unknown, Witnesses<unknown>>, ...>'.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeployedMFNGuardContract = FoundContract<Contract<any, any>>;

export function extractResult<T>(txData: unknown, circuitName: string): T {
    if (typeof txData !== 'object' || txData === null) {
        throw new Error(`Unexpected transaction result in ${circuitName}: expected object, got ${typeof txData}`);
    }
    
    // Check if it matches { private: { result: T } }
    if ('private' in txData && typeof txData.private === 'object' && txData.private !== null) {
        const priv = txData.private as Record<string, unknown>;
        if ('result' in priv && priv.result !== undefined) {
            return priv.result as T;
        }
    }
    
    // Check if it matches { result: T }
    if ('result' in txData && (txData as Record<string, unknown>).result !== undefined) {
        return (txData as Record<string, unknown>).result as T;
    }
    
    throw new Error(`Transaction result missing expected payload for circuit ${circuitName}`);
}

export interface DeployedMFNGuardAPI {
  readonly deployedContractAddress: ContractAddress;

  init_contract: (
    owner_hash: Uint8Array,
  ) => Promise<unknown>;

  initialize_class: (
    owner_secret: Uint8Array,
    class_id: Uint8Array,
    buyer_hash: Uint8Array,
    auditor_hash: Uint8Array,
    supplier_hashes: Uint8Array[],
    comparability_hash: Uint8Array
  ) => Promise<void>;

  commit_price: (class_id: Uint8Array, supplier_secret: Uint8Array, slot_index: bigint, price: bigint, salt: Uint8Array) => Promise<void>;
  set_buyer_reference: (class_id: Uint8Array, buyer_secret: Uint8Array, price: bigint, salt: Uint8Array) => Promise<void>;
  compliance_check: (
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[],
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array
  ) => Promise<ComplianceResult>;
  reveal_violation: (
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[],
    auditor_secret: Uint8Array,
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array
  ) => Promise<DisputeResult>;
  
  compute_auditor_hash: (secret: Uint8Array) => Promise<Uint8Array>;
  compute_owner_hash: (secret: Uint8Array) => Promise<Uint8Array>;
  compute_supplier_hash: (secret: Uint8Array) => Promise<Uint8Array>;
  compute_comparability_hash: (
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array
  ) => Promise<Uint8Array>;
}

const mfnguardPrivateStateKey = 'mfnguard-private-state';

export class MFNGuardAPI implements DeployedMFNGuardAPI {
  public readonly providers: MFNGuardProviders;

  private constructor(
    public readonly deployedContract: DeployedMFNGuardContract,
    providers: MFNGuardProviders,
    private readonly logger?: Logger,
  ) {
    this.providers = providers;
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
  }

  readonly deployedContractAddress: ContractAddress;

  async init_contract(owner_hash: Uint8Array): Promise<unknown> {
    this.logger?.info('init_contract');
    const txData = await this.deployedContract.callTx.init_contract(owner_hash);
    this.logger?.trace({ transactionAdded: { circuit: 'init_contract', txHash: txData.public.txHash } });
    return txData;
  }

  async initialize_class(
    owner_secret: Uint8Array,
    class_id: Uint8Array,
    buyer_hash: Uint8Array,
    auditor_hash: Uint8Array,
    supplier_hashes: Uint8Array[],
    comparability_hash: Uint8Array
  ): Promise<void> {
    this.logger?.info('initialize_class');
    const txData = await this.deployedContract.callTx.initialize_class(owner_secret, class_id, buyer_hash, auditor_hash, supplier_hashes, comparability_hash);
    this.logger?.trace({ transactionAdded: { circuit: 'initialize_class', txHash: txData.public.txHash } });
  }

  async commit_price(class_id: Uint8Array, supplier_secret: Uint8Array, slot_index: bigint, price: bigint, salt: Uint8Array): Promise<void> {
    this.logger?.info('commit_price');
    const txData = await this.deployedContract.callTx.commit_price(class_id, supplier_secret, slot_index, price, salt);
    this.logger?.trace({ transactionAdded: { circuit: 'commit_price', txHash: txData.public.txHash } });
  }

  async set_buyer_reference(class_id: Uint8Array, buyer_secret: Uint8Array, price: bigint, salt: Uint8Array): Promise<void> {
    this.logger?.info('set_buyer_reference');
    const txData = await this.deployedContract.callTx.set_buyer_reference(class_id, buyer_secret, price, salt);
    this.logger?.trace({ transactionAdded: { circuit: 'set_buyer_reference', txHash: txData.public.txHash } });
  }

  /**
   * Helper function to get the state of a class from the blockchain
   * Note: Need to import `ledger` from the generated contract code
   */
  async get_class_state(class_id: Uint8Array, ledgerFn: (state: ChargedState | StateValue) => Ledger): Promise<PriceClass | null> {
    const state = await this.providers.publicDataProvider.queryContractState(this.deployedContractAddress);
    if (!state) {
      return null;
    }
    const ledgerState = ledgerFn(state.data);
    if (ledgerState.classes.member(class_id)) {
      return ledgerState.classes.lookup(class_id);
    }
    return null;
  }

  async compliance_check(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[],
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array
  ): Promise<ComplianceResult> {
    this.logger?.info('compliance_check');
    const txData = await this.deployedContract.callTx.compliance_check(
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts,
      product,
      volume,
      region,
      term,
      currency,
      date_window
    );
    this.logger?.trace({ transactionAdded: { circuit: 'compliance_check', txHash: txData.public.txHash } });

    // Explicitly log the txData object to the browser console for empirical verification
    if (process.env.NODE_ENV === 'development') {

    }

    return extractResult<ComplianceResult>(txData, 'compliance_check');
  }

  async reveal_violation(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[],
    auditor_secret: Uint8Array,
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array
  ): Promise<DisputeResult> {
    this.logger?.info('reveal_violation');
    const txData = await this.deployedContract.callTx.reveal_violation(
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts,
      auditor_secret,
      product,
      volume,
      region,
      term,
      currency,
      date_window
    );
    this.logger?.trace({ transactionAdded: { circuit: 'reveal_violation', txHash: txData.public.txHash } });
    return extractResult<DisputeResult>(txData, 'reveal_violation');
  }

  async compute_auditor_hash(secret: Uint8Array): Promise<Uint8Array> {
    return pureCircuits.compute_auditor_hash(secret);
  }

  async compute_owner_hash(secret: Uint8Array): Promise<Uint8Array> {
    return pureCircuits.compute_owner_hash(secret);
  }

  async compute_supplier_hash(secret: Uint8Array): Promise<Uint8Array> {
    return pureCircuits.compute_supplier_hash(secret);
  }

  async compute_comparability_hash(
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array
  ): Promise<Uint8Array> {
    return pureCircuits.compute_comparability_hash(
      product,
      volume,
      region,
      term,
      currency,
      date_window
    );
  }

  static async join(providers: MFNGuardProviders, contractAddress: ContractAddress, logger?: Logger): Promise<MFNGuardAPI> {
    logger?.info({ joinContract: { contractAddress } });

    providers.privateStateProvider.setContractAddress(contractAddress);
    let initialPrivateState = await providers.privateStateProvider.get(mfnguardPrivateStateKey);
    if (!initialPrivateState) {
      initialPrivateState = {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deployedContract = await findDeployedContract<Contract<any, any>>(providers, {
      contractAddress,
      compiledContract: CompiledMFNGuardContractContract,
      privateStateId: mfnguardPrivateStateKey,
      initialPrivateState,
    });

    return new MFNGuardAPI(deployedContract, providers, logger);
  }
}

export const initializeProviders = async (connectedAPI: ConnectedAPI, logger?: Logger): Promise<MFNGuardProviders> => {
  const config = await connectedAPI.getConfiguration();
  // Ensure that proof server URL is ONLY read from env var as requested by user.
  const proofServerUrl = process.env.NEXT_PUBLIC_PROOF_SERVER_URL;
  if (!proofServerUrl) throw new Error('NEXT_PUBLIC_PROOF_SERVER_URL must be defined');

  // CONSTANT ALLOWLIST FOR PROOF SERVER to constrain trust boundary
  const ALLOWED_PROOF_SERVERS = [
    'http://127.0.0.1:6300',
    'http://localhost:6300',
    'http://127.0.0.1:6300/',
    'http://localhost:6300/',
    // In production, add your officially hosted trusted proof server here:
    // 'https://proof.mfnguard.app'
  ];

  if (!ALLOWED_PROOF_SERVERS.includes(proofServerUrl)) {
    throw new Error(`Security Violation: Proof server ${proofServerUrl} is not in the trusted allowlist! This prevents sending sensitive data to arbitrary servers.`);
  }

  // Currently we use a local path or window.location.origin for zkConfig (the browser ZKIR keys).
  // Next.js will need to serve these from /zkir and /keys in the public dir.
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider(zkConfigPath, fetch.bind(window));
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inMemoryMFNGuardPrivateStateProvider = inMemoryPrivateStateProvider<string, any>();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  return {
    privateStateProvider: inMemoryMFNGuardPrivateStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(proofServerUrl, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(
      process.env.NEXT_PUBLIC_INDEXER_URL || config.indexerUri,
      process.env.NEXT_PUBLIC_INDEXER_WS_URL || config.indexerWsUri
    ),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
        try {
          logger?.info({ tx, ttl }, 'Balancing transaction via wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            'signature',
            'proof',
            'binding',
            fromHex(received.tx),
          );
        } catch (e) {
          logger?.error({ error: e }, 'Error balancing transaction via wallet');
          throw e;
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        const txIdentifiers = tx.identifiers();
        const txId = txIdentifiers[0]; // Return the first transaction ID
        logger?.info({ txIdentifiers }, 'Submitted transaction via wallet');
        return txId;
      },
    },
  };
};

export const getMFNGuardAPI = async (providers: MFNGuardProviders, logger?: Logger): Promise<MFNGuardAPI> => {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "08841fbeb992574bbc5444d0d6056e11a5c348e515238588a956eec858df75ec";
  return MFNGuardAPI.join(providers, contractAddress, logger);
};
