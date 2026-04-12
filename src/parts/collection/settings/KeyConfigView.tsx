// ============================================
// KeyConfigView - Android/PC Key Configuration
// ============================================

import React, { useState } from 'react';
import { useSettingsStore, getDeviceType } from '@/core/stores/settingsStore';
import { Keyboard, Smartphone, Monitor, RotateCcw } from 'lucide-react';

// Styles
const styles = {
    container: "space-y-6",
    section: "bg-slate-800/50 rounded-xl p-6 border border-slate-700/50",
    sectionTitle: "text-lg font-bold text-slate-200 mb-4 flex items-center gap-2",
    tabContainer: "flex gap-2 mb-6",
    tab: "flex-1 py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2",
    tabActive: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    tabInactive: "bg-slate-700/50 text-slate-400 hover:bg-slate-700",
    row: "flex items-center justify-between py-3 border-b border-slate-700/50",
    label: "text-slate-300",
    keyButton: "px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-yellow-400 font-mono text-sm hover:bg-slate-600 transition-colors min-w-[80px] text-center",
    keyButtonListening: "bg-yellow-500/20 border-yellow-500 animate-pulse",
    resetButton: "mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors flex items-center gap-2",
};

type DeviceTab = 'android' | 'pc';

export const KeyConfigView: React.FC = () => {
    const detectedDevice = getDeviceType();
    const [activeTab, setActiveTab] = useState<DeviceTab>(detectedDevice);
    const [listeningFor, setListeningFor] = useState<string | null>(null);

    const {
        keyConfig,
        setPcKey,
        resetSettings,
    } = useSettingsStore();

    // Handle key capture for PC
    const handleKeyCapture = (actionKey: string) => {
        if (activeTab !== 'pc') return;

        setListeningFor(actionKey);

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const key = e.key === ' ' ? 'Space' : e.key;
            setPcKey(actionKey as keyof typeof keyConfig.pc, key);
            setListeningFor(null);
            window.removeEventListener('keydown', handleKeyDown);
        };

        window.addEventListener('keydown', handleKeyDown);

        // Timeout after 5 seconds
        setTimeout(() => {
            setListeningFor(null);
            window.removeEventListener('keydown', handleKeyDown);
        }, 5000);
    };

    const androidActions = [
        { key: 'tap', label: 'タップ' },
        { key: 'swipeLeft', label: '左スワイプ' },
        { key: 'swipeRight', label: '右スワイプ' },
        { key: 'doubleTap', label: 'ダブルタップ' },
    ];

    const pcActions = [
        { key: 'confirm', label: '決定' },
        { key: 'cancel', label: 'キャンセル' },
        { key: 'menu', label: 'メニュー' },
        { key: 'skip', label: 'スキップ' },
        { key: 'auto', label: 'オート' },
        { key: 'log', label: 'ログ' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <Keyboard size={20} className="text-yellow-400" />
                    キー設定
                </h3>

                {/* Device Tabs */}
                <div className={styles.tabContainer}>
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`${styles.tab} ${activeTab === 'android' ? styles.tabActive : styles.tabInactive}`}
                    >
                        <Smartphone size={18} />
                        Android
                    </button>
                    <button
                        onClick={() => setActiveTab('pc')}
                        className={`${styles.tab} ${activeTab === 'pc' ? styles.tabActive : styles.tabInactive}`}
                    >
                        <Monitor size={18} />
                        PC
                    </button>
                </div>

                {/* Android Key Config */}
                {activeTab === 'android' && (
                    <div>
                        {androidActions.map(action => (
                            <div key={action.key} className={styles.row}>
                                <span className={styles.label}>{action.label}</span>
                                <div className={styles.keyButton}>
                                    {keyConfig.android[action.key as keyof typeof keyConfig.android]}
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-slate-500 mt-4">
                            ※ Android のジェスチャー設定は変更できません
                        </p>
                    </div>
                )}

                {/* PC Key Config */}
                {activeTab === 'pc' && (
                    <div>
                        {pcActions.map(action => (
                            <div key={action.key} className={styles.row}>
                                <span className={styles.label}>{action.label}</span>
                                <button
                                    onClick={() => handleKeyCapture(action.key)}
                                    className={`${styles.keyButton} ${listeningFor === action.key ? styles.keyButtonListening : ''}`}
                                >
                                    {listeningFor === action.key
                                        ? '...'
                                        : keyConfig.pc[action.key as keyof typeof keyConfig.pc]
                                    }
                                </button>
                            </div>
                        ))}
                        <p className="text-xs text-slate-500 mt-4">
                            ※ クリックしてキーを押すと変更できます
                        </p>
                    </div>
                )}

                {/* Reset Button */}
                <button
                    onClick={resetSettings}
                    className={styles.resetButton}
                >
                    <RotateCcw size={16} />
                    初期設定に戻す
                </button>
            </div>
        </div>
    );
};
