import assert from 'assert';
import { canonicalizeText, canonicalizeCurrency, canonicalizeDateWindow, stringTo32Bytes } from './canonicalize';

console.log("Running canonicalize tests...");

// Test Text Canonicalization
assert.strictEqual(canonicalizeText("  Widget A  ", "Product"), "widget a");
assert.strictEqual(canonicalizeText("Enterprise-Tier 1!", "Product"), "enterprise-tier 1!");
assert.strictEqual(canonicalizeText("na", "Region"), "na");
assert.strictEqual(canonicalizeText("North America", "Region"), "north america");

// Test Currency Canonicalization
assert.strictEqual(canonicalizeCurrency("usd"), "usd");
assert.strictEqual(canonicalizeCurrency(" USD "), "usd");
try {
    canonicalizeCurrency("US");
    assert.fail("Should have thrown for short currency");
} catch (e: any) {
    assert.match(e.message, /ISO 4217/);
}
try {
    canonicalizeCurrency("USDOLLAR");
    assert.fail("Should have thrown for long currency");
} catch (e: any) {
    assert.match(e.message, /ISO 4217/);
}

// Test Date Window
assert.strictEqual(canonicalizeDateWindow("2024-01-01", "2024-12-31"), "2024-01-01/2024-12-31");
try {
    canonicalizeDateWindow("2024/01/01", "2024.12.31");
    assert.fail("Should have thrown for invalid format");
} catch (e: any) {
    assert.match(e.message, /YYYY-MM-DD/);
}

// Test padding to 32 bytes
const bytes = stringTo32Bytes("usd");
assert.strictEqual(bytes.length, 32);
assert.strictEqual(bytes[0], 117); // 'u'
assert.strictEqual(bytes[1], 115); // 's'
assert.strictEqual(bytes[2], 100); // 'd'
assert.strictEqual(bytes[3], 0);

console.log("All canonicalize tests passed.");
