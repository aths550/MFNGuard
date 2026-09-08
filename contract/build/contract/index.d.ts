import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type PriceClass = { slots: Uint8Array[];
                           filled: bigint[];
                           buyer_ref: Uint8Array;
                           buyer_filled: bigint
                         };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  test(context: __compactRuntime.CircuitContext<PS>,
       class_id_0: Uint8Array,
       c_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  test(context: __compactRuntime.CircuitContext<PS>,
       class_id_0: Uint8Array,
       c_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  test(context: __compactRuntime.CircuitContext<PS>,
       class_id_0: Uint8Array,
       c_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  classes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): PriceClass;
    [Symbol.iterator](): Iterator<[Uint8Array, PriceClass]>
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
