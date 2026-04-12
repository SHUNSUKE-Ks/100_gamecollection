// ============================================
// NanoNovel - Settings Store (Zustand)
// Sound, Screen, KeyConfig - Android/PC separated
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export interface SoundSettings {
    bgm: number;      // 0-100
    se: number;       // 0-100
    voice: number;    // 0-100
    muted: boolean;
}

export interface ScreenSettings {
    android: {
        orientation: 'landscape' | 'portrait';
        resolution: string;
        fps: number;
    };
    pc: {
        fullscreen: boolean;
        resolution: string;
        fps: number;
        vsync: boolean;
    };
}

export interface KeyConfig {
    android: {
        tap: string;
        swipeLeft: string;
        swipeRight: string;
        doubleTap: string;
    };
    pc: {
        confirm: string;
        cancel: string;
        menu: string;
        skip: string;
        auto: string;
        log: string;
    };
}

interface SettingsState {
    sound: SoundSettings;
    screen: ScreenSettings;
    keyConfig: KeyConfig;

    // Actions - Sound
    setBgmVolume: (volume: number) => void;
    setSeVolume: (volume: number) => void;
    setVoiceVolume: (volume: number) => void;
    toggleMute: () => void;

    // Actions - Screen
    setAndroidScreen: (settings: Partial<ScreenSettings['android']>) => void;
    setPcScreen: (settings: Partial<ScreenSettings['pc']>) => void;

    // Actions - KeyConfig
    setAndroidKey: (key: keyof KeyConfig['android'], value: string) => void;
    setPcKey: (key: keyof KeyConfig['pc'], value: string) => void;

    // Reset
    resetSettings: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
    sound: {
        bgm: 80,
        se: 80,
        voice: 100,
        muted: false,
    },
    screen: {
        android: {
            orientation: 'landscape' as const,
            resolution: '1920x1080',
            fps: 60,
        },
        pc: {
            fullscreen: false,
            resolution: '1920x1080',
            fps: 60,
            vsync: true,
        },
    },
    keyConfig: {
        android: {
            tap: 'advance',
            swipeLeft: 'back',
            swipeRight: 'forward',
            doubleTap: 'menu',
        },
        pc: {
            confirm: 'Enter',
            cancel: 'Escape',
            menu: 'M',
            skip: 'Ctrl',
            auto: 'A',
            log: 'L',
        },
    },
};

// ============================================
// Store with Persistence
// ============================================

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...initialState,

            // Sound Actions
            setBgmVolume: (volume) => set((state) => ({
                sound: { ...state.sound, bgm: Math.max(0, Math.min(100, volume)) }
            })),

            setSeVolume: (volume) => set((state) => ({
                sound: { ...state.sound, se: Math.max(0, Math.min(100, volume)) }
            })),

            setVoiceVolume: (volume) => set((state) => ({
                sound: { ...state.sound, voice: Math.max(0, Math.min(100, volume)) }
            })),

            toggleMute: () => set((state) => ({
                sound: { ...state.sound, muted: !state.sound.muted }
            })),

            // Screen Actions
            setAndroidScreen: (settings) => set((state) => ({
                screen: {
                    ...state.screen,
                    android: { ...state.screen.android, ...settings }
                }
            })),

            setPcScreen: (settings) => set((state) => ({
                screen: {
                    ...state.screen,
                    pc: { ...state.screen.pc, ...settings }
                }
            })),

            // KeyConfig Actions
            setAndroidKey: (key, value) => set((state) => ({
                keyConfig: {
                    ...state.keyConfig,
                    android: { ...state.keyConfig.android, [key]: value }
                }
            })),

            setPcKey: (key, value) => set((state) => ({
                keyConfig: {
                    ...state.keyConfig,
                    pc: { ...state.keyConfig.pc, [key]: value }
                }
            })),

            // Reset
            resetSettings: () => set(initialState),
        }),
        {
            name: 'nanonovel-settings',
        }
    )
);

// ============================================
// Device Detection Helper
// ============================================

export const getDeviceType = (): 'android' | 'pc' => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
        return 'android';
    }
    return 'pc';
};
