
import React, { useState, useRef } from 'react';
import { GeminiService, type OrderList, type AnalysisResult } from '@/core/services/GeminiService';
import sampleOrder from '@/data/samplejson/character_order.json';

// Styles
const styles = {
    container: "flex h-full bg-slate-900 text-slate-200 overflow-hidden font-sans",
    sidebar: "w-1/3 min-w-[350px] max-w-[600px] bg-slate-800 border-r border-slate-700 flex flex-col p-4 overflow-y-auto",
    main: "flex-1 flex flex-col bg-slate-900 overflow-hidden relative",
    sectionTitle: "text-lg font-bold text-yellow-500 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2",
    card: "bg-slate-700 rounded-lg p-4 mb-4 border border-slate-600 shadow-sm",
    input: "w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500 transition-colors",
    button: "w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    dropZone: "border-2 border-dashed border-slate-600 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-slate-700/50 transition-all",
    assetGrid: "grid grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto h-full",
    assetCard: "bg-slate-800 rounded border border-slate-700 overflow-hidden relative group",
    assetImage: "w-full aspect-square object-contain bg-slate-950/50",
    assetOverlay: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center",
};

export const StudioScreen: React.FC = () => {
    // State
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [orderJson, setOrderJson] = useState<string>(JSON.stringify(sampleOrder, null, 2));
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                setReferenceImage(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!referenceImage) return;

        setIsAnalyzing(true);
        try {
            const order: OrderList = JSON.parse(orderJson);
            const result = await GeminiService.analyzeCharacterAndOrders(referenceImage, order);
            console.log("Analysis Result:", result);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis Failed:", error);
            alert("Analysis failed. See console for details.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Copy prompt to clipboard
    const handleCopyPrompt = async (assetId: number) => {
        if (!analysisResult) return;

        const asset = analysisResult.assets.find(a => a.id === assetId);
        if (!asset) return;

        try {
            await navigator.clipboard.writeText(asset.prompt);
            setCopiedId(assetId);
            setTimeout(() => setCopiedId(null), 2000); // Reset after 2s
        } catch (error) {
            console.error("Copy failed:", error);
            alert("Failed to copy prompt");
        }
    };

    // Copy all prompts
    const handleCopyAll = async () => {
        if (!analysisResult) return;

        const allPrompts = analysisResult.assets
            .map(a => `### ${a.filename}\n${a.prompt}`)
            .join('\n\n---\n\n');

        try {
            await navigator.clipboard.writeText(allPrompts);
            alert('All prompts copied to clipboard!');
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Sidebar: Configuration */}
            <aside className={styles.sidebar} style={{ width: '600px', minWidth: '600px', maxWidth: '600px' }}>
                <h2 className="text-2xl font-black mb-6 text-slate-100 tracking-tighter">
                    <span className="text-yellow-500">NANOBANANA</span> STUDIO
                </h2>

                {/* 1. Reference Image */}
                <div className="mb-8">
                    <h3 className={styles.sectionTitle}>1. Reference Image</h3>
                    {/* Hidden input moved outside dropZone to prevent double dialog */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <div
                        className={styles.dropZone}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleFile(file);
                        }}
                    >
                        {referenceImage ? (
                            <img src={referenceImage} alt="Reference" className="h-full w-full object-contain p-2" />
                        ) : (
                            <div className="text-center text-slate-500">
                                <p className="text-3xl mb-2">📷</p>
                                <p>Click or Drag Image</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Order Configuration */}
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className={styles.sectionTitle}>2. Order JSON</h3>
                    <textarea
                        className={styles.input}
                        style={{
                            minHeight: '500px',
                            width: '100%',
                            flex: 1,
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            resize: 'none',
                            marginBottom: '16px'
                        }}
                        value={orderJson}
                        onChange={e => setOrderJson(e.target.value)}
                        placeholder="Paste Assets_OrderList here..."
                    />
                    <button
                        className={styles.button}
                        onClick={handleAnalyze}
                        disabled={!referenceImage || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⚙️</span> Analyzing...
                            </span>
                        ) : (
                            "Check List & Analyze"
                        )}
                    </button>
                    {referenceImage && !isAnalyzing && !analysisResult && (
                        <p className="text-xs text-center text-slate-500 mt-2">
                            画像とJSONを元に、AIがアセット生成プランを作成します。
                        </p>
                    )}
                </div>
            </aside>

            {/* Main: Results & Generation */}
            <main className={styles.main}>
                {!analysisResult ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50 select-none">
                        <div className="text-6xl mb-4">🎨</div>
                        <p className="text-xl font-bold">Waiting for Analysis...</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Header Info */}
                        <header className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {analysisResult.name}
                                    <span className="text-sm font-normal text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                                        ID: {analysisResult.id}
                                    </span>
                                </h1>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{analysisResult.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyAll}
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded shadow-lg flex items-center gap-2"
                                >
                                    📋 Copy All Prompts
                                </button>
                                {analysisResult.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-slate-700 text-yellow-500 px-2 py-1 rounded border border-slate-600 flex items-center">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </header>

                        {/* Asset Grid */}
                        <div className={styles.assetGrid}>
                            {analysisResult.assets.map((asset: any) => (
                                <div key={asset.id} className={styles.assetCard}>
                                    <div className="relative aspect-square bg-slate-950">
                                        {asset.imageUrl ? (
                                            <img src={asset.imageUrl} alt={asset.description} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                No Image
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-[10px] text-white rounded backdrop-blur-sm border border-white/10">
                                            {asset.type}
                                        </div>
                                    </div>

                                    {/* Info & Action */}
                                    <div className="p-3 bg-slate-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-mono text-slate-400">{asset.filename.split('/').pop()}</span>
                                        </div>
                                        <p className="text-xs text-slate-300 mb-3 line-clamp-2 h-8" title={asset.description}>
                                            {asset.description}
                                        </p>
                                        <button
                                            className="w-full py-2 rounded text-xs font-bold transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                                            onClick={() => handleCopyPrompt(asset.id)}
                                        >
                                            {copiedId === asset.id ? '✓ Copied!' : '📋 Copy Prompt'}
                                        </button>
                                        {/* Show prompt preview */}
                                        <details className="mt-2">
                                            <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300">Show Prompt</summary>
                                            <p className="text-[10px] text-slate-400 mt-1 p-2 bg-slate-900 rounded max-h-20 overflow-y-auto">
                                                {asset.prompt}
                                            </p>
                                        </details>
                                    </div>

                                    {/* Debug Prompt Hint on Hover (Optional) */}
                                    {/* <div className="hidden group-hover:block absolute bottom-full left-0 w-full bg-black/90 p-2 text-[10px] text-slate-300 pointer-events-none z-20">
                                        {asset.prompt}
                                    </div> */}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
