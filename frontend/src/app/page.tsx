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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#0a0a0e] to-black text-gray-100 font-sans p-4 md:p-8 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto mb-8 md:mb-12 gap-6 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
          <img src="/logo.jpg" alt="MFNGuard Logo" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-br from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent tracking-tight">
              MFNGuard
            </h1>
            <p className="text-indigo-200/60 text-xs md:text-sm mt-1 font-medium tracking-wide uppercase">Privacy-Preserving Compliance</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
              {error}
            </div>
          )}
          
          {connectedAddress ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-2 px-4 md:px-5 backdrop-blur-md shadow-inner w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPreview ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'}`}></div>
                <span className={`text-xs md:text-sm font-semibold tracking-wide ${isPreview ? 'text-indigo-300' : 'text-amber-400'}`}>
                  {network || "Unknown"}
                </span>
              </div>
              <div className="w-px h-5 bg-white/10 mx-1 md:mx-2"></div>
              <span className="text-xs md:text-sm text-gray-300 font-mono tracking-wider">{connectedAddress.slice(0, 8)}...{connectedAddress.slice(-6)}</span>
            </div>
          ) : (
            <button 
              onClick={connect}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm md:text-base font-semibold py-2.5 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] active:scale-95 flex items-center justify-center gap-2"
            >
              Connect Wallet
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
        <div className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-10 bg-white/5 p-1.5 md:p-2 rounded-[20px] border border-white/10 backdrop-blur-xl md:inline-flex w-full md:w-auto shadow-2xl">
          {(['supplier', 'buyer', 'dispute'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-4 md:px-8 py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 w-full sm:w-auto flex-1 md:flex-none ${
                activeTab === tab 
                  ? 'bg-indigo-600/90 text-white shadow-[0_4px_20px_rgba(79,70,229,0.4)] border border-indigo-400/30' 
                  : 'text-indigo-200/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab} View
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0a0a0e]/80 border border-white/10 rounded-3xl p-5 md:p-10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          {activeTab === "supplier" && <SupplierView />}
          {activeTab === "buyer" && <BuyerView />}
          {activeTab === "dispute" && <DisputeView />}
        </div>
      </main>
    </div>
  );
}
