// ============================================
// CollectionService - Firestore読み込み
// Firestoreが空ならnullを返す（呼び出し元でJSONにフォールバック）
// ============================================

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchCollection<T>(collectionName: string): Promise<T[] | null> {
  const snap = await getDocs(collection(db, collectionName));
  if (snap.empty) return null;
  return snap.docs.map(d => d.data() as T);
}
