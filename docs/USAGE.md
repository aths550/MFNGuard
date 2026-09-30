# MFNGuard Usage Guide

> [!NOTE]
> **Live Demo Deployment (Preview Testnet):** The currently deployed contract on the Midnight Preview network is a public demo. The "Owner Secret" and "Auditor Secret" are deliberately made public so that reviewers and testers can freely create and initialize their own comparability classes under unique labels, and run disputes. In a production deployment, these secrets would be strictly guarded.
>
> **Public demo owner key — testnet only, anyone can use this to initialize comparability classes:**
> **Demo Owner Secret (Hex):** `5d2f35066b6675d8be90b16e1d2308aa2c66b8a93d75018c2f06f97197f77cb7`
> **Demo Owner Hash:** `760ed3fbc5180dfc89feffe4807da373e90a3ca028962fbdfdf498d78bf2eda5`
> *(Contract initialized on-chain in tx 1dbbfab3088eb83b4395807619544d765b8bb8e7101a24799f99faa4be58a32d)*
>
> **Demo Auditor Secret (Hex):** `11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff`
> **Demo Auditor Hash:** `0917b1301c3d31df059dd84381191d6e9d5c4474c15717837001e39bfcd3af38`
> 
> **Class ID Collision Avoidance:** Since class IDs are derived purely from a label hash, two users using the same label (e.g., "Enterprise-Tier") will collide in the public demo. Please prefix your labels with your initials (e.g., "JD-Enterprise-Tier").

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
2. Select a Deal Class (e.g., JD-Enterprise-Tier) and an empty slot.
3. Connect your 1AM wallet.
4. Enter your private deal prices and generate a salt.
5. Click "Commit Price to Ledger". Wait for the transaction to finalize.
6. Your private price is now hashed and committed on-chain.
7. Export your Witness Bundle (this contains your salts and raw prices in plaintext) and send it out-of-band to your buyer. **Note:** The buyer will be able to see all of the prices and salts you committed in this bundle in plaintext.

### Buyer Portal Flow
1. Receive the Witness Bundle from your supplier.
2. Open the Buyer View tab.
3. Import the Witness Bundle received from the supplier.
4. Connect your 1AM wallet.
5. Enter your Class Label, Target Price, and generate a salt.
6. Click "1. Commit My Price". Wait for the transaction to finalize.
7. Click "2. Check Compliance". The app will generate a Zero-Knowledge proof locally to verify if your target price is compliant with the supplier's committed prices.

### Dispute View Flow
1. If the Compliance Check reveals a violation, open the Dispute View tab.
2. Enter the Class Label and the Buyer's Price and Salt.
3. Import the Supplier Witness Bundle.
4. Use the "Demo Auditor Key" or enter the Auditor's Private Key.
5. Click "Reveal Violation". The app will evaluate the proof and reveal only the specific price that violated the contract.

## Troubleshooting
- **Wallet Connection Fails:** Ensure you are on the Midnight Preview network, not Preprod or Devnet.
- **Insufficient Funds / Transaction Rejected:** You need tDUST and tNIGHT. Use the official Midnight Faucet to fund your wallet. If the faucet is rate-limiting, try again later or use a different wallet.
- **ContractTypeError (Mismatched Verifier Keys):** The frontend is trying to interact with an older version of the contract. Ensure your `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` matches the deployed contract.
