# Library DB・View システム詳細

## 概要
この文書では、CollectionScreenの**Library機能**におけるデータベース構造（リスト式DB）と**View切替システム**の仕組みを詳しく解説します。

---

## Part 1: Library リスト式DBシステム

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                      Library システム                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ JSON Files   │───▶│ getData()    │───▶│ TableView    │   │
│  │ (データソース) │    │ (データ取得)  │    │ (表示)        │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  characters.json      currentData[]        カラム定義         │
│  enemies.json         (配列データ)         getColumns()       │
│  npcs.json                                                   │
│  backgrounds.json                                            │
│  items.json                                                  │
│  bgm.json / se.json                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### データの流れ

#### 1. JSONデータのインポート
```typescript
// CollectionScreen.tsx - データソースのインポート
import characterData from '@/data/collection/characters.json';
import enemyData from '@/data/collection/enemies.json';
import npcData from '@/data/collection/npcs.json';
import backgroundData from '@/data/collection/backgrounds.json';
import bgmData from '@/data/collection/bgm.json';
import seData from '@/data/collection/se.json';
import eventData from '@/data/collection/events.json';
import galleryData from '@/data/collection/gallery.json';
import itemData from '@/data/collection/items.json';
```

#### 2. タブに応じたデータ選択 (getData関数)
```typescript
const getData = () => {
    if (primaryTab === 'library') {
        switch (secondaryTab) {
            case 'character': return characterData.characters || [];
            case 'enemy': return enemyData.enemies || [];
            case 'npc': return npcData.npcs || [];
            case 'place': return backgroundData.locations || [];
            case 'item_dict': return itemData.items || [];
            case 'sound_db':
                // BGMとSEをマージして返す
                const bgmList = (bgmData.bgm || []).map(item => ({ ...item, type: 'BGM' }));
                const seList = (seData.se || []).map(item => ({ ...item, type: 'SE' }));
                return [...bgmList, ...seList];
            default: return [];
        }
    }
    return [];
};
```

#### 3. カラム定義 (getColumns関数)
```typescript
const getColumns = () => {
    switch (secondaryTab) {
        case 'character': return CHARACTER_COLUMNS;
        case 'enemy': return ENEMY_COLUMNS;
        case 'npc': return NPC_COLUMNS;
        case 'place': return PLACE_COLUMNS;
        case 'item_dict': return ITEM_COLUMNS;
        case 'sound_db': return SOUND_COLUMNS;
        default: return [];
    }
};
```

### DBテーブル一覧（SecondaryTab）

| タブID | 表示名 | データソース | ルートキー |
|--------|--------|-------------|-----------|
| `place` | 地名辞典 | backgrounds.json | `locations` |
| `character` | キャラクター図鑑 | characters.json | `characters` |
| `npc` | NPC図鑑 | npcs.json | `npcs` |
| `enemy` | エネミー図鑑 | enemies.json | `enemies` |
| `item_dict` | アイテム図鑑 | items.json | `items` |
| `event` | イベントDB | events.json | `events` |
| `cg` | CG・ギャラリー | gallery.json | `images` |
| `sound_db` | サウンド図鑑 | bgm.json + se.json | `bgm` + `se` |

### カラム定義の構造

```typescript
export interface TableColumn {
    key: string;           // JSONのプロパティキー
    label: string;         // 表示ラベル
    render?: (value: any, item: any) => React.ReactNode;  // カスタムレンダラー
}
```

#### CHARACTER_COLUMNS 例
```typescript
const CHARACTER_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'description', label: '説明' },
    {
        key: 'defaultTags',
        label: 'タグ',
        render: (tags: string[]) => (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(tags || []).map((tag, i) => (
                    <span key={tag} style={{
                        ...tagStyle,
                        backgroundColor: ['#3b82f6', '#8b5cf6'][i % 2] + '33',
                        color: ['#60a5fa', '#a78bfa'][i % 2],
                    }}>
                        {tag}
                    </span>
                ))}
            </div>
        )
    }
];
```

---

## Part 2: View 切替システム

### View システム概要

```
┌─────────────────────────────────────────────────────────────┐
│                     View 切替システム                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   useViewMode Hook                                           │
│   ┌────────────────────────────────────────┐                │
│   │ viewMode: 'list' | 'gallery' |          │                │
│   │           'kanban' | 'custom'           │                │
│   └────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│   ViewSwitcher コンポーネント                                 │
│   ┌────┬────┬────┬────┐                                     │
│   │ 📋 │ 🖼️ │ 📊 │ 👤 │  ← 4つのビューモード                │
│   │List│Gall│Kanb│Cust│                                     │
│   └────┴────┴────┴────┘                                     │
│                        │                                     │
│                        ▼                                     │
│   条件分岐による表示切替                                       │
│   ┌──────────────────────────────────────┐                  │
│   │ viewMode === 'list'    → TableView   │                  │
│   │ viewMode === 'gallery' → GalleryView │                  │
│   │ viewMode === 'kanban'  → KanbanView  │                  │
│   │ viewMode === 'custom'  → *DetailView │                  │
│   └──────────────────────────────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### useViewMode Hook

```typescript
// src/core/hooks/useViewMode.ts
import { useState } from 'react';

