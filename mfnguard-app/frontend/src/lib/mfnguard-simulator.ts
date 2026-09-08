/**
 * ============================================================================
 * DEPRECATED / ORPHANED — DO NOT USE IN PRODUCTION
 * ============================================================================
 * This simulator was copied from the contract test suite during early
 * prototyping. It runs circuits in-memory using impureCircuits without
 * generating real ZK proofs or submitting transactions to the ledger.
 *
 * It is NOT imported or called by any frontend component.
 * It should be removed before production deployment.
 * ============================================================================
 */
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
  type DisputeResult
} from "mfnguard-contract";

export class MFNGuardSimulator {
  readonly contract: Contract<any>;
  circuitContext: CircuitContext<any>;

  constructor() {
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

  public commit_price(class_id: Uint8Array, price: bigint, salt: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.commit_price(
      this.circuitContext,
      class_id,
      price,
      salt
    ).context;
    return this.getLedger();
  }

  public set_buyer_reference(class_id: Uint8Array, price: bigint, salt: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.set_buyer_reference(
      this.circuitContext,
      class_id,
      price,
      salt
    ).context;
    return this.getLedger();
  }

  public compliance_check(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[]
  ): ComplianceResult {
    const result = this.contract.impureCircuits.compliance_check(
      this.circuitContext,
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts
    );
    this.circuitContext = result.context;
    return result.result;
  }
  
  public reveal_violation(
    class_id: Uint8Array,
    buyer_price: bigint,
    buyer_salt: Uint8Array,
    supplier_prices: bigint[],
    supplier_salts: Uint8Array[]
  ): DisputeResult {
    const result = this.contract.impureCircuits.reveal_violation(
      this.circuitContext,
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts
    );
    this.circuitContext = result.context;
    return result.result;
  }
}
