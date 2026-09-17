# <img src="frontend/public/logo.jpg" width="30" height="30" align="top"> MFNGuard

[![CI/CD](https://github.com/aths550/MFNGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/aths550/MFNGuard/actions/workflows/ci.yml)


MFNGuard is a privacy-preserving Most-Favored-Nation (MFN) pricing compliance verifier on the Midnight blockchain, written in Compact. It allows buyers to cryptographically verify that they are receiving the best price from a supplier across a specific comparability class, without the supplier ever having to reveal the raw prices of other deals, and without the buyer revealing their own target price directly.


## Links
- **Live Demo**: [https://mfn-guard-frontend.vercel.app](https://mfn-guard-frontend.vercel.app)
- **Product X Profile**: [https://x.com/MFNGuard](https://x.com/MFNGuard)
- **Demo Video**: [https://www.loom.com/share/b38bbe839e984400ad8c926c84456ec5](https://www.loom.com/share/b38bbe839e984400ad8c926c84456ec5)
- **Deployed Contract (Preview Network)**: `fd1b841ba4dff397916eb0ca339574f1f4e276edc8e02ab44459f6951ff638fa`


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
- [1AM Wallet](https://www.lace.io/) browser extension installed and configured for Midnight Testnet (Preview).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/aths550/MFNGuard.git
   cd MFNGuard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env.local` file in the `frontend` directory. 
By default, the template connects to the Midnight `preview` testnet. Set your deployed contract address here:

```env
NEXT_PUBLIC_NETWORK_ID=preview
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.preview.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://127.0.0.1:6300
```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Ensure your 1AM wallet is connected to the same network specified in your `.env.local`.

## Usage Instructions

### Supplier Portal Flow
1. Navigate to the **Supplier Portal**.
2. Enter a **Comparability Class ID** (e.g., `class-a-q3`) and a **Price**. 
3. Click **Commit Price** and sign the transaction in 1AM Wallet. 
4. The app polls the blockchain to ensure your transaction is firmly committed.
5. In the "Export Witnesses" section, enter a shared passphrase and download the encrypted witness bundle (`mfnguard-witness-...json`). Send this file and passphrase to the Buyer.

### Buyer Portal Flow
1. Navigate to the **Buyer Portal**.
2. Enter your **Class ID**, your **Price**, and click **Set Reference Price**. Sign the transaction in 1AM Wallet. Wait for it to confirm on-chain.
3. Once confirmed, import the witness bundle (`.json` file) sent by the Supplier and enter the shared passphrase.
4. Click **Run Compliance Check**. The app generates a zero-knowledge proof locally verifying if the supplier gave a better price to anyone else in that class.

### Dispute View Flow
1. Navigate to the **Dispute View**.
2. If the compliance check reveals a violation, import the same witness bundle.
3. Enter the Auditor's Private Key (simulated in this MVP for testing purposes).
4. Click **Reveal Violation** to unmask only the specific price that violated the contract.

## Trust Model & Security Considerations (MVP)

> [!WARNING]
> **Proof Server Trust Boundary:** MFNGuard currently relies on a centralized Proof Server to synthesize the zero-knowledge proofs. Because standard Midnight ZK-SNARKs are single-prover, the Proof Server acts as a necessary **Trusted Third Party (TTP)**. 
> 
> When running a Compliance Check or revealing a dispute, the Proof Server receives **both the Supplier's and Buyer's private prices and salts in plaintext**. Furthermore, the `auditor_secret` is resent in plaintext to the proof server on every `reveal_violation` call. 
> 
> **Consequently, the Proof Server operator possesses full visibility into all private data and holds the power to impersonate the Auditor.** Because the `auditor_hash` is immutable once set in a `PriceClass`, a single compromised proof-server session permanently compromises the auditor role for that entire class. 
> 
> A production-ready iteration of MFNGuard must replace this component with either advanced Multi-Party Computation (MPC) or run the Proof Server inside a verifiable Hardware Secure Enclave (e.g., Intel SGX or AWS Nitro) to seal memory and cryptographically attest that no logs are retained. Additionally, production versions should consider a rotating/one-time secret scheme to bound this exposure window.

> [!NOTE]
> **Fixed Slate Size:** The current implementation uses a fixed slate size of N=5 slots per comparability class due to current constraints around loops and mapping in the Compact compiler. Suppliers can only commit a maximum of 5 deals per class.

> [!WARNING]
> **KNOWN GAP - E2E Testing:** The automated `e2e-test.ts` script in the CI pipeline currently only validates environment variable injection and wiring. It **does not** execute a real on-chain transaction flow (`commit_price` -> `compliance_check`). This is because headless transaction execution requires a dedicated, pre-funded test wallet with tDUST, which cannot be reliably funded in an automated CI environment without manual faucet interaction. Do not mistake a passing CI build for real on-chain automated test coverage.
