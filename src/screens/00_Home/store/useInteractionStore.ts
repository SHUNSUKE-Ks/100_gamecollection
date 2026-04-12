
import { create } from 'zustand';
import type { InteractionState, Present, Dialogue, Emotion, StatusKey, QuickAction, CharacterProfile } from '../types';
import { DIALOGUES, INITIAL_STATUS, EVENTS, DEFAULT_CHARACTER } from '../data/constants';

const getDialogue = (category: string, currentAffection: number): Dialogue | undefined => {
  const available = DIALOGUES.filter(d => {
    if (d.category !== category) return false;
    if (d.minAffection !== undefined && currentAffection < d.minAffection) return false;
    if (d.maxAffection !== undefined && currentAffection > d.maxAffection) return false;
    return true;
  });

  if (available.length === 0) return undefined;
  return available[Math.floor(Math.random() * available.length)];
};

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const useInteractionStore = create<InteractionState>((set, get) => ({
  status: JSON.parse(JSON.stringify(INITIAL_STATUS)),
  currentEmotion: 'normal',
  currentDialogue: "あ、やっと来た。",
  lastInteractionTime: Date.now(),
  actionCooldowns: {},

  // Character Management
  characterList: [DEFAULT_CHARACTER],
  activeCharacterId: DEFAULT_CHARACTER.id,
  isGeneratingImages: false,

  activeEvent: null,
  completedEvents: [],

  addCharacter: (profile: CharacterProfile) => {
    set(state => ({
      characterList: [...state.characterList, profile],
      activeCharacterId: profile.id,
      isGeneratingImages: false, // Do NOT auto-start generation to save quota
      status: JSON.parse(JSON.stringify(INITIAL_STATUS)),
      currentDialogue: `初めまして、${profile.design.name}です。`
    }));
  },

  switchCharacter: (id: string) => {
    const { characterList } = get();
    const target = characterList.find(c => c.id === id);
    if (!target) return;

    set({
      activeCharacterId: id,
      status: JSON.parse(JSON.stringify(INITIAL_STATUS)),
      currentEmotion: 'normal',
      currentDialogue: `……なに？ (Switched to ${target.design.name})`,
      isGeneratingImages: false
    });
  },

  updateCharacterImage: (charId, emotion, url) => {
    set(state => {
      const newList = state.characterList.map(c => {
        if (c.id === charId) {
          return { ...c, images: { ...c.images, [emotion]: url } };
        }
        return c;
      });
      return { characterList: newList };
    });
  },

  setGenerating: (val) => set({ isGeneratingImages: val }),

  checkEvents: () => {
    const { status, completedEvents, activeEvent } = get();
    if (activeEvent) return;

    const possibleEvents = EVENTS.filter(ev => {
      if (completedEvents.includes(ev.id)) return false;
      const { condition, value } = ev.trigger;
      if (condition === 'minTrust') return status.trust.current >= value;
      if (condition === 'minFatigue') return status.fatigue.current >= value;
      if (condition === 'minAffection') return status.affection.current >= value;
      return false;
    }).sort((a, b) => b.trigger.priority - a.trigger.priority);

    if (possibleEvents.length > 0) {
      const nextEvent = possibleEvents[0];
      set({
        activeEvent: { id: nextEvent.id, stepIndex: 0 },
        currentEmotion: nextEvent.steps[0].emotion,
        currentDialogue: nextEvent.steps[0].text
      });
    }
  },

  advanceEvent: () => {
    const { activeEvent, status, completedEvents } = get();
    if (!activeEvent) return;

    const scenario = EVENTS.find(e => e.id === activeEvent.id);
    if (!scenario) return;

    const nextIndex = activeEvent.stepIndex + 1;
    if (nextIndex < scenario.steps.length) {
      set({
        activeEvent: { ...activeEvent, stepIndex: nextIndex },
        currentEmotion: scenario.steps[nextIndex].emotion,
        currentDialogue: scenario.steps[nextIndex].text
      });
    } else {
      const newStatus = { ...status };
      Object.entries(scenario.rewards).forEach(([key, val]) => {
        if (typeof val === 'number') {
          const sKey = key as StatusKey;
          if (newStatus[sKey]) {
            newStatus[sKey].current = clamp(newStatus[sKey].current + val, 0, 100);
          }
        }
      });

      set({
        activeEvent: null,
        completedEvents: [...completedEvents, activeEvent.id],
        status: newStatus,
        currentEmotion: 'normal'
      });
    }
  },

  performQuickAction: (action: QuickAction) => {
    const { status, activeEvent, actionCooldowns } = get();
    if (activeEvent) return;

    const now = Date.now();
    const lastUse = actionCooldowns[action.id] || 0;
    if (now - lastUse < action.cooldown * 1000) return;

    const newStatus = { ...status };
    Object.entries(action.effects).forEach(([key, value]) => {
      const sKey = key as StatusKey;
      if (newStatus[sKey]) {
        newStatus[sKey].current = clamp(newStatus[sKey].current + (value || 0), 0, 100);
      }
    });

    const dialogue = getDialogue(action.dialogue_category, newStatus.affection.current);

    set({
      status: newStatus,
      currentEmotion: dialogue?.emotion || 'normal',
      currentDialogue: dialogue?.text || null,
      lastInteractionTime: now,
      actionCooldowns: { ...actionCooldowns, [action.id]: now }
    });

    get().checkEvents();
  },

  triggerAction: (key: StatusKey, value: number) => {
    const { status, activeEvent } = get();
    if (activeEvent) return;
    const newStatus = { ...status };
    if (newStatus[key]) {
      newStatus[key].current = clamp(newStatus[key].current + value, 0, newStatus[key].max);
    }
    set({ status: newStatus, lastInteractionTime: Date.now() });
    get().checkEvents();
  },

  tap: () => {
    const { status, activeEvent } = get();
    if (activeEvent) {
      get().advanceEvent();
      return;
    }
    const dialogue = getDialogue('tap', status.affection.current);
    const newStatus = { ...status };
    newStatus.mood.current = clamp(newStatus.mood.current + 2, 0, 100);
    newStatus.fatigue.current = clamp(newStatus.fatigue.current + 1, 0, 100);
    set({
      status: newStatus,
      currentEmotion: dialogue?.emotion || 'surprised',
      currentDialogue: dialogue?.text || "な、なによ！",
      lastInteractionTime: Date.now()
    });
    get().checkEvents();
  },

  idle: () => {
    const { status, activeEvent } = get();
    if (activeEvent) return;
    const dialogue = getDialogue('idle', status.affection.current);
    set({
      currentEmotion: 'idle',
      currentDialogue: dialogue?.text || "……ふぁ。",
    });
  },

  givePresent: (present: Present) => {
    const { status, activeEvent } = get();
    if (activeEvent) return;
    const newStatus = { ...status };
    Object.entries(present.effects).forEach(([key, value]) => {
      const sKey = key as StatusKey;
      if (newStatus[sKey]) {
        newStatus[sKey].current = clamp(newStatus[sKey].current + (value || 0), 0, 100);
      }
    });
    let category = 'present_normal';
    let emotion: Emotion = 'normal';
    if (present.preference === 'love' || present.preference === 'special') {
      category = 'present_love';
      emotion = 'super';
    } else if (present.preference === 'dislike') {
      category = 'present_dislike';
      emotion = 'biribiri';
    }
    const dialogue = getDialogue(category, newStatus.affection.current);
    set({
      status: newStatus,
      currentEmotion: emotion,
      currentDialogue: dialogue?.text || `これ、${present.name}？ ありがとう。`,
      lastInteractionTime: Date.now()
    });
    get().checkEvents();
  },

  reset: () => set({ status: JSON.parse(JSON.stringify(INITIAL_STATUS)), currentEmotion: 'normal', currentDialogue: null, activeEvent: null, actionCooldowns: {} })
}));
