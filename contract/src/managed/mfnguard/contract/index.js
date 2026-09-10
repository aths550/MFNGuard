import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeVector(5, _descriptor_2);

class _PriceClass_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      slots: _descriptor_1.fromValue(value_0),
      filled: _descriptor_3.fromValue(value_0),
      buyer_ref: _descriptor_0.fromValue(value_0),
      buyer_filled: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.slots).concat(_descriptor_3.toValue(value_0.filled).concat(_descriptor_0.toValue(value_0.buyer_ref).concat(_descriptor_2.toValue(value_0.buyer_filled))));
  }
}

const _descriptor_4 = new _PriceClass_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_6 = new __compactRuntime.CompactTypeVector(5, _descriptor_5);

class _ComplianceResult_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_5.alignment());
  }
  fromValue(value_0) {
    return {
      compliant: _descriptor_2.fromValue(value_0),
      discrepancy: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.compliant).concat(_descriptor_5.toValue(value_0.discrepancy));
  }
}

const _descriptor_7 = new _ComplianceResult_0();

class _DisputeResult_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_5.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      violator_found: _descriptor_2.fromValue(value_0),
      violator_price: _descriptor_5.fromValue(value_0),
      violator_index: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.violator_found).concat(_descriptor_5.toValue(value_0.violator_price).concat(_descriptor_2.toValue(value_0.violator_index)));
  }
}

const _descriptor_8 = new _DisputeResult_0();

const _descriptor_9 = __compactRuntime.CompactTypeBoolean;

