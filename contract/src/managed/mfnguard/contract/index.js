import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeVector(5, _descriptor_2);

class _PriceClass_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))));
  }
  fromValue(value_0) {
    return {
      slots: _descriptor_1.fromValue(value_0),
      filled: _descriptor_3.fromValue(value_0),
      supplier_hashes: _descriptor_1.fromValue(value_0),
      buyer_ref: _descriptor_0.fromValue(value_0),
      buyer_filled: _descriptor_2.fromValue(value_0),
      buyer_hash: _descriptor_0.fromValue(value_0),
      auditor_hash: _descriptor_0.fromValue(value_0),
      comparability_hash: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.slots).concat(_descriptor_3.toValue(value_0.filled).concat(_descriptor_1.toValue(value_0.supplier_hashes).concat(_descriptor_0.toValue(value_0.buyer_ref).concat(_descriptor_2.toValue(value_0.buyer_filled).concat(_descriptor_0.toValue(value_0.buyer_hash).concat(_descriptor_0.toValue(value_0.auditor_hash).concat(_descriptor_0.toValue(value_0.comparability_hash))))))));
  }
}

const _descriptor_4 = new _PriceClass_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_6 = new __compactRuntime.CompactTypeVector(5, _descriptor_5);

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

const _descriptor_7 = new _DisputeResult_0();

const _descriptor_8 = __compactRuntime.CompactTypeBoolean;

class _ComplianceResult_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_5.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      compliant: _descriptor_2.fromValue(value_0),
      discrepancy: _descriptor_5.fromValue(value_0),
      committed_count: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.compliant).concat(_descriptor_5.toValue(value_0.discrepancy).concat(_descriptor_2.toValue(value_0.committed_count)));
  }
}

const _descriptor_9 = new _ComplianceResult_0();

