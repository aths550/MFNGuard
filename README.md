# MFNGuard

[![CI/CD](https://github.com/USERNAME/MFNGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/MFNGuard/actions/workflows/ci.yml)

MFNGuard is a privacy-preserving Most-Favored-Nation (MFN) pricing compliance verifier on the Midnight blockchain, written in Compact. It allows buyers to cryptographically verify that they are receiving the best price from a supplier across a specific comparability class, without the supplier ever having to reveal the raw prices of other deals, and without the buyer revealing their own target price directly.

## Deployment Details (Placeholders)
- **Network**: Preprod
- **Contract Address**: `[INSERT CONTRACT ADDRESS HERE]`
- **Live Demo Link**: `[INSERT DEMO LINK HERE]`
- **Demo Video**: `[INSERT VIDEO LINK HERE]`
- **Product Profile**: `[INSERT X PROFILE LINK HERE]`

## Project Overview

In traditional B2B contracts, enforcing an MFN clause requires a costly, invasive third-party audit of the supplier's private ledger. MFNGuard completely automates this using zero-knowledge proofs.

1. **Suppliers** can commit their deal prices anonymously into 5 "slots" per comparability class. The raw prices never leave their device; only cryptographic commitments are stored on-chain.
2. **Buyers** set their reference price (what they are currently paying) as a commitment on-chain.
3. **Cross-Party Data Exchange**: The supplier securely exports an encrypted "Witness Bundle" (containing the raw prices and salts) and shares it out-of-band with the buyer.
4. **Compliance Check**: The buyer imports the bundle locally and runs a ZK proof against the on-chain commitments. The proof verifies that *none* of the supplier's other committed prices in that class are lower than the buyer's price.
5. **Disputes**: If a violation is found, an Auditor can use their private key to decrypt the specific violating deal and enforce the contract, keeping all compliant deals entirely private.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- [Lace Wallet](https://www.lace.io/) browser extension installed and configured for Midnight Testnet/Preprod.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/USERNAME/MFNGuard.git
   cd MFNGuard/mfnguard-app/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env.local` file in the `mfnguard-app/frontend` directory. 
By default, the template connects to the Midnight `preview` testnet. To deploy and connect to **Preprod**, update the endpoints:

```env
# Change from 'preview' to 'preprod' for the Midnight Preprod Network
NEXT_PUBLIC_NETWORK_ID=preprod
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_INDEXER_URL=https://indexer.preprod.midnight.network/api/v4/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.preprod.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://127.0.0.1:6300
```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Ensure your Lace wallet is connected to the same network specified in your `.env.local`.

## Usage Instructions

### Supplier Portal Flow
1. Navigate to the **Supplier Portal**.
2. Enter a **Comparability Class ID** (e.g., `class-a-q3`) and a **Price**. 
3. Click **Commit Price** and sign the transaction in Lace Wallet. 
4. The app polls the blockchain to ensure your transaction is firmly committed.
5. In the "Export Witnesses" section, enter a shared passphrase and download the encrypted witness bundle (`mfnguard-witness-...json`). Send this file and passphrase to the Buyer.

### Buyer Portal Flow
1. Navigate to the **Buyer Portal**.
2. Enter your **Class ID**, your **Price**, and click **Set Reference Price**. Sign the transaction in Lace Wallet. Wait for it to confirm on-chain.
3. Once confirmed, import the witness bundle (`.json` file) sent by the Supplier and enter the shared passphrase.
4. Click **Run Compliance Check**. The app generates a zero-knowledge proof locally verifying if the supplier gave a better price to anyone else in that class.

### Dispute View Flow
1. Navigate to the **Dispute View**.
2. If the compliance check reveals a violation, import the same witness bundle.
3. Enter the Auditor's Private Key (simulated in this MVP for testing purposes).
4. Click **Reveal Violation** to unmask only the specific price that violated the contract.

## Security Limitations (MVP)

> **MVP limitation — fixed slate size:** The current implementation uses a fixed slate size of N=5 slots per comparability class due to current constraints around loops and mapping in the Compact compiler. Suppliers can only commit a maximum of 5 deals per class.

> **MVP limitation — proof server trust assumption:** Compliance checks are computed by a proof server that briefly holds both parties' plaintext prices in memory to generate the ZK proof. It does not persist or log this data, but it is a trusted third party for this specific operation. A production version would replace this with two-party MPC or co-proving, so no single party or server ever holds both secrets simultaneously.
