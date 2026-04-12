import React, { useEffect, useCallback, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useInteractionStore } from './store/useInteractionStore';
import ChromaKeyCharacter from './components/ChromaKeyCharacter';
import StatusGauge from './components/StatusGauge';
import Inventory from './components/Inventory';
import CharacterBox from './components/CharacterBox';
import EventOverlay from './components/EventOverlay';
import { EVENTS, QUICK_ACTIONS } from './data/constants';
import type { StatusState, QuickAction, StatusKey } from './types';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { useGameStore } from '@/core/stores/gameStore';

const useIdleTimer = (onIdle: () => void, timeout: number = 10000) => {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(onIdle, timeout);
        };
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        window.addEventListener('click', resetTimer);
        resetTimer();
        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            window.removeEventListener('click', resetTimer);
        };
    }, [onIdle, timeout]);
};

const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => {
    const performQuickAction = useInteractionStore(state => state.performQuickAction);
    const cooldowns = useInteractionStore(state => state.actionCooldowns);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const lastUse = cooldowns[action.id] || 0;
            const elapsed = (Date.now() - lastUse) / 1000;
            const remaining = Math.max(0, action.cooldown - elapsed);
            setTimeLeft(remaining);
        }, 100);
        return () => clearInterval(interval);
    }, [cooldowns, action]);

    const isLocked = timeLeft > 0;
    const progress = (timeLeft / action.cooldown) * 100;

    return (
        <button
            onClick={() => !isLocked && performQuickAction(action)}
            className={`w-14 h-14 relative rounded-xl border border-white/20 overflow-hidden backdrop-blur-md transition-all active:scale-95 group ${isLocked ? 'cursor-not-allowed opacity-60' : 'bg-white/10 hover:bg-white/20 hover:scale-105'}`}
            aria-label={action.name}
        >
            <span className="text-2xl relative z-10">{action.icon}</span>
            {isLocked && (
                <div
                    className="absolute bottom-0 left-0 w-full bg-pink-500/30 transition-all duration-100 ease-linear"
                    style={{ height: `${progress}%` }}
                />
            )}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/95 border border-white/10 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                <div className="text-[10px] font-bold text-pink-400 mb-0.5">{action.name}</div>
                <div className="text-[8px] text-white/60 leading-tight max-w-[120px] whitespace-normal">
                    {action.description}
                </div>
            </div>
        </button>
    );
};

