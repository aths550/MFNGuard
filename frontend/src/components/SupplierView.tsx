import { useState } from 'react';
import { useWallet } from './WalletContext';
import { useSharedData } from './SharedDataContext';
import { bytesToHex, generateSecretKey } from '../lib/crypto';
import { deriveClassId } from '../lib/class-id';
import { canonicalizeCurrency, canonicalizeDateWindow, canonicalizeText, stringTo32Bytes } from '../lib/canonicalize';


const MAX_UINT64 = 18446744073709551615n;

export default function SupplierView() {
    const { connectedAddress, mfnguardAPI: api } = useWallet();
    const { supplierPrices, supplierSalts, addSupplierData, formData, updateFormData } = useSharedData();

    // Key Generation State
    const [generatedKeyHex, setGeneratedKeyHex] = useState<string | null>(null);
    
    // Form State
    const [slotIndex, setSlotIndex] = useState<string>('0');
    const [price, setPrice] = useState('');
    
    const [salt, setSalt] = useState(() => bytesToHex(window.crypto.getRandomValues(new Uint8Array(32))));
    
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleGenerateKey = () => {
        const key = generateSecretKey();
        const hex = bytesToHex(key);
        setGeneratedKeyHex(hex);
        
        const newSecrets = [...formData.supplierSecrets];
        newSecrets[parseInt(slotIndex)] = hex;
        updateFormData({ supplierSecrets: newSecrets });
    };

    const handleExportKey = () => {
        if (!generatedKeyHex) return;
        const blob = new Blob([generatedKeyHex], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mfnguard-supplier-secret.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerateSalt = () => {
        setSalt(bytesToHex(window.crypto.getRandomValues(new Uint8Array(32))));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connectedAddress || !api) {
            setStatus({ type: 'error', message: 'Wallet not connected.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Canonicalizing and preparing transaction...' });
            
            const currentSupplierSecret = formData.supplierSecrets[parseInt(slotIndex)] || '';
            if (currentSupplierSecret.length !== 64) throw new Error("Supplier secret must be a 64-character hex string.");
            const supplierSecretBytes = new Uint8Array(Buffer.from(currentSupplierSecret, 'hex'));
            
            if (salt.length !== 64) throw new Error("Salt must be a 64-character hex string.");
            const saltBytes = new Uint8Array(Buffer.from(salt, 'hex'));

            const priceBigInt = BigInt(price);
            if (priceBigInt < 0n) throw new Error("Price must be positive");

            const slot = BigInt(slotIndex);
            if (slot < 0n || slot > 4n) throw new Error("Slot index must be between 0 and 4");

            // Canonicalize
            const canonProduct = canonicalizeText(formData.product, 'Product');
            const canonRegion = canonicalizeText(formData.region, 'Region');
            const canonCurrency = canonicalizeCurrency(formData.currency);
            const canonDateWindow = canonicalizeDateWindow(formData.startDate, formData.endDate);
            const parsedVolume = BigInt(formData.volume);
            const parsedTerm = BigInt(formData.term);
            if (parsedVolume <= 0n) throw new Error("Volume must be positive");
            if (parsedTerm <= 0n) throw new Error("Term must be positive");

            const classIdHex = await deriveClassId(formData.label);
            const classIdBytes = new Uint8Array(Buffer.from(classIdHex, 'hex'));



            
            
            setStatus({ type: 'loading', message: 'Please sign the transaction in your wallet...' });
            
            await api.commit_price(classIdBytes, supplierSecretBytes, slot, priceBigInt, saltBytes);
            
            // Save to in-memory context for witness bundle export later
            const currentPrices = supplierPrices[classIdHex] ? [...supplierPrices[classIdHex]] : Array(5).fill(MAX_UINT64);
            const currentSalts = supplierSalts[classIdHex] ? [...supplierSalts[classIdHex]] : Array(5).fill(null).map(() => new Uint8Array(32));
            
            currentPrices[Number(slot)] = priceBigInt;
            currentSalts[Number(slot)] = saltBytes;
            
            addSupplierData(classIdHex, currentPrices, currentSalts);

            setStatus({ type: 'success', message: `Price committed successfully for slot ${slotIndex}!` });
            
            // Generate a new salt for the next potential commit to prevent reuse
            handleGenerateSalt();
        } catch (_err: unknown) {
            console.error(_err instanceof Error ? _err.message : "An error occurred");
            setStatus({ type: 'error', message: 'Failed to commit price — check your inputs and try again.' });
        }
    };

    const handleExportBundle = async () => {
        try {
            const classIdHex = await deriveClassId(formData.label);
            const prices = supplierPrices[classIdHex];
            const salts = supplierSalts[classIdHex];
            
            if (!prices || !salts) {
                setStatus({ type: 'error', message: 'No prices committed in memory for this class label.' });
                return;
            }

            const exportData = {
                classId: classIdHex,
                prices: prices.map(p => p.toString()),
                salts: salts.map(s => bytesToHex(s))
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mfnguard-witness-${classIdHex.substring(0, 8)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setStatus({ type: 'success', message: 'Witness bundle exported successfully.' });
        } catch (_err: unknown) {
            setStatus({ type: 'error', message: 'Failed to export witness bundle.' });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-emerald-400 mb-2">Supplier Portal</h2>
                <p className="text-emerald-200/80 text-sm">
                    Commit your private price to the blockchain. Your price remains secret unless the auditor reveals a violation.
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Supplier Authentication</h3>
                <div className="flex gap-4 mb-4">
                    <button type="button" onClick={handleGenerateKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Generate my key
                    </button>
                </div>
                
                {generatedKeyHex && (
                    <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-emerald-400 font-bold text-sm mb-2">Key generated! SAVE THIS NOW. It will not be shown again.</p>
                        <code className="block w-full bg-black/50 p-3 rounded font-mono text-emerald-300 text-xs break-all select-all mb-3">
                            {generatedKeyHex}
                        </code>
                        <button type="button" onClick={handleExportKey} className="text-xs bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-200 px-3 py-1.5 rounded transition-colors border border-emerald-500/30">
                            Download Key File
                        </button>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supplier Secret (Hex)</label>
                    <input type="password" value={formData.supplierSecrets[parseInt(slotIndex)] || ''} onChange={e => {
                        const newSecrets = [...formData.supplierSecrets];
                        newSecrets[parseInt(slotIndex)] = e.target.value;
                        updateFormData({ supplierSecrets: newSecrets });
                    }} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Enter 64-character hex secret..." />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Class & Slot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Class Label</label>
                            <input type="text" required value={formData.label} onChange={e => updateFormData({ label: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g., JD-Enterprise-Tier" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Slot Index</label>
                            <select value={slotIndex} onChange={e => setSlotIndex(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors">
                                <option value="0">Slot 0</option>
                                <option value="1">Slot 1</option>
                                <option value="2">Slot 2</option>
                                <option value="3">Slot 3</option>
                                <option value="4">Slot 4</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Comparability Rule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</label>
                            <input type="text" required value={formData.product} onChange={e => updateFormData({ product: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., Widget A" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Volume</label>
                            <input type="number" required value={formData.volume} onChange={e => updateFormData({ volume: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., 1000" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Region</label>
                            <input type="text" required value={formData.region} onChange={e => updateFormData({ region: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., NA" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Term (Months)</label>
                            <input type="number" required value={formData.term} onChange={e => updateFormData({ term: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="e.g., 12" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Currency (ISO 4217)</label>
                            <input type="text" required value={formData.currency} onChange={e => updateFormData({ currency: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white uppercase" placeholder="USD" maxLength={3} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date (YYYY-MM-DD)</label>
                            <input type="text" required value={formData.startDate} onChange={e => updateFormData({ startDate: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="2024-01-01" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date (YYYY-MM-DD)</label>
                            <input type="text" required value={formData.endDate} onChange={e => updateFormData({ endDate: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="2024-12-31" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Price Commitment</h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Price (integer representation)</label>
                            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g., 9900 for $99.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                                <span>Cryptographic Salt (Hex)</span>
                                <button type="button" onClick={handleGenerateSalt} className="text-emerald-400 hover:text-emerald-300 transition-colors">Regenerate</button>
                            </label>
                            <input type="text" required value={salt} onChange={e => setSalt(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500" />
                            <p className="text-xs text-gray-500 mt-1">A random 32-byte value ensures your price cannot be guessed via dictionary attacks.</p>
                        </div>
                    </div>
                </div>

                {status.type !== 'idle' && (
                    <div className={`p-4 rounded-xl text-sm ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                        {status.message}
                    </div>
                )}

                <div className="flex gap-4">
                    <button type="submit" disabled={status.type === 'loading'} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg">
                        Commit Price to Ledger
                    </button>
                    <button type="button" onClick={handleExportBundle} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg border border-gray-600">
                        Export Witness Bundle
                    </button>
                </div>
                
                <p className="text-xs text-center text-gray-500">
                    <strong className="text-amber-500/80">Privacy Warning:</strong> The witness bundle contains your raw prices and salts in plaintext. Anyone with this file can see your data.
                </p>
            </form>
        </div>
    );
}
