# MFNGuard Usage Guide

## Local Execution
To run MFNGuard locally:
1. Ensure you have Node.js (v18+) and the 1AM Wallet extension installed and configured for Midnight Testnet (Preview).
2. Ensure you have test funds (tDUST and tNIGHT) in your Preview wallet.
3. Clone the repo, then run `npm install` in both the `contract` and `frontend` directories.
4. Run `npm run build` in the `contract` directory.
5. Copy the `.env.local.example` to `.env.local` in the `frontend` directory.
6. Run `npm run dev` in the `frontend` directory.
7. Open `http://localhost:3000` in your browser.

## Walkthroughs

### Supplier Portal Flow
1. Open the Supplier View tab.
2. Select a Deal Class (e.g., Enterprise Tier).
3. Connect your 1AM wallet.
4. Enter your 5 private deal prices.
5. Click "Commit Prices to Blockchain". Wait for the transaction to finalize.
6. Your private prices are now hashed and committed on-chain.
7. Export your Witness Bundle (this contains your salts and raw prices) and send it out-of-band to your buyer.

### Buyer Portal Flow
1. Receive the Witness Bundle from your supplier.
2. Open the Buyer View tab.
3. Select the corresponding Deal Class.
4. Connect your 1AM wallet.
5. Enter your Target Price (the price you want to verify against the MFN).
6. Click "Submit Reference Price". Wait for the transaction to finalize.
7. Upload the Witness Bundle received from the supplier.
8. Click "Run Compliance Check". The app will generate a Zero-Knowledge proof locally to verify if your target price is compliant with the supplier's committed prices.

### Dispute View Flow
1. If the Compliance Check reveals a violation, open the Dispute View tab.
2. Select the corresponding Deal Class.
3. Import the Witness Bundle.
4. Enter the Auditor's Private Key (provided out-of-band for the MVP).
5. Click "Reveal Violation". The app will decrypt and reveal only the specific price that violated the contract.

## Troubleshooting
- **Wallet Connection Fails:** Ensure you are on the Midnight Preview network, not Preprod or Devnet.
- **Insufficient Funds / Transaction Rejected:** You need tDUST and tNIGHT. Use the official Midnight Faucet to fund your wallet. If the faucet is rate-limiting, try again later or use a different wallet.
- **ContractTypeError (Mismatched Verifier Keys):** The frontend is trying to interact with an older version of the contract. Ensure your `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` matches the deployed contract.