const _descriptor_10 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(7, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_8.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_8.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_12 = new _Either_0();

const _descriptor_13 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

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

const _descriptor_14 = new _ContractAddress_0();

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
      init_contract: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`init_contract: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const owner_hash_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('init_contract',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 31 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(owner_hash_0.buffer instanceof ArrayBuffer && owner_hash_0.BYTES_PER_ELEMENT === 1 && owner_hash_0.length === 32)) {
          __compactRuntime.typeError('init_contract',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 31 char 1',
                                     'Bytes<32>',
                                     owner_hash_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(owner_hash_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._init_contract_0(context,
                                               partialProofData,
                                               owner_hash_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      initialize_class: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`initialize_class: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const owner_secret_0 = args_1[1];
        const class_id_0 = args_1[2];
        const buyer_hash_0 = args_1[3];
        const auditor_hash_0 = args_1[4];
        const supplier_hashes_0 = args_1[5];
        const comparability_hash_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(owner_secret_0.buffer instanceof ArrayBuffer && owner_secret_0.BYTES_PER_ELEMENT === 1 && owner_secret_0.length === 32)) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'Bytes<32>',
                                     owner_secret_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(buyer_hash_0.buffer instanceof ArrayBuffer && buyer_hash_0.BYTES_PER_ELEMENT === 1 && buyer_hash_0.length === 32)) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'Bytes<32>',
                                     buyer_hash_0)
        }
        if (!(auditor_hash_0.buffer instanceof ArrayBuffer && auditor_hash_0.BYTES_PER_ELEMENT === 1 && auditor_hash_0.length === 32)) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'Bytes<32>',
                                     auditor_hash_0)
        }
        if (!(Array.isArray(supplier_hashes_0) && supplier_hashes_0.length === 5 && supplier_hashes_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'Vector<5, Bytes<32>>',
                                     supplier_hashes_0)
        }
        if (!(comparability_hash_0.buffer instanceof ArrayBuffer && comparability_hash_0.BYTES_PER_ELEMENT === 1 && comparability_hash_0.length === 32)) {
          __compactRuntime.typeError('initialize_class',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'mfnguard.compact line 36 char 1',
                                     'Bytes<32>',
                                     comparability_hash_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(owner_secret_0).concat(_descriptor_0.toValue(class_id_0).concat(_descriptor_0.toValue(buyer_hash_0).concat(_descriptor_0.toValue(auditor_hash_0).concat(_descriptor_1.toValue(supplier_hashes_0).concat(_descriptor_0.toValue(comparability_hash_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._initialize_class_0(context,
                                                  partialProofData,
                                                  owner_secret_0,
                                                  class_id_0,
                                                  buyer_hash_0,
                                                  auditor_hash_0,
                                                  supplier_hashes_0,
                                                  comparability_hash_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      compute_auditor_hash(context, ...args_1) {
        return { result: pureCircuits.compute_auditor_hash(...args_1), context };
      },
      compute_owner_hash(context, ...args_1) {
        return { result: pureCircuits.compute_owner_hash(...args_1), context };
      },
      compute_supplier_hash(context, ...args_1) {
        return { result: pureCircuits.compute_supplier_hash(...args_1), context };
      },
      compute_buyer_hash(context, ...args_1) {
        return { result: pureCircuits.compute_buyer_hash(...args_1), context };
      },
      compute_comparability_hash(context, ...args_1) {
        return { result: pureCircuits.compute_comparability_hash(...args_1), context };
      },
      commit_price: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`commit_price: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const supplier_secret_0 = args_1[2];
        const slot_index_0 = args_1[3];
        const price_0 = args_1[4];
        const salt_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 123 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 123 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(supplier_secret_0.buffer instanceof ArrayBuffer && supplier_secret_0.BYTES_PER_ELEMENT === 1 && supplier_secret_0.length === 32)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 123 char 1',
                                     'Bytes<32>',
                                     supplier_secret_0)
        }
        if (!(typeof(slot_index_0) === 'bigint' && slot_index_0 >= 0n && slot_index_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 123 char 1',
                                     'Uint<0..18446744073709551616>',
                                     slot_index_0)
        }
        if (!(typeof(price_0) === 'bigint' && price_0 >= 0n && price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 123 char 1',
                                     'Uint<0..18446744073709551616>',
                                     price_0)
        }
        if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
          __compactRuntime.typeError('commit_price',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'mfnguard.compact line 123 char 1',
                                     'Bytes<32>',
                                     salt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_0.toValue(supplier_secret_0).concat(_descriptor_5.toValue(slot_index_0).concat(_descriptor_5.toValue(price_0).concat(_descriptor_0.toValue(salt_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._commit_price_0(context,
                                              partialProofData,
                                              class_id_0,
                                              supplier_secret_0,
                                              slot_index_0,
                                              price_0,
                                              salt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      set_buyer_reference: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`set_buyer_reference: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const buyer_secret_0 = args_1[2];
        const price_0 = args_1[3];
        const salt_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 189 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 189 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(buyer_secret_0.buffer instanceof ArrayBuffer && buyer_secret_0.BYTES_PER_ELEMENT === 1 && buyer_secret_0.length === 32)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 189 char 1',
                                     'Bytes<32>',
                                     buyer_secret_0)
        }
        if (!(typeof(price_0) === 'bigint' && price_0 >= 0n && price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 189 char 1',
                                     'Uint<0..18446744073709551616>',
                                     price_0)
        }
        if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
          __compactRuntime.typeError('set_buyer_reference',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 189 char 1',
                                     'Bytes<32>',
                                     salt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_0.toValue(buyer_secret_0).concat(_descriptor_5.toValue(price_0).concat(_descriptor_0.toValue(salt_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._set_buyer_reference_0(context,
                                                     partialProofData,
                                                     class_id_0,
                                                     buyer_secret_0,
                                                     price_0,
                                                     salt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      compliance_check: (...args_1) => {
        if (args_1.length !== 12) {
          throw new __compactRuntime.CompactError(`compliance_check: expected 12 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const buyer_price_0 = args_1[2];
        const buyer_salt_0 = args_1[3];
        const supplier_prices_0 = args_1[4];
        const supplier_salts_0 = args_1[5];
        const product_0 = args_1[6];
        const volume_0 = args_1[7];
        const region_0 = args_1[8];
        const term_0 = args_1[9];
        const currency_0 = args_1[10];
        const date_window_0 = args_1[11];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(typeof(buyer_price_0) === 'bigint' && buyer_price_0 >= 0n && buyer_price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Uint<0..18446744073709551616>',
                                     buyer_price_0)
        }
        if (!(buyer_salt_0.buffer instanceof ArrayBuffer && buyer_salt_0.BYTES_PER_ELEMENT === 1 && buyer_salt_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     buyer_salt_0)
        }
        if (!(Array.isArray(supplier_prices_0) && supplier_prices_0.length === 5 && supplier_prices_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Vector<5, Uint<0..18446744073709551616>>',
                                     supplier_prices_0)
        }
        if (!(Array.isArray(supplier_salts_0) && supplier_salts_0.length === 5 && supplier_salts_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Vector<5, Bytes<32>>',
                                     supplier_salts_0)
        }
        if (!(product_0.buffer instanceof ArrayBuffer && product_0.BYTES_PER_ELEMENT === 1 && product_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     product_0)
        }
        if (!(volume_0.buffer instanceof ArrayBuffer && volume_0.BYTES_PER_ELEMENT === 1 && volume_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     volume_0)
        }
        if (!(region_0.buffer instanceof ArrayBuffer && region_0.BYTES_PER_ELEMENT === 1 && region_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     region_0)
        }
        if (!(term_0.buffer instanceof ArrayBuffer && term_0.BYTES_PER_ELEMENT === 1 && term_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     term_0)
        }
        if (!(currency_0.buffer instanceof ArrayBuffer && currency_0.BYTES_PER_ELEMENT === 1 && currency_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 10 (argument 11 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     currency_0)
        }
        if (!(date_window_0.buffer instanceof ArrayBuffer && date_window_0.BYTES_PER_ELEMENT === 1 && date_window_0.length === 32)) {
          __compactRuntime.typeError('compliance_check',
                                     'argument 11 (argument 12 as invoked from Typescript)',
                                     'mfnguard.compact line 220 char 1',
                                     'Bytes<32>',
                                     date_window_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_5.toValue(buyer_price_0).concat(_descriptor_0.toValue(buyer_salt_0).concat(_descriptor_6.toValue(supplier_prices_0).concat(_descriptor_1.toValue(supplier_salts_0).concat(_descriptor_0.toValue(product_0).concat(_descriptor_0.toValue(volume_0).concat(_descriptor_0.toValue(region_0).concat(_descriptor_0.toValue(term_0).concat(_descriptor_0.toValue(currency_0).concat(_descriptor_0.toValue(date_window_0))))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))))))))
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
                                                  supplier_salts_0,
                                                  product_0,
                                                  volume_0,
                                                  region_0,
                                                  term_0,
                                                  currency_0,
                                                  date_window_0);
        partialProofData.output = { value: _descriptor_9.toValue(result_0), alignment: _descriptor_9.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      reveal_violation: (...args_1) => {
        if (args_1.length !== 13) {
          throw new __compactRuntime.CompactError(`reveal_violation: expected 13 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const class_id_0 = args_1[1];
        const buyer_price_0 = args_1[2];
        const buyer_salt_0 = args_1[3];
        const supplier_prices_0 = args_1[4];
        const supplier_salts_0 = args_1[5];
        const auditor_secret_0 = args_1[6];
        const product_0 = args_1[7];
        const volume_0 = args_1[8];
        const region_0 = args_1[9];
        const term_0 = args_1[10];
        const currency_0 = args_1[11];
        const date_window_0 = args_1[12];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 1 (as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(class_id_0.buffer instanceof ArrayBuffer && class_id_0.BYTES_PER_ELEMENT === 1 && class_id_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     class_id_0)
        }
        if (!(typeof(buyer_price_0) === 'bigint' && buyer_price_0 >= 0n && buyer_price_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Uint<0..18446744073709551616>',
                                     buyer_price_0)
        }
        if (!(buyer_salt_0.buffer instanceof ArrayBuffer && buyer_salt_0.BYTES_PER_ELEMENT === 1 && buyer_salt_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     buyer_salt_0)
        }
        if (!(Array.isArray(supplier_prices_0) && supplier_prices_0.length === 5 && supplier_prices_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Vector<5, Uint<0..18446744073709551616>>',
                                     supplier_prices_0)
        }
        if (!(Array.isArray(supplier_salts_0) && supplier_salts_0.length === 5 && supplier_salts_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Vector<5, Bytes<32>>',
                                     supplier_salts_0)
        }
        if (!(auditor_secret_0.buffer instanceof ArrayBuffer && auditor_secret_0.BYTES_PER_ELEMENT === 1 && auditor_secret_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     auditor_secret_0)
        }
        if (!(product_0.buffer instanceof ArrayBuffer && product_0.BYTES_PER_ELEMENT === 1 && product_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     product_0)
        }
        if (!(volume_0.buffer instanceof ArrayBuffer && volume_0.BYTES_PER_ELEMENT === 1 && volume_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     volume_0)
        }
        if (!(region_0.buffer instanceof ArrayBuffer && region_0.BYTES_PER_ELEMENT === 1 && region_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     region_0)
        }
        if (!(term_0.buffer instanceof ArrayBuffer && term_0.BYTES_PER_ELEMENT === 1 && term_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 10 (argument 11 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     term_0)
        }
        if (!(currency_0.buffer instanceof ArrayBuffer && currency_0.BYTES_PER_ELEMENT === 1 && currency_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 11 (argument 12 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     currency_0)
        }
        if (!(date_window_0.buffer instanceof ArrayBuffer && date_window_0.BYTES_PER_ELEMENT === 1 && date_window_0.length === 32)) {
          __compactRuntime.typeError('reveal_violation',
                                     'argument 12 (argument 13 as invoked from Typescript)',
                                     'mfnguard.compact line 288 char 1',
                                     'Bytes<32>',
                                     date_window_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(class_id_0).concat(_descriptor_5.toValue(buyer_price_0).concat(_descriptor_0.toValue(buyer_salt_0).concat(_descriptor_6.toValue(supplier_prices_0).concat(_descriptor_1.toValue(supplier_salts_0).concat(_descriptor_0.toValue(auditor_secret_0).concat(_descriptor_0.toValue(product_0).concat(_descriptor_0.toValue(volume_0).concat(_descriptor_0.toValue(region_0).concat(_descriptor_0.toValue(term_0).concat(_descriptor_0.toValue(currency_0).concat(_descriptor_0.toValue(date_window_0)))))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))))))))
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
                                                  supplier_salts_0,
                                                  auditor_secret_0,
                                                  product_0,
                                                  volume_0,
                                                  region_0,
                                                  term_0,
                                                  currency_0,
                                                  date_window_0);
        partialProofData.output = { value: _descriptor_7.toValue(result_0), alignment: _descriptor_7.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      init_contract: this.circuits.init_contract,
      initialize_class: this.circuits.initialize_class,
      commit_price: this.circuits.commit_price,
      set_buyer_reference: this.circuits.set_buyer_reference,
      compliance_check: this.circuits.compliance_check,
      reveal_violation: this.circuits.reveal_violation
    };
    this.provableCircuits = {
      init_contract: this.circuits.init_contract,
      initialize_class: this.circuits.initialize_class,
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
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('init_contract', new __compactRuntime.ContractOperation());
    state_0.setOperation('initialize_class', new __compactRuntime.ContractOperation());
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
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(1n),
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
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_1, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _init_contract_0(context, partialProofData, owner_hash_0) {
    let tmp_0;
    __compactRuntime.assert(!(tmp_0 = 0n,
                              _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                        partialProofData,
                                                                                        [
                                                                                         { dup: { n: 0 } },
                                                                                         { idx: { cached: false,
                                                                                                  pushPath: false,
                                                                                                  path: [
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_2.toValue(1n),
                                                                                                                    alignment: _descriptor_2.alignment() } }] } },
                                                                                         { push: { storage: false,
                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                                                                         'member',
                                                                                         { popeq: { cached: true,
                                                                                                    result: undefined } }]).value)),
                            'Contract already initialized');
    const tmp_1 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(1n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_1),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(owner_hash_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _initialize_class_0(context,
                      partialProofData,
                      owner_secret_0,
                      class_id_0,
                      buyer_hash_0,
                      auditor_hash_0,
                      supplier_hashes_0,
                      comparability_hash_0)
  {
    let tmp_0;
    __compactRuntime.assert((tmp_0 = 0n,
                             _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_2.toValue(1n),
                                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Contract not initialized');
    const TAG_OWNER_0 = __compactRuntime.convertFieldToBytes(32,
                                                             4n,
                                                             'mfnguard.compact line 45 char 23');
    const expected_owner_0 = this._persistentHash_2([TAG_OWNER_0, owner_secret_0]);
    let tmp_1;
    __compactRuntime.assert(this._equal_0(expected_owner_0,
                                          (tmp_1 = 0n,
                                           _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                     partialProofData,
                                                                                                     [
                                                                                                      { dup: { n: 0 } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_2.toValue(1n),
                                                                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_2.toValue(tmp_1),
                                                                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                                                                      { popeq: { cached: false,
                                                                                                                 result: undefined } }]).value))),
                            'Unauthorized: Not the contract owner');
    const is_member_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
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
    __compactRuntime.assert(!is_member_0, 'Class already exists');
    const empty_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                               0n,
                                                               'mfnguard.compact line 52 char 25');
    __compactRuntime.assert(!this._equal_1(buyer_hash_0, empty_bytes_0),
                            'Buyer hash cannot be zero');
    __compactRuntime.assert(!this._equal_2(auditor_hash_0, empty_bytes_0),
                            'Auditor hash cannot be zero');
    __compactRuntime.assert(!this._equal_3(supplier_hashes_0[0], empty_bytes_0),
                            'Supplier hash 0 cannot be zero');
    __compactRuntime.assert(!this._equal_4(supplier_hashes_0[1], empty_bytes_0),
                            'Supplier hash 1 cannot be zero');
    __compactRuntime.assert(!this._equal_5(supplier_hashes_0[2], empty_bytes_0),
                            'Supplier hash 2 cannot be zero');
    __compactRuntime.assert(!this._equal_6(supplier_hashes_0[3], empty_bytes_0),
                            'Supplier hash 3 cannot be zero');
    __compactRuntime.assert(!this._equal_7(supplier_hashes_0[4], empty_bytes_0),
                            'Supplier hash 4 cannot be zero');
    __compactRuntime.assert(!this._equal_8(supplier_hashes_0[0],
                                           supplier_hashes_0[1]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_9(supplier_hashes_0[0],
                                           supplier_hashes_0[2]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_10(supplier_hashes_0[0],
                                            supplier_hashes_0[3]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_11(supplier_hashes_0[0],
                                            supplier_hashes_0[4]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_12(supplier_hashes_0[1],
                                            supplier_hashes_0[2]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_13(supplier_hashes_0[1],
                                            supplier_hashes_0[3]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_14(supplier_hashes_0[1],
                                            supplier_hashes_0[4]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_15(supplier_hashes_0[2],
                                            supplier_hashes_0[3]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_16(supplier_hashes_0[2],
                                            supplier_hashes_0[4]),
                            'Supplier hashes must be distinct');
    __compactRuntime.assert(!this._equal_17(supplier_hashes_0[3],
                                            supplier_hashes_0[4]),
                            'Supplier hashes must be distinct');
    const empty_slots_0 = [empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0,
                           empty_bytes_0];
    const empty_filled_0 = [0n, 0n, 0n, 0n, 0n];
    const initial_class_0 = { slots: empty_slots_0,
                              filled: empty_filled_0,
                              supplier_hashes: supplier_hashes_0,
                              buyer_ref: empty_bytes_0,
                              buyer_filled: 0n,
                              buyer_hash: buyer_hash_0,
                              auditor_hash: auditor_hash_0,
                              comparability_hash: comparability_hash_0 };
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(initial_class_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _compute_auditor_hash_0(secret_0) {
    const TAG_AUDITOR_0 = __compactRuntime.convertFieldToBytes(32,
                                                               1n,
                                                               'mfnguard.compact line 90 char 25');
    return this._persistentHash_2([TAG_AUDITOR_0, secret_0]);
  }
  _compute_owner_hash_0(secret_0) {
    const TAG_OWNER_0 = __compactRuntime.convertFieldToBytes(32,
                                                             4n,
                                                             'mfnguard.compact line 95 char 23');
    return this._persistentHash_2([TAG_OWNER_0, secret_0]);
  }
  _compute_supplier_hash_0(secret_0) {
    const TAG_SUPPLIER_0 = __compactRuntime.convertFieldToBytes(32,
                                                                5n,
                                                                'mfnguard.compact line 100 char 26');
    return this._persistentHash_2([TAG_SUPPLIER_0, secret_0]);
  }
  _compute_buyer_hash_0(secret_0) {
    const TAG_BUYER_SECRET_0 = __compactRuntime.convertFieldToBytes(32,
                                                                    7n,
                                                                    'mfnguard.compact line 105 char 30');
    return this._persistentHash_2([TAG_BUYER_SECRET_0, secret_0]);
  }
  _compute_comparability_hash_0(product_0,
                                volume_0,
                                region_0,
                                term_0,
                                currency_0,
                                date_window_0)
  {
    const TAG_COMPARABILITY_0 = __compactRuntime.convertFieldToBytes(32,
                                                                     6n,
                                                                     'mfnguard.compact line 117 char 31');
    return this._persistentHash_0([TAG_COMPARABILITY_0,
                                   product_0,
                                   volume_0,
                                   region_0,
                                   term_0,
                                   currency_0,
                                   date_window_0]);
  }
  _commit_price_0(context,
                  partialProofData,
                  class_id_0,
                  supplier_secret_0,
                  slot_index_0,
                  price_0,
                  salt_0)
  {
    __compactRuntime.assert(price_0 > 0n, 'Price must be strictly positive');
    __compactRuntime.assert(price_0 < 100000000000n,
                            'Price exceeds sanity limit');
    __compactRuntime.assert(slot_index_0 < 5n, 'Invalid slot index');
    const is_member_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
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
    __compactRuntime.assert(is_member_0, 'Class does not exist');
    const current_class_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
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
    const TAG_SUPPLIER_0 = __compactRuntime.convertFieldToBytes(32,
                                                                5n,
                                                                'mfnguard.compact line 139 char 26');
    const expected_supplier_0 = this._persistentHash_2([TAG_SUPPLIER_0,
                                                        supplier_secret_0]);
    const auth_hash_0 = this._equal_18(slot_index_0, 0n) ?
                        current_class_0.supplier_hashes[0] :
                        this._equal_19(slot_index_0, 1n) ?
                        current_class_0.supplier_hashes[1] :
                        this._equal_20(slot_index_0, 2n) ?
                        current_class_0.supplier_hashes[2] :
                        this._equal_21(slot_index_0, 3n) ?
                        current_class_0.supplier_hashes[3] :
                        current_class_0.supplier_hashes[4];
    __compactRuntime.assert(this._equal_22(expected_supplier_0, auth_hash_0),
                            'Unauthorized supplier for this slot');
    const is_empty_0 = this._equal_23(slot_index_0, 0n) ?
                       this._equal_24(current_class_0.filled[0], 0n) :
                       this._equal_25(slot_index_0, 1n) ?
                       this._equal_26(current_class_0.filled[1], 0n) :
                       this._equal_27(slot_index_0, 2n) ?
                       this._equal_28(current_class_0.filled[2], 0n) :
                       this._equal_29(slot_index_0, 3n) ?
                       this._equal_30(current_class_0.filled[3], 0n) :
                       this._equal_31(current_class_0.filled[4], 0n);
    __compactRuntime.assert(is_empty_0, 'Slot already filled');
    const TAG_PRICE_COMMIT_0 = __compactRuntime.convertFieldToBytes(32,
                                                                    2n,
                                                                    'mfnguard.compact line 156 char 30');
    const commitment_0 = this._persistentHash_1([TAG_PRICE_COMMIT_0,
                                                 class_id_0,
                                                 current_class_0.comparability_hash,
                                                 __compactRuntime.convertFieldToBytes(32,
                                                                                      price_0,
                                                                                      'mfnguard.compact line 157 char 124'),
                                                 salt_0]);
    const next_slots_0 = [this._equal_35(slot_index_0, 0n) ?
                          commitment_0 :
                          current_class_0.slots[0],
                          this._equal_36(slot_index_0, 1n) ?
                          commitment_0 :
                          current_class_0.slots[1],
                          this._equal_33(slot_index_0, 2n) ?
                          commitment_0 :
                          current_class_0.slots[2],
                          this._equal_34(slot_index_0, 3n) ?
                          commitment_0 :
                          current_class_0.slots[3],
                          this._equal_32(slot_index_0, 4n) ?
                          commitment_0 :
                          current_class_0.slots[4]];
    const next_filled_0 = [this._equal_40(slot_index_0, 0n) ?
                           1n :
                           current_class_0.filled[0],
                           this._equal_41(slot_index_0, 1n) ?
                           1n :
                           current_class_0.filled[1],
                           this._equal_38(slot_index_0, 2n) ?
                           1n :
                           current_class_0.filled[2],
                           this._equal_39(slot_index_0, 3n) ?
                           1n :
                           current_class_0.filled[3],
                           this._equal_37(slot_index_0, 4n) ?
                           1n :
                           current_class_0.filled[4]];
    const next_class_0 = { slots: next_slots_0,
                           filled: next_filled_0,
                           supplier_hashes: current_class_0.supplier_hashes,
                           buyer_ref: current_class_0.buyer_ref,
                           buyer_filled: current_class_0.buyer_filled,
                           buyer_hash: current_class_0.buyer_hash,
                           auditor_hash: current_class_0.auditor_hash,
                           comparability_hash:
                             current_class_0.comparability_hash };
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
  _set_buyer_reference_0(context,
                         partialProofData,
                         class_id_0,
                         buyer_secret_0,
                         price_0,
                         salt_0)
  {
    __compactRuntime.assert(price_0 > 0n, 'Price must be strictly positive');
    __compactRuntime.assert(price_0 < 100000000000n,
                            'Price exceeds sanity limit');
    const is_member_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
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
    __compactRuntime.assert(is_member_0, 'Class does not exist');
    const current_class_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
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
    __compactRuntime.assert(this._equal_42(current_class_0.buyer_filled, 0n),
                            'Buyer reference already set');
    const TAG_BUYER_SECRET_0 = __compactRuntime.convertFieldToBytes(32,
                                                                    7n,
                                                                    'mfnguard.compact line 199 char 30');
    const expected_buyer_hash_0 = this._persistentHash_2([TAG_BUYER_SECRET_0,
                                                          buyer_secret_0]);
    __compactRuntime.assert(this._equal_43(expected_buyer_hash_0,
                                           current_class_0.buyer_hash),
                            'Unauthorized buyer');
    const TAG_BUYER_COMMIT_0 = __compactRuntime.convertFieldToBytes(32,
                                                                    3n,
                                                                    'mfnguard.compact line 203 char 30');
    const commitment_0 = this._persistentHash_1([TAG_BUYER_COMMIT_0,
                                                 class_id_0,
                                                 current_class_0.comparability_hash,
                                                 __compactRuntime.convertFieldToBytes(32,
                                                                                      price_0,
                                                                                      'mfnguard.compact line 204 char 124'),
                                                 salt_0]);
    const next_class_0 = { slots: current_class_0.slots,
                           filled: current_class_0.filled,
                           supplier_hashes: current_class_0.supplier_hashes,
                           buyer_ref: commitment_0,
                           buyer_filled: 1n,
                           buyer_hash: current_class_0.buyer_hash,
                           auditor_hash: current_class_0.auditor_hash,
                           comparability_hash:
                             current_class_0.comparability_hash };
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
                      supplier_salts_0,
                      product_0,
                      volume_0,
                      region_0,
                      term_0,
                      currency_0,
                      date_window_0)
  {
    const TAG_PRICE_COMMIT_0 = __compactRuntime.convertFieldToBytes(32,
                                                                    2n,
                                                                    'mfnguard.compact line 233 char 30');
    const TAG_BUYER_COMMIT_0 = __compactRuntime.convertFieldToBytes(32,
                                                                    3n,
                                                                    'mfnguard.compact line 234 char 30');
    const TAG_COMPARABILITY_0 = __compactRuntime.convertFieldToBytes(32,
                                                                     6n,
                                                                     'mfnguard.compact line 235 char 31');
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
    __compactRuntime.assert(this._equal_44(class_state_0.buyer_filled, 1n),
                            'Buyer reference not set');
    const computed_comp_0 = this._persistentHash_0([TAG_COMPARABILITY_0,
                                                    product_0,
                                                    volume_0,
                                                    region_0,
                                                    term_0,
                                                    currency_0,
                                                    date_window_0]);
    __compactRuntime.assert(this._equal_45(computed_comp_0,
                                           class_state_0.comparability_hash),
                            'Comparability attributes do not match the class definition');
    const expected_buyer_commit_0 = this._persistentHash_1([TAG_BUYER_COMMIT_0,
                                                            class_id_0,
                                                            class_state_0.comparability_hash,
                                                            __compactRuntime.convertFieldToBytes(32,
                                                                                                 buyer_price_0,
                                                                                                 'mfnguard.compact line 245 char 133'),
                                                            buyer_salt_0]);
    __compactRuntime.assert(this._equal_46(expected_buyer_commit_0,
                                           class_state_0.buyer_ref),
                            'Buyer witness does not match commitment');
    const max_val_0 = 18446744073709551615n;
    const p0_0 = this._equal_47(class_state_0.filled[0], 1n) ?
                 supplier_prices_0[0] :
                 max_val_0;
    const expected_commit_0_0 = this._persistentHash_1([TAG_PRICE_COMMIT_0,
                                                        class_id_0,
                                                        class_state_0.comparability_hash,
                                                        __compactRuntime.convertFieldToBytes(32,
                                                                                             p0_0,
                                                                                             'mfnguard.compact line 251 char 129'),
                                                        supplier_salts_0[0]]);
    __compactRuntime.assert(this._equal_48(class_state_0.filled[0], 0n)
                            ||
                            this._equal_49(expected_commit_0_0,
                                           class_state_0.slots[0]),
                            'Supplier witness 0 does not match');
    const p1_0 = this._equal_50(class_state_0.filled[1], 1n) ?
                 supplier_prices_0[1] :
                 max_val_0;
    const expected_commit_1_0 = this._persistentHash_1([TAG_PRICE_COMMIT_0,
                                                        class_id_0,
                                                        class_state_0.comparability_hash,
                                                        __compactRuntime.convertFieldToBytes(32,
                                                                                             p1_0,
                                                                                             'mfnguard.compact line 255 char 129'),
                                                        supplier_salts_0[1]]);
    __compactRuntime.assert(this._equal_51(class_state_0.filled[1], 0n)
                            ||
                            this._equal_52(expected_commit_1_0,
                                           class_state_0.slots[1]),
                            'Supplier witness 1 does not match');
    const p2_0 = this._equal_53(class_state_0.filled[2], 1n) ?
                 supplier_prices_0[2] :
                 max_val_0;
    const expected_commit_2_0 = this._persistentHash_1([TAG_PRICE_COMMIT_0,
                                                        class_id_0,
                                                        class_state_0.comparability_hash,
                                                        __compactRuntime.convertFieldToBytes(32,
                                                                                             p2_0,
                                                                                             'mfnguard.compact line 259 char 129'),
                                                        supplier_salts_0[2]]);
    __compactRuntime.assert(this._equal_54(class_state_0.filled[2], 0n)
                            ||
                            this._equal_55(expected_commit_2_0,
                                           class_state_0.slots[2]),
                            'Supplier witness 2 does not match');
    const p3_0 = this._equal_56(class_state_0.filled[3], 1n) ?
                 supplier_prices_0[3] :
                 max_val_0;
    const expected_commit_3_0 = this._persistentHash_1([TAG_PRICE_COMMIT_0,
                                                        class_id_0,
                                                        class_state_0.comparability_hash,
                                                        __compactRuntime.convertFieldToBytes(32,
                                                                                             p3_0,
                                                                                             'mfnguard.compact line 263 char 129'),
                                                        supplier_salts_0[3]]);
    __compactRuntime.assert(this._equal_57(class_state_0.filled[3], 0n)
                            ||
                            this._equal_58(expected_commit_3_0,
                                           class_state_0.slots[3]),
                            'Supplier witness 3 does not match');
    const p4_0 = this._equal_59(class_state_0.filled[4], 1n) ?
                 supplier_prices_0[4] :
                 max_val_0;
    const expected_commit_4_0 = this._persistentHash_1([TAG_PRICE_COMMIT_0,
                                                        class_id_0,
                                                        class_state_0.comparability_hash,
                                                        __compactRuntime.convertFieldToBytes(32,
                                                                                             p4_0,
                                                                                             'mfnguard.compact line 267 char 129'),
                                                        supplier_salts_0[4]]);
    __compactRuntime.assert(this._equal_60(class_state_0.filled[4], 0n)
                            ||
                            this._equal_61(expected_commit_4_0,
                                           class_state_0.slots[4]),
                            'Supplier witness 4 does not match');
    const has_any_0 = this._equal_62(class_state_0.filled[0], 1n)
                      ||
                      this._equal_63(class_state_0.filled[1], 1n)
                      ||
                      this._equal_64(class_state_0.filled[2], 1n)
                      ||
                      this._equal_65(class_state_0.filled[3], 1n)
                      ||
                      this._equal_66(class_state_0.filled[4], 1n);
    __compactRuntime.assert(has_any_0, 'No supplier prices committed');
    const min1_0 = p0_0 < p1_0 ? p0_0 : p1_0;
    const min2_0 = p2_0 < p3_0 ? p2_0 : p3_0;
    const min3_0 = min1_0 < min2_0 ? min1_0 : min2_0;
    const min_supplier_price_0 = min3_0 < p4_0 ? min3_0 : p4_0;
    const count_raw_0 = class_state_0.filled[0] + class_state_0.filled[1]
                        +
                        class_state_0.filled[2]
                        +
                        class_state_0.filled[3]
                        +
                        class_state_0.filled[4];
    const count_0 = ((t1) => {
                      if (t1 > 255n) {
                        throw new __compactRuntime.CompactError('mfnguard.compact line 279 char 19: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                      }
                      return t1;
                    })(count_raw_0);
    if (min_supplier_price_0 < buyer_price_0) {
      return { compliant: 0n,
               discrepancy:
                 (__compactRuntime.assert(buyer_price_0 >= min_supplier_price_0,
                                          'result of subtraction would be negative'),
                  buyer_price_0 - min_supplier_price_0),
               committed_count: count_0 };
    } else {
      return { compliant: 1n, discrepancy: 0n, committed_count: count_0 };
    }
  }
  _reveal_violation_0(context,
                      partialProofData,
                      class_id_0,
                      buyer_price_0,
                      buyer_salt_0,
                      supplier_prices_0,
                      supplier_salts_0,
                      auditor_secret_0,
                      product_0,
                      volume_0,
                      region_0,
                      term_0,
                      currency_0,
                      date_window_0)
  {
    const TAG_AUDITOR_0 = __compactRuntime.convertFieldToBytes(32,
                                                               1n,
                                                               'mfnguard.compact line 302 char 25');
    const expected_auditor_hash_0 = this._persistentHash_2([TAG_AUDITOR_0,
                                                            auditor_secret_0]);
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
    __compactRuntime.assert(this._equal_67(expected_auditor_hash_0,
                                           class_state_0.auditor_hash),
                            'Unauthorized auditor');
    const result_0 = this._compliance_check_0(context,
                                              partialProofData,
                                              class_id_0,
                                              buyer_price_0,
                                              buyer_salt_0,
                                              supplier_prices_0,
                                              supplier_salts_0,
                                              product_0,
                                              volume_0,
                                              region_0,
                                              term_0,
                                              currency_0,
                                              date_window_0);
    __compactRuntime.assert(this._equal_68(result_0.compliant, 0n),
                            'No violation to reveal');
    const max_val_0 = 18446744073709551615n;
    const p0_0 = this._equal_69(class_state_0.filled[0], 1n) ?
                 supplier_prices_0[0] :
                 max_val_0;
    const p1_0 = this._equal_70(class_state_0.filled[1], 1n) ?
                 supplier_prices_0[1] :
                 max_val_0;
    const p2_0 = this._equal_71(class_state_0.filled[2], 1n) ?
                 supplier_prices_0[2] :
                 max_val_0;
    const p3_0 = this._equal_72(class_state_0.filled[3], 1n) ?
                 supplier_prices_0[3] :
                 max_val_0;
    const p4_0 = this._equal_73(class_state_0.filled[4], 1n) ?
                 supplier_prices_0[4] :
                 max_val_0;
    const v0_0 = p0_0 < buyer_price_0;
    const v1_0 = p1_0 < buyer_price_0;
    const v2_0 = p2_0 < buyer_price_0;
    const v3_0 = p3_0 < buyer_price_0;
    const v4_0 = p4_0 < buyer_price_0;
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
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_12(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_16(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_17(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_18(x0, y0) {
    if (x0 !== y0) { return false; }
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
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_22(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
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
    if (x0 !== y0) { return false; }
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
  _equal_34(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_35(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_36(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_37(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_38(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_39(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_40(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_41(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_42(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_43(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_44(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_45(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_46(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_47(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_48(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_49(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_50(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_51(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_52(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_53(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_54(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_55(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_56(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_57(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_58(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_59(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_60(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_61(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_62(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_63(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_64(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_65(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_66(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_67(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_68(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_69(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_70(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_71(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_72(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_73(x0, y0) {
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
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
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
                                     'mfnguard.compact line 28 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
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
                                     'mfnguard.compact line 28 char 1',
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
    },
    state: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
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
                                                                                            value: { value: _descriptor_2.toValue(1n),
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
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 255n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'mfnguard.compact line 29 char 1',
                                     'Uint<0..256>',
                                     key_0)
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 255n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'mfnguard.compact line 29 char 1',
                                     'Uint<0..256>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(key_0),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {
  compute_auditor_hash: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`compute_auditor_hash: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('compute_auditor_hash',
                                 'argument 1',
                                 'mfnguard.compact line 89 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._compute_auditor_hash_0(secret_0);
  },
  compute_owner_hash: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`compute_owner_hash: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('compute_owner_hash',
                                 'argument 1',
                                 'mfnguard.compact line 94 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._compute_owner_hash_0(secret_0);
  },
  compute_supplier_hash: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`compute_supplier_hash: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('compute_supplier_hash',
                                 'argument 1',
                                 'mfnguard.compact line 99 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._compute_supplier_hash_0(secret_0);
  },
  compute_buyer_hash: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`compute_buyer_hash: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('compute_buyer_hash',
                                 'argument 1',
                                 'mfnguard.compact line 104 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._compute_buyer_hash_0(secret_0);
  },
  compute_comparability_hash: (...args_0) => {
    if (args_0.length !== 6) {
      throw new __compactRuntime.CompactError(`compute_comparability_hash: expected 6 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const product_0 = args_0[0];
    const volume_0 = args_0[1];
    const region_0 = args_0[2];
    const term_0 = args_0[3];
    const currency_0 = args_0[4];
    const date_window_0 = args_0[5];
    if (!(product_0.buffer instanceof ArrayBuffer && product_0.BYTES_PER_ELEMENT === 1 && product_0.length === 32)) {
      __compactRuntime.typeError('compute_comparability_hash',
                                 'argument 1',
                                 'mfnguard.compact line 109 char 1',
                                 'Bytes<32>',
                                 product_0)
    }
    if (!(volume_0.buffer instanceof ArrayBuffer && volume_0.BYTES_PER_ELEMENT === 1 && volume_0.length === 32)) {
      __compactRuntime.typeError('compute_comparability_hash',
                                 'argument 2',
                                 'mfnguard.compact line 109 char 1',
                                 'Bytes<32>',
                                 volume_0)
    }
    if (!(region_0.buffer instanceof ArrayBuffer && region_0.BYTES_PER_ELEMENT === 1 && region_0.length === 32)) {
      __compactRuntime.typeError('compute_comparability_hash',
                                 'argument 3',
                                 'mfnguard.compact line 109 char 1',
                                 'Bytes<32>',
                                 region_0)
    }
    if (!(term_0.buffer instanceof ArrayBuffer && term_0.BYTES_PER_ELEMENT === 1 && term_0.length === 32)) {
      __compactRuntime.typeError('compute_comparability_hash',
                                 'argument 4',
                                 'mfnguard.compact line 109 char 1',
                                 'Bytes<32>',
                                 term_0)
    }
    if (!(currency_0.buffer instanceof ArrayBuffer && currency_0.BYTES_PER_ELEMENT === 1 && currency_0.length === 32)) {
      __compactRuntime.typeError('compute_comparability_hash',
                                 'argument 5',
                                 'mfnguard.compact line 109 char 1',
                                 'Bytes<32>',
                                 currency_0)
    }
    if (!(date_window_0.buffer instanceof ArrayBuffer && date_window_0.BYTES_PER_ELEMENT === 1 && date_window_0.length === 32)) {
      __compactRuntime.typeError('compute_comparability_hash',
                                 'argument 6',
                                 'mfnguard.compact line 109 char 1',
                                 'Bytes<32>',
                                 date_window_0)
    }
    return _dummyContract._compute_comparability_hash_0(product_0,
                                                        volume_0,
                                                        region_0,
                                                        term_0,
                                                        currency_0,
                                                        date_window_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
