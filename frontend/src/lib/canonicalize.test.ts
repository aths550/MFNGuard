import { describe, it, expect } from 'vitest';
import { canonicalizeText, canonicalizeCurrency, canonicalizeDateWindow, stringTo32Bytes } from './canonicalize';

describe('canonicalizeText', () => {
    it('lowercases and trims text', () => {
        expect(canonicalizeText('  Widget A  ', 'Product')).toBe('widget a');
        expect(canonicalizeText('Enterprise-Tier 1!', 'Product')).toBe('enterprise-tier 1!');
        expect(canonicalizeText('na', 'Region')).toBe('na');
        expect(canonicalizeText('North America', 'Region')).toBe('north america');
    });
});

describe('canonicalizeCurrency', () => {
    it('accepts valid 3-letter currency', () => {
        expect(canonicalizeCurrency('usd')).toBe('usd');
        expect(canonicalizeCurrency(' USD ')).toBe('usd');
    });

    it('throws for short or long currencies', () => {
        expect(() => canonicalizeCurrency('US')).toThrow(/ISO 4217/);
        expect(() => canonicalizeCurrency('USDOLLAR')).toThrow(/ISO 4217/);
    });
});

describe('canonicalizeDateWindow', () => {
    it('accepts correct format', () => {
        expect(canonicalizeDateWindow('2024-01-01', '2024-12-31')).toBe('2024-01-01/2024-12-31');
    });

    it('throws for invalid format', () => {
        expect(() => canonicalizeDateWindow('2024/01/01', '2024.12.31')).toThrow(/YYYY-MM-DD/);
    });
});

describe('stringTo32Bytes', () => {
    it('pads to 32 bytes correctly', () => {
        const bytes = stringTo32Bytes('usd');
        expect(bytes.length).toBe(32);
        expect(bytes[0]).toBe(117); // 'u'
        expect(bytes[1]).toBe(115); // 's'
        expect(bytes[2]).toBe(100); // 'd'
        expect(bytes[3]).toBe(0);
    });
});
