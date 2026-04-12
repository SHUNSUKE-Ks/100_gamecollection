// ============================================
// NanoNovel - Chapter Screen (Enhanced)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import './ChapterScreen.css';

interface ChapterScreenProps {
    chapterNumber?: number;
    title?: string;
    description?: string;
    autoTransitionDelay?: number; // ms
}

export function ChapterScreen({
    chapterNumber = 1,
    title = "目覚め",
    description = "深い森の中、記憶を失った若者の物語が始まる。",
    autoTransitionDelay = 4000, // 4 seconds default
}: ChapterScreenProps) {
    const setScreen = useGameStore((state) => state.setScreen);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Handle transition with fade-out
    const handleTransition = useCallback(() => {
        if (isFadingOut) return; // Prevent double trigger

        setIsFadingOut(true);

        // Wait for fade-out animation to complete
        setTimeout(() => {
            setScreen('NOVEL');
        }, 800); // Match CSS animation duration
    }, [isFadingOut, setScreen]);

    // Auto-transition after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            handleTransition();
        }, autoTransitionDelay);

        return () => clearTimeout(timer);
    }, [autoTransitionDelay, handleTransition]);

    // Handle click anywhere on screen
    const handleScreenClick = () => {
        handleTransition();
    };

    return (
        <div
            className={`chapter-screen ${isFadingOut ? 'fading-out' : ''}`}
            onClick={handleScreenClick}
        >
            <div className="chapter-content">
                <p className="chapter-number">Chapter {chapterNumber}</p>
                <h1 className="chapter-title">{title}</h1>
                <p className="chapter-description">{description}</p>
            </div>

            <span
                className="chapter-skip"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent double trigger
                    handleTransition();
                }}
            >
                Skip ▶
            </span>

            {/* Click hint */}
            <p className="chapter-hint">Click to continue...</p>
        </div>
    );
}
