// ============================================
// NanoNovel - Novel Screen (with Save/Load)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { useScenario } from '@/core/hooks';
import { ChatLog } from '@/parts/novel/components/ChatLog';
import { SaveLoadModal } from '@/parts/novel/components/SaveLoadModal';
import './NovelScreen.css';

export function NovelScreen() {
    const setScreen = useGameStore((state) => state.setScreen);

    // Use the scenario hook
    const {
        currentStory,
        hasChoices,
        choices,
        progress,
        logs,
        advance,
        selectChoice,
        isSceneStart,
        titleCallText,
    } = useScenario();

    // UI State
    const [isAuto, setIsAuto] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
    const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load'>('save');
    const [showTitleCall, setShowTitleCall] = useState(false);
    const autoTimerRef = useRef<number | null>(null);
    const titleCallTimerRef = useRef<number | null>(null);

    // Title Call Effect - show overlay when SCENE_START with questTitle
    useEffect(() => {
        if (isSceneStart && titleCallText) {
            setShowTitleCall(true);

            // Auto advance after animation (3s animation)
            titleCallTimerRef.current = window.setTimeout(() => {
                setShowTitleCall(false);
                advance();
            }, 3000);
        }

        return () => {
            if (titleCallTimerRef.current) {
                clearTimeout(titleCallTimerRef.current);
            }
        };
    }, [isSceneStart, titleCallText, advance]);

    // Auto-play effect
    useEffect(() => {
        if (isAuto && currentStory && !hasChoices && !isSceneStart) {
            autoTimerRef.current = window.setTimeout(() => {
                const advanced = advance();
                if (!advanced) {
                    setIsAuto(false);
                }
            }, 2500);
        }

        return () => {
            if (autoTimerRef.current) {
                clearTimeout(autoTimerRef.current);
            }
        };
    }, [isAuto, currentStory, hasChoices, advance, isSceneStart]);

    // Stop auto on choices
    useEffect(() => {
        if (hasChoices) {
            setIsAuto(false);
        }
    }, [hasChoices]);

    // Handle click to advance
    const handleAdvance = () => {
        if (hasChoices || showTitleCall) return;
        advance();
    };

    // Handle choice selection
    const handleChoice = (nextStoryID: string) => {
        selectChoice(nextStoryID);
    };

    // Toggle auto mode
    const toggleAuto = () => {
        setIsAuto(prev => !prev);
    };

    // Open Save modal
    const openSaveModal = () => {
        setSaveLoadMode('save');
        setIsSaveLoadOpen(true);
    };

    // Open Load modal
    const openLoadModal = () => {
        setSaveLoadMode('load');
        setIsSaveLoadOpen(true);
    };

    if (!currentStory) {
        return <div className="novel-screen">Loading...</div>;
    }

    // Don't render normal UI during title call
    if (showTitleCall && titleCallText) {
        return (
            <div className="novel-screen">
                <div className="title-call-overlay">
                    <h1 className="title-call-text">{titleCallText}</h1>
                    <div className="title-call-decoration"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="novel-screen">
            {/* Header */}
            <header className="novel-header">
                <div className="novel-header-left">
                    <button
                        className="novel-header-btn"
                        onClick={() => setIsLogOpen(true)}
                    >
                        Log
                    </button>
                    <span className="novel-progress">{progress}%</span>
                </div>
                <div className="novel-header-right">
                    <button
                        className={`novel-header-btn ${isAuto ? 'active' : ''}`}
                        onClick={toggleAuto}
                    >
                        Auto {isAuto && '●'}
                    </button>
                    <button className="novel-header-btn" onClick={openSaveModal}>
                        Save
                    </button>
                    <button className="novel-header-btn" onClick={openLoadModal}>
                        Load
                    </button>
                    <button className="novel-header-btn" onClick={() => setScreen('MENU')}>
                        Menu
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="novel-main">
                {/* Background */}
                <div className="novel-background">
                    <div className="novel-background-placeholder">
                        {currentStory.backgroundImage || '背景画像'}
                    </div>
                </div>

                {/* Character */}
                {currentStory.characterImage && (
                    <div className="novel-character">
                        <div className="novel-character-placeholder">
                            {currentStory.characterImage}
                        </div>
                    </div>
                )}
            </main>

            {/* Dialog Box */}
            <div className="novel-dialog">
                <div
                    className="novel-dialog-box"
                    onClick={hasChoices ? undefined : handleAdvance}
                >
                    <p className="novel-speaker">{currentStory.speaker || ''}</p>
                    <p className="novel-text">{currentStory.text || ''}</p>

                    {/* Choices */}
                    {hasChoices && (
                        <div className="novel-choices">
                            {choices.map((choice, index) => (
                                <button
                                    key={index}
                                    className="novel-choice-btn"
                                    onClick={() => handleChoice(choice.nextStoryID)}
                                >
                                    ▸ {choice.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Advance indicator */}
                    {!hasChoices && (
                        <span className="novel-indicator">▼</span>
                    )}
                </div>
            </div>

            {/* Chat Log Modal */}
            <ChatLog
                logs={logs}
                isOpen={isLogOpen}
                onClose={() => setIsLogOpen(false)}
            />

            {/* Save/Load Modal */}
            <SaveLoadModal
                isOpen={isSaveLoadOpen}
                onClose={() => setIsSaveLoadOpen(false)}
                initialMode={saveLoadMode}
            />
        </div>
    );
}

