
import React, { useState } from 'react';
import { OrderList, AnalysisResult } from '../types';
import { analyzeCharacterAndOrders, generateAssetImage } from '../services/gemini';
import { ImageUpload } from './ImageUpload';
import { JsonEditor } from './JsonEditor';
import { AssetTable } from './AssetTable';

declare const JSZip: any;

interface GeneratorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ORDER: OrderList = {
  order_id: "batch_001",
  character_name: "Remi Unant",
  assets: [
    {
      name: "Standard Standing",
      type: "Standing",
      filename: "remi_unant/standing_01.png",
      description: "Standard standing pose, looking at camera, confident."
    },
    {
      name: "Smile Expression",
      type: "Expression",
      filename: "remi_unant/face_smile.png",
      description: "Gentle smiling expression, soft eyes."
    },
    {
      name: "Campfire Event",
      type: "CG",
      filename: "remi_unant/cg_event_01.png",
      description: "Event CG: Character sitting by a campfire at night, warm lighting."
    }
  ]
};

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({ isOpen, onClose }) => {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [orderJson, setOrderJson] = useState<string>(JSON.stringify(DEFAULT_ORDER, null, 4));
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!referenceImage) {
      setError("Please upload a reference image first.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const parsedOrders = JSON.parse(orderJson);
      const result = await analyzeCharacterAndOrders(referenceImage, parsedOrders);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze orders.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async (assetId: number) => {
    if (!analysis) return;
    setAnalysis(prev => {
      if (!prev) return null;
      return {
        ...prev,
        assets: prev.assets.map(a => a.id === assetId ? { ...a, isGenerating: true } : a)
      };
    });

    try {
      const asset = analysis.assets.find(a => a.id === assetId);
      if (!asset) return;
      const imageUrl = await generateAssetImage(asset.prompt, referenceImage || undefined);
      setAnalysis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          assets: prev.assets.map(a => a.id === assetId ? { ...a, imageUrl, isGenerating: false } : a)
        };
      });
      return imageUrl;
    } catch (err) {
      setAnalysis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          assets: prev.assets.map(a => a.id === assetId ? { ...a, isGenerating: false } : a)
        };
      });
      throw err;
    }
  };

  const handleGenerateAll = async () => {
    if (!analysis || isGeneratingAll) return;
    setIsGeneratingAll(true);
    try {
      // 順番に生成（API制限を考慮）
      for (const asset of analysis.assets) {
        try {
          await handleGenerateImage(asset.id);
        } catch (e) {
          console.error(`Failed to generate asset ${asset.id}`, e);
        }
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleDownloadPackage = async () => {
    if (!analysis) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(analysis.id || 'character_assets');
      const dataJson: any = { ...analysis, assets: { standing: [], faces: {}, cgs: [] } };

      for (const asset of analysis.assets) {
        if (asset.imageUrl) {
          const fileName = asset.filename.split('/').pop() || `asset_${asset.id}.png`;
          folder.file(fileName, asset.imageUrl.split(',')[1], { base64: true });
          if (asset.type === 'Standing') dataJson.assets.standing.push(fileName);
          else if (asset.type === 'Expression') dataJson.assets.faces[asset.id] = fileName;
          else if (asset.type === 'CG') dataJson.assets.cgs.push(fileName);
        }
      }
      folder.file("data.json", JSON.stringify(dataJson, null, 4));
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${analysis.id}_package.zip`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-slate-900 border-r border-slate-800 z-[70] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center rotate-2">
              <span className="text-slate-950 font-black text-sm italic">NB</span>
            </div>
            <h3 className="font-black tracking-tighter uppercase text-sm">Asset Generator</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              Step 1: Reference
            </h4>
            <ImageUpload image={referenceImage} onUpload={setReferenceImage} />
          </section>

          <section className="space-y-4">
            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              Step 2: Specification
            </h4>
            <JsonEditor value={orderJson} onChange={setOrderJson} />
          </section>

          <div className="pt-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-yellow-400/10 ${
                isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'
              }`}
            >
              {isAnalyzing ? "Analyzing Character..." : "Analyze & Generate"}
            </button>
            {error && <p className="mt-4 text-xs text-red-400 text-center">{error}</p>}
          </div>

          {analysis && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4 gap-2">
                  <h4 className="text-lg font-bold flex-1">{analysis.name}</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownloadPackage}
                      disabled={isExporting || isGeneratingAll}
                      className="px-3 py-1.5 bg-slate-800 text-slate-200 text-[10px] font-bold rounded uppercase hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
                    >
                      {isExporting ? 'Exporting...' : 'Export Package'}
                    </button>
                    <button 
                      onClick={handleGenerateAll}
                      disabled={isGeneratingAll}
                      className="px-3 py-1.5 bg-yellow-400 text-slate-950 text-[10px] font-bold rounded uppercase hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {isGeneratingAll ? (
                        <>
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        'Generate All'
                      )}
                    </button>
                  </div>
                </div>
                <AssetTable assets={analysis.assets} onGenerateImage={handleGenerateImage} />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};
