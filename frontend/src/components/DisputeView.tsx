import { useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useSharedData } from './SharedDataContext';
import { bytesToHex, deriveClassId, generateSecretKey } from '../lib/crypto';
import { canonicalizeCurrency, canonicalizeDateWindow, canonicalizeText, stringTo32Bytes } from '../lib/canonicalize';
import { getMFNGuardAPI } from '../lib/mfnguard-api';

const DEMO_AUDITOR_SECRET_HEX = "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff";

export default function DisputeView() {
    const { connectedAddress, providers } = useWallet();
    const { supplierPrices, supplierSalts, buyerPrice, buyerSalt, importSupplierData } = useSharedData();

    // Key Generation State
    const [useDemoKey, setUseDemoKey] = useState(false);
    const [generatedKeyHex, setGeneratedKeyHex] = useState<string | null>(null);
    const [auditorSecretInput, setAuditorSecretInput] = useState<string>('');

    // Form State
    const [label, setLabel] = useState('');
    
    // Buyer Data Inputs
    const [bPriceInput, setBPriceInput] = useState('');
    const [bSaltInput, setBSaltInput] = useState('');

    // Comparability Fields
    const [product, setProduct] = useState('');
    const [volume, setVolume] = useState('');
    const [region, setRegion] = useState('');
    const [term, setTerm] = useState('');
    const [currency, setCurrency] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const [disputeResult, setDisputeResult] = useState<{violator_found: boolean, violator_price: number, violator_index: number} | null>(null);

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    // Auto-fill buyer data if available in context
    useEffect(() => {
        const fillBuyerData = async () => {
            if (!label) return;
            try {
                const classIdHex = await deriveClassId(label);
                if (buyerPrice[classIdHex] !== undefined) {
                    setBPriceInput(buyerPrice[classIdHex].toString());
                }
                if (buyerSalt[classIdHex]) {
                    setBSaltInput(bytesToHex(buyerSalt[classIdHex]));
                }
            } catch (e) {}
        };
        fillBuyerData();
    }, [label, buyerPrice, buyerSalt]);

    const handleGenerateKey = () => {
        const key = generateSecretKey();
        const hex = bytesToHex(key);
        setGeneratedKeyHex(hex);
        setAuditorSecretInput(hex);
        setUseDemoKey(false);
    };

    const handleUseDemoKey = () => {
        setUseDemoKey(true);
        setAuditorSecretInput(DEMO_AUDITOR_SECRET_HEX);
        setGeneratedKeyHex(null);
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
            
            setImportStatus({ type: 'success', message: `Witnesses imported for class ID: ${data.classId.substring(0, 8)}...` });
        } catch (err: any) {
            setImportStatus({ type: 'error', message: 'Failed to parse bundle.' });
        }
    };

    const handleRunDispute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connectedAddress || !providers) {
            setStatus({ type: 'error', message: 'Wallet not connected.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Canonicalizing and preparing transaction...' });
            
            if (auditorSecretInput.length !== 64) throw new Error("Auditor secret must be a 64-character hex string.");
            const auditorSecretBytes = new Uint8Array(Buffer.from(auditorSecretInput, 'hex'));

            const classIdHex = await deriveClassId(label);
            const classIdBytes = new Uint8Array(Buffer.from(classIdHex, 'hex'));
            
            const importedPrices = supplierPrices[classIdHex];
            const importedSalts = supplierSalts[classIdHex];

            if (!importedPrices || !importedSalts) {
                throw new Error("Missing supplier witness data. Please import the witness bundle first.");
            }

            if (bSaltInput.length !== 64) throw new Error("Buyer salt must be a 64-character hex string.");
            const bSaltBytes = new Uint8Array(Buffer.from(bSaltInput, 'hex'));

            const priceBigInt = BigInt(bPriceInput);
            if (priceBigInt < 0n) throw new Error("Buyer price must be positive");

            // Canonicalize
            const canonProduct = canonicalizeText(product, 'Product');
            const canonRegion = canonicalizeText(region, 'Region');
            const canonCurrency = canonicalizeCurrency(currency);
            const canonDateWindow = canonicalizeDateWindow(startDate, endDate);
            const parsedVolume = BigInt(volume);
            const parsedTerm = BigInt(term);

            const productBytes = stringTo32Bytes(canonProduct);
            const regionBytes = stringTo32Bytes(canonRegion);
            const currencyBytes = stringTo32Bytes(canonCurrency);
            const dateWindowBytes = stringTo32Bytes(canonDateWindow);

            const api = await getMFNGuardAPI(providers);
            
            setStatus({ type: 'loading', message: 'Please sign the transaction in your wallet...' });
            
            const result = await (api as any).reveal_violation(
                classIdBytes,
                priceBigInt,
                bSaltBytes,
                importedPrices,
                importedSalts,
                auditorSecretBytes,
                productBytes,
                parsedVolume,
                regionBytes,
                parsedTerm,
                currencyBytes,
                dateWindowBytes
            );
            
            setDisputeResult({
                violator_found: result.violator_found === 1n,
                violator_price: Number(result.violator_price),
                violator_index: Number(result.violator_index)
            });
            
            setStatus({ type: 'success', message: 'Dispute revelation complete!' });
        } catch (err: any) {
            console.error(err);
            setStatus({ type: 'error', message: err.message || 'Check failed.' });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-red-400 mb-2">Auditor Portal</h2>
                <p className="text-red-200/80 text-sm">
                    Investigate proven violations by revealing the violator's specific price to an authorized auditor.
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Auditor Authentication</h3>
                <div className="flex gap-4 mb-4">
                    <button type="button" onClick={handleGenerateKey} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Generate my key
                    </button>
                    <button type="button" onClick={handleUseDemoKey} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Use public demo auditor key
                    </button>
                </div>
                
                {useDemoKey && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span>⚠️</span> DEMO MODE: this key is public
                        </p>
                        <p className="text-red-300/80 text-xs mt-1">Anyone can use this key to act as an auditor on the testnet.</p>
                    </div>
                )}
                
                {generatedKeyHex && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 font-bold text-sm mb-2">Key generated! SAVE THIS NOW. It will not be shown again.</p>
                        <code className="block w-full bg-black/50 p-3 rounded font-mono text-red-300 text-xs break-all select-all">
                            {generatedKeyHex}
                        </code>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Auditor Secret (Hex)</label>
                    <input type="password" value={auditorSecretInput} onChange={e => setAuditorSecretInput(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors" placeholder="Enter 64-character hex secret..." />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Import Witness Bundle</h3>
                <form onSubmit={handleImportBundle} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input type="file" accept=".json" onChange={e => setImportFile(e.target.files?.[0] || null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20" />
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

            <form onSubmit={handleRunDispute} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Class Identification & Buyer Data</h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Class Label</label>
                            <input type="text" required value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors" placeholder="e.g., JD-Enterprise-Tier" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Price</label>
                                <input type="number" required value={bPriceInput} onChange={e => setBPriceInput(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" placeholder="e.g., 9900" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Salt (Hex)</label>
                                <input type="text" required value={bSaltInput} onChange={e => setBSaltInput(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-red-500" />
                            </div>
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
                    <div className={`p-4 rounded-xl text-sm ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {status.message}
                    </div>
                )}

                {disputeResult && (
                    <div className="p-6 rounded-2xl border bg-black/30 border-red-500/30">
                        {disputeResult.violator_found ? (
                            <>
                                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                                    <span>⚠️</span> Violation Confirmed & Revealed
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Violator Slot Index</p>
                                        <p className="text-2xl font-mono text-white">{disputeResult.violator_index}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Revealed Price</p>
                                        <p className="text-2xl font-mono text-red-400">{disputeResult.violator_price}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                <span>✅</span> No Violation Found
                            </h3>
                        )}
                    </div>
                )}

                <button type="submit" disabled={status.type === 'loading'} className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                    Reveal Violation
                </button>
            </form>
        </div>
    );
}
