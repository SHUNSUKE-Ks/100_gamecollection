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

// ── 型定義（PlotNotebookと共有） ──────────────

export interface PlotLine {
  id: string;
  speaker: string;
  text: string;
}

export type PlotStatus = 'idea' | 'draft' | 'fixed';
export type CastSlot = string | null;

export interface PlotCard {
  id: string;
  title: string;
  lines: PlotLine[];
  castSlots: [CastSlot, CastSlot, CastSlot, CastSlot];
  episodeId: string;
  chapterId: string;
  sceneTag: string;
  status: PlotStatus;
  updatedAt?: number; // timestamp for ordering
}

const COLLECTION = 'plot_cards';

// ── 全件取得 ──────────────────────────────────

export async function loadPlots(): Promise<PlotCard[]> {
  const q = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as PlotCard);
}

// ── 1件保存（upsert） ─────────────────────────

export async function savePlot(card: PlotCard): Promise<void> {
  const data: PlotCard = { ...card, updatedAt: Date.now() };
  await setDoc(doc(db, COLLECTION, card.id), data);
}

// ── 1件削除 ───────────────────────────────────

export async function deletePlot(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
