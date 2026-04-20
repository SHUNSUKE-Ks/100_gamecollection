// ============================================
// PlotService - Firestore CRUD for PlotCards
// ============================================

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// ── カード種別 ────────────────────────────────

export type CardType = 'log' | 'chat' | 'choice' | 'state';

// ── 会話ログ / CHAT 共通行 ────────────────────

export interface PlotLine {
  id: string;
  speaker: string;
  text: string;
  isComment?: boolean;
  // CHAT 専用
  icon?: string;   // 画像パス (chara/xxx/standing_01.png)
  face?: string;   // 表情差分パス
}

// ── CHOICE ────────────────────────────────────

export interface FlagEntry  { id: string; key: string; value: boolean; }
export interface ParamEntry { id: string; key: string; value: number;  }

export interface OptionEffects {
  flags:  FlagEntry[];
  params: ParamEntry[];
}

export interface ChoiceOption {
  id: string;
  label: string;
  next?: string;
  effects: OptionEffects;
  result: { speaker: string; text: string };
}

export interface ChoiceData {
  question: { speaker: string; text: string };
  options: ChoiceOption[];
}

// ── STATE ─────────────────────────────────────

export interface StateData {
  flags:  FlagEntry[];
  params: ParamEntry[];
}

// ── カード本体 ────────────────────────────────

export type PlotStatus = 'idea' | 'draft' | 'fixed';
export type CastSlot   = string | null;

export interface PlotCard {
  id:         string;
  title:      string;
  cardType?:  CardType;          // 省略時は 'log' 扱い
  lines:      PlotLine[];        // log / chat
  choiceData?: ChoiceData;       // choice
  stateData?:  StateData;        // state
  castSlots:  [CastSlot, CastSlot, CastSlot, CastSlot];
  episodeId:  string;
  chapterId:  string;
  sceneTag:   string;
  status:     PlotStatus;
  updatedAt?: number;
}

const COLLECTION = 'plot_cards';

export async function loadPlots(): Promise<PlotCard[]> {
  const q = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as PlotCard);
}

export async function savePlot(card: PlotCard): Promise<void> {
  const data: PlotCard = { ...card, updatedAt: Date.now() };
  await setDoc(doc(db, COLLECTION, card.id), data);
}

export async function deletePlot(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
