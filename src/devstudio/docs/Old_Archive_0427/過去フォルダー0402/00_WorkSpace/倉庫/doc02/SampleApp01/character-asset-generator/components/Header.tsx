
import React from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onToggleSidebar}
        >
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-6 group-active:scale-90 transition-all shadow-lg shadow-yellow-400/20">
            <span className="text-slate-950 font-black text-xl italic">NB</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">NANOBANANA<span className="text-yellow-400">PRO</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Open Side Panel</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <span className="hover:text-yellow-400 cursor-pointer transition-colors">Documentation</span>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AI Engine Ready
          </div>
        </div>
      </div>
    </header>
  );
};
