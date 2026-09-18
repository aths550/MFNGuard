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
  if (!seed) {
    console.error("Missing PREVIEW_TEST_WALLET_KEY environment variable");
    process.exit(1);
  }

  const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
  await walletProvider.start();

  console.log('Waiting 10 seconds before starting to allow wallet connection...');
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

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

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
  // Polling loop to wait for wallet history sync completion on Preview
  for (let i = 0; i < 60; i++) {
    try {
      tx1 = await contract.callTx.set_buyer_reference(classId, 900n, buyerSalt, auditorHash);
      console.log(`Transaction submitted! Hash: ${tx1.public.txHash}`);
      break;
    } catch (e: any) {
      const errStr = e.message + " " + (e.cause ? String(e.cause) : "");
      console.log(`Waiting for wallet to sync funds... (${i}) [Err: ${errStr.substring(0, 50)}]`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  if (!tx1) {
    console.error("Failed to sync wallet funds on Preview network in 10 minutes.");
    process.exit(1);
  }

  console.log(`\n--- STEP 2: Supplier commits price ---`);
  try {
    const tx2 = await contract.callTx.commit_price(classId, 800n, supplierSalt, auditorHash);
    console.log(`Transaction submitted! Hash: ${tx2.public.txHash}`);
  } catch (e: any) {
    console.error("Failed commit_price:", e.message);
    process.exit(1);
  }

  const paddedPrices = [800n, 0n, 0n, 0n, 0n];
  const paddedSalts = [supplierSalt, new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32)];

  console.log(`\n--- STEP 3: Attempting reveal_violation with WRONG secret ---`);
  try {
    const tx3 = await contract.callTx.reveal_violation(
      classId, 900n, buyerSalt, paddedPrices, paddedSalts, wrongSecret
    );
    console.error(`❌ FAILURE: Wrong secret succeeded! TX Hash: ${tx3.public.txHash}`);
    process.exit(1);
  } catch (e: any) {
    if (e.message.includes("Unauthorized auditor")) {
      console.log(`✅ SUCCESS: Wrong secret was rejected as expected with "Unauthorized auditor"!`);
    } else {
      console.error(`❌ FAILURE: Wrong secret failed for wrong reason: ${e.message}`);
      process.exit(1);
    }
  }

  console.log(`\n--- STEP 4: Attempting reveal_violation with CORRECT secret ---`);
  try {
    const tx4 = await contract.callTx.reveal_violation(
      classId, 900n, buyerSalt, paddedPrices, paddedSalts, auditorSecret
    );
    console.log(`✅ SUCCESS: Correct secret succeeded! TX Hash: ${tx4.public.txHash}`);
  } catch (e: any) {
    if (e.message.includes("No violation exists to reveal")) {
      console.log(`✅ SUCCESS: Correct secret passed auditor check, failed gracefully on "No violation exists to reveal"!`);
    } else {
      console.error(`❌ FAILURE: Correct secret was rejected for wrong reason: ${e.message}`);
      process.exit(1);
    }
  }

  console.log("\nAll E2E checks passed!");
  process.exit(0);
}

run().catch(e => {
  console.error("Fatal E2E error:", e);
  process.exit(1);
});
