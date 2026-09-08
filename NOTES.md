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

## Frontend .env.local Template

```
NEXT_PUBLIC_NETWORK_ID=preview
NEXT_PUBLIC_CONTRACT_ADDRESS=e61a7676bd4ea2e82b097c6f15f451ce1d0888353bd69479cf7342964eeb9778
NEXT_PUBLIC_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.preview.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://127.0.0.1:6300
```
