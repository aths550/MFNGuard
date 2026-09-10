"use client";

import React, { createContext, useContext, useState } from 'react';
import { MFNGuardAPI, initializeProviders } from '../lib/mfnguard-api';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Call setNetworkId once globally during app bootstrap
setNetworkId(process.env.NEXT_PUBLIC_NETWORK_ID || 'preview');

interface WalletContextType {
    connectedAddress: string | null;
    network: string | null;
    isPreview: boolean;
    isSyncing: boolean;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    api: any | null; // The initial Lace API
    mfnguardAPI: MFNGuardAPI | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [api, setApi] = useState<any | null>(null);
    const [mfnguardAPI, setMfnguardAPI] = useState<MFNGuardAPI | null>(null);

    const isPreview = network?.toLowerCase() === 'preview';

    const connect = async () => {
        try {
            setError(null);
            const midnight = (window as any).midnight;
            if (!midnight) {
                setError("No Midnight wallet extensions found. Please install a compatible wallet.");
                return;
            }

            const walletKeys = Object.keys(midnight);
            if (walletKeys.length === 0) {
                setError("No wallets found.");
                return;
            }
            
            const walletObj = midnight[walletKeys[0]];
            if (!walletObj) {
                setError("Wallet object not valid.");
                return;
            }

            setApi(walletObj);
            
            try {
                const networkId = process.env.NEXT_PUBLIC_NETWORK_ID || 'preview';
                const connectedAPI = await walletObj.connect(networkId);
                
                if (connectedAPI.getShieldedAddresses) {
                    const addrs = await connectedAPI.getShieldedAddresses();
                    setConnectedAddress(addrs.shieldedCoinPublicKey?.substring(0, 16) + '...');
                } else {
                    setConnectedAddress("Connected Wallet");
                }
                
                setNetwork(networkId);

                // Initialize MFNGuard API
                const providers = await initializeProviders(connectedAPI);
                const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as ContractAddress;
                if (!contractAddress) {
                    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS not configured");
                }
                
                const mAPI = await MFNGuardAPI.join(providers, contractAddress);
                setMfnguardAPI(mAPI);
                
                setIsSyncing(true);
                setTimeout(() => setIsSyncing(false), 7000);

            } catch (innerError: any) {
                console.warn("Wallet connect error:", innerError);
                setError("Failed to connect or initialize API: " + (innerError.message || innerError));
            }
        } catch (e: any) {
            setError(e.message || "Failed to connect to wallet.");
        }
    };

    const disconnect = () => {
        setConnectedAddress(null);
        setNetwork(null);
        setApi(null);
        setMfnguardAPI(null);
        setError(null);
        setIsSyncing(false);
    };
    
    return (
        <WalletContext.Provider value={{ connectedAddress, network, isPreview, isSyncing, error, connect, disconnect, api, mfnguardAPI }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
