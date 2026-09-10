import { MidnightWalletProvider } from '@midnight-ntwrk/midnight-js-wallet-provider';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { randomBytes } from 'crypto';

const generateAndPrint = async () => {
  const seed = toHex(randomBytes(32));
  console.log('Generated Seed:', seed);
  
  const envConfiguration = {
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300'
  };
  
  try {
    const walletProvider = await MidnightWalletProvider.build(
      { info: () => {}, error: console.error, debug: () => {}, trace: () => {}, warn: () => {}, fatal: console.error },
      envConfiguration,
      seed
    );
    
    await walletProvider.start();
    const unshieldedState = await walletProvider.wallet.unshielded.state;
    
    // Subscribe to get address
    unshieldedState.subscribe(state => {
      console.log('Preview Address:', state.address);
      process.exit(0);
    });
  } catch (e) {
    console.error(e);
  }
};

generateAndPrint();
