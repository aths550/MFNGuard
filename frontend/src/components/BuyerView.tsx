"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "./WalletContext";
import { useSharedData } from "./SharedDataContext";
import { decryptPayload } from "../lib/crypto";
import { ledger } from "../../../contract/src/index";

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

export default function BuyerView() {
  const { connectedAddress, mfnguardAPI, disconnect, isSyncing } = useWallet();
  const { addBuyerData, supplierPrices, supplierSalts, importSupplierData, buyerPrice, buyerSalt, globalAuditorSecret, setGlobalAuditorSecret } = useSharedData();
  const [classId, setClassId] = useState("");
  const [price, setPrice] = useState("");

  
  // Transaction locks to prevent double-click race conditions
  const isCommittingRef = useRef(false);
  const isCheckingRef = useRef(false);

  // Auto-generate 32-byte salt as hex
  const generateHex32 = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const [salt, setSalt] = useState(generateHex32());
  
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);
  
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{compliant: boolean, discrepancy: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPassphrase, setImportPassphrase] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Auto-restore UI state from persistent context (localStorage) on mount/reload
  useEffect(() => {
    if (!classId) {
      const storedClasses = Object.keys(supplierPrices);
      if (storedClasses.length > 0) {
        const lastClass = storedClasses[storedClasses.length - 1];
        setClassId(lastClass);
        
        if (buyerPrice[lastClass]) {
          setPrice(buyerPrice[lastClass].toString());
        }
        if (buyerSalt[lastClass]) {
          const hex = Array.from(buyerSalt[lastClass]).map(b => b.toString(16).padStart(2, '0')).join('');
          setSalt(hex);
        }
      }
    }
  }, [supplierPrices, buyerPrice, buyerSalt, classId]);

  const handleImportBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !importPassphrase) return;
    setIsImporting(true);
    setError(null);
    setImportSuccess(null);
    
    try {
      const text = await importFile.text();
      const payload = JSON.parse(text);
      const decryptedStr = await decryptPayload(payload, importPassphrase);
      const data = JSON.parse(decryptedStr);
      
      const parsedPrices = data.prices.map((p: string) => BigInt(p));
      const parsedSalts = data.salts.map((s: number[]) => new Uint8Array(s));
      
      importSupplierData(data.classId, parsedPrices, parsedSalts);
      setImportFile(null);
      setImportPassphrase("");
      setClassId(data.classId); // Conveniently prefill the class ID
      setImportSuccess(`Successfully imported witnesses for ${data.classId}`);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') console.error(err);
      setError(`Import Error: Failed to decrypt or parse bundle. Check passphrase.`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSetReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommitting || isSyncing || isCommittingRef.current) return;
    if (!connectedAddress || !mfnguardAPI) {
      setError("Please connect your wallet first and ensure contract API is initialized.");
      return;
    }
    if (globalAuditorSecret.length !== 64) {
      setError("Auditor Secret must be exactly 64 hex characters (32 bytes).");
      return;
    }
    
    setError(null);
    setCommitStatus(null);
    
    isCommittingRef.current = true;
    setIsCommitting(true);
    
    try {
      if (process.env.NODE_ENV === 'development') console.log(`[Local Action] Setting buyer reference price ${price} to class ${classId} with salt ${salt}`);
      
      const priceBigInt = BigInt(price);
      if (priceBigInt < 0n) {
        throw new Error("Contract Error: Invalid witness. Price must be positive.");
      }

      const classIdBytes = stringToUint8Array(classId);
      const saltBytes = hexToUint8Array(salt);
      
      const secretBytes = hexToUint8Array(globalAuditorSecret);
      const auditorHashBytes = await mfnguardAPI.compute_auditor_hash(secretBytes);

      await mfnguardAPI.set_buyer_reference(classIdBytes, priceBigInt, saltBytes, auditorHashBytes);
      addBuyerData(classId, priceBigInt, saltBytes);

      setCommitStatus(`Transaction submitted. Waiting for confirmation on-chain (~15-45s)...`);

      // Poll for on-chain confirmation
      let confirmed = false;
      let attempts = 0;
      while (!confirmed && attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const state = await mfnguardAPI.get_class_state(classIdBytes, ledger);
        if (state && state.buyer_filled === 1n) {
          confirmed = true;
          break;
        }
        attempts++;
      }

      if (confirmed) {
        setCommitStatus(`Successfully set reference price for ${classId} and confirmed on-chain.`);
      } else {
        throw new Error("Transaction broadcasted but taking too long to confirm. Please verify in 1AM Wallet.");
      }
    } catch (err: any) {
      console.error("[MFNGuard] Caught error in handleSetReference:", err);
      let errMsg = "Failed to set reference price";
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
        setError("Blockchain Confirmation Pending: Your previous transaction is still being mined. Please wait a moment before setting a new reference price.");
      } else {
        setError(errMsg);
      }
    } finally {
      setIsCommitting(false);
      isCommittingRef.current = false;
    }
  };

  const handleRunComplianceCheck = async () => {
    if (isChecking || isSyncing || isCheckingRef.current) return;
    if (!classId || !price || !salt || !auditorSecret || !mfnguardAPI) {
      setError("Please set the reference price details first.");
      return;
    }

    isCheckingRef.current = true;
    setIsChecking(true);
    setCheckResult(null);
    setError(null);
    
    try {
      const classIdBytes = stringToUint8Array(classId);
      
      // Verify that the prerequisite (Set Reference Price) has actually confirmed on-chain
      const state = await mfnguardAPI.get_class_state(classIdBytes, ledger);
      if (!state || state.buyer_filled !== 1n) {
        setError("Buyer reference price is not yet confirmed on-chain. Please wait ~15-30 seconds and try again.");
        setIsChecking(false);
        isCheckingRef.current = false;
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[BuyerView] Looking up supplier data for classId: '${classId}'`);
        console.log(`[BuyerView] Current full supplierPrices store:`, supplierPrices);
      }
      
      const sPrices = supplierPrices[classId];
      const sSalts = supplierSalts[classId];

      if (!sPrices || !sSalts) {
        throw new Error(`Supplier data for class '${classId}' not found in local session. Ensure the supplier shares their data locally first.`);
      }

      const buyerPriceBigInt = BigInt(price);
      const buyerSaltBytes = hexToUint8Array(salt);

      const result = await mfnguardAPI.compliance_check(
        classIdBytes,
        buyerPriceBigInt,
        buyerSaltBytes,
        sPrices,
        sSalts
      );
      
      setCheckResult({
        compliant: result.compliant === 1n,
        discrepancy: Number(result.discrepancy)
      });
      
    } catch (err: any) {
      // FORCE log to console for debugging even in prod build
      console.error("[MFNGuard] Caught error in handleRunComplianceCheck:", err);
      
      // Safely extract string message
      let errMsg = "Unknown error";
      if (typeof err === 'string') {
        errMsg = err;
      } else if (err && typeof err.message === 'string') {
        errMsg = err.message;
      } else if (err) {
        try { errMsg = JSON.stringify(err); } catch(e) {}
      }
      if (process.env.NODE_ENV === 'development') console.log("[MFNGuard] Parsed errMsg:", errMsg);
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes("182")) {
        setError("Zero-Knowledge Proof Error: Wallet still syncing — please wait a moment and try again.");
      } else if (lowerMsg.includes("already pending")) {
        setError("Blockchain Confirmation Pending: Your previous transaction is still being mined on the testnet. Please wait ~15-30 seconds for it to confirm before requesting another check.");
      } else if (lowerMsg.includes("expired") || lowerMsg.includes("reconnect")) {
        disconnect();
        setError("Zero-Knowledge Proof Error: Wallet session expired. Please click 'Connect 1AM Wallet' at the top right to reconnect, then try again.");
      } else {
        setError(`Zero-Knowledge Proof Error: ${errMsg}`);
      }
    } finally {
      setIsChecking(false);
      isCheckingRef.current = false;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Buyer Portal</h2>
        <p className="text-emerald-200/70 text-sm md:text-base max-w-2xl">Verify that your price is as good as the supplier's best price without seeing their data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {/* Set Reference Form */}
        <div className="bg-[#12121a]/90 p-5 md:p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
          <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-3 text-white">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            Set Contracted Price
          </h3>
          
          <form onSubmit={handleSetReference} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-emerald-100/80 mb-2">Comparability Class ID</label>
              <input 
                type="text" 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                placeholder="e.g., class-a-q3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-100/80 mb-2">Your Price</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                placeholder="e.g., 900"
              />
            </div>

            <div>
              <label className="flex justify-between items-center text-sm font-medium text-emerald-100/80 mb-2">
                <span>Cryptographic Salt</span>
                <button type="button" onClick={() => setSalt(generateHex32())} className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold tracking-wide uppercase transition-colors">♻️ Regenerate</button>
              </label>
              <input 
                type="text" 
                value={salt}
                onChange={e => setSalt(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-emerald-200/60 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-emerald-100/80">Auditor Secret Key (32-byte hex)</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input 
                  type="text" 
                  value={globalAuditorSecret}
                  onChange={e => setGlobalAuditorSecret(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 font-mono text-sm shadow-inner transition-all"
                  placeholder="e.g. 1a2b3c..."
                  required
                />
                <button 
                  type="button"
                  onClick={() => setGlobalAuditorSecret(generateHex32())}
                  className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors text-sm font-medium text-emerald-300"
                  title="Auto-generate secure secret"
                >
                  🔑 Gen
                </button>
              </div>
              <p className="text-xs text-emerald-200/50 pt-1">Save this secret to give to the Auditor. The app hashes this securely before submitting.</p>
            </div>
            
            {commitStatus && (
              <div className="text-cyan-400 text-sm p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 backdrop-blur-md">
                {commitStatus}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isCommitting || isSyncing || !connectedAddress || !mfnguardAPI}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSyncing ? "Syncing wallet, one moment..." : isCommitting ? "Setting Reference..." : "Set Reference Price"}
            </button>
          </form>
        </div>

        {/* Verification Check */}
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="bg-[#12121a]/50 border border-white/5 rounded-3xl p-6 md:p-8 flex-grow flex flex-col items-center justify-center text-center backdrop-blur-sm shadow-lg relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {!checkResult && !isChecking && (
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)] rotate-3">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Ready to Verify?</h3>
                <p className="text-sm md:text-base text-emerald-200/60 mb-8 max-w-sm mx-auto">Ensure you have imported the supplier's witness bundle before running this check.</p>
                
                {error && (
                  <div className="w-full text-red-400 text-sm p-4 mb-8 bg-red-500/10 rounded-xl border border-red-500/20 text-left backdrop-blur-md">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleRunComplianceCheck}
                  disabled={isChecking || isSyncing || !mfnguardAPI}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] disabled:opacity-50 active:scale-[0.98] w-full sm:w-auto"
                >
                  {isSyncing ? "Syncing wallet, one moment..." : "Run Compliance Check"}
                </button>
              </div>
            )}

            {isChecking && (
              <div className="flex flex-col items-center relative z-10 py-8">
                <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                <p className="text-cyan-400 font-semibold text-lg">Generating Zero-Knowledge Proof...</p>
                <p className="text-sm text-emerald-200/60 mt-2">Checking against supplier's private state</p>
              </div>
            )}

            {checkResult && (
              <div className="w-full animate-in zoom-in duration-500 relative z-10">
                <div className={`p-8 rounded-3xl border backdrop-blur-xl shadow-2xl ${checkResult.compliant ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_10px_40px_rgba(16,185,129,0.15)]' : 'bg-red-500/10 border-red-500/30 shadow-[0_10px_40px_rgba(239,68,68,0.15)]'}`}>
                  <div className="flex justify-center mb-6">
                    {checkResult.compliant ? (
                      <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl md:text-3xl font-bold mb-3 tracking-tight ${checkResult.compliant ? 'text-cyan-400' : 'text-red-400'}`}>
                    {checkResult.compliant ? 'MFN Compliant' : 'MFN Violation Detected'}
                  </h3>
                  
                  <p className="text-emerald-100/80 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                    {checkResult.compliant 
                      ? "Cryptographic proof generated successfully. Your price is verified to be the lowest or equal to the lowest in the class." 
                      : `A violation was cryptographically proven. Discrepancy amount: ${checkResult.discrepancy}`}
                  </p>
                  
                  <button 
                    onClick={() => setCheckResult(null)}
                    className="text-sm font-medium text-emerald-300 hover:text-white px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98]"
                  >
                    Run Another Check
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Witness Bundle Section */}
          <div className="bg-[#12121a]/90 p-5 md:p-8 rounded-3xl border border-white/5 shadow-xl backdrop-blur-md">
            <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-3 text-white">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              Import Witness Bundle
            </h3>
            
            <form onSubmit={handleImportBundle} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-emerald-100/80 mb-2">Encrypted Bundle (.json)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={e => setImportFile(e.target.files?.[0] || null)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-emerald-200/60 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 transition-all cursor-pointer shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-100/80 mb-2">Shared Passphrase</label>
                <input 
                  type="password"
                  value={importPassphrase}
                  onChange={e => setImportPassphrase(e.target.value)}
                  placeholder="Enter decryption passphrase"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner transition-all"
                />
              </div>
              
              {importSuccess && (
                <div className="text-cyan-400 text-sm p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 backdrop-blur-md">
                  {importSuccess}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isImporting || !importFile || !importPassphrase}
                className="w-full text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 mt-4 active:scale-[0.98]"
              >
                {isImporting ? "Decrypting..." : "Import Witnesses"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
