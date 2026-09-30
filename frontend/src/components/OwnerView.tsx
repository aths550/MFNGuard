import { useState } from 'react';
import { useWallet } from './WalletContext';
import { bytesToHex, generateSecretKey } from '../lib/crypto';
import { deriveClassId } from '../lib/class-id';
import { canonicalizeCurrency, canonicalizeDateWindow, canonicalizeText, stringTo32Bytes } from '../lib/canonicalize';

const DEMO_OWNER_SECRET_HEX = "67723b1a3dc4038d2784944d00ce5969ad70492c29fb37a2ea1207ee1aebd9d7";

export default function OwnerView() {
    const { connectedAddress, mfnguardAPI: api } = useWallet();
    
    // Key Generation State
    const [useDemoKey, setUseDemoKey] = useState(false);
    const [generatedKeyHex, setGeneratedKeyHex] = useState<string | null>(null);
    const [ownerSecretInput, setOwnerSecretInput] = useState<string>('');
    
    // Form State
    const [label, setLabel] = useState('');
    const [buyerHash, setBuyerHash] = useState('');
    const [auditorHash, setAuditorHash] = useState('');
    const [supplierHashes, setSupplierHashes] = useState<string[]>(['', '', '', '', '']);
    
    // Comparability Fields
    const [product, setProduct] = useState('');
    const [volume, setVolume] = useState('');
    const [region, setRegion] = useState('');
    const [term, setTerm] = useState('');
    const [currency, setCurrency] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleGenerateKey = () => {
        const key = generateSecretKey();
        const hex = bytesToHex(key);
        setGeneratedKeyHex(hex);
        setOwnerSecretInput(hex);
        setUseDemoKey(false);
    };

    const handleUseDemoKey = () => {
        setUseDemoKey(true);
        setOwnerSecretInput(DEMO_OWNER_SECRET_HEX);
        setGeneratedKeyHex(null);
    };

    const handleSupplierHashChange = (index: number, val: string) => {
        const newHashes = [...supplierHashes];
        newHashes[index] = val;
        setSupplierHashes(newHashes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connectedAddress || !api) {
            setStatus({ type: 'error', message: 'Wallet not connected.' });
            return;
        }
        
        try {
            setStatus({ type: 'loading', message: 'Canonicalizing and preparing transaction...' });
            
            if (ownerSecretInput.length !== 64) throw new Error("Owner secret must be a 64-character hex string.");
            const ownerSecretBytes = new Uint8Array(Buffer.from(ownerSecretInput, 'hex'));
            
            // Validate public hashes
            if (buyerHash.length !== 64) throw new Error("Buyer hash must be a 64-character hex string.");
            if (auditorHash.length !== 64) throw new Error("Auditor hash must be a 64-character hex string.");
            if (supplierHashes.some(h => h.length !== 64)) throw new Error("All 5 supplier hashes must be 64-character hex strings.");
            
            const buyerHashBytes = new Uint8Array(Buffer.from(buyerHash, 'hex'));
            const auditorHashBytes = new Uint8Array(Buffer.from(auditorHash, 'hex'));
            const supplierHashBytes = supplierHashes.map(h => new Uint8Array(Buffer.from(h, 'hex')));

            // Canonicalize Fields
            const canonProduct = canonicalizeText(product, 'Product');
            const canonRegion = canonicalizeText(region, 'Region');
            const canonCurrency = canonicalizeCurrency(currency);
            const canonDateWindow = canonicalizeDateWindow(startDate, endDate);
            const parsedVolumeNum = BigInt(volume);
            const parsedTermNum = BigInt(term);
            if (parsedVolumeNum <= 0n) throw new Error("Volume must be positive");
            if (parsedTermNum <= 0n) throw new Error("Term must be positive");
            const parsedVolume = stringTo32Bytes(parsedVolumeNum.toString());
            const parsedTerm = stringTo32Bytes(parsedTermNum.toString());

            const classIdHex = await deriveClassId(label);
            const classIdBytes = new Uint8Array(Buffer.from(classIdHex, 'hex'));

            const productBytes = stringTo32Bytes(canonProduct);
            const regionBytes = stringTo32Bytes(canonRegion);
            const currencyBytes = stringTo32Bytes(canonCurrency);
            const dateWindowBytes = stringTo32Bytes(canonDateWindow);

            
            // Calculate comparability hash client side to pass it (or we could pass the raw values, but the API expects the hash)
            // Wait, the API `initialize_class` expects comparability_hash
            const compHashBytes = await api.compute_comparability_hash(productBytes, parsedVolume, regionBytes, parsedTerm, currencyBytes, dateWindowBytes);

            setStatus({ type: 'loading', message: 'Please sign the transaction in your wallet...' });
            await api.initialize_class(ownerSecretBytes, classIdBytes, buyerHashBytes, auditorHashBytes, supplierHashBytes, compHashBytes);
            
            setStatus({ type: 'success', message: `Class successfully initialized! Derived Class ID: ${classIdHex}` });
        } catch (_err: unknown) {
            console.error(_err instanceof Error ? _err.message : "An error occurred");
            setStatus({ type: 'error', message: 'Failed to initialize class — check your inputs and try again.' });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-indigo-400 mb-2">Owner Portal</h2>
                <p className="text-indigo-200/80 text-sm">
                    Initialize a new comparability class. Only the owner can execute this transaction.
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Owner Authentication</h3>
                <div className="flex gap-4 mb-4">
                    <button type="button" onClick={handleGenerateKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Generate my key
                    </button>
                    <button type="button" onClick={handleUseDemoKey} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Use public demo owner key
                    </button>
                </div>
                
                {useDemoKey && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span>⚠️</span> DEMO MODE: this key is public
                        </p>
                        <p className="text-red-300/80 text-xs mt-1">Anyone can use this key to initialize classes on the testnet.</p>
                    </div>
                )}
                
                {generatedKeyHex && (
                    <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-emerald-400 font-bold text-sm mb-2">Key generated! SAVE THIS NOW. It will not be shown again.</p>
                        <code className="block w-full bg-black/50 p-3 rounded font-mono text-emerald-300 text-xs break-all select-all">
                            {generatedKeyHex}
                        </code>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Owner Secret (Hex)</label>
                    <input type="password" value={ownerSecretInput} onChange={e => setOwnerSecretInput(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Enter 64-character hex secret..." />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Class Identification</h3>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Class Label</label>
                        <input type="text" required value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g., JD-Enterprise-Tier" />
                        <p className="text-xs text-gray-500 mt-1">Class ID will be derived from this label.</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Authorization Hashes</h3>
                    <p className="text-xs text-gray-400 mb-4">Enter the public hashes provided by the buyer, auditor, and suppliers.</p>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Hash</label>
                            <input type="text" required value={buyerHash} onChange={e => setBuyerHash(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500" placeholder="64-character hex..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Auditor Hash</label>
                            <input type="text" required value={auditorHash} onChange={e => setAuditorHash(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500" placeholder="64-character hex..." />
                        </div>
                        
                        <div className="pt-4 border-t border-white/10">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">5 Supplier Hashes</label>
                            {supplierHashes.map((sh, idx) => (
                                <div key={idx} className="mb-2 flex items-center gap-3">
                                    <span className="text-xs text-gray-500 font-mono w-4">{idx}</span>
                                    <input type="text" required value={sh} onChange={e => handleSupplierHashChange(idx, e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500" placeholder="64-character hex..." />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Comparability Rule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</label>
                            <input type="text" required value={product} onChange={e => setProduct(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., Widget A" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Volume</label>
                            <input type="number" required value={volume} onChange={e => setVolume(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., 1000" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Region</label>
                            <input type="text" required value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., NA" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Term (Months)</label>
                            <input type="number" required value={term} onChange={e => setTerm(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., 12" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Currency (ISO 4217)</label>
                            <input type="text" required value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white uppercase" placeholder="USD" maxLength={3} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date (YYYY-MM-DD)</label>
                            <input type="text" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="2024-01-01" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date (YYYY-MM-DD)</label>
                            <input type="text" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="2024-12-31" />
                        </div>
                    </div>
                </div>

                {status.type !== 'idle' && (
                    <div className={`p-4 rounded-xl text-sm ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                        {status.message}
                    </div>
                )}

                <button type="submit" disabled={status.type === 'loading'} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg">
                    Initialize Class
                </button>
            </form>
        </div>
    );
}
