// ============================================
// NanoNovel - Game Store (Zustand)
// Menu_Ver1.1 - Party & Save Data Integration
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScreenType } from '@/core/types';

// ============================================
// Types
// ============================================

export interface PartyMember {
    characterId: string;
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    exp: number;
    equipment: {
        weapon?: string;
        armor?: string;
        accessory?: string;
    };
}

export interface InventoryItem {
    itemId: string;
    count: number;
}

interface GameState {
    // Current screen
    currentScreen: ScreenType;

    // Current title (for multi-title support)
    currentTitleId: string;

    // Collection deep link (e.g. 'story:plot' でプロット手帳へ直接遷移)
    collectionDeepLink: string | null;

    // Story progress (旧ノベル型)
    currentStoryID: string;

    // EventCard system (RPGイベント型)
    currentEventID: string | null;

    // Flags
    flags: Record<string, unknown>;

    // Inventory
    inventory: InventoryItem[];

    // Party (Menu_Ver1.1)
    party: PartyMember[];
    maxPartySize: number;

    // Player stats
    gold: number;
    playTime: number; // seconds

    // Actions - Screen
    setScreen: (screen: ScreenType) => void;
    setTitleId: (titleId: string) => void;
    setCollectionDeepLink: (link: string | null) => void;

    // Actions - Story (旧ノベル型)
    setStoryID: (storyID: string) => void;
    // Actions - EventCard (RPGイベント型)
    setEventID: (eventID: string | null) => void;
    setFlag: (key: string, value: unknown) => void;

    // Actions - Inventory
    addItem: (itemId: string, count: number) => void;
    removeItem: (itemId: string, count: number) => void;

    // Actions - Party (Menu_Ver1.1)
    addToParty: (member: PartyMember) => boolean;
    removeFromParty: (characterId: string) => void;
    updatePartyMember: (characterId: string, updates: Partial<PartyMember>) => void;
    levelUp: (characterId: string) => void;

    // Actions - Gold
    addGold: (amount: number) => void;
    spendGold: (amount: number) => boolean;

    // Actions - Game Management
    resetGame: () => void;
    incrementPlayTime: (seconds: number) => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
    currentScreen: 'TITLE' as ScreenType,
    currentTitleId: 'proj_nannovel',
    collectionDeepLink: null as string | null,
    currentStoryID: '01_01_01',
    currentEventID: null as string | null,
    flags: {},
    inventory: [],
    party: [],
    maxPartySize: 4,
    gold: 0,
    playTime: 0,
};

// ============================================
// Store with Persistence
// ============================================

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Screen
            setScreen: (screen) => set({ currentScreen: screen }),
            setTitleId: (titleId) => set({ currentTitleId: titleId }),
            setCollectionDeepLink: (link) => set({ collectionDeepLink: link }),

            // Story (旧ノベル型)
            setStoryID: (storyID) => set({ currentStoryID: storyID }),
            // EventCard (RPGイベント型)
            setEventID: (eventID) => set({ currentEventID: eventID }),
            setFlag: (key, value) => set((state) => ({
                flags: { ...state.flags, [key]: value }
            })),

            // Inventory
            addItem: (itemId, count) => set((state) => {
                const existing = state.inventory.find(item => item.itemId === itemId);
                if (existing) {
                    return {
                        inventory: state.inventory.map(item =>
                            item.itemId === itemId
                                ? { ...item, count: item.count + count }
                                : item
                        )
                    };
                }
                return {
                    inventory: [...state.inventory, { itemId, count }]
                };
            }),

            removeItem: (itemId, count) => set((state) => {
                const existing = state.inventory.find(item => item.itemId === itemId);
                if (!existing) return state;

                const newCount = existing.count - count;
                if (newCount <= 0) {
                    return {
                        inventory: state.inventory.filter(item => item.itemId !== itemId)
                    };
                }
                return {
                    inventory: state.inventory.map(item =>
                        item.itemId === itemId
                            ? { ...item, count: newCount }
                            : item
                    )
                };
            }),

            // Party Management
            addToParty: (member) => {
                const state = get();
                if (state.party.length >= state.maxPartySize) return false;
                if (state.party.some(p => p.characterId === member.characterId)) return false;

                set({ party: [...state.party, member] });
                return true;
            },

            removeFromParty: (characterId) => set((state) => ({
                party: state.party.filter(p => p.characterId !== characterId)
            })),

            updatePartyMember: (characterId, updates) => set((state) => ({
                party: state.party.map(p =>
                    p.characterId === characterId
                        ? { ...p, ...updates }
                        : p
                )
            })),

            levelUp: (characterId) => set((state) => ({
                party: state.party.map(p => {
                    if (p.characterId !== characterId) return p;
                    const newLevel = p.level + 1;
                    return {
                        ...p,
                        level: newLevel,
                        maxHp: p.maxHp + 10,
                        maxMp: p.maxMp + 5,
                        hp: p.maxHp + 10, // Full heal on level up
                        mp: p.maxMp + 5,
                        exp: 0,
                    };
                })
            })),

            // Gold
            addGold: (amount) => set((state) => ({
                gold: state.gold + amount
            })),

            spendGold: (amount) => {
                const state = get();
                if (state.gold < amount) return false;
                set({ gold: state.gold - amount });
                return true;
            },

            // Game Management
            resetGame: () => set(initialState),

            incrementPlayTime: (seconds) => set((state) => ({
                playTime: state.playTime + seconds
            })),
        }),
        {
            name: 'nanonovel-save',
            partialize: (state) => ({
                currentStoryID: state.currentStoryID,
                flags: state.flags,
                inventory: state.inventory,
                party: state.party,
                gold: state.gold,
                playTime: state.playTime,
            }),
        }
    )
);
