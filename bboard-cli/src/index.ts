import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import { type Logger } from 'pino';
import { type Config, StandaloneConfig } from './config.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { waitForUnshieldedFunds } from './wallet-utils.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledMFNGuardContractContract } from '../../contract/src/index.js';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

const originalConsoleError = console.error;
const originalConsoleLog = console.log;

const formatEffectError = (arg: any) => {
  if (arg && typeof arg === 'object') {
    try {
      // If it has an explicit toString that isn't just [object Object], use it
      if (typeof arg.toString === 'function' && arg.toString() !== '[object Object]') {
        // Axios errors or custom errors
        return arg.toString();
      }
      return JSON.stringify(arg, (key, value) => {
        if (typeof value === 'bigint') return value.toString() + 'n';
        if (value instanceof Error) return { message: value.message, stack: value.stack, name: value.name };
        return value;
      }, 2);
    } catch (e) {
      return arg;
    }
  }
  return arg;
};

console.error = (...args) => {
  originalConsoleError(...args.map(formatEffectError));
};
console.log = (...args) => {
  originalConsoleLog(...args.map(formatEffectError));
};

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
};

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<string | undefined> => {
  if (config instanceof StandaloneConfig) {
    return '0000000000000000000000000000000000000000000000000000000000000001';
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return toHex(randomBytes(32));
      case '2':
        return await rli.question('Enter your wallet seed: ');
      case '3':
        logger.info('Exiting...');
        return undefined;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, testEnv: TestEnvironment, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  const providersToBeStopped: MidnightWalletProvider[] = [];
  try {
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);
    const seed = await buildWallet(config, rli, logger);
    if (seed === undefined) {
      return;
    }
    const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
    providersToBeStopped.push(walletProvider);
    const walletFacade: WalletFacade = walletProvider.wallet;

    await walletProvider.start();

    const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfiguration, unshieldedToken());
    const nightBalance = unshieldedState.balances[unshieldedToken().raw];
    if (nightBalance === undefined) {
      logger.info('No funds received, exiting...');
      return;
    }
    logger.info(`Your NIGHT wallet balance is: ${nightBalance}`);

    const zkConfigProvider = new NodeZkConfigProvider<'commit_price' | 'set_buyer_reference' | 'compliance_check' | 'reveal_violation'>(config.zkConfigPath);
    
    const providers = {
      privateStateProvider: levelPrivateStateProvider<string, any>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => 'Bboard-Test-2026!',
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };

    logger.info('Deploying MFNGuard contract...');
    const deployOptions = {
      compiledContract: CompiledMFNGuardContractContract,
      privateStateId: 'mfnguard-state',
      initialPrivateState: {} as any,
    } as any;

    logger.info(`Deploy Options (excluding compiledContract): ${JSON.stringify({ ...deployOptions, compiledContract: '[Omitted for brevity]' }, null, 2)}`);

    const deployedContract = await deployContract(providers as any, deployOptions);

    logger.info(`\n========================================`);
    logger.info(`Successfully deployed MFNGuard contract to Preview!`);
    logger.info(`Contract Address: ${deployedContract.deployTxData.public.contractAddress}`);
    logger.info(`========================================\n`);

  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.debug(`${e.stack}`);
    } else {
      logger.error(`Found error (unknown type)`);
    }
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } finally {
      for (const wallet of providersToBeStopped) {
        logger.info('Stopping wallet...');
        await wallet.stop();
      }
      if (testEnv) {
        logger.info('Stopping test environment...');
        await testEnv.shutdown();
      }
    }
  }
};
