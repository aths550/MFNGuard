"use client";

import { useState } from "react";
import { useWallet } from "./WalletContext";
import { useSharedData } from "./SharedDataContext";

// Helper to convert string to Uint8Array 32-bytes
const stringToUint8Array = (str: string) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const bytes = new Uint8Array(32);
  bytes.set(encoded.slice(0, 32));
  return bytes;
};

export default function DisputeView() {
  const { connectedAddress, mfnguardAPI } = useWallet();
  const { supplierPrices, supplierSalts, buyerPrice, buyerSalt } = useSharedData();
  const [classId, setClassId] = useState("");
  const [auditorKey, setAuditorKey] = useState("");
  
  const [isChecking, setIsChecking] = useState(false);
  const [disputeResult, setDisputeResult] = useState<{violator_found: boolean, violator_price: number, violator_index: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !auditorKey || !mfnguardAPI) {
      setError("Please fill out all details and ensure API is ready.");
      return;
    }

    setIsChecking(true);
    setDisputeResult(null);
    setError(null);
    
    try {
      const sPrices = supplierPrices[classId];
      const sSalts = supplierSalts[classId];
      const bPrice = buyerPrice[classId];
      const bSalt = buyerSalt[classId];

      if (!sPrices || !sSalts || bPrice === undefined || !bSalt) {
        throw new Error(`Data for class '${classId}' is incomplete in local session. Ensure both Supplier and Buyer have shared their data locally first.`);
      }

      const classIdBytes = stringToUint8Array(classId);

      const result = await mfnguardAPI.reveal_violation(
        classIdBytes,
        bPrice,
        bSalt,
        sPrices,
        sSalts
      );
      
      setDisputeResult({
        violator_found: result.violator_found === 1n,
        violator_price: Number(result.violator_price),
        violator_index: Number(result.violator_index)
      });
      
    } catch (err: any) {
      setError(`Dispute Error: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Auditor Dispute Portal</h2>
        <p className="text-slate-400 text-sm">Investigate proven violations by revealing the violator's specific price to an authorized auditor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Trigger Dispute Revelation
          </h3>
          
          <form onSubmit={handleRunDispute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Comparability Class ID</label>
              <input 
                type="text" 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                placeholder="e.g., class-a-q3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Auditor Public Key (Hex)</label>
              <input 
                type="text" 
                value={auditorKey}
                onChange={e => setAuditorKey(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                placeholder="0x..."
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl border border-red-400/20">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isChecking || !connectedAddress || !mfnguardAPI}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
            >
              {isChecking ? "Generating Proof..." : "Reveal Violation Data"}
            </button>
          </form>
        </div>

        {/* Verification Check */}
        <div className="flex flex-col">
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 flex-grow flex flex-col items-center justify-center text-center">
            
            {!disputeResult && !isChecking && (
              <>
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2 text-slate-400">Awaiting Dispute</h3>
                <p className="text-sm text-slate-500 max-w-xs">Enter a class ID where a violation has been proven to reveal the offending supplier slot.</p>
              </>
            )}

            {isChecking && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-amber-500 font-medium">Generating Dispute Proof...</p>
                <p className="text-sm text-slate-400 mt-2">Checking against local private state</p>
              </div>
            )}

            {disputeResult && (
              <div className="w-full animate-in zoom-in duration-300">
                <div className="p-6 rounded-2xl border bg-amber-500/10 border-amber-500/30">
                  <h3 className="text-xl font-bold mb-4 text-amber-500">
                    {disputeResult.violator_found ? 'Violation Found & Revealed' : 'No Violation Found'}
                  </h3>
                  
                  {disputeResult.violator_found ? (
                    <div className="space-y-3 text-left">
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                        <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Offending Slot Index</span>
                        <span className="font-mono text-emerald-400">{disputeResult.violator_index}</span>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                        <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Revealed Price</span>
                        <span className="font-mono text-emerald-400">{disputeResult.violator_price}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-4">
                        This data has been securely decrypted locally for the provided auditor public key.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-sm">
                      No violation was found in this class. The dispute cannot proceed.
                    </p>
                  )}
                  
                  <button 
                    onClick={() => setDisputeResult(null)}
                    className="mt-6 text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-slate-400 transition-colors"
                  >
                    Reset View
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
