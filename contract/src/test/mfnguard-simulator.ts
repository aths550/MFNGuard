import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
  type ComplianceResult,
  type DisputeResult,
} from "../managed/mfnguard/contract/index.js";

export class MFNGuardSimulator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly contract: Contract<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  circuitContext: CircuitContext<any>;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.contract = new Contract<any>({});
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({}, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public init_contract(owner_hash: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.init_contract(
      this.circuitContext,
      owner_hash,
    ).context;
    return this.getLedger();
  }

  public initialize_class(
    owner_secret: Uint8Array,
    class_id: Uint8Array,
    buyer_hash: Uint8Array,
    auditor_hash: Uint8Array,
    supplier_hashes: Uint8Array[],
    comparability_hash: Uint8Array,
  ): Ledger {
    this.circuitContext = this.contract.impureCircuits.initialize_class(
      this.circuitContext,
      owner_secret,
      class_id,
      buyer_hash,
      auditor_hash,
      supplier_hashes,
      comparability_hash,
    ).context;
    return this.getLedger();
  }

  public commit_price(
    class_id: Uint8Array,
    supplier_secret: Uint8Array,
    slot_index: bigint,
    price: bigint,
    salt: Uint8Array,
  ): Ledger {
    this.circuitContext = this.contract.impureCircuits.commit_price(
      this.circuitContext,
      class_id,
      supplier_secret,
      slot_index,
      price,
      salt,
    ).context;
    return this.getLedger();
  }

  public set_buyer_reference(
    class_id: Uint8Array,
    buyer_secret: Uint8Array,
    price: bigint,
    salt: Uint8Array,
  ): Ledger {
    this.circuitContext = this.contract.impureCircuits.set_buyer_reference(
      this.circuitContext,
      class_id,
      buyer_secret,
      price,
      salt,
    ).context;
    return this.getLedger();
  }

  public compliance_check(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[],
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array,
  ): ComplianceResult {
    const result = this.contract.impureCircuits.compliance_check(
      this.circuitContext,
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts,
      product,
      volume,
      region,
      term,
      currency,
      date_window,
    );
    this.circuitContext = result.context;
    return result.result;
  }

  public reveal_violation(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[],
    auditor_secret: Uint8Array,
    product: Uint8Array,
    volume: Uint8Array,
    region: Uint8Array,
    term: Uint8Array,
    currency: Uint8Array,
    date_window: Uint8Array,
  ): DisputeResult {
    const result = this.contract.impureCircuits.reveal_violation(
      this.circuitContext,
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts,
      auditor_secret,
      product,
      volume,
      region,
      term,
      currency,
      date_window,
    );
    this.circuitContext = result.context;
    return result.result;
  }
}
