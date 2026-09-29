import { describe, it, expect } from 'vitest';
import { 
    canonicalizeText, 
    canonicalizeCurrency, 
    canonicalizeDate, 
    canonicalizeDateWindow,
    stringTo32Bytes
} from './canonicalize.js';

describe('canonicalizeText', () => {
    it('trims whitespace', () => {
        expect(canonicalizeText('  hello  ', 'Field')).toBe('hello');
    });
    
    it('lowercases text', () => {
        expect(canonicalizeText('HELLO World', 'Field')).toBe('hello world');
    });
    
    it('NFC normalizes text', () => {
        const nfd = 'Am\u00e9lie'; // 'Amélie' using precomposed character
        const decomposed = 'Ame\u0301lie'; // 'Amélie' using combining character
        expect(canonicalizeText(decomposed, 'Field')).toBe(nfd.toLowerCase());
    });
    
    it('rejects empty input', () => {
        expect(() => canonicalizeText('   ', 'Field')).toThrow('Field cannot be empty.');
    });
});

describe('canonicalizeCurrency', () => {
    it('accepts valid ISO codes', () => {
        expect(canonicalizeCurrency('USD')).toBe('usd');
        expect(canonicalizeCurrency('  eur  ')).toBe('eur');
    });
    
    it('rejects invalid ISO codes', () => {
        expect(() => canonicalizeCurrency('US')).toThrow(/must be a valid 3-letter ISO/);
        expect(() => canonicalizeCurrency('US DOLLAR')).toThrow(/must be a valid 3-letter ISO/);
    });
});

describe('canonicalizeDate', () => {
    it('accepts valid YYYY-MM-DD dates', () => {
        expect(canonicalizeDate('2024-05-15', 'Date')).toBe('2024-05-15');
    });
    
    it('rejects malformed dates', () => {
        expect(() => canonicalizeDate('2024/05/15', 'Date')).toThrow(/must be in YYYY-MM-DD format/);
        expect(() => canonicalizeDate('15-05-2024', 'Date')).toThrow(/must be in YYYY-MM-DD format/);
    });
    
    it('rejects invalid calendar dates', () => {
        expect(() => canonicalizeDate('2024-02-30', 'Date')).toThrow(/not a valid calendar date/);
        expect(() => canonicalizeDate('2023-02-29', 'Date')).toThrow(/not a valid calendar date/); // Not leap year
    });
});

describe('canonicalizeDateWindow', () => {
    it('formats a valid window', () => {
        expect(canonicalizeDateWindow('2024-01-01', '2024-12-31')).toBe('2024-01-01/2024-12-31');
    });
    
    it('rejects start date after end date', () => {
        expect(() => canonicalizeDateWindow('2024-12-31', '2024-01-01')).toThrow(/cannot be after End Date/);
    });
});

describe('stringTo32Bytes', () => {
    it('converts small strings correctly', () => {
        const bytes = stringTo32Bytes('usd');
        expect(bytes.length).toBe(32);
        expect(bytes[0]).toBe(117); // 'u'
        expect(bytes[1]).toBe(115); // 's'
        expect(bytes[2]).toBe(100); // 'd'
        expect(bytes[3]).toBe(0);
    });
    
    it('rejects strings that are too long', () => {
        const longStr = 'a'.repeat(33);
        expect(() => stringTo32Bytes(longStr)).toThrow(/too long after encoding/);
    });
});