export function HomeScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const {
        status,
        currentEmotion,
        currentDialogue,
        activeEvent,
        isGeneratingImages,
        setGenerating,
        tap,
        givePresent,
        advanceEvent,
        idle,
        // Character Mgmt
        activeCharacterId,
        characterList,
        updateCharacterImage
    } = useInteractionStore();

    const [genProgress, setGenProgress] = useState(0);

    // Retrieve current active character data
    const activeCharacter = characterList.find(c => c.id === activeCharacterId);

    // Character Generation Logic - Only runs when isGeneratingImages is TRUE (Manually triggered)
    const generateAssets = useCallback(async () => {
        if (!activeCharacter || !isGeneratingImages) return;

        // Check if we already have images for this character
        const missingEmotions = activeCharacter.emotion_prompts.filter(ep => !activeCharacter.images[ep.emotion]);

        if (missingEmotions.length === 0) {
            setGenerating(false);
            return;
        }

        // Fallback if API key is missing
        const apiKey = import.meta.env.VITE_GOOGLE_GENAI_KEY || '';
        if (!apiKey) {
            console.warn("API Key is missing. Skipping generation.");
            setGenerating(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            let completed = 0;
            setGenProgress(0);

            for (const item of missingEmotions) {
                setGenProgress(completed + 1);
                const fullPrompt = `${activeCharacter.design.base_prompt} Emotion: ${item.prompt} Avoid: ${activeCharacter.design.negative_prompt}`;

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: fullPrompt }] }
                    });

                    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (imagePart?.inlineData) {
                        const b64 = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                        updateCharacterImage(activeCharacter.id, item.emotion, b64);
                    }
                } catch (innerErr) {
                    console.error(`Failed to generate ${item.emotion}`, innerErr);
                }
                completed++;
            }
        } catch (e) {
            console.error("Image generation process failed", e);
        } finally {
            setGenerating(false);
        }
    }, [isGeneratingImages, activeCharacter, updateCharacterImage, setGenerating]);

    // Trigger generation ONLY when the flag changes to true
    useEffect(() => {
        if (isGeneratingImages) {
            generateAssets();
        }
    }, [isGeneratingImages, generateAssets]);

    useIdleTimer(useCallback(() => {
        if (currentEmotion !== 'idle' && !activeEvent && !isGeneratingImages) idle();
    }, [currentEmotion, idle, activeEvent, isGeneratingImages]), 15000);

    const activeScenario = activeEvent ? EVENTS.find(e => e.id === activeEvent.id) : null;
    const currentStep = activeScenario ? activeScenario.steps[activeEvent!.stepIndex] : null;

    // Visual Helpers
    const currentImage = activeCharacter?.images[currentEmotion] || activeCharacter?.images['normal'] || '';
    const progressPercent = activeCharacter ? (genProgress / activeCharacter.emotion_prompts.length) * 100 : 0;

    return (
        <div className={`relative w-full h-screen bg-slate-950 overflow-hidden flex items-end justify-center transition-all duration-1000 ${currentStep?.action === 'screen_shake' ? 'animate-biribiri' : ''}`}
            style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

            {/* Back Button (Retained) */}
            <div className="absolute top-4 left-4 z-50" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
                <button
                    onClick={() => setScreen('TITLE')}
                    className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Background Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-40 grayscale-[0.2]"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop")',
                    filter: 'blur(3px)'
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/80 z-10 pointer-events-none" />

            {/* Loading Overlay */}
            {isGeneratingImages && (
                <div className="absolute inset-0 z-[200] bg-slate-950/90 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-pink-500 animate-spin" />
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-white text-xl font-bold tracking-widest mb-2 uppercase">Generating Assets...</h2>
                        <p className="text-white/60 text-sm">Do not close this window. ({genProgress} remaining)</p>
                    </div>
                    <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-pink-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Gauges Layer */}
            <div className={`absolute top-16 left-3 z-30 flex flex-col gap-1.5 pointer-events-none transition-opacity duration-500 sm:left-6 sm:gap-2 ${activeEvent || isGeneratingImages ? 'opacity-0' : 'opacity-100'}`}
                style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 3rem)' }}>
                {(Object.entries(status) as [StatusKey, StatusState][]).map(([key, val]) => (
                    <StatusGauge
                        key={key}
                        label={val.label}
                        current={val.current}
                        max={val.max}
                        ui_key={val.ui_key}
                    />
                ))}
            </div>

            {/* Main Character Render */}
            <div className="relative z-20 w-full max-w-4xl h-full flex flex-col justify-end items-center pb-8">
                <div className={`flex-grow flex items-end justify-center w-full relative pointer-events-none transition-transform duration-1000 ${currentStep?.action === 'zoom_in' ? 'scale-125 translate-y-[10%]' : (currentStep?.action === 'zoom_slight' ? 'scale-110' : 'scale-100')}`}>
                    <div className="pointer-events-auto">
                        <ChromaKeyCharacter
                            src={currentImage}
                            emotion={currentEmotion}
                            onClick={tap}
                        />
                    </div>

                    {!activeEvent && currentEmotion === 'super' && (
                        <div className="absolute inset-0 flex justify-center items-center">
                            <span className="text-8xl animate-ping absolute top-1/4 opacity-50">💖</span>
                        </div>
                    )}
                </div>

                {/* Regular Dialogue Box */}
                {!activeEvent && !isGeneratingImages && (
                    <div className="w-full px-4 max-w-2xl flex flex-col gap-4">
                        <div className={`relative bg-white/95 text-slate-900 p-6 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-l-8 border-pink-500 min-h-[100px] transition-all duration-500 transform ${currentDialogue ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="absolute -top-3 left-6 bg-slate-900 text-white px-4 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-lg">
                                {activeCharacter?.design.name || '???'}
                            </div>
                            <p className="text-base font-bold leading-relaxed">{currentDialogue}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Event Overlay */}
            {activeScenario && activeEvent && (
                <EventOverlay
                    scenario={activeScenario}
                    currentStepIndex={activeEvent.stepIndex}
                    onNext={advanceEvent}
                />
            )}

            {/* Sidebar Controls */}
            <div className={`absolute top-4 right-3 z-30 flex flex-col gap-2 items-end transition-opacity duration-500 sm:top-6 sm:right-6 sm:gap-3 ${activeEvent || isGeneratingImages ? 'opacity-0' : 'opacity-100'}`}
                style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex gap-2">
                    <CharacterBox />
                    <Inventory onSelectPresent={givePresent} />
                </div>

                <div className="flex flex-col gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl sm:gap-2 sm:p-2">
                    {QUICK_ACTIONS.map(action => (
                        <ActionButton key={action.id} action={action} />
                    ))}
                </div>
            </div>
        </div>
    );
}
