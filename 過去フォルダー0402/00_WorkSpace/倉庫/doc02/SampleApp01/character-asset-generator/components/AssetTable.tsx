
import React from 'react';
import { GeneratedAsset } from '../types';

interface AssetTableProps {
  assets: GeneratedAsset[];
  onGenerateImage: (id: number) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({ assets, onGenerateImage }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Asset Info</th>
            <th className="px-6 py-4">Generation Prompt</th>
            <th className="px-6 py-4 text-center">Output</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {assets.map((asset) => (
            <tr key={asset.id} className="group hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-6 align-top">
                <span className="text-slate-600 font-mono text-xs">{String(asset.id).padStart(2, '0')}</span>
              </td>
              <td className="px-6 py-6 align-top max-w-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-200">{asset.filename.split('/').pop()}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                    asset.type === 'Standing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    asset.type === 'Expression' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                  }`}>
                    {asset.type}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{asset.description}</p>
                </div>
              </td>
              <td className="px-6 py-6 align-top max-w-md">
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 group-hover:border-slate-700 transition-colors">
                  <p className="text-[11px] font-mono leading-relaxed text-slate-400">
                    {asset.prompt}
                  </p>
                </div>
              </td>
              <td className="px-6 py-6 align-top">
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-32 h-32 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative ${
                    asset.isGenerating ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950' : ''
                  }`}>
                    {asset.imageUrl ? (
                      <img src={asset.imageUrl} alt={asset.filename} className="w-full h-full object-cover" />
                    ) : asset.isGenerating ? (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-yellow-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-[10px] text-slate-500 uppercase font-bold animate-pulse">Generating</span>
                      </div>
                    ) : (
                      <div className="text-slate-800 flex flex-col items-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {!asset.imageUrl && !asset.isGenerating && (
                    <button
                      onClick={() => onGenerateImage(asset.id)}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-yellow-400 transition-colors py-1 px-3 border border-slate-800 rounded hover:border-yellow-400/30"
                    >
                      Render
                    </button>
                  )}
                  {asset.imageUrl && (
                    <button
                      onClick={() => onGenerateImage(asset.id)}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
