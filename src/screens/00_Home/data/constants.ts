import type { Dialogue, Present, StatusKey, StatusState, EventScenario, QuickAction, CharacterProfile, EmotionPrompt } from '../types';

// Default Prompts to use when creating new characters
export const DEFAULT_EMOTION_PROMPTS: EmotionPrompt[] = [
  { emotion: "normal", description: "基本", prompt: "standing, arms crossed, smirk, looking at viewer, calm expression, green screen background" },
  { emotion: "surprised", description: "驚き", prompt: "surprised expression, wide eyes, blushing, hands up in surprise, flustered, green screen background" },
  { emotion: "super", description: "大喜び", prompt: "bright smile, sparkling eyes, hands clasped together, extremely happy, radiant aura, green screen background" },
  { emotion: "biribiri", description: "怒り/電撃", prompt: "angry blushing, tsundere expression, electric sparks around head, pouting, clenched fists, green screen background" },
  { emotion: "idle", description: "退屈", prompt: "bored expression, looking away, half-closed eyes, leaning head to side, lonely atmosphere, green screen background" },
  { emotion: "nadelu_reaction", description: "照れ", prompt: "shy, heavy blushing, looking down, hands on cheeks, embarrassed but slightly happy, green screen background" }
];

export const DEFAULT_CHARACTER: CharacterProfile = {
  id: "rin_hoshino_v1",
  design: {
    name: "Hoshino Rin",
    base_prompt: "Anime style, high quality, flat color, 1girl, petite teenage girl, long beige-blonde hair with a small side-bun, ahoge, blue eyes, wearing a white and navy blue sailor school uniform, star-shaped necktie charm, white socks, brown loafers, green screen background.",
    negative_prompt: "realistic, 3d, low quality, bad anatomy, text, watermark, messy lines, complex background"
  },
  emotion_prompts: DEFAULT_EMOTION_PROMPTS,
  images: {}, // Initially empty, will be generated or loaded
  dialogues: [] // Uses default global dialogues for now
};

export const UI_THEMES = {
  pink_heart: { color: "#FF69B4", bg_color: "#FFF0F5", icon: "❤️", animation: "pulse" },
  blue_shield: { color: "#1E90FF", bg_color: "#F0F8FF", icon: "🛡️", animation: "none" },
  yellow_bolt: { color: "#FFD700", bg_color: "#FFFACD", icon: "⚡", animation: "shake" },
  orange_apple: { color: "#FF8C00", bg_color: "#FFF5EE", icon: "🍎", animation: "none" },
  green_smile: { color: "#32CD32", bg_color: "#F0FFF0", icon: "😊", animation: "bounce" }
};

export const INITIAL_STATUS: Record<StatusKey, StatusState> = {
  affection: { current: 20, max: 100, label: "好感度", ui_key: "pink_heart" },
  trust: { current: 10, max: 100, label: "信頼度", ui_key: "blue_shield" },
  fatigue: { current: 0, max: 100, label: "疲労度", ui_key: "yellow_bolt" },
  satiety: { current: 60, max: 100, label: "満腹度", ui_key: "orange_apple" },
  mood: { current: 50, max: 100, label: "機嫌", ui_key: "green_smile" }
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "action_head_pat",
    name: "頭をなでる",
    icon: "🤚",
    description: "優しく頭を撫でる。機嫌が良くなるが、やりすぎると照れて電撃が走るかも。",
    effects: { affection: 2, mood: 10, fatigue: -2 },
    cooldown: 5,
    dialogue_category: "tap_nadelu",
    animation: "zoom_slight"
  },
  {
    id: "action_poke",
    name: "つつく",
    icon: "👉",
    description: "ほっぺたを指でつつく。ちょっとしたいたずら。",
    effects: { affection: 1, mood: -5, trust: 1 },
    cooldown: 2,
    dialogue_category: "tap_tsutsuku",
    animation: "shake_short"
  },
  {
    id: "action_gaze",
    name: "見つめる",
    icon: "👀",
    description: "じっと目を見つめる。親密度が高いと特別な反応が。",
    effects: { affection: 3, mood: 5 },
    cooldown: 10,
    dialogue_category: "tap_mizumelu",
    animation: "none"
  }
];

