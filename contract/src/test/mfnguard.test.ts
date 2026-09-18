import { MFNGuardSimulator } from "./mfnguard-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { pureCircuits } from "../managed/mfnguard/contract/index.js";

setNetworkId("undeployed");

describe("MFNGuard smart contract", () => {
  it("allows supplier to commit prices and buyer to set reference, then verifies compliance (compliant case)", () => {
    const simulator = new MFNGuardSimulator();
    const class_id = randomBytes(32);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);

    // Supplier commits 3 prices (2 empty slots)
    const salt1 = randomBytes(32);
    const salt2 = randomBytes(32);
    const salt3 = randomBytes(32);
    const salt_empty = randomBytes(32);

    simulator.commit_price(class_id, 1000n, salt1, auditor_hash);
    simulator.commit_price(class_id, 1200n, salt2, auditor_hash);
    simulator.commit_price(class_id, 1500n, salt3, auditor_hash);

    // Buyer sets reference price to 900 (should be compliant, since buyer price 900 <= min(1000, 1200, 1500))
    const buyer_salt = randomBytes(32);
    simulator.set_buyer_reference(class_id, 900n, buyer_salt, auditor_hash);

    // Perform compliance check
    const supplier_prices = [1000n, 1200n, 1500n, 0n, 0n];
    const supplier_salts = [salt1, salt2, salt3, salt_empty, salt_empty];

    const result = simulator.compliance_check(
      class_id,
      900n,
      buyer_salt,
      supplier_prices,
      supplier_salts,
    );

    expect(result.compliant).toEqual(1n);
    expect(result.discrepancy).toEqual(0n);
  });

  it("identifies a non-compliant case and returns the discrepancy", () => {
    const simulator = new MFNGuardSimulator();
    const class_id = randomBytes(32);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);

    const salt1 = randomBytes(32);
    const salt2 = randomBytes(32);
    const salt_empty = randomBytes(32);

    // Supplier commits a lower price (800) than the buyer has
    simulator.commit_price(class_id, 800n, salt1, auditor_hash);
    simulator.commit_price(class_id, 1000n, salt2, auditor_hash);

    // Buyer has 900
    const buyer_salt = randomBytes(32);
    simulator.set_buyer_reference(class_id, 900n, buyer_salt, auditor_hash);

    const supplier_prices = [800n, 1000n, 0n, 0n, 0n];
    const supplier_salts = [salt1, salt2, salt_empty, salt_empty, salt_empty];

    const result = simulator.compliance_check(
      class_id,
      900n,
      buyer_salt,
      supplier_prices,
      supplier_salts,
    );

    expect(result.compliant).toEqual(0n);
    // Discrepancy is buyer_price - min_price = 900 - 800 = 100
    expect(result.discrepancy).toEqual(100n);
  });

  it("fails verification if a witness does not match the on-chain commitment", () => {
    const simulator = new MFNGuardSimulator();
    const class_id = randomBytes(32);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);

    const salt1 = randomBytes(32);
    const salt_empty = randomBytes(32);

    simulator.commit_price(class_id, 1000n, salt1, auditor_hash);

    const buyer_salt = randomBytes(32);
    simulator.set_buyer_reference(class_id, 900n, buyer_salt, auditor_hash);

    // Provide incorrect price as witness
    const supplier_prices = [1100n, 0n, 0n, 0n, 0n];
    const supplier_salts = [
      salt1,
      salt_empty,
      salt_empty,
      salt_empty,
      salt_empty,
    ];

    expect(() =>
      simulator.compliance_check(
        class_id,
        900n,
        buyer_salt,
        supplier_prices,
        supplier_salts,
      ),
    ).toThrow(/Supplier witness 0 does not match/);
  });

  it("handles sentinel padding correctly with 0 real deals", () => {
    const simulator = new MFNGuardSimulator();
    const class_id = randomBytes(32);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);

    const buyer_salt = randomBytes(32);
    simulator.set_buyer_reference(class_id, 900n, buyer_salt, auditor_hash);

    const supplier_prices = [0n, 0n, 0n, 0n, 0n];
    const supplier_salts = [
      randomBytes(32),
      randomBytes(32),
      randomBytes(32),
      randomBytes(32),
      randomBytes(32),
    ];

    expect(() =>
      simulator.compliance_check(
        class_id,
        900n,
        buyer_salt,
        supplier_prices,
        supplier_salts,
      ),
    ).toThrow(/No supplier prices committed in this class/);
  });

  it("reveal_violation works correctly to find the violating index", () => {
    const simulator = new MFNGuardSimulator();
    const class_id = randomBytes(32);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);

    const salt1 = randomBytes(32);
    const salt2 = randomBytes(32);
    const salt3 = randomBytes(32);
    const salt_empty = randomBytes(32);

    simulator.commit_price(class_id, 1500n, salt1, auditor_hash);
    simulator.commit_price(class_id, 800n, salt2, auditor_hash); // violator
    simulator.commit_price(class_id, 1200n, salt3, auditor_hash);

    const buyer_salt = randomBytes(32);
    simulator.set_buyer_reference(class_id, 900n, buyer_salt, auditor_hash);

    const supplier_prices = [1500n, 800n, 1200n, 0n, 0n];
    const supplier_salts = [salt1, salt2, salt3, salt_empty, salt_empty];

    const result = simulator.reveal_violation(
      class_id,
      900n,
      buyer_salt,
      supplier_prices,
      supplier_salts,
      auditor_secret,
    );

    expect(result.violator_found).toEqual(1n);
    expect(result.violator_price).toEqual(800n);
    expect(result.violator_index).toEqual(1n);
  });

  it("rejects double calls to set_buyer_reference for the same class_id", () => {
    const simulator = new MFNGuardSimulator();
    const class_id = randomBytes(32);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);
    const buyer_salt = randomBytes(32);

    // First call should succeed
    simulator.set_buyer_reference(class_id, 900n, buyer_salt, auditor_hash);

    // Second call should fail
    expect(() =>
      simulator.set_buyer_reference(class_id, 800n, buyer_salt, auditor_hash),
    ).toThrow(/Buyer reference already set/);
  });
});
