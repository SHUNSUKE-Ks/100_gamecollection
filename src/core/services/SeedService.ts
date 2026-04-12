// ============================================
// SeedService - JSONデータをFirestoreへ一括投入
// 開発者が一度だけ実行する初期化ツール
// ============================================

import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// JSON imports
import characterData from '@/data/collection/characters.json';
import enemyData from '@/data/collection/enemies.json';
import npcData from '@/data/collection/npcs.json';
import itemData from '@/data/collection/items.json';
import bgmData from '@/data/collection/bgm.json';
import seData from '@/data/collection/se.json';
import skillData from '@/data/collection/skills.json';
import episodesData from '@/data/collection/episodes.json';
import eventsData from '@/data/collection/events.json';

// Firestore max batch size
const BATCH_SIZE = 500;

async function batchWrite(collectionName: string, items: any[]) {
  if (items.length === 0) return;
  let batch = writeBatch(db);
  let count = 0;

  for (const item of items) {
    if (!item.id) continue;
    const ref = doc(collection(db, collectionName), item.id);
    batch.set(ref, item);
    count++;
    if (count === BATCH_SIZE) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }
  if (count > 0) await batch.commit();
}

export interface SeedResult {
  collection: string;
  count: number;
  skipped: boolean;
}

async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.empty;
}

export async function seedAllCollections(
  onProgress?: (msg: string) => void
): Promise<SeedResult[]> {
  const results: SeedResult[] = [];

  const targets = [
    { name: 'characters', items: (characterData as any).characters || [] },
    { name: 'enemies',    items: (enemyData as any).enemies || [] },
    { name: 'npcs',       items: (npcData as any).npcs || [] },
    { name: 'items',      items: (itemData as any).items || [] },
    { name: 'bgm',        items: (bgmData as any).bgm || [] },
    { name: 'se',         items: (seData as any).se || [] },
    { name: 'skills',     items: (skillData as any).skills || [] },
    { name: 'episodes',   items: (episodesData as any).episodes || [] },
    { name: 'events',     items: (eventsData as any).events || [] },
  ];

  for (const { name, items } of targets) {
    onProgress?.(`${name} を確認中...`);
    const empty = await isCollectionEmpty(name);
    if (!empty) {
      onProgress?.(`${name}: 既存データあり → スキップ`);
      results.push({ collection: name, count: items.length, skipped: true });
      continue;
    }
    onProgress?.(`${name}: ${items.length}件 を書き込み中...`);
    await batchWrite(name, items);
    results.push({ collection: name, count: items.length, skipped: false });
    onProgress?.(`${name}: 完了`);
  }

  return results;
}

// 強制上書き（既存データがあっても再投入）
export async function forceSeedCollection(collectionName: string): Promise<number> {
  const target = [
    { name: 'characters', items: (characterData as any).characters || [] },
    { name: 'enemies',    items: (enemyData as any).enemies || [] },
    { name: 'npcs',       items: (npcData as any).npcs || [] },
    { name: 'items',      items: (itemData as any).items || [] },
    { name: 'bgm',        items: (bgmData as any).bgm || [] },
    { name: 'se',         items: (seData as any).se || [] },
    { name: 'skills',     items: (skillData as any).skills || [] },
    { name: 'episodes',   items: (episodesData as any).episodes || [] },
    { name: 'events',     items: (eventsData as any).events || [] },
  ].find(t => t.name === collectionName);

  if (!target) throw new Error(`Unknown collection: ${collectionName}`);
  await batchWrite(target.name, target.items);
  return target.items.length;
}
