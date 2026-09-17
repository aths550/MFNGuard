import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { PreviewRemoteConfig, PreviewTestEnvironment } from './config.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { waitForUnshieldedFunds } from './wallet-utils.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

async function checkBalance() {
  const logger = { info: console.log, error: console.error, debug: console.log } as any;
  const config = new PreviewRemoteConfig();
  const testEnv = new PreviewTestEnvironment(logger);
  setNetworkId('preview');
  const envConfiguration = await testEnv.start();
  const seed = "5d01e69076ed02220bee456c7d7174322ccfe1bfed28f580418b3b168eedc201";
  
  const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
  await walletProvider.start();
  
  const unshieldedState = await waitForUnshieldedFunds(logger, walletProvider.wallet, envConfiguration, unshieldedToken());
  const nightBalance = unshieldedState.balances[unshieldedToken().raw];
  
  console.log("Current balance:", nightBalance);
  process.exit(0);
}
checkBalance().catch(console.error);
