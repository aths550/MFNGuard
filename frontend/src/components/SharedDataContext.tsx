"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  generateSecretKey, 
  bytesToHex, 
  computeBuyerHash, 
  computeAuditorHash, 
  computeSupplierHash 
} from "../lib/crypto";

/**
 * SharedDataContext
 * 
 * Provides a React context for managing witness data (prices and salts) across the application,
 * as well as persisting form state across different views (Owner, Buyer, Supplier, Dispute).
 */

export interface FormData {
  label: string;
  product: string;
  volume: string;
  region: string;
  term: string;
  currency: string;
  startDate: string;
  endDate: string;
  ownerSecret: string;
  buyerSecret: string;
  auditorSecret: string;
  supplierSecrets: string[];
  buyerHash: string;
  auditorHash: string;
  supplierHashes: string[];
}

export interface SharedDataContextType {
  supplierPrices: Record<string, bigint[]>; // mapping class_id -> prices
  supplierSalts: Record<string, Uint8Array[]>;
  buyerPrice: Record<string, bigint>;
  buyerSalt: Record<string, Uint8Array>;
  addSupplierData: (classId: string, prices: bigint[], salts: Uint8Array[]) => void;
  addBuyerData: (classId: string, price: bigint, salt: Uint8Array) => void;
  importSupplierData: (classId: string, prices: bigint[], salts: Uint8Array[]) => void;
  
  formData: FormData;
  updateFormData: (partial: Partial<FormData>) => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [supplierPrices, setSupplierPrices] = useState<Record<string, bigint[]>>({});
  const [supplierSalts, setSupplierSalts] = useState<Record<string, Uint8Array[]>>({});
  const [buyerPrice, setBuyerPrice] = useState<Record<string, bigint>>({});
  const [buyerSalt, setBuyerSalt] = useState<Record<string, Uint8Array>>({});

  const [formData, setFormData] = useState<FormData>({
    label: 'class-a-12',
    product: 'Corn',
    volume: '100',
    region: 'US-Midwest',
    term: '30',
    currency: 'USD',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    ownerSecret: '',
    buyerSecret: '',
    auditorSecret: '',
    supplierSecrets: ['', '', '', '', ''],
    buyerHash: '',
    auditorHash: '',
    supplierHashes: ['', '', '', '', ''],
  });

  // Auto-generate distinct secrets and hashes on mount
  useEffect(() => {
    // We only want to generate secrets if they haven't been generated yet
    if (!formData.buyerSecret) {
      const bSec = generateSecretKey();
      const aSec = generateSecretKey();
      const sSecs = [
        generateSecretKey(),
        generateSecretKey(),
        generateSecretKey(),
        generateSecretKey(),
        generateSecretKey(),
      ];

      setFormData(prev => ({
        ...prev,
        buyerSecret: bytesToHex(bSec),
        auditorSecret: bytesToHex(aSec),
        supplierSecrets: sSecs.map(bytesToHex),
        buyerHash: bytesToHex(computeBuyerHash(bSec)),
        auditorHash: bytesToHex(computeAuditorHash(aSec)),
        supplierHashes: sSecs.map(s => bytesToHex(computeSupplierHash(s))),
      }));
    }
  }, []); // Run once on mount

  const updateFormData = (partial: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  };

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
    <SharedDataContext.Provider value={{ 
      supplierPrices, supplierSalts, buyerPrice, buyerSalt, 
      addSupplierData, addBuyerData, importSupplierData,
      formData, updateFormData
    }}>
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
