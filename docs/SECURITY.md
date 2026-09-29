# MFNGuard Security & Threat Model

> [!NOTE]
> **Live Demo Deployment (Preview Testnet):** The currently deployed contract on the Midnight Preview network is a public demo. In demo mode the owner secret is public, so the owner check is nominal and anyone can create and initialize their own comparability classes. In a production deployment, the Owner Secret must be kept strictly private so only the authorized owner can create classes.

This document outlines the security architecture, threat model, and known limitations of the MFNGuard v2 contract.

## Roles & Capabilities

MFNGuard strictly enforces authorization across four distinct roles:

1. **Owner**: 
   - **Capabilities**: Can initialize new comparability classes by providing the hashes for the buyer, auditor, and all authorized suppliers for that class.
   - **Trust**: Highly trusted. The owner has the power to dictate who can participate in a class.
2. **Supplier**:
   - **Capabilities**: Can commit a price into their specifically assigned slot within a class, provided they possess the secret key corresponding to their pre-registered supplier hash.
   - **Trust**: Semi-trusted. Expected to truthfully report prices, though cryptographically prevented from spoofing another supplier's slot.
3. **Buyer**:
   - **Capabilities**: Can set their reference price (what they are currently paying) for a class they are assigned to, and run a compliance check locally to verify the supplier's commitments.
   - **Trust**: Untrusted. Their identity is verified via `buyer_hash` when setting the reference price.
4. **Auditor**:
   - **Capabilities**: Can run the `reveal_violation` circuit if a violation exists, using their private key to cryptographically unmask the violating index and price.
   - **Trust**: Trusted for dispute resolution. If the contract is compliant, the auditor cannot unmask any prices.

## Key Derivation & Domain Separation

To prevent replay attacks and context confusion, all commitments are strictly domain-separated:

- **Role Hashes**: Each role generates a high-entropy 32-byte secret key locally. The hash is derived using a specific domain tag (e.g., `TAG_OWNER = 4`, `TAG_SUPPLIER = 5`) via a pure circuit: `persistentHash([TAG, secret])`. Only the hashes are public.
- **Commitments**: Supplier and Buyer price commitments are bound to the specific class context. The hash preimage includes the `class_id` and the `comparability_hash`, preventing a commitment from being replayed in a different class or under different comparability rules. 
  - `persistentHash([TAG_PRICE_COMMIT, class_id, comparability_hash, price, salt])`

## Comparability Rule

The comparability rule enforces that an MFN comparison is only mathematically valid if the goods/services are commercially equivalent. 
- **What it proves**: It proves that the buyer's compliance check and the supplier's commitments were strictly evaluated against the exact same set of canonical attributes (Product, Volume, Region, Term, Currency, Date Window). The `comparability_hash` is irreversibly bound into every price commitment.
- **What it does not prove**: It does not prove the *truth* of the off-chain real-world contracts. It only proves that the cryptographic commitments align with the agreed-upon attributes on-chain.

## Privacy Model

MFNGuard ensures that suppliers never reveal their raw prices to the **public or the blockchain**. The zero-knowledge proof verifies compliance without leaking data on-chain.

> [!WARNING]
> **Witness Bundle Visibility:** The privacy guarantee holds against the public chain. However, to run the local compliance check, the Supplier must securely export an encrypted "Witness Bundle" to the Buyer. **This bundle contains all of the supplier's committed prices and salts for that class in plaintext.** The buyer will see the supplier's other prices. Do not assume the buyer is kept blind to the supplier's numbers.

## Proof Server Visibility

> [!WARNING]
> MFNGuard relies on a centralized Proof Server to synthesize zero-knowledge proofs. During proof generation (e.g., `compliance_check` or `reveal_violation`), the Proof Server receives **both the Supplier's and Buyer's private prices and salts in plaintext**. The Proof Server acts as a Trusted Third Party (TTP) and must be operated in a highly secure, non-logging environment (e.g., a hardware enclave) for production use.

## Known Limitations

We enforce a strict policy of transparency regarding the contract's limitations:

1. **Owner Trust**: The owner is fully trusted. An owner could maliciously register their own hashes for every role in a class, completely subverting the MFN guarantee for that specific class.
2. **Owner-Init Front-Running**: Due to the lack of top-level constructor support in the Compact v0.23 compiler, the contract must be initialized via an exported `init_contract` circuit immediately after deployment. A sophisticated attacker could theoretically front-run this initialization transaction to hijack the contract, requiring a redeployment.
3. **Public-Hash Guessability**: Comparability attributes are canonicalized and hashed, but because the attribute space (e.g., ISO currency codes, regions) is relatively small, the `comparability_hash` is vulnerable to dictionary attacks. The attributes should be considered public, not confidential.
4. **Supplier Omission**: Suppliers can simply withhold or omit committing a lower price to the chain. The cryptographic proofs only verify the prices that were actually committed.
5. **Unfilled Slots**: Empty slots are skipped during compliance checks. To prevent a false sense of security, the `committed_count` is explicitly returned and must be displayed in the UI so the buyer knows how many prices were actually checked.
6. **Fixed 5-Slot Limit**: Due to current compiler constraints around loops, the contract is hardcoded to support exactly 5 supplier slots per class. 
7. **Version Migration**: This is the v2 contract. The original 90 tester wallets used the v1 contract (as documented in `USERS.md`).
8. **Public Demo Keys**: To facilitate public testing on the Preview Testnet, several highly-privileged secrets are published in plaintext in our documentation and UI. **Anyone holding these keys can act as the Owner or Auditor.** Do not use these keys in a production environment or for any real data.
   - **Demo Owner Secret**: `67723b1a3dc4038d2784944d00ce5969ad70492c29fb37a2ea1207ee1aebd9d7` (Hash: `537a8dab4449e56b19b31d8b8882ebd9cb22fa83273ef26d5750fc52bae5d172`)
   - **Demo Auditor Secret**: `11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff` (Hash: `0917b1301c3d31df059dd84381191d6e9d5c4474c15717837001e39bfcd3af38`)
