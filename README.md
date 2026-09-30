# <img src="frontend/public/logo.jpg" width="30" height="30" align="top"> MFNGuard

[![CI/CD](https://github.com/aths550/MFNGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/aths550/MFNGuard/actions/workflows/ci.yml)


MFNGuard is a privacy-preserving Most-Favored-Nation (MFN) pricing compliance verifier on the Midnight blockchain, written in Compact. It allows buyers to cryptographically verify that they are receiving the best price from a supplier across a specific comparability class, without the supplier ever having to reveal the raw prices of other deals, and without the buyer revealing their own target price directly.


## Links
- **Live Demo**: [https://mfn-guard-frontend.vercel.app](https://mfn-guard-frontend.vercel.app)
- **Product X Profile**: [https://x.com/MFNGuard](https://x.com/MFNGuard)
- **Demo Video (Original)**: [https://www.loom.com/share/7cbfa417d4b14824abbc301881347c2b](https://www.loom.com/share/7cbfa417d4b14824abbc301881347c2b)
- **Demo Video (Updated)**: [https://www.loom.com/share/7941111f64f5447eb3df1ff00d7b1d97](https://www.loom.com/share/7941111f64f5447eb3df1ff00d7b1d97)
- **Deployed Contract (Preview Network)**: `231587782ae8da84e3ac88234efb7d72a2ba6069466ea9414bf3e0bd527a96f1`
- **Tester Wallets (Preview)**: [docs/USERS.md](docs/USERS.md)
- **Level 6 Tester Wallets (Preview)**: [LAUNCH_USERS.md](LAUNCH_USERS.md)
- **Tester Feedback**: [docs/FEEDBACK.md](docs/FEEDBACK.md)
- **Security & Threat Model**: [docs/SECURITY.md](docs/SECURITY.md)

## Network & Contract
Network: Midnight Preview
Contract Address: 231587782ae8da84e3ac88234efb7d72a2ba6069466ea9414bf3e0bd527a96f1
Explorer: https://explorer.preview.midnight.network
Contract owner-initialized on 2026-09-30 (tx 1dbbfab3088eb83b4395807619544d765b8bb8e7101a24799f99faa4be58a32d).

*Abandoned test deployments: `510c34676f00ac52e39168f888a6b5a0eab965d7d0781a7bf9836a84e237dd71`, `08841fbeb...`, `88b72d1c0d76...`*


## Project Overview

> [!NOTE]
> **Live Demo Deployment (Preview Testnet):** The currently deployed contract on the Midnight Preview network is a public demo. The "Owner Secret" and "Auditor Secret" are deliberately made public so that reviewers and testers can freely create and initialize their own comparability classes under unique labels, and resolve disputes. In a production deployment, these secrets would be strictly guarded. The expected Demo hashes are:
> - **Demo Owner Hash**: `0bad71924aff1b5d88376dd518005fa09d08c85892bb3e45e49202beac618a86`
> - **Demo Auditor Hash**: `0917b1301c3d31df059dd84381191d6e9d5c4474c15717837001e39bfcd3af38`

In traditional B2B contracts, enforcing an MFN clause requires a costly, invasive third-party audit of the supplier's private ledger. MFNGuard completely automates this using zero-knowledge proofs.

1. **Suppliers** can commit their deal prices anonymously into 5 "slots" per comparability class. The raw prices never leave their device; only cryptographic commitments are stored on-chain.
2. **Buyers** set their reference price (what they are currently paying) as a commitment on-chain.
3. **Cross-Party Data Exchange**: The supplier securely exports a "Witness Bundle" (containing the raw prices and salts) and shares it out-of-band with the buyer.
4. **Compliance Check**: The buyer imports the bundle locally and runs a ZK proof against the on-chain commitments. The proof verifies that *none* of the supplier's other committed prices in that class are lower than the buyer's price.
5. **Disputes**: If a violation is found, an Auditor can use their private key and the supplier/buyer witness data to mathematically unmask the specific violating deal and enforce the contract, keeping all compliant deals entirely private.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- [1AM Wallet](https://www.lace.io/) browser extension installed and configured for Midnight Testnet (Preview).
- The app targets the Midnight Preview network, so testers need a Preview wallet with test funds.

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
2. Enter a **Class Label**, select an empty **Slot Index**, and enter a **Price** alongside comparability attributes. 
3. Click **Commit Price to Ledger** and sign the transaction in 1AM Wallet. 
4. The app polls the blockchain to ensure your transaction is firmly committed.
5. In the "Export Witnesses" section, click to download the plaintext witness bundle (`mfnguard-witness-...json`). Send this file to the Buyer securely out-of-band.

### Buyer Portal Flow
1. Navigate to the **Buyer Portal**.
2. Import the witness bundle (`.json` file) sent by the Supplier.
3. Enter your **Class Label**, your **Price**, and click **1. Commit My Price**. Sign the transaction in 1AM Wallet. Wait for it to confirm on-chain.
4. Click **2. Check Compliance**. The app generates a zero-knowledge proof locally verifying if the supplier gave a better price to anyone else in that class.

### Dispute View Flow
1. Navigate to the **Dispute View**.
2. Import the supplier's witness bundle.
3. Enter the Auditor's Private Key (or click "Use public demo auditor key"), the Class Label, and Buyer data.
4. Click **Reveal Violation** to unmask only the specific price that violated the contract.

## Testers & Feedback

MFNGuard was tested by real users on the Midnight Preview network (not Preprod) between 14 and 24 Sep 2026.

| Metric | Result |
| :--- | :--- |
| Unique tester wallets (Preview, unshielded) | 70 |
| Feedback form responses | 79 |
| Average clarity rating | 4.89 / 5 |
| Compliance Check result made sense | 77 of 79 |
| Would use for real B2B pricing agreements | 71 Yes, 8 Maybe, 0 No |

The wallet list is in [docs/USERS.md](docs/USERS.md) and can be checked against the deployed contract via https://explorer.preview.midnight.network or the indexer at https://indexer.preview.midnight.network/api/v4/graphql.

What we heard: testers asked for more UI polish and graphics, and one reported that effects and cards overshadowed the content on mobile.

All responses and the changes made in response are tracked in [docs/FEEDBACK.md](docs/FEEDBACK.md).

## Trust Model & Security Considerations (MVP)

> [!WARNING]
> **Proof Server Trust Boundary:** MFNGuard currently relies on a centralized Proof Server to synthesize the zero-knowledge proofs. Because standard Midnight ZK-SNARKs are single-prover, the Proof Server acts as a necessary **Trusted Third Party (TTP)**. 
> 
> When running a Compliance Check or revealing a dispute, the Proof Server receives **both the Supplier's and Buyer's private prices and salts in plaintext**. Furthermore, the `auditor_secret` is resent in plaintext to the proof server on every `reveal_violation` call. 
> 
> **Mitigation in Place:** The frontend implements an `ALLOWED_PROOF_SERVERS` client-side allowlist check before initializing the Midnight SDK. This strictly prevents accidental misconfigurations from routing private inputs to unauthorized domains. However, because this is a client-side check, it does not stop a determined attacker who can manually edit or bypass the shipped JavaScript.
> 
> **Production Recommendation:** A production-ready iteration of MFNGuard must replace this component with either advanced Multi-Party Computation (MPC) or run the Proof Server inside a verifiable Hardware Secure Enclave (e.g., Intel SGX or AWS Nitro) to seal memory and cryptographically attest that no logs are retained. 

> [!NOTE]
> **Fixed Slate Size:** The current implementation uses a fixed slate size of N=5 slots per comparability class due to current constraints around loops and mapping in the Compact compiler. Suppliers can only commit a maximum of 5 deals per class.

> [!WARNING]
> **KNOWN GAP - E2E Testing Volatility:** The automated `e2e-test.ts` script in the CI pipeline is fully wired to execute a real on-chain transaction flow (`commit_price` -> `set_buyer_reference` -> `reveal_violation`) and explicitly asserts on-chain rejections (e.g., halting double-calls). 
> 
> However, headless transaction execution requires a dedicated test wallet with `tDUST` to pay network fees. Because the Midnight Preview testnet faucet is often heavily rate-limited or unresponsive in automated CI environments, the script is configured to gracefully exit `0` rather than fail the build if it detects `Insufficient Funds`. Therefore, a passing CI build does not mathematically guarantee that the full on-chain pipeline was executed on that specific run, but rather that the TypeScript wiring remains structurally sound.

> [!IMPORTANT]
> **Circuit Updates Require Fresh Deployment:** If you modify the `mfnguard.compact` circuit code in any way, the resulting verifier keys will change upon compilation (`npm run compact`). The frontend will immediately crash with a `ContractTypeError` (mismatched verifier keys) if it tries to connect to the old deployed contract.
> **Going forward, any circuit change requires you to:**
> 1. Deploy a FRESH instance of the updated contract to Preview and capture its new contract address.
> 2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` consistently everywhere (Vercel environment variables, `.github/workflows/ci.yml`, and local `.env.local`).
> 3. Redeploy the frontend on Vercel so it picks up the new environment variables.

## Privacy Model
MFNGuard ensures that suppliers never reveal their raw prices to the public or to the blockchain. The zero-knowledge proof verifies compliance without leaking data on-chain. In the event of a dispute, only the designated Auditor can decrypt the violating deal using their private key.

> [!WARNING]
> **Witness Bundle Visibility:** The privacy guarantee holds against the public chain. However, to run the local compliance check, the Supplier must securely export a "Witness Bundle" to the Buyer. **This bundle contains all of the supplier's committed prices and salts for that class in plaintext.** The buyer will see the supplier's other prices.

The Proof Server acts as a trust boundary (as detailed above) and currently has visibility into private data during proof generation.

## Level 6 Users
For the list of 20 distinct Level 6 user wallet addresses, please see [LAUNCH_USERS.md](LAUNCH_USERS.md).
