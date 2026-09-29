/**
 * Canonicalizes comparability attributes before hashing.
 * 
 * Rules:
 * - Trim whitespace
 * - Unicode NFC normalize
 * - Lowercase text fields (product, region, currency)
 * - ISO 4217 currency codes (must be exactly 3 letters)
 * - ISO 8601 start/end dates for date window (YYYY-MM-DD)
 * - Reject invalid input with a clear message. Never silently pad or guess.
 */

export function canonicalizeText(input: string, fieldName: string): string {
    if (!input || typeof input !== 'string') {
        throw new Error(`${fieldName} must be a valid string.`);
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        throw new Error(`${fieldName} cannot be empty.`);
    }
    return trimmed.normalize('NFC').toLowerCase();
}

export function canonicalizeCurrency(input: string): string {
    const canonical = canonicalizeText(input, 'Currency');
    if (!/^[a-z]{3}$/.test(canonical)) {
        throw new Error(`Currency must be a valid 3-letter ISO 4217 code (e.g., USD, EUR). Received: ${input}`);
    }
    return canonical;
}

export function canonicalizeDate(input: string, fieldName: string): string {
    const trimmed = input?.trim();
    if (!trimmed) {
        throw new Error(`${fieldName} cannot be empty.`);
    }
    // Strict ISO 8601 Date: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new Error(`${fieldName} must be in YYYY-MM-DD format. Received: ${input}`);
    }
    
    // Validate it's an actual calendar date
    const [year, month, day] = trimmed.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day
    ) {
        throw new Error(`${fieldName} is not a valid calendar date. Received: ${input}`);
    }
    return trimmed; // already trimmed, no need to lowercase or NFC dates
}

export function canonicalizeDateWindow(startDate: string, endDate: string): string {
    const start = canonicalizeDate(startDate, 'Start Date');
    const end = canonicalizeDate(endDate, 'End Date');
    
    if (start > end) {
        throw new Error(`Start Date (${start}) cannot be after End Date (${end}).`);
    }
    
    return `${start}/${end}`;
}

// Convert string to exactly 32 bytes for the smart contract (pad with null bytes)
export function stringTo32Bytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    if (encoded.length > 32) {
        throw new Error(`String is too long after encoding (max 32 bytes). Received: ${str}`);
    }
    const bytes = new Uint8Array(32);
    bytes.set(encoded);
    return bytes;
}
