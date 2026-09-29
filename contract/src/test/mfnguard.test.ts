import { MFNGuardSimulator } from "./mfnguard-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { pureCircuits } from "../managed/mfnguard/contract/index.js";

setNetworkId("undeployed");

describe("MFNGuard smart contract adversarial tests", () => {
  const empty_bytes = new Uint8Array(32);
  const max_price = 100000000000n;

  // Helper to setup a valid class for later tests
  function setupValidClass(
    simulator: MFNGuardSimulator,
    existing_owner_secret?: Uint8Array,
  ) {
    const owner_secret = existing_owner_secret || randomBytes(32);
    if (!existing_owner_secret) {
      const owner_hash = pureCircuits.compute_owner_hash(owner_secret);
      simulator.init_contract(owner_hash);
    }

    const class_id = randomBytes(32);
    const buyer_secret = randomBytes(32);
    const buyer_hash = pureCircuits.compute_buyer_hash(buyer_secret);
    const auditor_secret = randomBytes(32);
    const auditor_hash = pureCircuits.compute_auditor_hash(auditor_secret);
    const supplier_secrets = [
      randomBytes(32),
      randomBytes(32),
      randomBytes(32),
      randomBytes(32),
      randomBytes(32),
    ];
    const supplier_hashes = supplier_secrets.map((s) =>
      pureCircuits.compute_supplier_hash(s),
    );

    const comparability = {
      product: randomBytes(32),
      volume: randomBytes(32),
      region: randomBytes(32),
      term: randomBytes(32),
      currency: randomBytes(32),
      date_window: randomBytes(32),
    };
    const comparability_hash = pureCircuits.compute_comparability_hash(
      comparability.product,
      comparability.volume,
      comparability.region,
      comparability.term,
      comparability.currency,
      comparability.date_window,
    );

    simulator.initialize_class(
      owner_secret,
      class_id,
      buyer_hash,
      auditor_hash,
      supplier_hashes,
      comparability_hash,
    );

    return {
      class_id,
      owner_secret,
      buyer_secret,
      buyer_hash,
      auditor_secret,
      auditor_hash,
      supplier_secrets,
      supplier_hashes,
      comparability,
      comparability_hash,
    };
  }

  describe("initialize_class", () => {
    it("non-owner initialize_class rejected", () => {
      const simulator = new MFNGuardSimulator();
      const real_owner_secret = randomBytes(32);
      const owner_hash = pureCircuits.compute_owner_hash(real_owner_secret);
      simulator.init_contract(owner_hash);

      const wrong_owner_secret = randomBytes(32);
      const class_id = randomBytes(32);
      expect(() =>
        simulator.initialize_class(
          wrong_owner_secret,
          class_id,
          randomBytes(32),
          randomBytes(32),
          [
            randomBytes(32),
            randomBytes(32),
            randomBytes(32),
            randomBytes(32),
            randomBytes(32),
          ],
          randomBytes(32),
        ),
      ).toThrow(/Unauthorized: Not the contract owner/);
    });

    it("re-initializing an existing class rejected", () => {
      const simulator = new MFNGuardSimulator();
      const {
        class_id,
        owner_secret,
        buyer_hash,
        auditor_hash,
        supplier_hashes,
        comparability_hash,
      } = setupValidClass(simulator);

      expect(() =>
        simulator.initialize_class(
          owner_secret,
          class_id,
          buyer_hash,
          auditor_hash,
          supplier_hashes,
          comparability_hash,
        ),
      ).toThrow(/Class already exists/);
    });

    it("zero buyer hash rejected", () => {
      const simulator = new MFNGuardSimulator();
      const owner_secret = randomBytes(32);
      simulator.init_contract(pureCircuits.compute_owner_hash(owner_secret));
      const supplier_hashes = [
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
      ];
      expect(() =>
        simulator.initialize_class(
          owner_secret,
          randomBytes(32),
          empty_bytes,
          randomBytes(32),
          supplier_hashes,
          randomBytes(32),
        ),
      ).toThrow(/Buyer hash cannot be zero/);
    });

    it("zero auditor hash rejected", () => {
      const simulator = new MFNGuardSimulator();
      const owner_secret = randomBytes(32);
      simulator.init_contract(pureCircuits.compute_owner_hash(owner_secret));
      const supplier_hashes = [
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
      ];
      expect(() =>
        simulator.initialize_class(
          owner_secret,
          randomBytes(32),
          randomBytes(32),
          empty_bytes,
          supplier_hashes,
          randomBytes(32),
        ),
      ).toThrow(/Auditor hash cannot be zero/);
    });

    it("zero supplier hash rejected", () => {
      const simulator = new MFNGuardSimulator();
      const owner_secret = randomBytes(32);
      simulator.init_contract(pureCircuits.compute_owner_hash(owner_secret));
      const bad_suppliers = [
        empty_bytes,
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
      ];
      expect(() =>
        simulator.initialize_class(
          owner_secret,
          randomBytes(32),
          randomBytes(32),
          randomBytes(32),
          bad_suppliers,
          randomBytes(32),
        ),
      ).toThrow(/Supplier hash 0 cannot be zero/);
    });

    it("duplicate supplier hashes rejected", () => {
      const simulator = new MFNGuardSimulator();
      const owner_secret = randomBytes(32);
      simulator.init_contract(pureCircuits.compute_owner_hash(owner_secret));
      const s0 = randomBytes(32);
      const dup_suppliers = [
        s0,
        s0,
        randomBytes(32),
        randomBytes(32),
        randomBytes(32),
      ];
      expect(() =>
        simulator.initialize_class(
          owner_secret,
          randomBytes(32),
          randomBytes(32),
          randomBytes(32),
          dup_suppliers,
          randomBytes(32),
        ),
      ).toThrow(/Supplier hashes must be distinct/);
    });
  });

  describe("commit_price", () => {
    it("unauthorized supplier rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id } = setupValidClass(simulator);
      const unauthorized_secret = randomBytes(32);
      expect(() =>
        simulator.commit_price(
          class_id,
          unauthorized_secret,
          0n,
          1000n,
          randomBytes(32),
        ),
      ).toThrow(/Unauthorized supplier for this slot/);
    });

    it("wrong slot for a valid supplier rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, supplier_secrets } = setupValidClass(simulator);
      expect(() =>
        simulator.commit_price(
          class_id,
          supplier_secrets[0],
          1n,
          1000n,
          randomBytes(32),
        ),
      ).toThrow(/Unauthorized supplier for this slot/);
    });

    it("slot already filled rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, supplier_secrets } = setupValidClass(simulator);
      simulator.commit_price(
        class_id,
        supplier_secrets[0],
        0n,
        1000n,
        randomBytes(32),
      );
      expect(() =>
        simulator.commit_price(
          class_id,
          supplier_secrets[0],
          0n,
          1000n,
          randomBytes(32),
        ),
      ).toThrow(/Slot already filled/);
    });

    it("price 0 rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, supplier_secrets } = setupValidClass(simulator);
      expect(() =>
        simulator.commit_price(
          class_id,
          supplier_secrets[1],
          1n,
          0n,
          randomBytes(32),
        ),
      ).toThrow(/Price must be strictly positive/);
    });

    it("price at the sanity limit rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, supplier_secrets } = setupValidClass(simulator);
      expect(() =>
        simulator.commit_price(
          class_id,
          supplier_secrets[1],
          1n,
          max_price,
          randomBytes(32),
        ),
      ).toThrow(/Price exceeds sanity limit/);
    });

    it("price above the sanity limit rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, supplier_secrets } = setupValidClass(simulator);
      expect(() =>
        simulator.commit_price(
          class_id,
          supplier_secrets[1],
          1n,
          max_price + 100n,
          randomBytes(32),
        ),
      ).toThrow(/Price exceeds sanity limit/);
    });
  });

  describe("set_buyer_reference", () => {
    it("wrong buyer secret rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id } = setupValidClass(simulator);
      const wrong_secret = randomBytes(32);
      expect(() =>
        simulator.set_buyer_reference(
          class_id,
          wrong_secret,
          1000n,
          randomBytes(32),
        ),
      ).toThrow(/Unauthorized buyer/);
    });

    it("class does not exist rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { buyer_secret } = setupValidClass(simulator);
      expect(() =>
        simulator.set_buyer_reference(
          randomBytes(32),
          buyer_secret,
          1000n,
          randomBytes(32),
        ),
      ).toThrow(/Class does not exist/);
    });

    it("second call rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret } = setupValidClass(simulator);
      simulator.set_buyer_reference(
        class_id,
        buyer_secret,
        1000n,
        randomBytes(32),
      );
      expect(() =>
        simulator.set_buyer_reference(
          class_id,
          buyer_secret,
          1200n,
          randomBytes(32),
        ),
      ).toThrow(/Buyer reference already set/);
    });
  });

  describe("compliance_check", () => {
    it("no supplier committed rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      const b_price = 1000n;
      simulator.set_buyer_reference(class_id, buyer_secret, b_price, b_salt);
      expect(() =>
        simulator.compliance_check(
          class_id,
          b_price,
          b_salt,
          [0n, 0n, 0n, 0n, 0n],
          [empty_bytes, empty_bytes, empty_bytes, empty_bytes, empty_bytes],
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/No supplier prices committed/);
    });

    it("wrong comparability attribute (product)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          randomBytes(32),
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Comparability attributes do not match/);
    });

    it("wrong comparability attribute (volume)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          comparability.product,
          randomBytes(32),
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Comparability attributes do not match/);
    });

    it("wrong comparability attribute (region)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          comparability.product,
          comparability.volume,
          randomBytes(32),
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Comparability attributes do not match/);
    });

    it("wrong comparability attribute (term)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          comparability.product,
          comparability.volume,
          comparability.region,
          randomBytes(32),
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Comparability attributes do not match/);
    });

    it("wrong comparability attribute (currency)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          randomBytes(32),
          comparability.date_window,
        ),
      ).toThrow(/Comparability attributes do not match/);
    });

    it("wrong comparability attribute (date_window)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          randomBytes(32),
        ),
      ).toThrow(/Comparability attributes do not match/);
    });

    it("tampered supplier price rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const tampered_s_prices = [900n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          tampered_s_prices,
          s_salts,
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Supplier witness 0 does not match/);
    });

    it("tampered supplier salt rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const tampered_s_salts = [
        randomBytes(32),
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1000n,
          b_salt,
          s_prices,
          tampered_s_salts,
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Supplier witness 0 does not match/);
    });

    it("tampered buyer price rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.compliance_check(
          class_id,
          1200n,
          b_salt,
          s_prices,
          s_salts,
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Buyer witness does not match commitment/);
    });

    it("buyer reference not set rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      expect(() =>
        simulator.compliance_check(
          class_id,
          900n,
          randomBytes(32),
          [1200n, 0n, 0n, 0n, 0n],
          [s_salt, empty_bytes, empty_bytes, empty_bytes, empty_bytes],
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Buyer reference not set/);
    });

    it("non-compliant happy path (with partial slots and committed_count)", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);

      const s_salt0 = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 800n, s_salt0);

      const s_salt1 = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[1], 1n, 1200n, s_salt1);

      const result_nc = simulator.compliance_check(
        class_id,
        1000n,
        b_salt,
        [800n, 1200n, 0n, 0n, 0n],
        [s_salt0, s_salt1, empty_bytes, empty_bytes, empty_bytes],
        comparability.product,
        comparability.volume,
        comparability.region,
        comparability.term,
        comparability.currency,
        comparability.date_window,
      );
      expect(result_nc.compliant).toEqual(0n);
      expect(result_nc.discrepancy).toEqual(200n);
      expect(result_nc.committed_count).toEqual(2n);
    });

    it("compliant happy path", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 900n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);

      const result_c = simulator.compliance_check(
        class_id,
        900n,
        b_salt,
        [1200n, 0n, 0n, 0n, 0n],
        [s_salt, empty_bytes, empty_bytes, empty_bytes, empty_bytes],
        comparability.product,
        comparability.volume,
        comparability.region,
        comparability.term,
        comparability.currency,
        comparability.date_window,
      );
      expect(result_c.compliant).toEqual(1n);
      expect(result_c.discrepancy).toEqual(0n);
      expect(result_c.committed_count).toEqual(1n);
    });
  });

  describe("reveal_violation", () => {
    it("wrong auditor secret rejected", () => {
      const simulator = new MFNGuardSimulator();
      const { class_id, buyer_secret, supplier_secrets, comparability } =
        setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 800n, s_salt);
      const s_prices = [800n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.reveal_violation(
          class_id,
          1000n,
          b_salt,
          s_prices,
          s_salts,
          randomBytes(32),
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/Unauthorized auditor/);
    });

    it("called when compliant (must fail)", () => {
      const simulator = new MFNGuardSimulator();
      const {
        class_id,
        buyer_secret,
        auditor_secret,
        supplier_secrets,
        comparability,
      } = setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 900n, b_salt);
      const s_salt = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt);
      const s_prices = [1200n, 0n, 0n, 0n, 0n];
      const s_salts = [
        s_salt,
        empty_bytes,
        empty_bytes,
        empty_bytes,
        empty_bytes,
      ];
      expect(() =>
        simulator.reveal_violation(
          class_id,
          900n,
          b_salt,
          s_prices,
          s_salts,
          auditor_secret,
          comparability.product,
          comparability.volume,
          comparability.region,
          comparability.term,
          comparability.currency,
          comparability.date_window,
        ),
      ).toThrow(/No violation to reveal/);
    });

    it("happy path returns the correct violator index and price", () => {
      const simulator = new MFNGuardSimulator();
      const {
        class_id,
        buyer_secret,
        auditor_secret,
        supplier_secrets,
        comparability,
      } = setupValidClass(simulator);
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(class_id, buyer_secret, 1000n, b_salt);
      const s_salt0 = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[0], 0n, 1200n, s_salt0);
      const s_salt1 = randomBytes(32);
      simulator.commit_price(class_id, supplier_secrets[1], 1n, 800n, s_salt1);
      const s_prices = [1200n, 800n, 0n, 0n, 0n];
      const s_salts = [s_salt0, s_salt1, empty_bytes, empty_bytes, empty_bytes];

      const result = simulator.reveal_violation(
        class_id,
        1000n,
        b_salt,
        s_prices,
        s_salts,
        auditor_secret,
        comparability.product,
        comparability.volume,
        comparability.region,
        comparability.term,
        comparability.currency,
        comparability.date_window,
      );
      expect(result.violator_found).toEqual(1n);
      expect(result.violator_price).toEqual(800n);
      expect(result.violator_index).toEqual(1n);
    });
  });

  describe("witness replay", () => {
    it("a commitment from class A must not verify in class B", () => {
      const simulator = new MFNGuardSimulator();
      const classA = setupValidClass(simulator);
      const classB = setupValidClass(simulator, classA.owner_secret); // Same contract, different class, skip init

      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(
        classA.class_id,
        classA.buyer_secret,
        1000n,
        b_salt,
      );
      simulator.set_buyer_reference(
        classB.class_id,
        classB.buyer_secret,
        1000n,
        b_salt,
      ); // Same exact price and salt

      const s_salt = randomBytes(32);
      simulator.commit_price(
        classA.class_id,
        classA.supplier_secrets[0],
        0n,
        1200n,
        s_salt,
      );

      // Try to use class A's supplier witness (price + salt) in class B
      // This will fail because class B has an empty slot 0, but if we assume the slot WAS filled,
      // the hash includes the class_id and comparability_hash, so the commitment would differ.
      // To test replay: Supplier commits a price in B, but we try to supply A's witness to verify it.
      simulator.commit_price(
        classB.class_id,
        classB.supplier_secrets[0],
        0n,
        1200n,
        s_salt,
      );

      // We know `classA.comparability_hash != classB.comparability_hash` (with overwhelming probability).
      // Let's try to verify class B's state using class B's comparability, but we provide class A's comparability?
      // No, we must provide class B's comparability.
      // The commitment in B incorporates classB.class_id and classB.comparability.
      // Wait, if the supplier provides the exact same price and salt, it works ONLY because they explicitly committed it to B.
      // What if we try to verify using class A's class_id but B's state? The API requires class_id.
      // Actually, since the domain-separation includes class_id and comparability_hash in the persistentHash,
      // replaying a *commitment* is impossible (you can't copy A's commitment and insert it into B without hashing).
      // The test is that `persistentHash([..., class_id, comparability, price, salt])` binds to the class context.
      expect(() =>
        simulator.compliance_check(
          classB.class_id,
          1000n,
          b_salt,
          [1200n, 0n, 0n, 0n, 0n],
          [randomBytes(32), empty_bytes, empty_bytes, empty_bytes, empty_bytes],
          classB.comparability.product,
          classB.comparability.volume,
          classB.comparability.region,
          classB.comparability.term,
          classB.comparability.currency,
          classB.comparability.date_window,
        ),
      ).toThrow(/Supplier witness 0 does not match/);
    });

    it("two classes with IDENTICAL comparability attributes but different class IDs generate different commitments", () => {
      const simulator = new MFNGuardSimulator();
      const classA = setupValidClass(simulator);

      // Setup class B with the exact same comparability attributes as A
      const classB_id = randomBytes(32);
      const buyerB_secret = randomBytes(32);
      const supplierB_secrets = Array.from({ length: 5 }, () =>
        randomBytes(32),
      );
      const auditorB_secret = randomBytes(32);

      const b_hash = pureCircuits.compute_buyer_hash(buyerB_secret);
      const a_hash = pureCircuits.compute_auditor_hash(auditorB_secret);
      const s_hashes = supplierB_secrets.map((s) =>
        pureCircuits.compute_supplier_hash(s),
      );
      const comp_hash = pureCircuits.compute_comparability_hash(
        classA.comparability.product,
        classA.comparability.volume,
        classA.comparability.region,
        classA.comparability.term,
        classA.comparability.currency,
        classA.comparability.date_window,
      );

      simulator.initialize_class(
        classA.owner_secret,
        classB_id,
        b_hash,
        a_hash,
        s_hashes,
        comp_hash,
      );

      // Commit the EXACT SAME price/salt in both classes
      const s_salt = randomBytes(32);
      simulator.commit_price(
        classA.class_id,
        classA.supplier_secrets[0],
        0n,
        1200n,
        s_salt,
      );
      simulator.commit_price(
        classB_id,
        supplierB_secrets[0],
        0n,
        1200n,
        s_salt,
      );

      // Assert the stored slot commitments differ (proves domain separation by class_id)
      const ledger = simulator.getLedger();
      const stateA = ledger.classes.lookup(classA.class_id);
      const stateB = ledger.classes.lookup(classB_id);
      expect(Buffer.from(stateA.slots[0]).toString("hex")).not.toEqual(
        Buffer.from(stateB.slots[0]).toString("hex"),
      );

      // Also commit the same buyer reference in both
      const b_salt = randomBytes(32);
      simulator.set_buyer_reference(
        classA.class_id,
        classA.buyer_secret,
        1000n,
        b_salt,
      );
      simulator.set_buyer_reference(classB_id, buyerB_secret, 1000n, b_salt);
      const updatedStateA = simulator
        .getLedger()
        .classes.lookup(classA.class_id);
      const updatedStateB = simulator.getLedger().classes.lookup(classB_id);
      expect(Buffer.from(updatedStateA.buyer_ref).toString("hex")).not.toEqual(
        Buffer.from(updatedStateB.buyer_ref).toString("hex"),
      );

      // Try to verify class B using class A's witness bundle

      // NOTE: Since we literally committed the exact same price and salt in class B,
      // the raw witness bundle (price=1200n, salt=s_salt) is actually valid for class B!
      // To test that you can't just replay a witness bundle when it wasn't committed,
      // we must try to use it against a different commitment.
      // Let's change B's commitment to something else, and THEN try A's bundle.
      const s_saltB2 = randomBytes(32);
      simulator.commit_price(
        classB_id,
        supplierB_secrets[1],
        1n,
        800n,
        s_saltB2,
      );

      // Trying to pass A's witness for slot 1 will fail:
      expect(() =>
        simulator.compliance_check(
          classB_id,
          1000n,
          b_salt,
          [1200n, 1200n, 0n, 0n, 0n],
          [s_salt, s_salt, empty_bytes, empty_bytes, empty_bytes],
          classA.comparability.product,
          classA.comparability.volume,
          classA.comparability.region,
          classA.comparability.term,
          classA.comparability.currency,
          classA.comparability.date_window,
        ),
      ).toThrow(/Supplier witness 1 does not match/);
    });
  });
});
