"use client";

import { useState, useRef } from "react";
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
  const [auditorSecret, setAuditorSecret] = useState("");
  
  // Auto-generate 32-byte salt as hex
  const generateHex32 = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const [salt, setSalt] = useState(generateHex32());
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const isCommittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passphrase, setPassphrase] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommitting || isSyncing || isCommittingRef.current) return;
    if (!connectedAddress || !mfnguardAPI) {
      setError("Please connect your wallet first and ensure contract API is initialized.");
      return;
    }
    if (auditorSecret.length !== 64) {
      setError("Auditor Secret must be exactly 64 hex characters (32 bytes).");
      return;
    }
    
    setError(null);
    isCommittingRef.current = true;
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

      // Compute the public hash client-side
      const secretBytes = hexToUint8Array(auditorSecret);
      const auditorHashBytes = await mfnguardAPI.compute_auditor_hash(secretBytes);

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
      await mfnguardAPI.commit_price(classIdBytes, priceBigInt, saltBytes, auditorHashBytes);

      // Poll for on-chain confirmation to hold the lock
      let confirmed = false;
      let attempts = 0;
      while (!confirmed && attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const state = await mfnguardAPI.get_class_state(classIdBytes, ledger);
        if (state && state.filled && state.filled[nextSlotIndex] === 1n) {
          confirmed = true;
          break;
        }
        attempts++;
      }

      if (!confirmed) {
        throw new Error("Transaction broadcasted but taking too long to confirm on-chain. Check wallet.");
      }

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
      setSalt(generateHex32());
    } catch (err: any) {
      console.error("[MFNGuard] Caught error in handleCommit:", err);
      let errMsg = "Failed to commit price";
      if (typeof err === 'string') {
        errMsg = err;
      } else if (err && typeof err.message === 'string') {
        errMsg = err.message;
      } else if (err) {
        try { errMsg = JSON.stringify(err); } catch(e) {}
      }
      if (process.env.NODE_ENV === 'development') console.log("[MFNGuard] Parsed errMsg:", errMsg);
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes("expired") || lowerMsg.includes("reconnect")) {
        disconnect();
        setError("Wallet session expired. Please click 'Connect 1AM Wallet' at the top right to reconnect, then try again.");
      } else if (lowerMsg.includes("182")) {
        setError("Wallet still syncing — please wait a moment and try again.");
      } else if (lowerMsg.includes("already pending")) {
        setError("Blockchain Confirmation Pending: Your previous transaction is still being mined on the testnet. Please wait ~15-30 seconds for it to confirm before requesting another check.");
      } else {
        setError(errMsg);
      }
    } finally {
      setIsCommitting(false);
      isCommittingRef.current = false;
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
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Supplier Portal</h2>
        <p className="text-orange-200/70 text-sm md:text-base max-w-2xl">Commit prices privately to the blockchain. Your raw prices never leave your device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {/* Commit Form */}
        <div className="bg-[#12121a]/90 p-5 md:p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
          <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-3 text-white">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            Commit Deal
          </h3>
          
          <form onSubmit={handleCommit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-orange-100/80 mb-2">Comparability Class ID</label>
              <input 
                type="text" 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-inner"
                placeholder="e.g., class-a-q3"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-orange-100/80">Auditor Secret Key (32-byte hex)</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input 
                  type="text" 
                  value={auditorSecret}
                  onChange={e => setAuditorSecret(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 font-mono text-sm shadow-inner transition-all"
                  placeholder="e.g. 1a2b3c..."
                  required
                />
                <button 
                  type="button"
                  onClick={() => setAuditorSecret(generateHex32())}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-sm text-white"
                  title="Auto-generate secure secret"
                >
                  🎲 Gen
                </button>
              </div>
              <p className="text-xs text-slate-400">Save this secret to give to the Auditor. The app hashes this securely before submitting.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-orange-100/80 mb-2">Price</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-inner"
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="flex justify-between items-center text-sm font-medium text-orange-100/80 mb-2">
                <span>Cryptographic Salt</span>
                <button type="button" onClick={() => setSalt(generateHex32())} className="text-orange-400 hover:text-orange-300 text-xs font-semibold tracking-wide uppercase transition-colors">Regenerate</button>
              </label>
              <input 
                type="text" 
                value={salt}
                onChange={e => setSalt(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-orange-200/60 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-inner"
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
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSyncing ? "Syncing wallet, one moment..." : isCommitting ? "Committing to Chain..." : "Commit Price"}
            </button>
          </form>
        </div>

        {/* Local Session Data */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Export Witnesses</h3>
            <p className="text-orange-200/60 text-sm mb-4">Export encrypted bundle to share with buyer.</p>
          </div>
          
          {slots.length > 0 && (
            <div className="bg-[#12121a]/90 p-5 md:p-6 rounded-3xl border border-white/5 shadow-xl backdrop-blur-md space-y-4">
              <label className="block text-sm font-medium text-orange-100/80">Shared Passphrase (for Export)</label>
              <input 
                type="password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="Enter passphrase to encrypt"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-inner transition-all"
              />
              <button 
                onClick={handleExportBundle}
                disabled={isExporting || !passphrase}
                className="w-full text-sm font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98]"
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
              <div className="bg-[#12121a]/50 border border-white/5 border-dashed rounded-3xl p-10 text-center text-orange-200/40 text-sm">
                No prices committed in this session yet.
              </div>
            ) : (
              slots.map((slot, idx) => (
                <div key={idx} className="bg-[#12121a]/90 border border-white/5 rounded-2xl p-4 md:p-5 flex justify-between items-center shadow-lg">
                  <div>
                    <div className="font-semibold text-white">{slot.classId}</div>
                    <div className="text-xs text-orange-200/60 font-mono mt-1">Slot {slot.slotIndex !== undefined ? slot.slotIndex : idx}</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>
                    <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">Confirmed</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 text-xs text-orange-200/50 bg-[#12121a]/40 p-5 rounded-2xl border border-white/5">
            <span className="font-semibold text-orange-300/80">Persistence Note:</span> Your witnesses are persisted securely in localStorage. Export them as an encrypted bundle to share with the Buyer out-of-band.
          </div>
        </div>
      </div>
    </div>
  );
}
