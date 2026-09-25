# MFNGuard Project Proposal

## Problem Statement
In traditional B2B contracts, enforcing a Most-Favored-Nation (MFN) clause requires a costly, invasive third-party audit of the supplier's private ledger. Buyers have no way to cryptographically verify they are getting the best price without forcing suppliers to reveal sensitive competitive pricing data of other clients.

## Solution
MFNGuard is a privacy-preserving MFN compliance verifier built on the Midnight blockchain. It leverages Zero-Knowledge proofs (ZK-SNARKs) to completely automate the audit process. 

1. **Suppliers** commit their deal prices anonymously into slots per comparability class. The raw prices never leave their device; only cryptographic commitments are stored on-chain.
2. **Buyers** set their reference price as a commitment on-chain.
3. **Cross-Party Data Exchange**: The supplier securely exports an encrypted "Witness Bundle" (containing the raw prices and salts) and shares it out-of-band with the buyer.
4. **Compliance Check**: The buyer imports the bundle locally and runs a ZK proof against the on-chain commitments. The proof verifies that *none* of the supplier's other committed prices in that class are lower than the buyer's price.

## Value Proposition
By using MFNGuard, B2B enterprises can guarantee contract compliance automatically, removing the need for manual audits while fully preserving the privacy of all involved parties.
