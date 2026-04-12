
export type Emotion = 'normal' | 'surprised' | 'idle' | 'super' | 'biribiri' | 'nadelu_reaction';

export type StatusKey = 'affection' | 'trust' | 'fatigue' | 'satiety' | 'mood';

export interface Dialogue {
  id: string;
  category: string;
  text: string;
  emotion: Emotion;
  minAffection?: number;
  maxAffection?: number;
  tags: string[];
}

export type EventAction = 'bg_dim' | 'zoom_in' | 'zoom_slight' | 'particle_heart' | 'screen_shake' | 'flash_white' | 'shake_short' | 'none';

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  effects: Partial<Record<StatusKey, number>>;
  cooldown: number;
  dialogue_category: string;
  animation: EventAction;
}

export interface EventStep {
  step: number;
  speaker: string;
  text: string;
  emotion: Emotion;
  action: EventAction;
}

export interface EventScenario {
  id: string;
  title: string;
  trigger: {
    condition: 'minTrust' | 'minFatigue' | 'minAffection';
    value: number;
    priority: number;
  };
  steps: EventStep[];
  rewards: Partial<Record<StatusKey, number>> & { unlock_item?: string };
}

export type ItemRarity = 'normal' | 'rare' | 'super_rare';
export type ItemPreference = 'love' | 'like' | 'normal' | 'dislike' | 'special';

export interface Present {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  effects: Partial<Record<StatusKey, number>>;
  preference: ItemPreference;
  tags: string[];
  icon: string;
}

export interface StatusState {
  current: number;
  max: number;
  label: string;
  ui_key: string;
}

// --- Character Management System ---

export interface CharacterDesign {
  name: string;
  base_prompt: string;
  negative_prompt: string;
}

export interface EmotionPrompt {
  emotion: Emotion;
  prompt: string;
  description: string; // For UI display
}

export interface CharacterProfile {
  id: string;
  design: CharacterDesign;
  emotion_prompts: EmotionPrompt[];
  images: Record<string, string>; // Emotion -> Base64
  dialogues?: Dialogue[]; // Optional override dialogues
}

export interface InteractionState {
  status: Record<StatusKey, StatusState>;
  currentEmotion: Emotion;
  currentDialogue: string | null;
  lastInteractionTime: number;
  
  // Character Management
  characterList: CharacterProfile[];
  activeCharacterId: string;
  isGeneratingImages: boolean;
  
  // Cooldown Tracking
  actionCooldowns: Record<string, number>;
  
  // Event State
  activeEvent: { id: string; stepIndex: number } | null;
  completedEvents: string[];
  
  // Actions
  addCharacter: (profile: CharacterProfile) => void;
  switchCharacter: (id: string) => void;
  updateCharacterImage: (charId: string, emotion: string, url: string) => void;
  setGenerating: (val: boolean) => void;
  
  tap: () => void;
  idle: () => void;
  givePresent: (present: Present) => void;
  performQuickAction: (action: QuickAction) => void;
  triggerAction: (key: StatusKey, value: number) => void;
  advanceEvent: () => void;
  checkEvents: () => void;
  reset: () => void;
}
