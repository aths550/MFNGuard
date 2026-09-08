// Web Crypto API implementations for AES-256-GCM + PBKDF2

export interface EncryptedPayload {
  iv: string; // base64
  salt: string; // base64
  ciphertext: string; // base64
}

// Convert base64 string to Uint8Array
export function base64ToBytes(base64: string): Uint8Array {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

// Convert Uint8Array to base64 string
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Derive an AES-GCM key from a passphrase using PBKDF2
async function deriveKey(passphrase: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt plaintext JSON into the payload format
export async function encryptPayload(plaintext: string, passphrase: string): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  const key = await deriveKey(passphrase, salt);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    enc.encode(plaintext)
  );
  
  return {
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    ciphertext: bytesToBase64(new Uint8Array(encrypted))
  };
}

// Decrypt a payload back to plaintext JSON
export async function decryptPayload(payload: EncryptedPayload, passphrase: string): Promise<string> {
  const ivBytes = base64ToBytes(payload.iv);
  const saltBytes = base64ToBytes(payload.salt);
  const ciphertextBytes = base64ToBytes(payload.ciphertext);
  
  const key = await deriveKey(passphrase, saltBytes);
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes
    },
    key,
    ciphertextBytes
  );
  
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

// A simple static key obfuscator for localStorage (protects against casual inspection only)
const STATIC_LOCAL_KEY_MATERIAL = "mfnguard-casual-inspection-only";

export async function obfuscateForStorage(plaintext: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(STATIC_LOCAL_KEY_MATERIAL),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const salt = enc.encode("static-salt-for-demo");
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 1000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  const iv = new Uint8Array(12); // all zeros for predictable obfuscation
  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return bytesToBase64(new Uint8Array(encrypted));
}

export async function deobfuscateFromStorage(obfuscated: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(STATIC_LOCAL_KEY_MATERIAL),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const salt = enc.encode("static-salt-for-demo");
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 1000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  const iv = new Uint8Array(12);
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBytes(obfuscated));
  return new TextDecoder().decode(decrypted);
}
