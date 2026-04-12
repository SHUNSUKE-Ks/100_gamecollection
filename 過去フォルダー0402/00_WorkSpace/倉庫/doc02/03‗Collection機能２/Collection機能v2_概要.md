# Collection機能 v2.0 仕様書

本ドキュメントは、実装済みのCollection機能（`CollectionScreen.tsx`）および最新の要件に基づいた機能概要です。

## 1. 画面レイアウト概要

### 1.1 全体構造

```
[ CollectionScreen ]
+---------------------------------------------------------------+
|  [Header Navigation]                                          |
|   Primary Tabs:   [アイテム] [装備] [ストーリー] [ライブラリー] [工房]... |
|   Secondary Tabs: [地名] [キャラ] [NPC] [エネミー] [CG]...          |
+---------------------------------------------------------------+
|  [Main Content Area]                                          |
|                                                               |
|  +--------------------------------------------------------+   |
|  | [View Switcher] (List / Gallery / Kanban / Custom)     |   |
|  +--------------------------------------------------------+   |
|                                                               |
|  +--------------------------------------------------------+   |
|  |                                                        |   |
|  |  Content Display Area                                  |   |
|  |  (TableView / GalleryView / DetailView etc.)           |   |
|  |                                                        |   |
|  +--------------------------------------------------------+   |
|                                                               |
+---------------------------------------------------------------+
```

### 1.2 タブ構成 (Navigation)

*   **Primary Tabs (大分類)**
    *   `Library`: データベース閲覧（キャラ、NPC、アイテム等）
    *   `Story`: ストーリー閲覧
    *   `Studio`: 開発・デバッグ機能
    *   `Sound`: サウンドプレイヤー
    *   `Item`, `Equipment`, `Skill`, `Ability` ... (Future)
*   **Secondary Tabs (Library選択時)**
    *   `Character` (キャラ図鑑)
    *   `NPC` (NPC図鑑)
    *   `Enemy` (エネミー図鑑)
    *   `Place` (地名辞典)
    *   `ItemDict` (アイテム図鑑)
    *   `Event` (イベントDB)
    *   `CG` (CGギャラリー)
    *   `SoundDB` (サウンド図鑑)

---

## 2. カラム機能一覧 (TableView定義)

一覧表示（List View）で使用されるテーブルカラムの定義です。

### 2.1 Character (キャラクター)
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `name` | 名前 | |
| `description` | 説明 | |
| `defaultTags` | タグ | 色付きタグ表示 |

### 2.2 Enemy (エネミー)
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `name` | 名前 | |
| `description` | 説明 | |
| `stats` | ステータス | HP, MPを表示 |

### 2.3 NPC
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `name` | 名前 | |
| `role` | 役割 | 色付きタグ |
| `location` | 場所 | 📍ロケーション名 |
| `dict` | 説明 | |

### 2.4 Place (場所・背景)
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `name` | 地名 | |
| `region` | 地域 | 色付きタグ |
| `description` | 説明 | |

### 2.5 Item (アイテム図鑑)
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `name` | 名前 | |
| `category` | カテゴリ | 回復/素材/装備/重要 (色分け) |
| `price` | 価格 | 💰金額 |
| `description` | 説明 | |

### 2.6 Sound DB (BGM/SE)
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `type` | Type | BGM / SE (色分け) |
| `title` | タイトル | |
| `artist` | アーティスト | |
| `filename` | ファイル名 | |
| `tags` | タグ | |
| `description` | 説明 | |

### 2.7 CG / Event
| Key | Label | 備考 |
|-----|-------|------|
| `id` | ID | |
| `title` | タイトル | |
| `category`/`type` | カテゴリ/種別 | CG/Cutin/Main/Quest... (色分け) |
| `tags` | タグ | |
| `description` | 説明 | |

---

## 3. 実装機能メモ

*   **ViewSwitcher**: 表示モードを切り替えるコンポーネント
    *   `List`: テーブル形式 (`TableView`)
    *   `Gallery`: グリッド画像形式 (`GalleryView`)
    *   `Kanban`: カンバン形式 (`KanbanView`)
    *   `Custom`: 個別の詳細ビュー (`CharacterDetailView` 等)
*   **Auto Switch**: `SecondaryTab` 切り替え時に、最適な ViewMode に自動で切り替わるロジックあり（例: Character選択時は `Custom` ビューへ）。

---

## 4. 共通スキーマ定義（他アプリ連携用）

他のアプリケーションでも資産を活用できるように、JSONデータ構造のスキーマ定義を以下に示します。

### 4.1 Base Item Schema (共通基底)
すべてのコレクションアイテムが最低限持つべきフィールドです。

```typescript
interface BaseCollectionItem {
  id: string;          // 一意の識別子 (snake_case推奨)
  name: string;        // 表示名
  description: string; // 説明テキスト
  tags?: string[];     // 検索・フィルタ用タグ配列
}
```

### 4.2 Character Schema
```typescript
interface CharacterItem extends BaseCollectionItem {
  defaultTags: string[]; // キャラ特性タグ (COLOR, TRAIT etc.)
  image?: string;        // メイン画像パス
  standing?: string[];   // 立ち絵バリエーション
}
```

### 4.3 Enemy Schema
```typescript
interface EnemyItem extends BaseCollectionItem {
  stats: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
  };
  rarity: 1 | 2 | 3 | 4 | 5; // 1:Common ~ 5:Legendary
  skills?: string[];         // 保有スキル名
}
```

### 4.4 NPC Schema
```typescript
interface NPCItem extends BaseCollectionItem {
  role: string;      // 役割 (Merchant, Elder etc.)
  location: string;  // 配置場所ID
}
```

### 4.5 Place (Location) Schema
```typescript
interface PlaceItem extends BaseCollectionItem {
  region: string;    // 所属地域 (Region ID)
  images: string[];  // 背景画像パス配列
}
```

### 4.6 Item Schema
```typescript
interface GameItem extends BaseCollectionItem {
  category: 'consumable' | 'material' | 'equipment' | 'key';
  price: number;
  effect?: string;   // 効果テキスト
  icon?: string;     // アイコンパス
}
```

### 4.7 Sound Schema
```typescript
interface SoundItem extends BaseCollectionItem {
  type: 'BGM' | 'SE';
  title: string;
  artist?: string;
  filename: string;  // ファイル物理名
}
```
**Last Updated**: 2026-01-27 (Synced with `CollectionScreen.tsx`)