export const EVENTS: EventScenario[] = [
  {
    id: "event_trust_milestone_50",
    title: "雨宿りと本音",
    trigger: { condition: "minTrust", value: 50, priority: 10 },
    steps: [
      { step: 1, speaker: "凛", text: "……ねぇ、ちょっといい？ あんたに話しておきたいことがあって。", emotion: "normal", action: "bg_dim" },
      { step: 2, speaker: "凛", text: "最初はさ、あんたのこと頼りない奴だと思ってた。でも……最近は、その……。", emotion: "idle", action: "zoom_in" },
      { step: 3, speaker: "凛", text: "……ありがと。私を見つけてくれて。……これからも、隣にいてよね。", emotion: "super", action: "particle_heart" }
    ],
    rewards: { affection: 20, unlock_item: "item_memory_pendant" }
  },
  {
    id: "event_fatigue_max_danger",
    title: "限界突破の雷鳴",
    trigger: { condition: "minFatigue", value: 90, priority: 5 },
    steps: [
      { step: 1, speaker: "凛", text: "……うぅ、頭がクラクラする……。電気が……抑えられない……！", emotion: "biribiri", action: "screen_shake" },
      { step: 2, speaker: "凛", text: "触らないで！ ……今触ったら、あんたまで黒焦げになっちゃうんだから……っ！", emotion: "surprised", action: "flash_white" }
    ],
    rewards: { mood: -30, trust: 5 }
  }
];

export const DIALOGUES: Dialogue[] = [
  { id: "rin_greet_01", category: "greeting", text: "あ、やっと来た。……別に、待っててあげたわけじゃないからね！", emotion: "normal", tags: ["朝"] },
  { id: "rin_tap_01", category: "tap", text: "ちょっと、急に触らないでよ！……びっくりするでしょ。", emotion: "surprised", tags: ["タップ"] },

  // Quick Action: Head Pat
  { id: "rin_nadelu_low", category: "tap_nadelu", text: "ちょ、ちょっと……子供扱いしないでよ！ ……手、どけて。", emotion: "surprised", maxAffection: 30, tags: ["なでる"] },
  { id: "rin_nadelu_high", category: "tap_nadelu", text: "…………。……もっと、続けてもいいわよ。……少しだけね？", emotion: "nadelu_reaction", minAffection: 70, tags: ["なでる"] },
  { id: "rin_nadelu_mid", category: "tap_nadelu", text: "……な、なによ。くすぐったいんだけど。", emotion: "normal", minAffection: 31, maxAffection: 69, tags: ["なでる"] },

  // Quick Action: Poke
  { id: "rin_tsutsuku_default", category: "tap_tsutsuku", text: "なによ、もう。……かまってほしいの？", emotion: "idle", tags: ["つつく"] },

  // Quick Action: Gaze
  { id: "rin_mizumelu_high", category: "tap_mizumelu", text: "……そんなにじっと見ないで。……顔、赤くなってきちゃうじゃない。", emotion: "surprised", minAffection: 50, tags: ["見つめる"] },
  { id: "rin_mizumelu_low", category: "tap_mizumelu", text: "……なによ。私の顔に、何かついてる？", emotion: "normal", maxAffection: 49, tags: ["見つめる"] },

  { id: "rin_present_love", category: "present_love", text: "これ、私が欲しかったやつ……。あ、ありがと。大切にするわね。", emotion: "super", tags: ["好物"] }
];

export const PRESENTS: Present[] = [
  { id: "item_cake", name: "特製ショートケーキ", description: "甘いものは別腹。", rarity: "rare", icon: "🍰", effects: { affection: 15, satiety: 20, mood: 30 }, preference: "love", tags: ["sweets"] },
  { id: "item_energy_drink", name: "超回復ドリンク", description: "疲れが吹き飛ぶ。", rarity: "normal", icon: "🔋", effects: { fatigue: -40, satiety: 5 }, preference: "normal", tags: ["energy"] }
];