# Deployment Guide

This document outlines the standard operating procedure for deploying the MFNGuard smart contract to a live Midnight testnet environment (currently `preview`).

## Prerequisites
- Node.js (v20+)
- A Midnight wallet seed funded with tDUST on the Midnight Preview network

## Deployment Steps

### 1. Run the Deployment Script
Execute the CLI deployment script against the live network. This deploys the uninitialized contract.

```bash
cd bboard-cli
npm run preview-remote -- deploy
```
*The script will prompt for your wallet seed or use `DEPLOYER_SEED` from your environment. Save the resulting Contract Address.*

### 2. Initialize the Contract
Run the initialization step to lock the contract to a new demo owner key and authorize it.

```bash
cd bboard-cli
npm run preview-remote -- init
```
*The script will prompt for the contract address (defaulting to the latest). It will generate a fresh Owner Secret, call `init_contract`, and verify the on-chain read-back matches the expected hash.*

### 3. Update Configuration
After successful deployment and initialization, you must update the following locations with the new **Contract Address**:

- `README.md` (Update the network/contract section)
- `frontend/.env.local` (Set `NEXT_PUBLIC_CONTRACT_ADDRESS`)
- `.github/workflows/ci.yml` (If applicable)

### 4. Update Documentation
- **`docs/USAGE.md`**: Update the "Demo Owner Key" reference to the newly generated public hash and private scalar (if intended for a public demo).
- **`docs/USERS.md` / `LAUNCH_USERS.md`**: Ensure legacy wallets are clearly labeled as testing the previous `v1` version, while marking the new deployment as `v2`.
