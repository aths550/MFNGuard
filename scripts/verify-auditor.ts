import { createLogger } from '../bboard-cli/src/logger-utils.js';
import { PreviewRemoteConfig, PreviewTestEnvironment } from '../bboard-cli/src/config.js';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledMFNGuardContractContract, pureCircuits } from '../contract/src/index.js';
import { randomBytes } from 'crypto';

async function run() {
  setNetworkId('preview');
  const config = new PreviewRemoteConfig();
  const logger = await createLogger(config.logDir);
  const testEnv = new PreviewTestEnvironment(logger);
  const envConfiguration = await testEnv.start();
  
  const seed = process.env.PREVIEW_TEST_WALLET_KEY;
  if (!seed) throw new Error("Missing seed");

  const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
  await walletProvider.start();

  console.log('Waiting 10 seconds before starting...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  const zkConfigProvider = new NodeZkConfigProvider<'commit_price' | 'set_buyer_reference' | 'compliance_check' | 'reveal_violation'>(config.zkConfigPath);
  
  const providers = {
    privateStateProvider: levelPrivateStateProvider<string, any>({
      privateStateStoreName: 'auditor-test-state-fixed',
      signingKeyStoreName: 'auditor-test-keys-fixed',
      privateStoragePasswordProvider: () => 'Bboard-Test-2026!',
      accountId: seed,
    }),
    publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
    zkConfigProvider: zkConfigProvider,
    proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
    walletProvider: walletProvider,
    midnightProvider: walletProvider,
  };

  const contractAddress = "fd1b841ba4dff397916eb0ca339574f1f4e276edc8e02ab44459f6951ff638fa";
  console.log(`Joining contract ${contractAddress}...`);
  providers.privateStateProvider.setContractAddress(contractAddress);
  const contract = await findDeployedContract(providers as any, {
    contractAddress,
    compiledContract: CompiledMFNGuardContractContract,
    privateStateId: 'mfnguard-state-' + Date.now(),
    initialPrivateState: {} as any
  });

  const auditorSecret = randomBytes(32);
  const wrongSecret = randomBytes(32);
  const classId = randomBytes(32);
  const buyerSalt = randomBytes(32);
  const supplierSalt = randomBytes(32);
  
  // 1. Set buyer reference (creates the class with auditor hash)
  const auditorHash = pureCircuits.compute_auditor_hash(auditorSecret);
  
  console.log(`\n--- STEP 1: Creating class with auditor_hash ---`);
  let tx1;
  for (let i = 0; i < 60; i++) {
    try {
      tx1 = await contract.callTx.set_buyer_reference(classId, 100n, buyerSalt, auditorHash);
      console.log(`Transaction submitted! Hash: ${tx1.public.txHash}`);
      break;
    } catch (e: any) {
      const errStr = e.message + " " + (e.cause ? String(e.cause) : "");
      console.log(`Waiting for wallet to sync funds... (${i}) [Err: ${errStr.substring(0, 50)}]`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  if (!tx1) process.exit(1);

  console.log(`\n--- STEP 2: Supplier commits price ---`);
  try {
    const tx2 = await contract.callTx.commit_price(classId, 120n, supplierSalt, auditorHash);
    console.log(`Transaction submitted! Hash: ${tx2.public.txHash}`);
  } catch (e: any) {
    console.error("Failed commit_price:", e.message);
    process.exit(1);
  }

  const paddedPrices = [120n, 0n, 0n, 0n, 0n];
  const paddedSalts = [supplierSalt, new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32)];

  console.log(`\n--- STEP 3: Attempting reveal_violation with WRONG secret ---`);
  try {
    const tx3 = await contract.callTx.reveal_violation(
      classId, 100n, buyerSalt, paddedPrices, paddedSalts, wrongSecret
    );
    console.log(`❌ FAILURE: Wrong secret succeeded! TX Hash: ${tx3.public.txHash}`);
  } catch (e: any) {
    console.log(`✅ SUCCESS: Wrong secret was rejected as expected!`);
    console.log(`Caught Error: ${e.message}`);
  }

  console.log(`\n--- STEP 4: Attempting reveal_violation with CORRECT secret ---`);
  try {
    const tx4 = await contract.callTx.reveal_violation(
      classId, 100n, buyerSalt, paddedPrices, paddedSalts, auditorSecret
    );
    console.log(`✅ SUCCESS: Correct secret succeeded! TX Hash: ${tx4.public.txHash}`);
  } catch (e: any) {
    console.log(`❌ FAILURE: Correct secret was rejected!`);
    console.log(`Caught Error: ${e.message}`);
  }

  process.exit(0);
}

run().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
