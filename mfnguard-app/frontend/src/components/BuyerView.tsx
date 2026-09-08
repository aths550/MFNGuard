"use client";

import { useState } from "react";
import { useWallet } from "./WalletContext";
import { useSharedData } from "./SharedDataContext";

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
  const { addBuyerData, supplierPrices, supplierSalts } = useSharedData();
  const [classId, setClassId] = useState("");
  const [price, setPrice] = useState("");
  
  // Auto-generate 32-byte salt as hex
  const generateSalt = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const [salt, setSalt] = useState(generateSalt());
  
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);
  
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{compliant: boolean, discrepancy: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommitting || isSyncing) return;
    if (!connectedAddress || !mfnguardAPI) {
      setError("Please connect your wallet first and ensure contract API is initialized.");
      return;
    }
    
    setError(null);
    setCommitStatus(null);
    setIsCommitting(true);
    
    try {
      console.log(`[Local Action] Setting buyer reference price ${price} to class ${classId} with salt ${salt}`);
      
      const priceBigInt = BigInt(price);
      if (priceBigInt < 0n) {
        throw new Error("Contract Error: Invalid witness. Price must be positive.");
      }

      const classIdBytes = stringToUint8Array(classId);
      const saltBytes = hexToUint8Array(salt);

      await mfnguardAPI.set_buyer_reference(classIdBytes, priceBigInt, saltBytes);
      addBuyerData(classId, priceBigInt, saltBytes);

      setCommitStatus(`Successfully set reference price for ${classId}.`);
    } catch (err: any) {
      const errMsg = err.message || "Failed to set reference price";
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

  const handleRunComplianceCheck = async () => {
    if (isChecking || isSyncing) return;
    if (!classId || !price || !salt || !mfnguardAPI) {
      setError("Please set the reference price details first.");
      return;
    }

    setIsChecking(true);
    setCheckResult(null);
    setError(null);
    
    try {
      console.log(`[BuyerView] Looking up supplier data for classId: '${classId}'`);
      console.log(`[BuyerView] Current full supplierPrices store:`, supplierPrices);
      
      const sPrices = supplierPrices[classId];
      const sSalts = supplierSalts[classId];

      if (!sPrices || !sSalts) {
        throw new Error(`Supplier data for class '${classId}' not found in local session. Ensure the supplier shares their data locally first.`);
      }

      const classIdBytes = stringToUint8Array(classId);
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
      const errMsg = err.message || "Unknown error";
      if (errMsg.includes("182")) {
        setError("Zero-Knowledge Proof Error: Wallet still syncing — please wait a moment and try again.");
      } else if (errMsg.toLowerCase().includes("expired") || errMsg.toLowerCase().includes("reconnect")) {
        disconnect();
        setError("Zero-Knowledge Proof Error: Wallet session expired. Please click 'Connect Lace Wallet' at the top right to reconnect, then try again.");
      } else {
        setError(`Zero-Knowledge Proof Error: ${errMsg}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Buyer Portal</h2>
        <p className="text-slate-400 text-sm">Verify that your price is as good as the supplier's best price without seeing their data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Set Reference Form */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Set Contracted Price
          </h3>
          
          <form onSubmit={handleSetReference} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Comparability Class ID</label>
              <input 
                type="text" 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                placeholder="e.g., class-a-q3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Price</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                placeholder="e.g., 900"
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
            
            {commitStatus && (
              <div className="text-emerald-400 text-sm p-3 bg-emerald-400/10 rounded-xl border border-emerald-400/20">
                {commitStatus}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isCommitting || isSyncing || !connectedAddress || !mfnguardAPI}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSyncing ? "Syncing wallet, one moment..." : isCommitting ? "Setting Reference..." : "Set Reference Price"}
            </button>
          </form>
        </div>

        {/* Verification Check */}
        <div className="flex flex-col">
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 flex-grow flex flex-col items-center justify-center text-center">
            
            {!checkResult && !isChecking && (
              <>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to Verify?</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-xs">Ensure the supplier has shared their data in this browser session before running this check.</p>
                
                {error && (
                  <div className="w-full text-red-400 text-sm p-3 mb-6 bg-red-400/10 rounded-xl border border-red-400/20 text-left">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleRunComplianceCheck}
                  disabled={isChecking || isSyncing || !mfnguardAPI}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50"
                >
                  {isSyncing ? "Syncing wallet, one moment..." : "Run Compliance Check"}
                </button>
              </>
            )}

            {isChecking && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 font-medium">Generating Zero-Knowledge Proof...</p>
                <p className="text-sm text-slate-400 mt-2">Checking against supplier's private state</p>
              </div>
            )}

            {checkResult && (
              <div className="w-full animate-in zoom-in duration-300">
                <div className={`p-6 rounded-2xl border ${checkResult.compliant ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex justify-center mb-4">
                    {checkResult.compliant ? (
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${checkResult.compliant ? 'text-emerald-400' : 'text-red-400'}`}>
                    {checkResult.compliant ? 'MFN Compliant' : 'MFN Violation Detected'}
                  </h3>
                  
                  <p className="text-slate-300 text-sm mb-4">
                    {checkResult.compliant 
                      ? "Cryptographic proof generated. Your price is verified to be the lowest or equal to the lowest in the class." 
                      : `A violation was cryptographically proven. Discrepancy amount: ${checkResult.discrepancy}`}
                  </p>
                  
                  <button 
                    onClick={() => setCheckResult(null)}
                    className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-slate-400 transition-colors"
                  >
                    Run Another Check
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
