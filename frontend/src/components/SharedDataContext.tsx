"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
/**
 * SharedDataContext
 * 
 * Provides a React context for managing witness data (prices and salts) across the application.
 * 
 * CROSS-PARTY EXCHANGE:
 * In a real-world scenario, the Supplier and Buyer are different entities on different machines.
 * This context is supported by an export/import flow:
 * 1. Supplier commits prices, which are saved in this context.
 * 2. Supplier exports the data as a plaintext JSON payload.
 * 3. Buyer receives the payload out-of-band and imports it.
 * 
 * PERSISTENCE:
 * This context keeps data IN-MEMORY ONLY for security. All data will be lost on page reload.
 * 
 * SECURITY NOTE:
 * Keys and witness data are highly sensitive. We have removed localStorage persistence to prevent
 * accidental data leakage to other scripts running on the same origin.
 */

export interface SharedDataContextType {
  supplierPrices: Record<string, bigint[]>; // mapping class_id -> prices
  supplierSalts: Record<string, Uint8Array[]>;
  buyerPrice: Record<string, bigint>;
  buyerSalt: Record<string, Uint8Array>;
  addSupplierData: (classId: string, prices: bigint[], salts: Uint8Array[]) => void;
  addBuyerData: (classId: string, price: bigint, salt: Uint8Array) => void;
  importSupplierData: (classId: string, prices: bigint[], salts: Uint8Array[]) => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [supplierPrices, setSupplierPrices] = useState<Record<string, bigint[]>>({});
  const [supplierSalts, setSupplierSalts] = useState<Record<string, Uint8Array[]>>({});
  const [buyerPrice, setBuyerPrice] = useState<Record<string, bigint>>({});
  const [buyerSalt, setBuyerSalt] = useState<Record<string, Uint8Array>>({});

  const addSupplierData = (classId: string, prices: bigint[], salts: Uint8Array[]) => {
    setSupplierPrices(prev => ({ ...prev, [classId]: prices }));
    setSupplierSalts(prev => ({ ...prev, [classId]: salts }));
  };

  const importSupplierData = (classId: string, prices: bigint[], salts: Uint8Array[]) => {
    setSupplierPrices(prev => ({ ...prev, [classId]: prices }));
    setSupplierSalts(prev => ({ ...prev, [classId]: salts }));
  };

  const addBuyerData = (classId: string, price: bigint, salt: Uint8Array) => {
    setBuyerPrice(prev => ({ ...prev, [classId]: price }));
    setBuyerSalt(prev => ({ ...prev, [classId]: salt }));
  };

  return (
    <SharedDataContext.Provider value={{ supplierPrices, supplierSalts, buyerPrice, buyerSalt, addSupplierData, addBuyerData, importSupplierData }}>
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
