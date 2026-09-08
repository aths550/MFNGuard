import { CompiledMFNGuardContractContract } from '../../../contract/src/index';
import { Contract, type ComplianceResult, type DisputeResult } from 'mfnguard-contract';
import { type ContractAddress, fromHex, toHex } from '@midnight-ntwrk/compact-runtime';
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
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Transaction, type FinalizedTransaction, type Binding, type Proof, type SignatureEnabled, type TransactionId } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';

export type MFNGuardProviders = {
  readonly privateStateProvider: PrivateStateProvider;
  readonly publicDataProvider: PublicDataProvider;
  readonly zkConfigProvider: ZKConfigProvider<any>;
  readonly proofProvider: ProofProvider;
  readonly walletProvider: WalletProvider;
  readonly midnightProvider: MidnightProvider;
};

export type DeployedMFNGuardContract = FoundContract<Contract<any, any>>;

export interface DeployedMFNGuardAPI {
  readonly deployedContractAddress: ContractAddress;

  commit_price: (class_id: Uint8Array, price: bigint, salt: Uint8Array) => Promise<void>;
  set_buyer_reference: (class_id: Uint8Array, price: bigint, salt: Uint8Array) => Promise<void>;
  compliance_check: (
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[]
  ) => Promise<ComplianceResult>;
  reveal_violation: (
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[]
  ) => Promise<DisputeResult>;
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

  async commit_price(class_id: Uint8Array, price: bigint, salt: Uint8Array): Promise<void> {
    this.logger?.info('commit_price');
    const txData = await this.deployedContract.callTx.commit_price(class_id, price, salt);
    this.logger?.trace({ transactionAdded: { circuit: 'commit_price', txHash: txData.public.txHash } });
  }

  async set_buyer_reference(class_id: Uint8Array, price: bigint, salt: Uint8Array): Promise<void> {
    this.logger?.info('set_buyer_reference');
    const txData = await this.deployedContract.callTx.set_buyer_reference(class_id, price, salt);
    this.logger?.trace({ transactionAdded: { circuit: 'set_buyer_reference', txHash: txData.public.txHash } });
  }

  /**
   * Helper function to get the state of a class from the blockchain
   * Note: Need to import `ledger` from the generated contract code
   */
  async get_class_state(class_id: Uint8Array, ledgerFn: any): Promise<any> {
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
    supplier_salts: Uint8Array[]
  ): Promise<ComplianceResult> {
    this.logger?.info('compliance_check');
    const txData = await this.deployedContract.callTx.compliance_check(
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts
    );
    this.logger?.trace({ transactionAdded: { circuit: 'compliance_check', txHash: txData.public.txHash } });

    // Explicitly log the txData object to the browser console for empirical verification
    console.log("==================== MFNGuard txData Verification ====================");
    console.log("Full txData object:", txData);
    console.log("txData.public:", txData.public);
    console.log("txData.private:", (txData as any).private);
    console.log("======================================================================");

    return (txData as any).private?.result || (txData as any).result;
  }

  async reveal_violation(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[]
  ): Promise<DisputeResult> {
    this.logger?.info('reveal_violation');
    const txData = await this.deployedContract.callTx.reveal_violation(
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts
    );
    this.logger?.trace({ transactionAdded: { circuit: 'reveal_violation', txHash: txData.public.txHash } });
    return (txData as any).private?.result || (txData as any).result;
  }

  static async join(providers: MFNGuardProviders, contractAddress: ContractAddress, logger?: Logger): Promise<MFNGuardAPI> {
    logger?.info({ joinContract: { contractAddress } });

    providers.privateStateProvider.setContractAddress(contractAddress);
    let initialPrivateState = await providers.privateStateProvider.get(mfnguardPrivateStateKey);
    if (!initialPrivateState) {
      initialPrivateState = {};
    }

    const deployedContract = await findDeployedContract<Contract<any>>(providers, {
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

  // Currently we use a local path or window.location.origin for zkConfig (the browser ZKIR keys).
  // Next.js will need to serve these from /zkir and /keys in the public dir.
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider(zkConfigPath, fetch.bind(window));
  
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
