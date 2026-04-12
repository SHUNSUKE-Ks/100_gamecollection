// ============================================
// MenuScreen - Main Menu Container (Ver1.1)
// ============================================

import React, { useState } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { PartyView } from './views/PartyView';
import menuConfig from '@/data/menu/menuConfig.json';
import { Users, User, Backpack, Sword, Save, ArrowLeft } from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
    Users,
    User,
    Backpack,
    Sword,
    Save,
};

// Styles
const styles = {
    container: "flex h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200",
    sidebar: "w-64 bg-slate-900/80 backdrop-blur-sm border-r border-slate-700/50 flex flex-col",
    sidebarHeader: "p-4 border-b border-slate-700/50",
    menuList: "flex-1 py-2",
    menuItem: "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all cursor-pointer",
    menuItemActive: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    menuItemInactive: "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200",
    footer: "p-4 border-t border-slate-700/50",
    main: "flex-1 overflow-hidden",
    mainHeader: "p-4 border-b border-slate-700/50 bg-slate-800/50",
    mainContent: "h-full overflow-y-auto p-4",
    goldDisplay: "flex items-center gap-2 text-yellow-400 font-bold",
    playTimeDisplay: "text-xs text-slate-500 mt-1",
};

export const MenuScreen: React.FC = () => {
    const [activeView, setActiveView] = useState(menuConfig.defaultView);
    const { gold, playTime, setScreen } = useGameStore();

    // Format play time
    const formatPlayTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    // Get current view title
    const currentMenuItem = menuConfig.menuItems.find(item => item.id === activeView);

    // Render view based on selection
    const renderView = () => {
        switch (activeView) {
            case 'party':
                return <PartyView />;
            case 'status':
                return <div className="text-center text-slate-500 py-20">ステータス (未実装)</div>;
            case 'inventory':
                return <div className="text-center text-slate-500 py-20">アイテム (未実装)</div>;
            case 'equipment':
                return <div className="text-center text-slate-500 py-20">装備 (未実装)</div>;
            case 'save':
                return <div className="text-center text-slate-500 py-20">セーブ (未実装)</div>;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                {/* Header - Back Button */}
                <div className={styles.sidebarHeader}>
                    <button
                        onClick={() => setScreen('NOVEL')}
                        className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-lg font-bold">戻る</span>
                    </button>
                    <div className={styles.playTimeDisplay}>
                        プレイ時間: {formatPlayTime(playTime)}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className={styles.menuList}>
                    {menuConfig.menuItems.map((item) => {
                        const Icon = iconMap[item.icon] || Users;
                        const isActive = activeView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : styles.menuItemInactive}`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer - Gold Display */}
                <div className={styles.footer}>
                    <div className={styles.goldDisplay}>
                        <span className="text-2xl">💰</span>
                        <span className="text-xl">{gold.toLocaleString()} G</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Header */}
                <div className={styles.mainHeader}>
                    <h2 className="text-2xl font-bold">{currentMenuItem?.label}</h2>
                </div>

                {/* View Content */}
                <div className={styles.mainContent}>
                    {renderView()}
                </div>
            </main>
        </div>
    );
};
