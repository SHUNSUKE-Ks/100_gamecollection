
import React, { useState } from 'react';
import { Header } from './components/Header';
import { GeneratorSidebar } from './components/GeneratorSidebar';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      {/* メインコンテンツエリア（将来的に他の機能を置くことが可能） */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="max-w-2xl space-y-6">
          <div className="w-20 h-20 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center rotate-3 shadow-2xl shadow-yellow-400/20">
            <span className="text-slate-950 font-black text-3xl italic">NB</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Ready to Build Assets?</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            左上のアイコンをクリックして <strong>NANOBANANAPRO</strong> サイドパネルを開き、
            キャラクターアセットの生成を開始してください。
          </p>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="px-8 py-3 bg-yellow-400 text-slate-950 rounded-xl font-bold hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/10"
          >
            サイドパネルを開く
          </button>
        </div>
      </main>

      {/* 独立したサイドパネルコンポーネント */}
      <GeneratorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};

export default App;
