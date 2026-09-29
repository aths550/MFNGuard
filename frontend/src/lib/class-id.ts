import { bytesToHex } from './crypto';

/**
 * Derives a fixed 32-byte class ID from a human-readable label.
 * The domain tag "mfnguard_class:" prevents collisions with other hashing contexts.
 * 
 * Note: Since class IDs are derived purely from a label hash, two owners using the
 * same label would collide. As documented in docs/USAGE.md, we recommend users prefix
 * labels with their initials (e.g., "JD-Enterprise-Tier") to avoid concurrent collisions
 * in the public demo.
 */
export const deriveClassId = async (label: string): Promise<string> => {
    if (!/^[a-zA-Z0-9_-]+$/.test(label)) {
        throw new Error("Class ID label must contain only alphanumeric characters, underscores, and dashes.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(`mfnguard_class:${label.toLowerCase()}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return bytesToHex(hashArray);
};
