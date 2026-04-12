// ============================================
// NanoNovel - useScenario Hook
// ============================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import scenarioData from '@/data/novel/scenario.json';
import quest001 from '@/data/novel/quest_001.json';
import quest002 from '@/data/novel/quest_002.json';
import questApiTest from '@/data/novel/quest_api_test.json';
import type { Choice } from '@/core/types';

// Flexible story node type that handles both old and new schema
interface StoryNode {
    storyID: string;
    scene?: number;
    type?: 'SCENE_START';
    questTitle?: string;
    speaker?: string;
    text?: string;
    characterImage?: string;
    backgroundImage?: string;
    bgm?: string;
    event?: {
        type: string;
        payload?: {
            choices?: Choice[];
            nextStoryID?: string;
            goto?: string;
            enemyIDs?: string[];
        };
    };
    flags?: Record<string, unknown>;
    tags?: string[];
    note?: string;
}

// Type assertion and data merging
// scenario.json might be { scenario: Story[] } or just Story[]
const mainScenario = Array.isArray(scenarioData) ? scenarioData : (scenarioData as any).scenario || [];
const scenarios: StoryNode[] = [
    ...(mainScenario as StoryNode[]),
    ...(quest001 as unknown as StoryNode[]),
    ...(quest002 as unknown as StoryNode[]),
    ...(questApiTest as unknown as StoryNode[])
];

interface LogEntry {
    storyID: string;
    speaker: string;
    text: string;
}

export function useScenario() {
    const { currentStoryID, setStoryID, setFlag, addItem, setScreen } = useGameStore();
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Current story
    const currentStory = useMemo(() => {
        return scenarios.find(s => s.storyID === currentStoryID) || scenarios[0];
    }, [currentStoryID]);

    // Current index
    const currentIndex = useMemo(() => {
        return scenarios.findIndex(s => s.storyID === currentStoryID);
    }, [currentStoryID]);

    // Next story (within same file, by array order)
    const nextStory = useMemo(() => {
        if (currentIndex < 0) return undefined;
        return scenarios[currentIndex + 1];
    }, [currentIndex]);

    // Is this a SCENE_START node (for title call)
    const isSceneStart = useMemo(() => {
        return currentStory?.type === 'SCENE_START';
    }, [currentStory]);

    // Quest/Episode title for title call
    const titleCallText = useMemo(() => {
        return currentStory?.questTitle || '';
    }, [currentStory]);

    // Has choices
    const hasChoices = useMemo(() => {
        const event = currentStory?.event;
        return event?.type === 'CHOICE' &&
            event.payload?.choices &&
            event.payload.choices.length > 0;
    }, [currentStory]);

    // Choices
    const choices = useMemo(() => {
        if (hasChoices && currentStory?.event?.payload?.choices) {
            return currentStory.event.payload.choices as Choice[];
        }
        return [];
    }, [currentStory, hasChoices]);

    // Progress
    const progress = useMemo(() => {
        if (scenarios.length === 0) return 0;
        return Math.round((currentIndex / (scenarios.length - 1)) * 100);
    }, [currentIndex]);

    // Add to log (skip SCENE_START nodes without text)
    useEffect(() => {
        if (currentStory && currentStory.text && currentStory.speaker) {
            setLogs(prev => {
                if (prev.some(log => log.storyID === currentStory.storyID)) {
                    return prev;
                }
                return [...prev, {
                    storyID: currentStory.storyID,
                    speaker: currentStory.speaker || '',
                    text: currentStory.text || ''
                }];
            });
        }
    }, [currentStory]);

    // Advance to next story
    const advance = useCallback(() => {
        if (!currentStory) return false;

        const event = currentStory.event;

        // Don't advance on choices
        if (event?.type === 'CHOICE') {
            return false;
        }

        // Apply flags if present
        if (currentStory.flags) {
            Object.entries(currentStory.flags).forEach(([key, value]) => {
                setFlag(key, value);
            });
        }

        // Handle ITEM event
        if (event?.type === 'ITEM' && event.payload) {
            const itemID = (event.payload as any).itemID;
            const count = (event.payload as any).count || 1;
            if (itemID) addItem(itemID, count);
        }

        // Handle JUMP / TAP_NEXT event
        if ((event?.type === 'JUMP' || event?.type === 'TAP_NEXT') && event.payload?.nextStoryID) {
            setStoryID(event.payload.nextStoryID);
            return true;
        }

        // Handle BATTLE_START event
        if (event?.type === 'BATTLE_START' || event?.type === 'BATTLE') {
            setScreen('BATTLE');
            return true;
        }

        // Handle API_BATTLE_START event
        if (event?.type === 'API_BATTLE_START') {
            setScreen('API_BATTLE');
            return true;
        }

        // Handle END event
        if (event?.type === 'END') {
            const goto = event.payload?.goto;
            if (goto === 'COLLECTION') {
                setScreen('COLLECTION');
            } else {
                setScreen('TITLE'); // Default to TITLE if no goto or RESULT
            }
            return true;
        }

        // Move to next story in array
        if (nextStory) {
            setStoryID(nextStory.storyID);
            return true;
        }

        return false;
    }, [currentStory, nextStory, setStoryID, setFlag, addItem, setScreen]);

    // Select choice
    const selectChoice = useCallback((nextStoryID: string) => {
        setStoryID(nextStoryID);
    }, [setStoryID]);

    // Reset logs
    const resetLogs = useCallback(() => {
        setLogs([]);
    }, []);

    return {
        // State
        currentStory,
        currentIndex,
        hasChoices,
        choices,
        progress,
        logs,
        isSceneStart,
        titleCallText,

        // Actions
        advance,
        selectChoice,
        resetLogs,

        // Utilities
        totalCount: scenarios.length,
    };
}

