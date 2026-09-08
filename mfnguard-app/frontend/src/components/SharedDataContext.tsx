"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * ============================================================================
 * WARNING: DEMO-ONLY STAND-IN FOR OFF-CHAIN PRIVATE DATA EXCHANGE
 * ============================================================================
 * 
 * This SharedDataContext is purely a mock built to simulate an off-chain secure 
 * channel for testing in a single browser session. 
 * 
 * In a real production deployment, the Buyer and Supplier are different users 
 * operating on different computers. Midnight's zero-knowledge proving requires 
 * the party running a compliance check to have ALL plaintext inputs (witnesses) 
 * locally to generate the proof.
 * 
 * To securely share these private inputs without exposing them on the ledger, 
 * a production app must use a real off-chain mechanism, such as:
 *   - Encrypted messaging (e.g., Signal Protocol)
 *   - Secure MPC backend
 *   - Manually exchanging a signed encrypted payload/file
 * 
 * DO NOT use this in-memory sharing approach for a multi-user production build.
 * ============================================================================
 */

export interface SharedDataContextType {
  supplierPrices: Record<string, bigint[]>; // mapping class_id -> prices
  supplierSalts: Record<string, Uint8Array[]>;
  buyerPrice: Record<string, bigint>;
  buyerSalt: Record<string, Uint8Array>;
  addSupplierData: (classId: string, prices: bigint[], salts: Uint8Array[]) => void;
  addBuyerData: (classId: string, price: bigint, salt: Uint8Array) => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export function SharedDataProvider({ children }: { children: React.ReactNode }) {
  const [supplierPrices, setSupplierPrices] = useState<Record<string, bigint[]>>({});
  const [supplierSalts, setSupplierSalts] = useState<Record<string, Uint8Array[]>>({});
  const [buyerPrice, setBuyerPrice] = useState<Record<string, bigint>>({});
  const [buyerSalt, setBuyerSalt] = useState<Record<string, Uint8Array>>({});

  const addSupplierData = (classId: string, prices: bigint[], salts: Uint8Array[]) => {
    console.log(`[SharedDataContext] addSupplierData called for classId: '${classId}'`);
    console.log(`[SharedDataContext] Storing prices:`, prices);
    setSupplierPrices(prev => ({ ...prev, [classId]: prices }));
    setSupplierSalts(prev => ({ ...prev, [classId]: salts }));
  };

  const addBuyerData = (classId: string, price: bigint, salt: Uint8Array) => {
    console.log(`[SharedDataContext] addBuyerData called for classId: '${classId}'`);
    setBuyerPrice(prev => ({ ...prev, [classId]: price }));
    setBuyerSalt(prev => ({ ...prev, [classId]: salt }));
  };

  return (
    <SharedDataContext.Provider value={{ supplierPrices, supplierSalts, buyerPrice, buyerSalt, addSupplierData, addBuyerData }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error("useSharedData must be used within a SharedDataProvider");
  }
  return context;
}
