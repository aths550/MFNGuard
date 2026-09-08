# MFNGuard — MVP Preview Deployment Notes

## Deployment Configuration (MVP Preview v1)

- **Network**: Midnight Preview Testnet
- **Contract Address**: `e61a7676bd4ea2e82b097c6f15f451ce1d0888353bd69479cf7342964eeb9778`
- **Indexer URL**: `https://indexer.preview.midnight.network/api/v4/graphql`
- **Indexer WS URL**: `wss://indexer.preview.midnight.network/api/v4/graphql/ws`
- **Node RPC URL**: `https://rpc.preview.midnight.network`
- **Proof Server**: `http://127.0.0.1:6300` (local, must be running before use)
- **Network ID**: `preview`

## Verified End-to-End Flow (2026-09-08)

1. **Supplier commits price** (e.g. 1000 to class `test-class-b1`) → on-chain commitment stored
2. **Buyer sets reference price** (e.g. 1500 to same class) → on-chain commitment stored
3. **Compliance check** → ZK proof generated locally, result (`compliant` / `discrepancy`) stays **private** in `txData.private`, only the proof is submitted on-chain
4. **Dispute reveal** → Offending slot index and true price revealed, gated by auditor key

## Privacy Confirmation

- The `ComplianceResult` (`compliant`, `discrepancy`) is returned in `txData.private.result` — it is **never** present in `txData.public`
- The public ledger only sees: the zero-knowledge proof that the computation was done honestly, and updates to the contract's state map (commitments, filled flags)
- Raw prices, salts, and compliance outcomes are never written to the blockchain

## Local Prerequisites

- **Lace Wallet** browser extension configured for Midnight Preview
- **Proof Server** running at `http://127.0.0.1:6300` (compact-runtime proof generation)
- **Node.js 18+**

## Cross-Party Data Exchange (Export / Import)

This MVP uses an **Encrypted Payload File** (Option A) to securely transmit witness data from the Supplier to the Buyer without a backend server.

- **Export (Supplier):** Witness data (prices, salts) is encrypted locally using `AES-256-GCM` keyed with a PBKDF2-derived key from a user-provided passphrase. The ciphertext is exported as a `.json` file.
- **Import (Buyer):** The Buyer imports the file and provides the shared passphrase to decrypt the payload locally.
- **Persistence:** Decrypted witnesses are stored in the browser's `localStorage` so they survive page refreshes, solving the reused Class ID fragility.

### ⚠️ Security Limitations & Gaps (Honest Disclosure)

1. **Passphrase Exchange Gap:** This tool currently relies on a shared passphrase to derive the encryption key, but it **does not provide a secure mechanism to exchange that passphrase.** The passphrase must be exchanged out-of-band by the users themselves (e.g., verbally or via Signal). For production, this should be replaced with asymmetric encryption (Buyer's public key → ECDH → AES key) to remove the shared-passphrase problem entirely.
2. **At-Rest `localStorage` Encryption:** To minimize friction during a demo, the decrypted witnesses are persisted to `localStorage` using a static/client-side key scheme. **localStorage encryption in this version protects against casual inspection only — it does not protect against any script with execution access to the page, since the key material is also recoverable client-side.** Real at-rest protection would require re-prompting the user for their passphrase on every page reload to derive the decryption key.

## Frontend .env.local Template

```
NEXT_PUBLIC_NETWORK_ID=preview
NEXT_PUBLIC_CONTRACT_ADDRESS=e61a7676bd4ea2e82b097c6f15f451ce1d0888353bd69479cf7342964eeb9778
NEXT_PUBLIC_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.preview.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://127.0.0.1:6300
```
