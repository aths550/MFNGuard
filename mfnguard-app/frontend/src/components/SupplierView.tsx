"use client";

import { useState } from "react";
import { useWallet } from "./WalletContext";
import { useSharedData } from "./SharedDataContext";
import { encryptPayload } from "../lib/crypto";
import { ledger } from "../../../contract/src/index";

interface Slot {
  classId: string;
  price: string;
  salt: string;
  status: "pending" | "confirmed" | "failed";
  slotIndex?: number;
}

// Helper to convert hex string to Uint8Array
const hexToUint8Array = (hex: string) => {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < Math.min(hex.length / 2, 32); i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

// Helper to convert string to Uint8Array 32-bytes
const stringToUint8Array = (str: string) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const bytes = new Uint8Array(32);
  bytes.set(encoded.slice(0, 32));
  return bytes;
};

export default function SupplierView() {
  const { connectedAddress, mfnguardAPI, disconnect, isSyncing } = useWallet();
  const { addSupplierData, supplierPrices: existingSupplierPrices, supplierSalts: existingSupplierSalts } = useSharedData();
  const [classId, setClassId] = useState("");
  const [price, setPrice] = useState("");
  
  // Auto-generate 32-byte salt as hex
  const generateSalt = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const [salt, setSalt] = useState(generateSalt());
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passphrase, setPassphrase] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommitting || isSyncing) return;
    if (!connectedAddress || !mfnguardAPI) {
      setError("Please connect your wallet first and ensure contract API is initialized.");
      return;
    }
    
    setError(null);
    setIsCommitting(true);
    
    try {
      if (process.env.NODE_ENV === 'development') console.log(`[Local Action] Committing price ${price} to class ${classId} with salt ${salt}`);
      
      const capturedPrice = price;
      const capturedSalt = salt;
      
      const priceBigInt = BigInt(capturedPrice);
      if (priceBigInt < 0n) {
        throw new Error("Contract Error: Invalid witness. Price must be positive.");
      }

      const classIdBytes = stringToUint8Array(classId);
      const saltBytes = hexToUint8Array(capturedSalt);

      // Read current on-chain state to find the next available slot
      const classState = await mfnguardAPI.get_class_state(classIdBytes, ledger);
      let nextSlotIndex = 0;
      if (classState && classState.filled) {
        // filled is a bigint array, we look for the first 0n
        nextSlotIndex = classState.filled.findIndex((f: bigint) => f === 0n);
        if (nextSlotIndex === -1) {
          throw new Error("This comparability class is full (5/5 suppliers).");
        }
      }

      if (process.env.NODE_ENV === 'development') console.log(`[SupplierView] EXACT BEFORE commit_price - price: ${priceBigInt.toString()}, saltBytes:`, saltBytes, `computed slot index: ${nextSlotIndex}`);
      await mfnguardAPI.commit_price(classIdBytes, priceBigInt, saltBytes);

      setSlots([...slots, { classId, price: capturedPrice, salt: capturedSalt, status: "confirmed", slotIndex: nextSlotIndex }]);
      
      const MAX_UINT64 = BigInt("18446744073709551615");
      let currentPrices = existingSupplierPrices[classId] ? [...existingSupplierPrices[classId]] : Array(5).fill(MAX_UINT64);
      let currentSalts = existingSupplierSalts[classId] ? [...existingSupplierSalts[classId]] : Array(5).fill(null).map(() => new Uint8Array(32));
      
      currentPrices[nextSlotIndex] = priceBigInt;
      currentSalts[nextSlotIndex] = saltBytes;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SupplierView] EXACT BEFORE addSupplierData - appended price at index ${nextSlotIndex}: ${priceBigInt.toString()}`);
        console.log(`[SupplierView] Value of classId exactly before addSupplierData: '${classId}'`);
      }
      addSupplierData(classId, currentPrices, currentSalts);
      
      // Reset form
      setPrice("");
      setSalt(generateSalt());
    } catch (err: any) {
      const errMsg = err.message || "Failed to commit price";
      if (errMsg.toLowerCase().includes("expired") || errMsg.toLowerCase().includes("reconnect")) {
        disconnect();
        setError("Wallet session expired. Please click 'Connect Lace Wallet' at the top right to reconnect, then try again.");
      } else if (errMsg.includes("182")) {
        setError("Wallet still syncing — please wait a moment and try again.");
      } else {
        setError(errMsg);
      }
    } finally {
      setIsCommitting(false);
    }
  };

  const handleExportBundle = async () => {
    if (slots.length === 0 || !passphrase) return;
    setIsExporting(true);
    setServerStatus(null);
    setError(null);
    
    try {
      const targetClass = slots[0].classId; // Assuming we export for the first class we worked on
      
      // We export the entire array of prices and salts for the target class from the SharedDataContext
      // since the context now handles local persistence and updates correctly.
      const pricesToExport = existingSupplierPrices[targetClass] || [];
      const saltsToExport = existingSupplierSalts[targetClass] || [];

      // Serialize data for export
      const exportData = {
        classId: targetClass,
        prices: pricesToExport.map(p => p.toString()),
        salts: saltsToExport.map(s => Array.from(s))
      };

      const plaintext = JSON.stringify(exportData);
      const encryptedPayload = await encryptPayload(plaintext, passphrase);

      // Trigger file download
      const blob = new Blob([JSON.stringify(encryptedPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mfnguard-witness-${targetClass.substring(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setServerStatus("Success: Witness bundle encrypted and exported.");
      setPassphrase(""); // Clear passphrase after use
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') console.error(err);
      setError(`Encryption Error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Supplier Portal</h2>
        <p className="text-slate-400 text-sm">Commit prices privately to the blockchain. Your raw prices never leave your device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Commit Form */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Commit Deal
          </h3>
          
          <form onSubmit={handleCommit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Comparability Class ID</label>
              <input 
                type="text" 
                value={classId}
                onChange={e => {
                  setClassId(e.target.value);
                }}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                placeholder="e.g., class-a-q3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Price</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex justify-between">
                <span>Cryptographic Salt</span>
                <button type="button" onClick={() => setSalt(generateSalt())} className="text-emerald-400 hover:text-emerald-300 text-xs">Regenerate</button>
              </label>
              <input 
                type="text" 
                value={salt}
                onChange={e => setSalt(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isCommitting || isSyncing || !connectedAddress || !mfnguardAPI}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSyncing ? "Syncing wallet, one moment..." : isCommitting ? "Committing to Chain..." : "Commit Price"}
            </button>
          </form>
        </div>

        {/* Local Session Data */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-medium">Export Witnesses</h3>
          </div>
          
          {slots.length > 0 && (
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
              <label className="block text-sm font-medium text-slate-300">Shared Passphrase (for Export)</label>
              <input 
                type="password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="Enter passphrase to encrypt"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button 
                onClick={handleExportBundle}
                disabled={isExporting || !passphrase}
                className="w-full text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2.5 px-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isExporting ? "Encrypting..." : "Export Witness Bundle"}
              </button>
            </div>
          )}
          
          {serverStatus && (
            <div className="mb-4 text-emerald-400 text-sm p-3 bg-emerald-400/10 rounded-xl border border-emerald-400/20">
              {serverStatus}
            </div>
          )}

          <div className="space-y-3">
            {slots.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl p-8 text-center text-slate-500 text-sm">
                No prices committed in this session yet.
              </div>
            ) : (
              slots.map((slot, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-200">{slot.classId}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">Slot {slot.slotIndex !== undefined ? slot.slotIndex : idx}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-sm text-emerald-400">Confirmed</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 text-xs text-slate-500 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
            <span className="font-semibold text-slate-400">Persistence Note:</span> Your witnesses are persisted securely in localStorage. Export them as an encrypted bundle to share with the Buyer out-of-band.
          </div>
        </div>
      </div>
    </div>
  );
}
