# MFNGuard

MFNGuard is a privacy-preserving Most-Favored-Nation (MFN) pricing compliance verifier on the Midnight blockchain, written in Compact.

## Security Limitations (MVP)

> **MVP limitation — fixed slate size:** The current implementation uses a fixed slate size of N=5 slots per comparability class due to current constraints around loops and mapping in the Compact compiler. Suppliers can only commit a maximum of 5 deals per class.

> **MVP limitation — proof server trust assumption:** compliance checks are computed by a proof server that briefly holds both parties' plaintext prices in memory to generate the ZK proof. It does not persist or log this data, but it is a trusted third party for this specific operation. A production version would replace this with two-party MPC or co-proving, so no single party or server ever holds both secrets simultaneously.
