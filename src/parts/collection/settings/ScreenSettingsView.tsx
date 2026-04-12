// ============================================
// ScreenSettingsView - Android/PC Screen Settings
// ============================================

import React, { useState } from 'react';
import { useSettingsStore, getDeviceType } from '@/core/stores/settingsStore';
import { Monitor, Smartphone } from 'lucide-react';

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
    value: "text-slate-400",
    select: "bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500",
    toggle: "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
    toggleActive: "bg-yellow-500",
    toggleInactive: "bg-slate-600",
    toggleKnob: "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
};

const resolutions = ['1280x720', '1920x1080', '2560x1440', '3840x2160'];
const fpsOptions = [30, 60, 120];

type DeviceTab = 'android' | 'pc';

export const ScreenSettingsView: React.FC = () => {
    const detectedDevice = getDeviceType();
    const [activeTab, setActiveTab] = useState<DeviceTab>(detectedDevice);

    const {
        screen,
        setAndroidScreen,
        setPcScreen,
    } = useSettingsStore();

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <Monitor size={20} className="text-yellow-400" />
                    画面設定
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

                {/* Android Settings */}
                {activeTab === 'android' && (
                    <div>
                        {/* Orientation */}
                        <div className={styles.row}>
                            <span className={styles.label}>画面向き</span>
                            <select
                                className={styles.select}
                                value={screen.android.orientation}
                                onChange={(e) => setAndroidScreen({ orientation: e.target.value as 'landscape' | 'portrait' })}
                            >
                                <option value="landscape">横画面 (固定)</option>
                                <option value="portrait">縦画面</option>
                            </select>
                        </div>

                        {/* Resolution */}
                        <div className={styles.row}>
                            <span className={styles.label}>解像度</span>
                            <select
                                className={styles.select}
                                value={screen.android.resolution}
                                onChange={(e) => setAndroidScreen({ resolution: e.target.value })}
                            >
                                {resolutions.map(res => (
                                    <option key={res} value={res}>{res}</option>
                                ))}
                            </select>
                        </div>

                        {/* FPS */}
                        <div className={styles.row}>
                            <span className={styles.label}>フレームレート</span>
                            <select
                                className={styles.select}
                                value={screen.android.fps}
                                onChange={(e) => setAndroidScreen({ fps: Number(e.target.value) })}
                            >
                                {fpsOptions.map(fps => (
                                    <option key={fps} value={fps}>{fps} FPS</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* PC Settings */}
                {activeTab === 'pc' && (
                    <div>
                        {/* Fullscreen Toggle */}
                        <div className={styles.row}>
                            <span className={styles.label}>フルスクリーン</span>
                            <button
                                onClick={() => setPcScreen({ fullscreen: !screen.pc.fullscreen })}
                                className={`${styles.toggle} ${screen.pc.fullscreen ? styles.toggleActive : styles.toggleInactive}`}
                            >
                                <div
                                    className={styles.toggleKnob}
                                    style={{ transform: screen.pc.fullscreen ? 'translateX(24px)' : 'translateX(0)' }}
                                />
                            </button>
                        </div>

                        {/* Resolution */}
                        <div className={styles.row}>
                            <span className={styles.label}>解像度</span>
                            <select
                                className={styles.select}
                                value={screen.pc.resolution}
                                onChange={(e) => setPcScreen({ resolution: e.target.value })}
                            >
                                {resolutions.map(res => (
                                    <option key={res} value={res}>{res}</option>
                                ))}
                            </select>
                        </div>

                        {/* FPS */}
                        <div className={styles.row}>
                            <span className={styles.label}>フレームレート</span>
                            <select
                                className={styles.select}
                                value={screen.pc.fps}
                                onChange={(e) => setPcScreen({ fps: Number(e.target.value) })}
                            >
                                {fpsOptions.map(fps => (
                                    <option key={fps} value={fps}>{fps} FPS</option>
                                ))}
                            </select>
                        </div>

                        {/* VSync Toggle */}
                        <div className={styles.row}>
                            <span className={styles.label}>垂直同期 (VSync)</span>
                            <button
                                onClick={() => setPcScreen({ vsync: !screen.pc.vsync })}
                                className={`${styles.toggle} ${screen.pc.vsync ? styles.toggleActive : styles.toggleInactive}`}
                            >
                                <div
                                    className={styles.toggleKnob}
                                    style={{ transform: screen.pc.vsync ? 'translateX(24px)' : 'translateX(0)' }}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* Current Device Indicator */}
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
                    検出されたデバイス: <span className="text-yellow-400">{detectedDevice === 'android' ? 'Android' : 'PC'}</span>
                </div>
            </div>
        </div>
    );
};
