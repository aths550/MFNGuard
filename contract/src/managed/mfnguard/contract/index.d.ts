import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type PriceClass = { slots: Uint8Array[];
                           filled: bigint[];
                           supplier_hashes: Uint8Array[];
                           buyer_ref: Uint8Array;
                           buyer_filled: bigint;
                           buyer_hash: Uint8Array;
                           auditor_hash: Uint8Array;
                           comparability_hash: Uint8Array
                         };

export type ComplianceResult = { compliant: bigint;
                                 discrepancy: bigint;
                                 committed_count: bigint
                               };

export type DisputeResult = { violator_found: bigint;
                              violator_price: bigint;
                              violator_index: bigint
                            };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  init_contract(context: __compactRuntime.CircuitContext<PS>,
                owner_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  initialize_class(context: __compactRuntime.CircuitContext<PS>,
                   owner_secret_0: Uint8Array,
                   class_id_0: Uint8Array,
                   buyer_hash_0: Uint8Array,
                   auditor_hash_0: Uint8Array,
                   supplier_hashes_0: Uint8Array[],
                   comparability_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  commit_price(context: __compactRuntime.CircuitContext<PS>,
               class_id_0: Uint8Array,
               supplier_secret_0: Uint8Array,
               slot_index_0: bigint,
               price_0: bigint,
               salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  set_buyer_reference(context: __compactRuntime.CircuitContext<PS>,
                      class_id_0: Uint8Array,
                      buyer_secret_0: Uint8Array,
                      price_0: bigint,
                      salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  compliance_check(context: __compactRuntime.CircuitContext<PS>,
                   class_id_0: Uint8Array,
                   buyer_price_0: bigint,
                   buyer_salt_0: Uint8Array,
                   supplier_prices_0: bigint[],
                   supplier_salts_0: Uint8Array[],
                   product_0: Uint8Array,
                   volume_0: Uint8Array,
                   region_0: Uint8Array,
                   term_0: Uint8Array,
                   currency_0: Uint8Array,
                   date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, ComplianceResult>;
  reveal_violation(context: __compactRuntime.CircuitContext<PS>,
                   class_id_0: Uint8Array,
                   buyer_price_0: bigint,
                   buyer_salt_0: Uint8Array,
                   supplier_prices_0: bigint[],
                   supplier_salts_0: Uint8Array[],
                   auditor_secret_0: Uint8Array,
                   product_0: Uint8Array,
                   volume_0: Uint8Array,
                   region_0: Uint8Array,
                   term_0: Uint8Array,
                   currency_0: Uint8Array,
                   date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, DisputeResult>;
}

export type ProvableCircuits<PS> = {
  init_contract(context: __compactRuntime.CircuitContext<PS>,
                owner_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  initialize_class(context: __compactRuntime.CircuitContext<PS>,
                   owner_secret_0: Uint8Array,
                   class_id_0: Uint8Array,
                   buyer_hash_0: Uint8Array,
                   auditor_hash_0: Uint8Array,
                   supplier_hashes_0: Uint8Array[],
                   comparability_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  commit_price(context: __compactRuntime.CircuitContext<PS>,
               class_id_0: Uint8Array,
               supplier_secret_0: Uint8Array,
               slot_index_0: bigint,
               price_0: bigint,
               salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  set_buyer_reference(context: __compactRuntime.CircuitContext<PS>,
                      class_id_0: Uint8Array,
                      buyer_secret_0: Uint8Array,
                      price_0: bigint,
                      salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  compliance_check(context: __compactRuntime.CircuitContext<PS>,
                   class_id_0: Uint8Array,
                   buyer_price_0: bigint,
                   buyer_salt_0: Uint8Array,
                   supplier_prices_0: bigint[],
                   supplier_salts_0: Uint8Array[],
                   product_0: Uint8Array,
                   volume_0: Uint8Array,
                   region_0: Uint8Array,
                   term_0: Uint8Array,
                   currency_0: Uint8Array,
                   date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, ComplianceResult>;
  reveal_violation(context: __compactRuntime.CircuitContext<PS>,
                   class_id_0: Uint8Array,
                   buyer_price_0: bigint,
                   buyer_salt_0: Uint8Array,
                   supplier_prices_0: bigint[],
                   supplier_salts_0: Uint8Array[],
                   auditor_secret_0: Uint8Array,
                   product_0: Uint8Array,
                   volume_0: Uint8Array,
                   region_0: Uint8Array,
                   term_0: Uint8Array,
                   currency_0: Uint8Array,
                   date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, DisputeResult>;
}

export type PureCircuits = {
  compute_auditor_hash(secret_0: Uint8Array): Uint8Array;
  compute_owner_hash(secret_0: Uint8Array): Uint8Array;
  compute_supplier_hash(secret_0: Uint8Array): Uint8Array;
  compute_buyer_hash(secret_0: Uint8Array): Uint8Array;
  compute_comparability_hash(product_0: Uint8Array,
                             volume_0: Uint8Array,
                             region_0: Uint8Array,
                             term_0: Uint8Array,
                             currency_0: Uint8Array,
                             date_window_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  init_contract(context: __compactRuntime.CircuitContext<PS>,
                owner_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  initialize_class(context: __compactRuntime.CircuitContext<PS>,
                   owner_secret_0: Uint8Array,
                   class_id_0: Uint8Array,
                   buyer_hash_0: Uint8Array,
                   auditor_hash_0: Uint8Array,
                   supplier_hashes_0: Uint8Array[],
                   comparability_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  compute_auditor_hash(context: __compactRuntime.CircuitContext<PS>,
                       secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  compute_owner_hash(context: __compactRuntime.CircuitContext<PS>,
                     secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  compute_supplier_hash(context: __compactRuntime.CircuitContext<PS>,
                        secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  compute_buyer_hash(context: __compactRuntime.CircuitContext<PS>,
                     secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  compute_comparability_hash(context: __compactRuntime.CircuitContext<PS>,
                             product_0: Uint8Array,
                             volume_0: Uint8Array,
                             region_0: Uint8Array,
                             term_0: Uint8Array,
                             currency_0: Uint8Array,
                             date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  commit_price(context: __compactRuntime.CircuitContext<PS>,
               class_id_0: Uint8Array,
               supplier_secret_0: Uint8Array,
               slot_index_0: bigint,
               price_0: bigint,
               salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  set_buyer_reference(context: __compactRuntime.CircuitContext<PS>,
                      class_id_0: Uint8Array,
                      buyer_secret_0: Uint8Array,
                      price_0: bigint,
                      salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  compliance_check(context: __compactRuntime.CircuitContext<PS>,
                   class_id_0: Uint8Array,
                   buyer_price_0: bigint,
                   buyer_salt_0: Uint8Array,
                   supplier_prices_0: bigint[],
                   supplier_salts_0: Uint8Array[],
                   product_0: Uint8Array,
                   volume_0: Uint8Array,
                   region_0: Uint8Array,
                   term_0: Uint8Array,
                   currency_0: Uint8Array,
                   date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, ComplianceResult>;
  reveal_violation(context: __compactRuntime.CircuitContext<PS>,
                   class_id_0: Uint8Array,
                   buyer_price_0: bigint,
                   buyer_salt_0: Uint8Array,
                   supplier_prices_0: bigint[],
                   supplier_salts_0: Uint8Array[],
                   auditor_secret_0: Uint8Array,
                   product_0: Uint8Array,
                   volume_0: Uint8Array,
                   region_0: Uint8Array,
                   term_0: Uint8Array,
                   currency_0: Uint8Array,
                   date_window_0: Uint8Array): __compactRuntime.CircuitResults<PS, DisputeResult>;
}

export type Ledger = {
  classes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): PriceClass;
    [Symbol.iterator](): Iterator<[Uint8Array, PriceClass]>
  };
  state: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Uint8Array;
    [Symbol.iterator](): Iterator<[bigint, Uint8Array]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
