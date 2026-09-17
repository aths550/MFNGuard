import pino from 'pino';

// Seed for the E2E test wallet (must be funded on preview)
// Provided via GitHub Actions secrets
const TEST_SEED = process.env.PREVIEW_TEST_WALLET_KEY;
if (!TEST_SEED) throw new Error('PREVIEW_TEST_WALLET_KEY is not set in environment');

async function runE2E() {
  const logger = pino({ level: 'info' });
  logger.info('Starting Headless E2E Smoke Test');

  try {
    const contractAddressHex = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddressHex) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');

    logger.info('Environment configuration validated successfully.');
    logger.info(`Target Contract: ${contractAddressHex}`);
    
    // KNOWN GAP: This script currently only validates environment wiring, not on-chain behavior.
    // It DOES NOT execute an actual commit_price -> compliance_check flow on the live Preview network.
    // Reason: Executing transactions headless requires a dedicated, pre-funded test wallet with tDUST,
    // which cannot be reliably funded in an automated CI environment without manual faucet interaction. 
    // Do not mistake a successful exit code here for real on-chain test coverage.
    logger.warn('KNOWN GAP: Skipping actual transaction execution due to lack of funded test wallet.');
    logger.info('Configuration check passed.');
    
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'E2E test failed');
    process.exit(1);
  }
}

runE2E();
