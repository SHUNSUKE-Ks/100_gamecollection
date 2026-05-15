# Story / Event クエスト画面 引継ぎ資料
## Layout + 機能仕様

---

## 1. 画面構成

```
┌──────────────────────────────────────────────────────────────────────┐
│  [アイテム] [装備] [スキル] [アビリティ] [ストーリー●] [ライブラリー] │ ← Top Nav
├──────────────────────────────────────────────────────────────────────┤
│  [メイン●] [イベント]           [📋ステッパー] [📊カンバン] [📝リスト] │ ← Sub Nav + View Toggle
├──────────────────────────────────────────────────────────────────────┤
│ Character: [All▼]  NPCロール: [All▼]  Location: [All▼]  [+ タグ管理]│ ← 3rd Level Filter
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐                                                     │
│  │ エピソード1  │      ┌─────────────────────────────────────┐      │
│  │ ├─ 第1章 ◯  │      │  Episode 1                          │      │
│  │ ├─ 第2章 ✓  │      │  第2章：森の遺跡                      │      │
│  │ └─ 第3章 ◯  │      ├─────────────────────────────────────┤      │
│  ├─────────────┤      │ ┌─────┐ ┌─────┐ ┌─────┐            │      │
│  │ エピソード2  │      │ │Event│ │Event│ │Event│            │      │
│  │ ├─ 第1章 ◯  │      │ │Card │ │Card │ │Card │            │      │
│  │ └─ 第2章 ◯  │      │ └─────┘ └─────┘ └─────┘            │      │
│  └─────────────┘      └─────────────────────────────────────┘      │
│   [◀ 折畳み]                                                         │
│   Side Panel                    Main Content                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. ファイル構成

| ファイル | 役割 |
|---------|------|
| `screens/11_Collection/CollectionScreen.jsx` | Story画面（lines 1135-1547） |
| `assets/data/events.json` | クエスト・サブイベントデータ |
| `hooks/useGameStore.js` | `episodes`, `startEvent` 等 |
| `styles/screens/chapterGallery.css` | Stepper/Kanban用スタイル |
| `components/common/MultiSelect.jsx` | タグフィルタ用 |

---

## 3. データ構造

### 3.1 events.json
```json
{
  "events": [
    {
      "id": "quest_003",
      "title": "森の遺跡の調査",
      "description": "長老からの依頼...",
      "type": "quest",           // main | quest | sub
      "location": "FOREST_ENTRANCE",
      "episode": "ep1",
      "chapter": "ep1-ch2",
      "reward": "ゴールド150、薬草x3",
      "difficulty": 2,           // 1-3
      "startStoryID": "Q_03_01_01",
      "relatedAssets": {
        "background": "loc_forest_ruins",
        "bgm": "mori01",
        "items": ["material_herb_001"],
        "enemies": ["monster_01"]
      }
    }
  ],
  "types": [
    { "id": "main", "label": "メインストーリー", "color": "#ef4444" },
    { "id": "quest", "label": "クエスト", "color": "#f59e0b" },
    { "id": "sub", "label": "サブイベント", "color": "#3b82f6" }
  ]
}
```

### 3.2 Episode構造（useGameStore経由）
```typescript
interface Episode {
  id: string;
  title: string;
  chapters: Chapter[];
  locations?: Location[];
}

interface Chapter {
  id: string;
  title: string;
  events: Event[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  startStoryID?: string;
}
```

---

## 4. サブカテゴリ

| ID | Label | 内容 |
|----|-------|------|
| `main` | メイン | エピソード/チャプター選択式 |
| `event` | イベント | クエスト/サブイベントグリッド |

---

## 5. View Modes（メインストーリー用）

### 5.1 Stepper Mode（デフォルト）
- 左: サイドパネル（折畳み可）でEpisode/Chapter選択
- 右: EventCardグリッド表示
- 📋 アイコン

### 5.2 Kanban Mode
- Locationごとの縦カラム
- 各カラムにEventカードをスタック
- 📊 アイコン

### 5.3 List Mode
- テーブル形式
- カラム: イベント | 場所 | Episode | Chapter | アクション
- 📝 アイコン

---

## 6. 3rd Level Filter

タグベースのフィルタリング。`MultiSelect`コンポーネント使用。

| Filter | Tag Category | 用途 |
|--------|-------------|------|
| Character | Character, Class, Affiliation | 登場キャラで絞込 |
| NPCロール | NPCRole | 関連NPCで絞込 |
| Location | Location | 場所で絞込 |

**+ タグ管理ボタン**: TagManagerモーダルを開く

---

## 7. Event Card（クエスト画面用）

```jsx
<div className="event-card" style={{ borderLeft: `4px solid ${eventType.color}` }}>
  {/* Header */}
  <span className="type-badge">{eventType.label}</span>
  <span className="difficulty">★★☆</span>

  {/* Body */}
  <h3>{event.title}</h3>
  <p>{event.description}</p>

  {/* Tags */}
  <span className="location-tag">📍 {location.label}</span>
  <span className="chapter-tag">{event.episode} / {event.chapter}</span>

  {/* Reward */}
  <div className="reward">💰 報酬: {event.reward}</div>

  {/* Action */}
  <button onClick={() => startEvent(event.id, event.startStoryID)}>
    {event.startStoryID ? 'イベントを開始' : '準備中'}
  </button>
</div>
```

---

## 8. State一覧

| State | 型 | 初期値 | 用途 |
|-------|-----|-------|------|
| `storySubCategory` | string | `'main'` | サブカテゴリ切替 |
| `storyViewMode` | string | `'stepper'` | 表示モード切替 |
| `isStoryPanelOpen` | boolean | `true` | サイドパネル開閉 |
| `selectedChapter` | string | - | 選択中チャプターID |
| `filterCharacter` | string[] | `[]` | キャラタグフィルタ |
| `filterNpcRole` | string[] | `[]` | NPCロールフィルタ |
| `filterLocation` | string[] | `[]` | 場所フィルタ |

---

## 9. アクション

| 関数 | 引数 | 動作 |
|------|------|------|
| `setStorySubCategory(id)` | `'main'` \| `'event'` | サブカテゴリ変更 |
| `setStoryViewMode(mode)` | `'stepper'` \| `'kanban'` \| `'list'` | 表示モード変更 |
| `setSelectedChapter(id)` | chapterId | チャプター選択 |
| `startEvent(eventId, storyId)` | eventId, storyId | ノベル画面へ遷移 |

---

## 10. CSS クラス一覧

| クラス | 用途 |
|--------|------|
| `.story-screen` | ルートコンテナ |
| `.story-sub-nav` | サブナビゲーション |
| `.chapter-gallery-screen` | Stepperモード全体 |
| `.side-panel` | 左サイドパネル |
| `.side-panel.open/.closed` | 開閉状態 |
| `.toggle-panel-btn` | 折畳みボタン |
| `.main-content-area` | 右メインエリア |
| `.stepper-container` | Episode/Chapter一覧 |
| `.episode-item` | エピソードブロック |
| `.chapter-item` / `.active` | チャプター行 |
| `.events-grid` | イベントカードグリッド |
| `.event-card` | 個別イベントカード |
| `.event-read-btn` | 「読む」ボタン |

---

## 11. 移植チェックリスト

- [ ] `events.json` をコピー
- [ ] Story画面部分をCollectionScreenから抽出
- [ ] `MultiSelect` コンポーネントをコピー
- [ ] `TagManager` コンポーネントをコピー
- [ ] `chapterGallery.css` をコピー
- [ ] useGameStore の `episodes`, `startEvent` を実装
- [ ] 必要に応じてLocations定義を追加

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-18
