import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { MidnightWalletProvider } from '@midnight-ntwrk/midnight-js-wallet-provider';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledMFNGuardContractContract } from './src/index.js';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

// Preview Endpoints
const envConfiguration = {
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  proofServer: 'http://127.0.0.1:6300' // Using local proof server endpoint
};

export const run = async (): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  try {
    console.log("=== MFNGuard Preview Deployer ===");
    const seed = await rli.question('Enter your Preview Wallet Seed (32 hex bytes): ');
    
    if (!seed || seed.length !== 64) {
      console.error("Invalid seed. Must be 64 hex characters.");
      return;
    }

    console.log(`Connecting wallet with seed...`);
    const walletProvider = await MidnightWalletProvider.build(
      { info: console.log, error: console.error, debug: console.log, trace: console.log, warn: console.warn, fatal: console.error } as any,
      envConfiguration,
      seed
    );

    await walletProvider.start();

    // Verify funds
    const unshieldedState = await walletProvider.wallet.unshielded.state;
    const balances = await unshieldedState.toPromise().then((s: any) => s.balances);
    const nightBalance = balances[unshieldedToken().raw] || 0n;
    
    if (nightBalance === 0n) {
      console.error('No tNIGHT funds in this wallet! Please fund via Discord Faucet.');
      return;
    }
    
    console.log(`tNIGHT wallet balance is: ${nightBalance}`);

    const zkConfigProvider = new NodeZkConfigProvider<'commit_price' | 'set_buyer_reference' | 'compliance_check' | 'reveal_violation'>('./src/managed/mfnguard');
    
    const providers = {
      privateStateProvider: levelPrivateStateProvider<string, any>({
        privateStateStoreName: 'deployer-state',
        signingKeyStoreName: `deployer-state-signing-keys`,
        privateStoragePasswordProvider: () => 'Bboard-Test-2026!',
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };

    console.log('Deploying MFNGuard contract...');
    const deployedContract = await deployContract(providers as any, {
      compiledContract: CompiledMFNGuardContractContract,
      args: []
    });

    console.log(`\n========================================`);
    console.log(`Successfully deployed MFNGuard contract to Preview!`);
    console.log(`Contract Address: ${deployedContract.deployTxData.public.contractAddress}`);
    console.log(`========================================\n`);

  } catch (e) {
    console.error(`Error deploying contract:`, e);
  } finally {
    rli.close();
    process.exit(0);
  }
};

run();
