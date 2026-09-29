import { pureCircuits } from '../../../../contract/src/managed/mfnguard/contract/index.js';

// Convert hex string to Uint8Array (Midnight expects 32 bytes)
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length !== 64) {
    throw new Error('Hex string must be exactly 64 characters (32 bytes).');
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate a high-entropy 32-byte secret key
export function generateSecretKey(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(32));
}

// Thin wrappers around contract pure hash circuits
export function computeOwnerHash(secret: Uint8Array): Uint8Array {
  return new Uint8Array(pureCircuits.compute_owner_hash(secret));
}

export function computeSupplierHash(secret: Uint8Array): Uint8Array {
  return new Uint8Array(pureCircuits.compute_supplier_hash(secret));
}

export function computeBuyerHash(secret: Uint8Array): Uint8Array {
  return new Uint8Array(pureCircuits.compute_buyer_hash(secret));
}

export function computeAuditorHash(secret: Uint8Array): Uint8Array {
  return new Uint8Array(pureCircuits.compute_auditor_hash(secret));
}

export function computeComparabilityHash(
    product: Uint8Array,
    volume: bigint,
    region: Uint8Array,
    term: bigint,
    currency: Uint8Array,
    dateWindow: Uint8Array
): Uint8Array {
  return new Uint8Array(pureCircuits.compute_comparability_hash(
      product, volume, region, term, currency, dateWindow
  ));
}

