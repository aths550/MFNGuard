import { useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useSharedData } from './SharedDataContext';
import { bytesToHex, generateSecretKey } from '../lib/crypto';
import { deriveClassId } from '../lib/class-id';
import { canonicalizeCurrency, canonicalizeDateWindow, canonicalizeText, stringTo32Bytes } from '../lib/canonicalize';
import { ledger } from 'mfnguard-contract';



export default function BuyerView() {
    const { connectedAddress, mfnguardAPI: api } = useWallet();
    const { supplierPrices, supplierSalts, importSupplierData, addBuyerData, formData, updateFormData } = useSharedData();

    // Key Generation State
    const [generatedKeyHex, setGeneratedKeyHex] = useState<string | null>(null);

    // Form State
    const [price, setPrice] = useState('');
    const [salt, setSalt] = useState(() => bytesToHex(window.crypto.getRandomValues(new Uint8Array(32))));

    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const [checkResult, setCheckResult] = useState<{compliant: boolean, discrepancy: bigint} | null>(null);

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const [committedCount, setCommittedCount] = useState<number | null>(null);

    const handleGenerateKey = () => {
        const key = generateSecretKey();
        const hex = bytesToHex(key);
        setGeneratedKeyHex(hex);
        updateFormData({ buyerSecret: hex });
    };

    const handleExportKey = () => {
        if (!generatedKeyHex) return;
        const blob = new Blob([generatedKeyHex], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mfnguard-buyer-secret.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerateSalt = () => {
        setSalt(bytesToHex(window.crypto.getRandomValues(new Uint8Array(32))));
    };

    const handleImportBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;
        setImportStatus({ type: 'loading', message: 'Importing...' });
        
        try {
            const text = await importFile.text();
            const data = JSON.parse(text);
            
            const parsedPrices = data.prices.map((p: string) => BigInt(p));
            const parsedSalts = data.salts.map((s: string) => new Uint8Array(Buffer.from(s, 'hex')));
            
            importSupplierData(data.classId, parsedPrices, parsedSalts);
            setImportFile(null);
            
            // Try to find the label from classId? Impossible directly, user has to enter it.
            // But we can store it in the state.
            setImportStatus({ type: 'success', message: `Witnesses imported for class ID: ${data.classId.substring(0, 8)}...` });
        } catch (_err: unknown) {
            setImportStatus({ type: 'error', message: 'Failed to parse bundle.' });
        }
    };

    // Check committed count when label changes
    useEffect(() => {
        const checkSlots = async () => {
            if (!formData.label || !api) {
                setCommittedCount(null);
                return;
            }
            try {
                const classIdHex = await deriveClassId(formData.label);
                const classIdBytes = new Uint8Array(Buffer.from(classIdHex, 'hex'));
                
                const state = await api.get_class_state(classIdBytes, ledger);
                if (state && state.filled) {
                    const count = state.filled.filter((f: bigint) => f === 1n).length;
                    setCommittedCount(count);
                } else {
                    setCommittedCount(0);
                }
            } catch (err) {
                setCommittedCount(null);
            }
        };
        
        const timeout = setTimeout(checkSlots, 500);
        return () => clearTimeout(timeout);
    }, [formData.label, api]);

    const handleSubmitCommit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connectedAddress || !api) {
            setStatus({ type: 'error', message: 'Wallet not connected.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Preparing transaction...' });
            
            if (formData.buyerSecret.length !== 64) throw new Error("Buyer secret must be a 64-character hex string.");
            const buyerSecretBytes = new Uint8Array(Buffer.from(formData.buyerSecret, 'hex'));
            
            if (salt.length !== 64) throw new Error("Salt must be a 64-character hex string.");
            const saltBytes = new Uint8Array(Buffer.from(salt, 'hex'));

            const priceBigInt = BigInt(price);
            if (priceBigInt < 0n) throw new Error("Price must be positive");

            const classIdHex = await deriveClassId(formData.label);
            const classIdBytes = new Uint8Array(Buffer.from(classIdHex, 'hex'));

            
            setStatus({ type: 'loading', message: 'Please sign the transaction in your wallet...' });
            
            await api.set_buyer_reference(classIdBytes, buyerSecretBytes, priceBigInt, saltBytes);
            
            // Save buyer data to in-memory context for DisputeView to use in a demo setting
            addBuyerData(classIdHex, priceBigInt, saltBytes);
            
            setStatus({ type: 'success', message: 'Buyer reference committed successfully!' });
        } catch (_err: unknown) {
            console.error(_err instanceof Error ? _err.message : "An error occurred");
            setStatus({ type: 'error', message: 'Failed to commit buyer reference — check your inputs and try again.' });
        }
    };

    const handleComplianceCheck = async () => {
        if (!connectedAddress || !api) {
            setStatus({ type: 'error', message: 'Wallet not connected.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Canonicalizing and preparing transaction...' });
            
            const classIdHex = await deriveClassId(formData.label);
            const classIdBytes = new Uint8Array(Buffer.from(classIdHex, 'hex'));
            
            const importedPrices = supplierPrices[classIdHex];
            const importedSalts = supplierSalts[classIdHex];

            if (!importedPrices || !importedSalts) {
                throw new Error("Missing supplier witness data. Please import the witness bundle first.");
            }

            if (salt.length !== 64) throw new Error("Salt must be a 64-character hex string.");
            const saltBytes = new Uint8Array(Buffer.from(salt, 'hex'));

            const priceBigInt = BigInt(price);
            if (priceBigInt < 0n) throw new Error("Price must be positive");

            // Canonicalize
            const canonProduct = canonicalizeText(formData.product, 'Product');
            const canonRegion = canonicalizeText(formData.region, 'Region');
            const canonCurrency = canonicalizeCurrency(formData.currency);
            const canonDateWindow = canonicalizeDateWindow(formData.startDate, formData.endDate);
            const parsedVolume = stringTo32Bytes(BigInt(formData.volume).toString());
            const parsedTerm = stringTo32Bytes(BigInt(formData.term).toString());

            const productBytes = stringTo32Bytes(canonProduct);
            const regionBytes = stringTo32Bytes(canonRegion);
            const currencyBytes = stringTo32Bytes(canonCurrency);
            const dateWindowBytes = stringTo32Bytes(canonDateWindow);

            
            setStatus({ type: 'loading', message: 'Please sign the transaction in your wallet...' });
            
            const result = await api.compliance_check(
                classIdBytes,
                priceBigInt,
                saltBytes,
                importedPrices,
                importedSalts,
                productBytes,
                parsedVolume,
                regionBytes,
                parsedTerm,
                currencyBytes,
                dateWindowBytes
            );
            
            setCheckResult({
                compliant: result.compliant === 1n,
                discrepancy: BigInt(result.discrepancy)
            });
            setStatus({ type: 'success', message: 'Compliance check complete!' });
        } catch (_err: unknown) {
            console.error(_err instanceof Error ? _err.message : "An error occurred");
            setStatus({ type: 'error', message: 'Failed to complete compliance check — check your inputs and try again.' });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-sky-500/10 border border-sky-500/30 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-sky-400 mb-2">Buyer Portal</h2>
                <p className="text-sky-200/80 text-sm">
                    Commit your reference price and verify supplier compliance using the provided witness bundle.
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Buyer Authentication</h3>
                <div className="flex gap-4 mb-4">
                    <button type="button" onClick={handleGenerateKey} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Generate my key
                    </button>
                </div>
                
                {generatedKeyHex && (
                    <div className="mb-4 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
                        <p className="text-sky-400 font-bold text-sm mb-2">Key generated! SAVE THIS NOW. It will not be shown again.</p>
                        <code className="block w-full bg-black/50 p-3 rounded font-mono text-sky-300 text-xs break-all select-all mb-3">
                            {generatedKeyHex}
                        </code>
                        <button type="button" onClick={handleExportKey} className="text-xs bg-sky-600/30 hover:bg-sky-500/50 text-sky-200 px-3 py-1.5 rounded transition-colors border border-sky-500/30">
                            Download Key File
                        </button>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Secret (Hex)</label>
                    <input type="password" value={formData.buyerSecret} onChange={e => updateFormData({ buyerSecret: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-sky-500 transition-colors" placeholder="Enter 64-character hex secret..." />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Import Witness Bundle</h3>
                <form onSubmit={handleImportBundle} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input type="file" accept=".json" onChange={e => setImportFile(e.target.files?.[0] || null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20" />
                        <button type="submit" disabled={!importFile} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                            Import
                        </button>
                    </div>
                    {importStatus.type !== 'idle' && (
                        <div className={`p-3 rounded-lg text-sm ${importStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : importStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400'}`}>
                            {importStatus.message}
                        </div>
                    )}
                </form>
            </div>

            <form onSubmit={handleSubmitCommit} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Class Identification</h3>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Class Label</label>
                        <input type="text" required value={formData.label} onChange={e => updateFormData({ label: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 transition-colors" placeholder="e.g., JD-Enterprise-Tier" />
                    </div>
                    {committedCount !== null && (
                        <div className={`mt-4 p-4 border rounded-xl flex items-start gap-3 ${committedCount < 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                            <div className="mt-0.5">
                                {committedCount < 5 ? '⚠️' : '✅'}
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${committedCount < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {committedCount}/5 Supplier Slots Filled
                                </p>
                                {committedCount < 5 && (
                                    <p className="text-xs text-amber-200/70 mt-1">
                                        Warning: Proceeding with the compliance check before all slots are filled may leak information about the specific prices committed so far.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
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
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Price</label>
                            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500" placeholder="e.g., 9900 for $99.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                                <span>Cryptographic Salt (Hex)</span>
                                <button type="button" onClick={handleGenerateSalt} className="text-sky-400 hover:text-sky-300 transition-colors">Regenerate</button>
                            </label>
                            <input type="text" required value={salt} onChange={e => setSalt(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-sky-500" />
                        </div>
                    </div>
                </div>

                {status.type !== 'idle' && (
                    <div className={`p-4 rounded-xl text-sm ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                        {status.message}
                    </div>
                )}

                {checkResult && (
                    <div className={`p-6 rounded-2xl border ${checkResult.compliant ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <h3 className={`text-xl font-bold flex items-center gap-3 ${checkResult.compliant ? 'text-emerald-400' : 'text-red-400'}`}>
                            {checkResult.compliant ? (
                                <><span>✅</span> Compliant</>
                            ) : (
                                <><span>❌</span> MFN Violation Detected</>
                            )}
                        </h3>
                        {!checkResult.compliant && (
                            <div className="mt-4 p-4 bg-black/30 rounded-xl">
                                <p className="text-red-300 text-sm">
                                    The supplier sold this product to another customer for <strong className="text-white font-mono">{Number(checkResult.discrepancy) / 100}</strong> units less than your price.
                                </p>
                            </div>
                        )}
                        {checkResult.compliant && (
                            <p className="mt-2 text-emerald-200/80 text-sm">
                                The supplier has adhered to the Most Favored Nation clause. No lower prices were found.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex gap-4">
                    <button type="submit" disabled={status.type === 'loading'} className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg">
                        1. Commit My Price
                    </button>
                    <button type="button" onClick={handleComplianceCheck} disabled={status.type === 'loading'} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg">
                        2. Check Compliance
                    </button>
                </div>
            </form>
        </div>
    );
}
