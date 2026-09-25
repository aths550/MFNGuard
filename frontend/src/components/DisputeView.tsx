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

      const auditorSecretBytes = stringToUint8Array(auditorKey);

      const result = await mfnguardAPI.reveal_violation(
        classIdBytes,
        bPrice,
        bSalt,
        sPrices,
        sSalts,
        auditorSecretBytes
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
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Auditor Dispute Portal</h2>
        <p className="text-emerald-200/70 text-sm md:text-base max-w-2xl">Investigate proven violations by revealing the violator's specific price to an authorized auditor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {/* Form */}
        <div className="bg-[#12121a]/90 p-5 md:p-8 rounded-3xl border border-red-500/10 shadow-[0_10px_40px_rgba(245,158,11,0.05)] backdrop-blur-md">
          <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-3 text-white">
            <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            Trigger Dispute Revelation
          </h3>
          
          <form onSubmit={handleRunDispute} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-emerald-100/80 mb-2">Comparability Class ID</label>
              <input 
                type="text" 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner"
                placeholder="e.g., class-a-q3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-100/80 mb-2">Auditor Secret Key (Hex/String)</label>
              <input 
                type="password" 
                value={auditorKey}
                onChange={e => setAuditorKey(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner"
                placeholder="Enter 32-byte secret..."
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20 backdrop-blur-md">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isChecking || !connectedAddress || !mfnguardAPI}
              className="w-full bg-red-500 hover:bg-red-400 text-black font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isChecking ? "Generating Proof..." : "Reveal Violation Data"}
            </button>
          </form>
        </div>

        {/* Verification Check */}
        <div className="flex flex-col">
          <div className="bg-[#12121a]/50 border border-white/5 rounded-3xl p-6 md:p-8 flex-grow flex flex-col items-center justify-center text-center backdrop-blur-sm relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {!disputeResult && !isChecking && (
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/5 rounded-2xl flex items-center justify-center mb-6 border border-red-500/10 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-emerald-200/80">Awaiting Dispute</h3>
                <p className="text-sm md:text-base text-emerald-200/50 max-w-sm mx-auto">Enter a class ID where a violation has been proven to reveal the offending supplier slot.</p>
              </div>
            )}

            {isChecking && (
              <div className="flex flex-col items-center relative z-10 py-8">
                <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-6"></div>
                <p className="text-red-500 font-semibold text-lg">Generating Dispute Proof...</p>
                <p className="text-sm text-emerald-200/60 mt-2">Checking against local private state</p>
              </div>
            )}

            {disputeResult && (
              <div className="w-full animate-in zoom-in duration-500 relative z-10">
                <div className="p-8 rounded-3xl border bg-red-500/10 border-red-500/30 backdrop-blur-xl shadow-[0_10px_40px_rgba(245,158,11,0.15)]">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-red-500 tracking-tight">
                    {disputeResult.violator_found ? 'Violation Found & Revealed' : 'No Violation Found'}
                  </h3>
                  
                  {disputeResult.violator_found ? (
                    <div className="space-y-4 text-left">
                      <div className="bg-black/50 rounded-2xl p-4 border border-red-500/20 shadow-inner">
                        <span className="text-red-500/60 text-xs font-semibold uppercase tracking-wider block mb-1">Offending Slot Index</span>
                        <span className="font-mono text-xl text-red-400">{disputeResult.violator_index}</span>
                      </div>
                      <div className="bg-black/50 rounded-2xl p-4 border border-red-500/20 shadow-inner">
                        <span className="text-red-500/60 text-xs font-semibold uppercase tracking-wider block mb-1">Revealed Price</span>
                        <span className="font-mono text-xl text-red-400">{disputeResult.violator_price}</span>
                      </div>
                      <p className="text-sm text-red-200/70 mt-6 flex items-start gap-2 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                        <span className="text-red-400">✅</span> The auditor key was verified on-chain via ZK hash commitment.
                      </p>
                    </div>
                  ) : (
                    <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed bg-black/30 p-6 rounded-2xl border border-white/5">
                      No violation was found in this class. The dispute cannot proceed.
                    </p>
                  )}
                  
                  <button 
                    onClick={() => setDisputeResult(null)}
                    className="mt-8 text-sm font-medium text-red-500/80 hover:text-red-400 px-6 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all active:scale-[0.98]"
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
