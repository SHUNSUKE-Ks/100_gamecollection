// ============================================
// CollectionService - Firestore 読み書き
// Firestoreが空ならnullを返す（呼び出し元でJSONにフォールバック）
// ============================================

import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/** コレクション全件取得（空なら null） */
export async function fetchCollection<T>(collectionName: string): Promise<T[] | null> {
  const snap = await getDocs(collection(db, collectionName));
  if (snap.empty) return null;
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

/** 新規レコード追加。自動 id + createdAt を付与して返す */
export async function addRecord(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
