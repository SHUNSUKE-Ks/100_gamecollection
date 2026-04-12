// ============================================
// SoundSettingsView - BGM/SE/Voice Volume Sliders
// ============================================

import React from 'react';
import { useSettingsStore } from '@/core/stores/settingsStore';
import { Volume2, VolumeX, Music, Mic, Sparkles } from 'lucide-react';

// Styles
const styles = {
    container: "space-y-6",
    section: "bg-slate-800/50 rounded-xl p-6 border border-slate-700/50",
    sectionTitle: "text-lg font-bold text-slate-200 mb-4 flex items-center gap-2",
    sliderRow: "flex items-center gap-4 mb-4",
    sliderLabel: "w-24 flex items-center gap-2 text-slate-300",
    sliderContainer: "flex-1",
    slider: "w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-yellow-500",
    sliderValue: "w-12 text-right text-sm text-slate-400",
    muteButton: "p-2 rounded-lg transition-colors",
    muteActive: "bg-red-500/20 text-red-400",
    muteInactive: "bg-slate-700/50 text-slate-400 hover:bg-slate-700",
    resetButton: "mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors",
};

interface VolumeSliderProps {
    label: string;
    icon: React.ReactNode;
    value: number;
    onChange: (value: number) => void;
    muted?: boolean;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ label, icon, value, onChange, muted }) => (
    <div className={styles.sliderRow}>
        <div className={styles.sliderLabel}>
            {icon}
            <span>{label}</span>
        </div>
        <div className={styles.sliderContainer}>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={styles.slider}
                style={{ opacity: muted ? 0.5 : 1 }}
                disabled={muted}
            />
        </div>
        <div className={styles.sliderValue}>
            {muted ? 'OFF' : `${value}%`}
        </div>
    </div>
);

export const SoundSettingsView: React.FC = () => {
    const {
        sound,
        setBgmVolume,
        setSeVolume,
        setVoiceVolume,
        toggleMute,
    } = useSettingsStore();

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <Volume2 size={20} className="text-yellow-400" />
                    サウンド設定
                </h3>

                {/* Mute Toggle */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                    <span className="text-slate-300">全体ミュート</span>
                    <button
                        onClick={toggleMute}
                        className={`${styles.muteButton} ${sound.muted ? styles.muteActive : styles.muteInactive}`}
                    >
                        {sound.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>

                {/* BGM Slider */}
                <VolumeSlider
                    label="BGM"
                    icon={<Music size={16} className="text-blue-400" />}
                    value={sound.bgm}
                    onChange={setBgmVolume}
                    muted={sound.muted}
                />

                {/* SE Slider */}
                <VolumeSlider
                    label="SE"
                    icon={<Sparkles size={16} className="text-yellow-400" />}
                    value={sound.se}
                    onChange={setSeVolume}
                    muted={sound.muted}
                />

                {/* Voice Slider */}
                <VolumeSlider
                    label="Voice"
                    icon={<Mic size={16} className="text-pink-400" />}
                    value={sound.voice}
                    onChange={setVoiceVolume}
                    muted={sound.muted}
                />
            </div>
        </div>
    );
};
