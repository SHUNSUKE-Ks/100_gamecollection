# CollectionScreen — 詳細ドキュメント

`src/screens/11_Collection/CollectionScreen.tsx`

---

## 概要

ゲームコレクション管理のメイン画面。10 本のプライマリタブ + 最大 9 本のセカンダリタブを持つ。
各タブでビュー切り替え（list / gallery / kanban / custom）が可能。

---

## タブ構造

### PrimaryTab（最上段ナビ）

```typescript
type PrimaryTab =
  | 'item'       // アイテム
  | 'equipment'  // 装備
  | 'skill'      // スキル
  | 'ability'    // アビリティ
  | 'story'      // ストーリー（→ PlotNotebook）
  | 'library'    // ライブラリ（→ SecondaryTab を展開）
  | 'tagsdb'     // タグ DB
  | 'sound'      // サウンドコレクション
  | 'keymap'     // キーマップ設定
  | 'settings';  // 設定
```

### SecondaryTab（library 選択時に表示）

```typescript
type SecondaryTab =
  | 'place'      // 場所DB
  | 'character'  // キャラクター DB
  | 'npc'        // NPC DB
  | 'enemy'      // エネミー DB
  | 'item_dict'  // アイテム辞書
  | 'skill_db'   // スキル DB
  | 'event'      // イベント DB
  | 'cg'         // CG ライブラリ
  | 'sound_db';  // サウンド DB
```

### SettingsTab（settings 選択時に表示）

```typescript
type SettingsTab =
  | 'sound_settings'
  | 'screen_settings'
  | 'key_settings';
```

---

## コンポーネント階層

```
CollectionScreen
  ├─ PrimaryNavBar         （タブバー）
  │
  ├─ [primary === 'library']
  │    └─ SecondaryNavBar  （サブタブバー）
  │         └─ ViewSwitcher (list/gallery/kanban/custom)
  │              ├─ TableView<T>
  │              ├─ GalleryView<T>
  │              ├─ KanbanView<T>
  │              └─ CharacterDetailView / EnemyDetailView etc.
  │
  ├─ [primary === 'story']
  │    └─ StoryView
  │         └─ PlotNotebook / NovelLibraryView / NovelDetailView
  │
  ├─ [primary === 'item' | 'equipment' | 'skill' | 'ability']
  │    └─ LibraryCatalogScreen
  │         └─ CatalogSidebar + カタログレイアウト群
  │
  ├─ [primary === 'tagsdb']
  │    └─ TagsDBScreen
  │
  ├─ [primary === 'sound']
  │    └─ SoundCollectionView
  │
  ├─ [primary === 'settings']
  │    └─ SettingsPanel (SettingsTab 別)
  │
  ├─ WorkspacePanel        （右サイドパネル）
  └─ RecordCardModal       （新規レコード追加モーダル）
```

---

## 主な状態管理

CollectionScreen は `useGameStore`（Zustand）を使用せず、
ローカル useState + Firestore 直呼び出しで管理している。

```typescript
// ローカル状態
const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('library');
const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>('character');
const [viewMode, setViewMode] = useState<CollectionViewType>('list');
const [records, setRecords] = useState<Record<string, unknown>[]>([]);

// Firestore 読み込み（primaryTab / secondaryTab 変更時）
useEffect(() => {
  CollectionService.fetchCollection(currentDbKey).then(setRecords);
}, [currentDbKey]);
```

---

## RecordCardModal — DB 別フォーム設定

```typescript
export type DbKey =
  | 'titles' | 'characters' | 'npcs' | 'enemies'
  | 'locations' | 'items' | 'skills' | 'events' | 'sounds' | 'tags';
```

`RECORD_CONFIGS` オブジェクトで各 DbKey ごとのフォーム項目を定義。
新しい DB を追加するときは `DbKey` 型と `RECORD_CONFIGS` を更新するだけでよい。

---

## DataViews の使い方

### ViewSwitcher

```tsx
import { ViewSwitcher, CollectionViewType } from '@/components/data-views/ViewSwitcher';

<ViewSwitcher
  currentView={viewMode}
  onViewChange={(v: CollectionViewType) => setViewMode(v)}
/>
```

### TableView / GalleryView / KanbanView

いずれもジェネリクス対応。`T` にレコード型を渡す。

```tsx
import { TableView } from '@/components/data-views/TableView';

<TableView<CharacterRecord>
  data={records}
  columns={[
    { key: 'name', label: '名前' },
    { key: 'role', label: '役割' },
  ]}
  onRowClick={(row) => setSelected(row)}
/>
```

```tsx
import { GalleryView } from '@/components/data-views/GalleryView';

<GalleryView<CharacterRecord>
  data={records}
  renderCard={(item) => <CharacterCard character={item} />}
/>
```

---

## 新しいプライマリタブを追加する手順

1. `PrimaryTab` 型に追加
2. ナビバーの表示項目配列に追加
3. レンダリング分岐に `case 'new_tab': return <NewTabView />;` を追加
4. 必要に応じて `DbKey` と `RECORD_CONFIGS` を更新

---

## 再利用性の課題と改善案

| 課題 | 現状 | 改善案 |
|-----|------|--------|
| Firestore 直呼び | CollectionScreen 内で直接 fetch | CollectionService フックに切り出す |
| タブ状態がローカル | URL に反映されない | `useSearchParams` でディープリンク対応 |
| ビューが密結合 | 各タブがビューを個別管理 | `useViewMode` フックに一元化 |
| RecordCardModal | DbKey ベース、型安全性が低い | Zod スキーマベースに移行 |
