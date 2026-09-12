"use client";

import { useState } from "react";
import { useWallet } from "@/components/WalletContext";
import SupplierView from "@/components/SupplierView";
import BuyerView from "@/components/BuyerView";
import DisputeView from "@/components/DisputeView";

export default function Home() {
  const { connectedAddress, network, isPreview, error, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<"supplier" | "buyer" | "dispute">("supplier");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="MFNGuard Logo" className="w-12 h-12 rounded-xl border border-slate-800 shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              MFNGuard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Privacy-Preserving MFN Compliance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
              {error}
            </div>
          )}
          
          {connectedAddress ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full py-1.5 px-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPreview ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`}></div>
                <span className={`text-sm font-medium ${isPreview ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {network || "Unknown"}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <span className="text-sm text-slate-300 font-mono">{connectedAddress}</span>
            </div>
          ) : (
            <button 
              onClick={connect}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              Connect 1AM Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        {!isPreview && connectedAddress && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-amber-500 font-medium">Wrong Network Detected</h3>
              <p className="text-amber-500/80 text-sm mt-1">
                You are currently connected to {network}. MFNGuard requires the Midnight Preview testnet. Please switch networks in your 1AM wallet.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50 backdrop-blur-sm inline-flex">
          {(['supplier', 'buyer', 'dispute'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab} View
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
          {activeTab === "supplier" && <SupplierView />}
          {activeTab === "buyer" && <BuyerView />}
          {activeTab === "dispute" && <DisputeView />}
        </div>
      </main>
    </div>
  );
}