const _descriptor_10 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_9.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_11 = new _Either_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_13 = new _ContractAddress_0();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      commit_price: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`commit_price: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const price_0 = args_1[2];
        const salt_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 20 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 20 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(typeof(price_0) === 'bigint' && price_0 >= 0n && price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 20 char 1',
                                     'Uint<0..18446744073709551616>',
                                     price_0)
        }
        if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 20 char 1',
                                     'Bytes<32>',
                                     salt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_5.toValue(price_0).concat(_descriptor_0.toValue(salt_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._commit_price_0(context,
                                              partialProofData,
                                              class_id_0,
                                              price_0,
                                              salt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      set_buyer_reference: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`set_buyer_reference: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const price_0 = args_1[2];
        const salt_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 82 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 82 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(typeof(price_0) === 'bigint' && price_0 >= 0n && price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 82 char 1',
                                     'Uint<0..18446744073709551616>',
                                     price_0)
        }
        if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 82 char 1',
                                     'Bytes<32>',
                                     salt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_5.toValue(price_0).concat(_descriptor_0.toValue(salt_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._set_buyer_reference_0(context,
                                                     partialProofData,
                                                     class_id_0,
                                                     price_0,
                                                     salt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      compliance_check: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`compliance_check: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const buyer_price_0 = args_1[2];
        const buyer_salt_0 = args_1[3];
        const supplier_prices_0 = args_1[4];
        const supplier_salts_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 110 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 110 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(typeof(buyer_price_0) === 'bigint' && buyer_price_0 >= 0n && buyer_price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 110 char 1',
                                     'Uint<0..18446744073709551616>',
                                     buyer_price_0)
        }
        if (!(buyer_salt_0.buffer instanceof ArrayBuffer && buyer_salt_0.BYTES_PER_ELEMENT === 1 && buyer_salt_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 110 char 1',
                                     'Bytes<32>',
                                     buyer_salt_0)
        }
        if (!(Array.isArray(supplier_prices_0) && supplier_prices_0.length === 5 && supplier_prices_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 110 char 1',
                                     'Vector<5, Uint<0..18446744073709551616>>',
                                     supplier_prices_0)
        }
        if (!(Array.isArray(supplier_salts_0) && supplier_salts_0.length === 5 && supplier_salts_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'mfnguard.compact line 110 char 1',
                                     'Vector<5, Bytes<32>>',
                                     supplier_salts_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_5.toValue(buyer_price_0).concat(_descriptor_0.toValue(buyer_salt_0).concat(_descriptor_6.toValue(supplier_prices_0).concat(_descriptor_1.toValue(supplier_salts_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_1.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._compliance_check_0(context,
                                                  partialProofData,
                                                  class_id_0,
                                                  buyer_price_0,
                                                  buyer_salt_0,
                                                  supplier_prices_0,
                                                  supplier_salts_0);
        partialProofData.output = { value: _descriptor_7.toValue(result_0), alignment: _descriptor_7.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      reveal_violation: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`reveal_violation: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const buyer_price_0 = args_1[2];
        const buyer_salt_0 = args_1[3];
        const supplier_prices_0 = args_1[4];
        const supplier_salts_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 169 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 169 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(typeof(buyer_price_0) === 'bigint' && buyer_price_0 >= 0n && buyer_price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 169 char 1',
                                     'Uint<0..18446744073709551616>',
                                     buyer_price_0)
        }
        if (!(buyer_salt_0.buffer instanceof ArrayBuffer && buyer_salt_0.BYTES_PER_ELEMENT === 1 && buyer_salt_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 169 char 1',
                                     'Bytes<32>',
                                     buyer_salt_0)
        }
        if (!(Array.isArray(supplier_prices_0) && supplier_prices_0.length === 5 && supplier_prices_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 169 char 1',
                                     'Vector<5, Uint<0..18446744073709551616>>',
                                     supplier_prices_0)
        }
        if (!(Array.isArray(supplier_salts_0) && supplier_salts_0.length === 5 && supplier_salts_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'mfnguard.compact line 169 char 1',
                                     'Vector<5, Bytes<32>>',
                                     supplier_salts_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_5.toValue(buyer_price_0).concat(_descriptor_0.toValue(buyer_salt_0).concat(_descriptor_6.toValue(supplier_prices_0).concat(_descriptor_1.toValue(supplier_salts_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_1.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._reveal_violation_0(context,
                                                  partialProofData,
                                                  class_id_0,
                                                  buyer_price_0,
                                                  buyer_salt_0,
                                                  supplier_prices_0,
                                                  supplier_salts_0);
        partialProofData.output = { value: _descriptor_8.toValue(result_0), alignment: _descriptor_8.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      commit_price: this.circuits.commit_price,
      set_buyer_reference: this.circuits.set_buyer_reference,
      compliance_check: this.circuits.compliance_check,
      reveal_violation: this.circuits.reveal_violation
    };
    this.provableCircuits = {
      commit_price: this.circuits.commit_price,
      set_buyer_reference: this.circuits.set_buyer_reference,
      compliance_check: this.circuits.compliance_check,
      reveal_violation: this.circuits.reveal_violation
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('commit_price', new __compactRuntime.ContractOperation());
    state_0.setOperation('set_buyer_reference', new __compactRuntime.ContractOperation());
    state_0.setOperation('compliance_check', new __compactRuntime.ContractOperation());
    state_0.setOperation('reveal_violation', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _commit_price_0(context, partialProofData, class_id_0, price_0, salt_0) {
    const commitment_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                      price_0,
                                                                                      'mfnguard.compact line 21 char 62'),
                                                 salt_0]);
    const is_member_0 = _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_2.toValue(0n),
                                                                                                              alignment: _descriptor_2.alignment() } }] } },
                                                                                   { push: { storage: false,
                                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(class_id_0),
                                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                                   'member',
                                                                                   { popeq: { cached: true,
                                                                                              result: undefined } }]).value);
    const empty_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                               0n,
                                                               'mfnguard.compact line 26 char 25');
    const empty_slots_0 = [empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0];
    const empty_filled_0 = [0n, 0n, 0n, 0n, 0n];
    const initial_class_0 = { slots: empty_slots_0,
                              filled: empty_filled_0,
                              buyer_ref: empty_bytes_0,
                              buyer_filled: 0n };
    const current_class_0 = is_member_0 ?
                            _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_0.toValue(class_id_0),
                                                                                                                  alignment: _descriptor_0.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value)
                            :
                            initial_class_0;
    const i0_empty_0 = this._equal_0(current_class_0.filled[0], 0n);
    const i1_empty_0 = this._equal_1(current_class_0.filled[1], 0n);
    const i2_empty_0 = this._equal_2(current_class_0.filled[2], 0n);
    const i3_empty_0 = this._equal_3(current_class_0.filled[3], 0n);
    const i4_empty_0 = this._equal_4(current_class_0.filled[4], 0n);
    const fill_0_0 = i0_empty_0;
    const fill_1_0 = !fill_0_0 && i1_empty_0;
    const fill_2_0 = !fill_0_0 && !fill_1_0 && i2_empty_0;
    const fill_3_0 = !fill_0_0 && !fill_1_0 && !fill_2_0 && i3_empty_0;
    const fill_4_0 = !fill_0_0 && !fill_1_0 && !fill_2_0 && !fill_3_0
                     &&
                     i4_empty_0;
    __compactRuntime.assert(fill_0_0 || fill_1_0 || fill_2_0 || fill_3_0
                            ||
                            fill_4_0,
                            'No empty slots available in this price class');
    const next_slots_0 = [fill_0_0 ? commitment_0 : current_class_0.slots[0],
                          fill_1_0 ? commitment_0 : current_class_0.slots[1],
                          fill_2_0 ? commitment_0 : current_class_0.slots[2],
                          fill_3_0 ? commitment_0 : current_class_0.slots[3],
                          fill_4_0 ? commitment_0 : current_class_0.slots[4]];
    const next_filled_0 = [fill_0_0 ? 1n : current_class_0.filled[0],
                           fill_1_0 ? 1n : current_class_0.filled[1],
                           fill_2_0 ? 1n : current_class_0.filled[2],
                           fill_3_0 ? 1n : current_class_0.filled[3],
                           fill_4_0 ? 1n : current_class_0.filled[4]];
    const next_class_0 = { slots: next_slots_0,
                           filled: next_filled_0,
                           buyer_ref: current_class_0.buyer_ref,
                           buyer_filled: current_class_0.buyer_filled };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(class_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(next_class_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _set_buyer_reference_0(context, partialProofData, class_id_0, price_0, salt_0)
  {
    const commitment_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                      price_0,
                                                                                      'mfnguard.compact line 83 char 62'),
                                                 salt_0]);
    const is_member_0 = _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_2.toValue(0n),
                                                                                                              alignment: _descriptor_2.alignment() } }] } },
                                                                                   { push: { storage: false,
                                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(class_id_0),
                                                                                                                                          alignment: _descriptor_0.alignment() }).encode() } },
                                                                                   'member',
                                                                                   { popeq: { cached: true,
                                                                                              result: undefined } }]).value);
    const empty_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                               0n,
                                                               'mfnguard.compact line 86 char 25');
    const empty_slots_0 = [empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0];
    const empty_filled_0 = [0n, 0n, 0n, 0n, 0n];
    const initial_class_0 = { slots: empty_slots_0,
                              filled: empty_filled_0,
                              buyer_ref: empty_bytes_0,
                              buyer_filled: 0n };
    const current_class_0 = is_member_0 ?
                            _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_0.toValue(class_id_0),
                                                                                                                  alignment: _descriptor_0.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value)
                            :
                            initial_class_0;
    const next_class_0 = { slots: current_class_0.slots,
                           filled: current_class_0.filled,
                           buyer_ref: commitment_0,
                           buyer_filled: 1n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(class_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(next_class_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _compliance_check_0(context,
                      partialProofData,
                      class_id_0,
                      buyer_price_0,
                      buyer_salt_0,
                      supplier_prices_0,
                      supplier_salts_0)
  {
    const class_state_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_2.toValue(0n),
                                                                                                                alignment: _descriptor_2.alignment() } }] } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_0.toValue(class_id_0),
                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value);
    __compactRuntime.assert(this._equal_5(class_state_0.buyer_filled, 1n),
                            'Buyer reference not set');
    const expected_buyer_commit_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                                 buyer_price_0,
                                                                                                 'mfnguard.compact line 120 char 73'),
                                                            buyer_salt_0]);
    __compactRuntime.assert(this._equal_6(expected_buyer_commit_0,
                                          class_state_0.buyer_ref),
                            'Buyer witness does not match commitment');
    const max_val_0 = 18446744073709551615n;
    const p0_0 = this._equal_7(class_state_0.filled[0], 1n) ?
                 supplier_prices_0[0] :
                 max_val_0;
    const expected_commit_0_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                             p0_0,
                                                                                             'mfnguard.compact line 127 char 69'),
                                                        supplier_salts_0[0]]);
    __compactRuntime.assert(this._equal_8(class_state_0.filled[0], 0n)
                            ||
                            this._equal_9(expected_commit_0_0,
                                          class_state_0.slots[0]),
                            'Supplier witness 0 does not match');
    const p1_0 = this._equal_10(class_state_0.filled[1], 1n) ?
                 supplier_prices_0[1] :
                 max_val_0;
    const expected_commit_1_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                             p1_0,
                                                                                             'mfnguard.compact line 131 char 69'),
                                                        supplier_salts_0[1]]);
    __compactRuntime.assert(this._equal_11(class_state_0.filled[1], 0n)
                            ||
                            this._equal_12(expected_commit_1_0,
                                           class_state_0.slots[1]),
                            'Supplier witness 1 does not match');
    const p2_0 = this._equal_13(class_state_0.filled[2], 1n) ?
                 supplier_prices_0[2] :
                 max_val_0;
    const expected_commit_2_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                             p2_0,
                                                                                             'mfnguard.compact line 135 char 69'),
                                                        supplier_salts_0[2]]);
    __compactRuntime.assert(this._equal_14(class_state_0.filled[2], 0n)
                            ||
                            this._equal_15(expected_commit_2_0,
                                           class_state_0.slots[2]),
                            'Supplier witness 2 does not match');
    const p3_0 = this._equal_16(class_state_0.filled[3], 1n) ?
                 supplier_prices_0[3] :
                 max_val_0;
    const expected_commit_3_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                             p3_0,
                                                                                             'mfnguard.compact line 139 char 69'),
                                                        supplier_salts_0[3]]);
    __compactRuntime.assert(this._equal_17(class_state_0.filled[3], 0n)
                            ||
                            this._equal_18(expected_commit_3_0,
                                           class_state_0.slots[3]),
                            'Supplier witness 3 does not match');
    const p4_0 = this._equal_19(class_state_0.filled[4], 1n) ?
                 supplier_prices_0[4] :
                 max_val_0;
    const expected_commit_4_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                             p4_0,
                                                                                             'mfnguard.compact line 143 char 69'),
                                                        supplier_salts_0[4]]);
    __compactRuntime.assert(this._equal_20(class_state_0.filled[4], 0n)
                            ||
                            this._equal_21(expected_commit_4_0,
                                           class_state_0.slots[4]),
                            'Supplier witness 4 does not match');
    const has_any_0 = this._equal_22(class_state_0.filled[0], 1n)
                      ||
                      this._equal_23(class_state_0.filled[1], 1n)
                      ||
                      this._equal_24(class_state_0.filled[2], 1n)
                      ||
                      this._equal_25(class_state_0.filled[3], 1n)
                      ||
                      this._equal_26(class_state_0.filled[4], 1n);
    __compactRuntime.assert(has_any_0,
                            'No supplier prices committed in this class');
    const m1_0 = p0_0 < p1_0 ? p0_0 : p1_0;
    const m2_0 = p2_0 < m1_0 ? p2_0 : m1_0;
    const m3_0 = p3_0 < m2_0 ? p3_0 : m2_0;
    const min_price_0 = p4_0 < m3_0 ? p4_0 : m3_0;
    const compliant_0 = buyer_price_0 <= min_price_0;
    const discrepancy_0 = compliant_0 ?
                          0n :
                          (__compactRuntime.assert(buyer_price_0 >= min_price_0,
                                                   'result of subtraction would be negative'),
                           buyer_price_0 - min_price_0);
    return { compliant: compliant_0 ? 1n : 0n, discrepancy: discrepancy_0 };
  }
  _reveal_violation_0(context,
                      partialProofData,
                      class_id_0,
                      buyer_price_0,
                      buyer_salt_0,
                      supplier_prices_0,
                      supplier_salts_0)
  {
    const class_state_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_2.toValue(0n),
                                                                                                                alignment: _descriptor_2.alignment() } }] } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_0.toValue(class_id_0),
                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value);
    __compactRuntime.assert(this._equal_27(class_state_0.buyer_filled, 1n),
                            'Buyer reference not set');
    const expected_buyer_commit_0 = this._persistentHash_0([__compactRuntime.convertFieldToBytes(32,
                                                                                                 buyer_price_0,
                                                                                                 'mfnguard.compact line 179 char 73'),
                                                            buyer_salt_0]);
    __compactRuntime.assert(this._equal_28(expected_buyer_commit_0,
                                           class_state_0.buyer_ref),
                            'Buyer witness does not match commitment');
    const max_val_0 = 18446744073709551615n;
    const p0_0 = this._equal_29(class_state_0.filled[0], 1n) ?
                 supplier_prices_0[0] :
                 max_val_0;
    const p1_0 = this._equal_30(class_state_0.filled[1], 1n) ?
                 supplier_prices_0[1] :
                 max_val_0;
    const p2_0 = this._equal_31(class_state_0.filled[2], 1n) ?
                 supplier_prices_0[2] :
                 max_val_0;
    const p3_0 = this._equal_32(class_state_0.filled[3], 1n) ?
                 supplier_prices_0[3] :
                 max_val_0;
    const p4_0 = this._equal_33(class_state_0.filled[4], 1n) ?
                 supplier_prices_0[4] :
                 max_val_0;
    const v0_0 = p0_0 < buyer_price_0;
    const v1_0 = p1_0 < buyer_price_0;
    const v2_0 = p2_0 < buyer_price_0;
    const v3_0 = p3_0 < buyer_price_0;
    const v4_0 = p4_0 < buyer_price_0;
    __compactRuntime.assert(v0_0 || v1_0 || v2_0 || v3_0 || v4_0,
                            'No violation exists to reveal');
    const found_0 = 1n;
    const v_price_0 = v0_0 ?
                      p0_0 :
                      v1_0 ? p1_0 : v2_0 ? p2_0 : v3_0 ? p3_0 : p4_0;
    const v_index_0 = v0_0 ? 0n : v1_0 ? 1n : v2_0 ? 2n : v3_0 ? 3n : 4n;
    return { violator_found: found_0,
             violator_price: v_price_0,
             violator_index: v_index_0 };
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_12(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_16(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_17(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_18(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_19(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_20(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_21(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_22(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_23(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_24(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_25(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_26(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_27(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_28(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_29(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_30(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_31(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_32(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_33(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    classes: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                                                 alignment: _descriptor_5.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'mfnguard.compact line 17 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'mfnguard.compact line 17 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