export type ViewMode = 'list' | 'gallery' | 'kanban' | 'custom';

export function useViewMode(initialMode: ViewMode = 'list') {
    const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
    return { viewMode, setViewMode };
}
```

### ViewSwitcher コンポーネント

```typescript
// src/components/data-views/ViewSwitcher.tsx
import { Menu, Grid3x3, LayoutList, IdCard } from 'lucide-react';

export type CollectionViewType = 'list' | 'gallery' | 'kanban' | 'custom';

interface ViewSwitcherProps {
    currentView: CollectionViewType;
    onViewChange: (view: CollectionViewType) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    const views: { id: CollectionViewType; icon: typeof Menu; label: string }[] = [
        { id: 'list', icon: Menu, label: 'リスト表示' },
        { id: 'gallery', icon: Grid3x3, label: 'ギャラリー表示' },
        { id: 'kanban', icon: LayoutList, label: 'カンバン表示' },
        { id: 'custom', icon: IdCard, label: '詳細表示' }
    ];

    return (
        <div className="inline-flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
            {views.map((view) => {
                const Icon = view.icon;
                return (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={`p-2 rounded transition-all
                            ${currentView === view.id
                                ? 'bg-gray-700 text-yellow-400'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                        title={view.label}
                    >
                        <Icon size={18} strokeWidth={2} />
                    </button>
                );
            })}
        </div>
    );
}
```

### View 表示の条件分岐

```typescript
// CollectionScreen.tsx 内の表示ロジック
{primaryTab === 'library' && (
    <div className="collection-view-container">
        {/* リスト表示 */}
        {viewMode === 'list' && (
            <TableView data={currentData} columns={currentColumns} />
        )}
        
        {/* ギャラリー表示 */}
        {viewMode === 'gallery' && (
            <GalleryView data={currentData} />
        )}
        
        {/* カンバン表示 */}
        {viewMode === 'kanban' && (
            <KanbanView data={currentData} />
        )}
        
        {/* カスタム詳細表示 */}
        {viewMode === 'custom' && (
            (() => {
                switch (secondaryTab) {
                    case 'character':
                        return <CharacterDetailView data={currentData} />;
                    case 'npc':
                        return <NPCDetailView data={currentData} />;
                    case 'enemy':
                        return <EnemyDetailView data={currentData} />;
                    case 'place':
                        return <BackgroundDetailView data={currentData} />;
                    case 'sound_db':
                        return <BGMPlayerView />;
                    default:
                        return <div>未実装</div>;
                }
            })()
        )}
    </div>
)}
```

### 各View の特徴

| View | コンポーネント | 特徴 | 用途 |
|------|--------------|------|------|
| **list** | TableView | テーブル形式、ソート可能 | データ一覧確認 |
| **gallery** | GalleryView | グリッドカード、3:4アスペクト | 画像確認 |
| **kanban** | KanbanView | カラム分け、ドラッグ対応 | ステータス管理 |
| **custom** | *DetailView | タブ別カスタムUI | 詳細閲覧 |

---

## Part 3: 自動View切替

### タブ変更時のView自動切替

```typescript
// CollectionScreen.tsx
useEffect(() => {
    if (secondaryTab === 'character') {
        // キャラクタータブは自動的にcustom viewに
        setViewMode('custom');
    } else if (secondaryTab === 'sound_db') {
        // サウンドはデフォルトのまま（またはcustom）
    } else {
        // その他のタブでcustom viewだった場合はlistに戻す
        if (viewMode === 'custom') setViewMode('list');
    }
}, [secondaryTab]);
```

---

## Part 4: 移植時のカスタマイズ例

### 新しいDBタブの追加

```typescript
// 1. SecondaryTab 型に追加
type SecondaryTab = 'place' | 'character' | ... | 'new_tab';

// 2. secondaryTabs 配列に追加
const secondaryTabs = [
    ...existingTabs,
    { id: 'new_tab', label: '新しい図鑑' }
];

// 3. getData に分岐追加
case 'new_tab': return newData.items || [];

// 4. getColumns に分岐追加
case 'new_tab': return NEW_TAB_COLUMNS;

// 5. カラム定義を作成
const NEW_TAB_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    // ...
];
```

### 新しいViewモードの追加

```typescript
// 1. ViewMode 型を拡張
export type ViewMode = 'list' | 'gallery' | 'kanban' | 'custom' | 'timeline';

// 2. ViewSwitcher に追加
{ id: 'timeline', icon: Clock, label: 'タイムライン表示' }

// 3. 表示分岐に追加
{viewMode === 'timeline' && <TimelineView data={currentData} />}
```

---

## まとめ

| 機能 | 実装場所 | 説明 |
|------|---------|------|
| **データ取得** | `getData()` | secondaryTab に応じてJSONから配列取得 |
| **カラム定義** | `getColumns()` | テーブル表示時のカラム構造 |
| **View状態管理** | `useViewMode` | 4種類の表示モード管理 |
| **View切替UI** | `ViewSwitcher` | アイコンボタンで切替 |
| **条件分岐表示** | `CollectionScreen` | viewMode に応じたコンポーネント描画 |
