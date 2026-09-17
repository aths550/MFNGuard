import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledMFNGuardContractContract, pureCircuits } from '../contract/src/index.js';
import { StandaloneConfig } from '../bboard-cli/src/config.js';
import { randomBytes } from 'crypto';
import { MidnightWalletProvider } from '@midnight-ntwrk/midnight-js-wallet-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { createLogger } from '../bboard-cli/src/logger.js';

async function run() {
  const config = new StandaloneConfig();
  const logger = await createLogger(config.logDir);
  const testEnv = config.getEnvironment(logger);
  const envConfiguration = await testEnv.start();
  
  // Standalone testenv provides its own genesis seed
  const seed = "5d01e69076ed02220bee456c7d7174322ccfe1bfed28f580418b3b168eedc201";

  const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
  await walletProvider.start();
  
  const zkConfigProvider = new NodeZkConfigProvider<'commit_price' | 'set_buyer_reference' | 'compliance_check' | 'reveal_violation'>(config.zkConfigPath);
  
  const providers = {
    privateStateProvider: levelPrivateStateProvider<string, any>({
      privateStateStoreName: 'auditor-test-state-local',
      signingKeyStoreName: 'auditor-test-keys-local',
      privateStoragePasswordProvider: () => 'Bboard-Test-2026!',
      accountId: seed,
    }),
    publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
    zkConfigProvider: zkConfigProvider,
    proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
    walletProvider: walletProvider,
    midnightProvider: walletProvider,
  };

  console.log(`Deploying contract to local standalone node...`);
  const contract = await deployContract(providers as any, {
    compiledContract: CompiledMFNGuardContractContract,
    privateStateId: 'mfnguard-state-' + Date.now(),
    initialPrivateState: {} as any
  });
  console.log(`Deployed to: ${contract.deployTxData.public.contractAddress}`);

  const auditorSecret = randomBytes(32);
  const wrongSecret = randomBytes(32);
  const classId = randomBytes(32);
  const buyerSalt = randomBytes(32);
  const supplierSalt = randomBytes(32);
  const auditorHash = pureCircuits.compute_auditor_hash(auditorSecret);
  
  console.log(`\n--- STEP 1: Creating class with auditor_hash ---`);
  const tx1 = await contract.callTx.set_buyer_reference(classId, 100n, buyerSalt, auditorHash);
  console.log(`Transaction submitted! Hash: ${tx1.public.txHash}`);

  console.log(`\n--- STEP 2: Supplier commits price ---`);
  const tx2 = await contract.callTx.commit_price(classId, 120n, supplierSalt, auditorHash);
  console.log(`Transaction submitted! Hash: ${tx2.public.txHash}`);

  const paddedPrices = [120n, 0n, 0n, 0n, 0n];
  const paddedSalts = [supplierSalt, new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32)];

  console.log(`\n--- STEP 3: Attempting reveal_violation with WRONG secret ---`);
  try {
    const tx3 = await contract.callTx.reveal_violation(
      classId, 100n, buyerSalt, paddedPrices, paddedSalts, wrongSecret
    );
    console.log(`❌ FAILURE: Wrong secret succeeded! TX Hash: ${tx3.public.txHash}`);
    process.exit(1);
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
    process.exit(1);
  }
}
run().catch(console.error);
