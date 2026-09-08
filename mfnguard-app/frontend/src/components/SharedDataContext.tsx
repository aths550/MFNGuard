"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
/**
 * SharedDataContext
 * 
 * Provides a React context for managing witness data (prices and salts) across the application.
 * 
 * CROSS-PARTY EXCHANGE (Option A):
 * In a real-world scenario, the Supplier and Buyer are different entities on different machines.
 * This context is supported by an encrypted export/import flow:
 * 1. Supplier commits prices, which are saved in this context.
 * 2. Supplier exports the data as an AES-256-GCM encrypted JSON payload.
 * 3. Buyer receives the payload out-of-band, imports it, and decrypts it with the shared passphrase.
 * 
 * PERSISTENCE:
 * To ensure witness data survives page refreshes, this context persists decrypted data to `localStorage`.
 * 
 * SECURITY LIMITATION:
 * The data stored in `localStorage` is only protected against casual inspection using a static obfuscation key.
 * It is NOT secure against scripts with execution access to the page, as the key material is also client-side.
 * Real at-rest protection would require re-prompting for the passphrase on every page reload.
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { obfuscateForStorage, deobfuscateFromStorage } from '../lib/crypto';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const stored = localStorage.getItem('mfnguard_witnesses');
        if (stored) {
          const deobfuscated = await deobfuscateFromStorage(stored);
          const data = JSON.parse(deobfuscated);
          
          if (data.supplierPrices) {
            const parsedPrices: Record<string, bigint[]> = {};
            for (const [key, arr] of Object.entries(data.supplierPrices)) {
              parsedPrices[key] = (arr as string[]).map(s => BigInt(s));
            }
            setSupplierPrices(parsedPrices);
          }
          
          if (data.supplierSalts) {
            const parsedSalts: Record<string, Uint8Array[]> = {};
            for (const [key, arr] of Object.entries(data.supplierSalts)) {
              parsedSalts[key] = (arr as number[][]).map(nums => new Uint8Array(nums));
            }
            setSupplierSalts(parsedSalts);
          }
          
          if (data.buyerPrice) {
            const parsedBuyerPrice: Record<string, bigint> = {};
            for (const [key, val] of Object.entries(data.buyerPrice)) {
              parsedBuyerPrice[key] = BigInt(val as string);
            }
            setBuyerPrice(parsedBuyerPrice);
          }
          
          if (data.buyerSalt) {
            const parsedBuyerSalt: Record<string, Uint8Array> = {};
            for (const [key, arr] of Object.entries(data.buyerSalt)) {
              parsedBuyerSalt[key] = new Uint8Array(arr as number[]);
            }
            setBuyerSalt(parsedBuyerSalt);
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.error('Failed to load witnesses from storage:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFromStorage();
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveToStorage = async () => {
      try {
        // Serialize BigInts to strings, and Uint8Arrays to standard arrays
        const serializedPrices: Record<string, string[]> = {};
        for (const [key, arr] of Object.entries(supplierPrices)) {
          serializedPrices[key] = arr.map(b => b.toString());
        }
        
        const serializedSalts: Record<string, number[][]> = {};
        for (const [key, arr] of Object.entries(supplierSalts)) {
          serializedSalts[key] = arr.map(ua => Array.from(ua));
        }
        
        const serializedBuyerPrice: Record<string, string> = {};
        for (const [key, val] of Object.entries(buyerPrice)) {
          serializedBuyerPrice[key] = val.toString();
        }
        
        const serializedBuyerSalt: Record<string, number[]> = {};
        for (const [key, val] of Object.entries(buyerSalt)) {
          serializedBuyerSalt[key] = Array.from(val);
        }

        const data = {
          supplierPrices: serializedPrices,
          supplierSalts: serializedSalts,
          buyerPrice: serializedBuyerPrice,
          buyerSalt: serializedBuyerSalt
        };

        const json = JSON.stringify(data);
        const obfuscated = await obfuscateForStorage(json);
        localStorage.setItem('mfnguard_witnesses', obfuscated);
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.error('Failed to save witnesses to storage:', e);
      }
    };
    saveToStorage();
  }, [supplierPrices, supplierSalts, buyerPrice, buyerSalt, isLoaded]);

  const addSupplierData = (classId: string, prices: bigint[], salts: Uint8Array[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SharedDataContext] addSupplierData called for classId: '${classId}'`);
      console.log(`[SharedDataContext] Storing prices:`, prices);
    }
    setSupplierPrices(prev => ({ ...prev, [classId]: prices }));
    setSupplierSalts(prev => ({ ...prev, [classId]: salts }));
  };

  const importSupplierData = (classId: string, prices: bigint[], salts: Uint8Array[]) => {
    setSupplierPrices(prev => ({ ...prev, [classId]: prices }));
    setSupplierSalts(prev => ({ ...prev, [classId]: salts }));
  };

  const addBuyerData = (classId: string, price: bigint, salt: Uint8Array) => {
    if (process.env.NODE_ENV === 'development') console.log(`[SharedDataContext] addBuyerData called for classId: '${classId}'`);
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
