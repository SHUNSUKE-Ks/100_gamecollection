import React, { useState } from 'react';
import type { Present } from '../types';
import { PRESENTS } from '../data/constants';
import { Gift, X } from 'lucide-react';

interface InventoryProps {
  onSelectPresent: (present: Present) => void;
}

const Inventory: React.FC<InventoryProps> = ({ onSelectPresent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'super_rare': return 'border-purple-500/50 shadow-purple-500/20 bg-purple-500/5';
      case 'rare': return 'border-blue-500/50 shadow-blue-500/20 bg-blue-500/5';
      default: return 'border-white/10 bg-white/5';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 transition-all active:scale-95 shadow-lg group ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <Gift className="text-pink-300" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full border-2 border-slate-900" />
      </button>

      <div className={`fixed inset-0 z-50 pointer-events-none overflow-hidden ${isOpen ? 'pointer-events-auto' : ''}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsOpen(false)} />

        <div className={`absolute top-0 right-0 h-full w-80 bg-slate-950/95 border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="text-white text-lg font-bold tracking-widest flex items-center gap-2">
              <Gift className="text-pink-400 w-5 h-5" /> ITEM BOX
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="text-white/60" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {PRESENTS.map((item) => (
              <button
                key={item.id}
                onClick={() => { onSelectPresent(item); setIsOpen(false); }}
                className={`w-full p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${getRarityClass(item.rarity)} hover:scale-[1.02]`}
              >
                <div className="flex gap-4 items-start">
                  <span className="text-4xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{item.name}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${item.rarity === 'super_rare' ? 'bg-purple-500 text-white' : (item.rarity === 'rare' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white/80')}`}>
                        {item.rarity.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1 leading-tight">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(item.effects).map(([key, val]) => (
                        <span key={key} className="text-[9px] bg-black/40 text-white/60 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                          {key}: {val && val > 0 ? `+${val}` : val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;