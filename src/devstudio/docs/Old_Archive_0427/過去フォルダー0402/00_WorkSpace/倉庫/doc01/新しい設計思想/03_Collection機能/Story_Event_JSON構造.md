# Story / Event JSON 構造一覧
## 全JSONファイル完全スキーマ

---

## 1. ファイル一覧

| ファイル | 用途 | 場所 |
|---------|------|------|
| `episodes.json` | エピソード/チャプター構造 + 場所定義 | `src/assets/data/` |
| `events.json` | クエスト/サブイベント一覧 | `src/assets/data/` |
| `scenario.json` | メインストーリー シナリオノード | `src/assets/data/` |
| `quest_XXX.json` | 個別クエスト シナリオノード | `src/assets/data/scenarios/` |

---

## 2. episodes.json

エピソード → チャプター → イベントの階層構造。

```json
{
  "episodes": [
    {
      "id": "ep1",
      "title": "Episode 1: 理の探求",
      "chapters": [
        {
          "id": "ep1-ch1",
          "title": "Chapter 1: 始まりの塔",
          "events": [
            {
              "id": "event-1",
              "title": "塔への招待",
              "description": "理の魔法使いとの邂逅",
              "location": "MAGIC_TOWER",
              "type": "main",
              "startStoryID": "M_01_01_01"
            }
          ]
        }
      ]
    }
  ],
  "locations": [
    {
      "id": "STARTING_VILLAGE",
      "label": "始まりの村",
      "color": "#22c55e"
    }
  ]
}
```

### Episode 型
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | string | エピソードID（ep1, ep2...） |
| `title` | string | 表示タイトル |
| `chapters` | Chapter[] | チャプター配列 |

### Chapter 型
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | string | チャプターID（ep1-ch1） |
| `title` | string | 表示タイトル |
| `events` | Event[] | イベント配列 |

### Event 型（episodes内）
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | イベントID |
| `title` | string | ✓ | タイトル |
| `description` | string | ✓ | 説明文 |
| `location` | string | - | 場所ID (MAGIC_TOWER等) |
| `type` | string | - | main \| quest \| sub |
| `startStoryID` | string | - | シナリオ開始ID |

### Location 型
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | string | 場所ID（UPPER_SNAKE_CASE） |
| `label` | string | 日本語表示名 |
| `color` | string | 表示色（hex） |

---

## 3. events.json

クエスト・サブイベントのフラット一覧。

```json
{
  "events": [
    {
      "id": "quest_003",
      "title": "森の遺跡の調査",
      "description": "長老からの依頼。森の奥にある遺跡の調査に向かう。",
      "type": "quest",
      "location": "FOREST_ENTRANCE",
      "episode": "ep1",
      "chapter": "ep1-ch2",
      "reward": "ゴールド150、薬草x3",
      "difficulty": 2,
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

### Event 型（events.json）
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | イベントID（quest_001, sub_001） |
| `title` | string | ✓ | タイトル |
| `description` | string | ✓ | 説明文 |
| `type` | string | ✓ | main \| quest \| sub |
| `location` | string | ✓ | 場所ID |
| `episode` | string | ✓ | 所属エピソード |
| `chapter` | string | ✓ | 所属チャプター |
| `reward` | string | ✓ | 報酬テキスト |
| `difficulty` | number | ✓ | 難易度 1-3 |
| `startStoryID` | string | - | シナリオ開始ID |
| `relatedAssets` | object | - | 関連アセット |

### relatedAssets 型
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `background` | string | 背景ID |
| `bgm` | string | BGM ID |
| `items` | string[] | アイテムID配列 |
| `enemies` | string[] | 敵ID配列 |

---

## 4. scenario.json

メインストーリーのシナリオノード配列。

```json
{
  "meta": {
    "title": "理の魔法使い",
    "type": "short_novel",
    "version": "1.1",
    "storyIdFormat": "[TYPE]_EP_CH_TXT"
  },
  "scenario": [
    {
      "storyID": "M_01_01_01",
      "scene": 1,
      "type": "SCENE_START",
      "questTitle": "理の魔法使い - Chapter 1",
      "sceneTags": ["bg_magic_tower_interior_1280x720"],
      "note": "Chapter1開始"
    },
    {
      "storyID": "M_01_01_02",
      "scene": 1,
      "speaker": "ナレーション",
      "text": "高くそびえる塔の前に、あなたは立っている。"
    },
    {
      "storyID": "M_01_02_03",
      "scene": 2,
      "event": {
        "type": "CHOICE",
        "payload": {
          "choices": [
            { "label": "力の理", "nextStoryID": "M_01_03_01" },
            { "label": "調和の理", "nextStoryID": "M_01_03_10" }
          ]
        }
      }
    },
    {
      "storyID": "M_01_04_03",
      "scene": 4,
      "event": {
        "type": "END",
        "payload": { "goto": "RESULT" }
      }
    }
  ]
}
```

### Meta 型
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `title` | string | シナリオタイトル |
| `type` | string | short_novel 等 |
| `version` | string | バージョン |
| `storyIdFormat` | string | ID命名規則 |

### ScenarioNode 型
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `storyID` | string | ✓ | ノードID（M_01_01_01形式） |
| `scene` | number | ✓ | シーン番号 |
| `type` | string | - | SCENE_START 等 |
| `questTitle` | string | - | シーン開始時タイトル |
| `sceneTags` | string[] | - | 背景タグ等 |
| `speaker` | string | - | 話者名 |
| `text` | string | - | セリフテキスト |
| `tags` | string[] | - | キャラ画像タグ等 |
| `event` | Event | - | イベントオブジェクト |
| `note` | string | - | 開発用メモ |

### Event 型（scenario内）
| type | payload | 説明 |
|------|---------|------|
| `TAP_NEXT` | `{ nextStoryID }` | 次のノードへ |
| `CHOICE` | `{ choices: [{label, nextStoryID}] }` | 選択肢分岐 |
| `BATTLE_START` | - | バトル開始 |
| `END` | `{ goto: "RESULT" \| "COLLECTION" }` | 終了・画面遷移 |

---

## 5. quest_XXX.json

クエスト専用シナリオノード配列。

```json
[
  {
    "storyID": "Q_03_01_01",
    "scene": 1,
    "type": "SCENE_START",
    "questTitle": "森の遺跡の調査",
    "sceneTags": [],
    "backgroundImage": "bg/xxx.png",
    "bgm": "mori01",
    "note": "Quest 03 開始"
  },
  {
    "storyID": "Q_03_01_02",
    "scene": 1,
    "speaker": "ナレーション",
    "text": "依頼を受けたあなたは、森の奥深くにある...",
    "backgroundImage": "bg/xxx.png",
    "bgm": "mori01"
  },
  {
    "storyID": "Q_03_01_05",
    "scene": 1,
    "event": { "type": "BATTLE_START" },
    "speaker": "システム",
    "text": "バトル開始！",
    "characterImage": "Monster_01.png"
  },
  {
    "storyID": "Q_03_01_10",
    "scene": 1,
    "event": {
      "type": "END",
      "payload": { "goto": "COLLECTION" }
    }
  }
]
```

### 追加フィールド（quest用）
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `backgroundImage` | string | 背景画像パス |
| `bgm` | string | BGM ID |
| `characterImage` | string | キャラ/敵画像 |

---

## 6. storyID 命名規則

```
[TYPE]_[EP]_[CH]_[TXT]

TYPE: M(メイン), Q(クエスト), S(サブ)
EP:   2桁エピソード番号 (01, 02...)
CH:   2桁チャプター番号 (01, 02...)
TXT:  2桁テキスト番号 (01, 02...)
```

| 例 | 意味 |
|----|------|
| `M_01_01_01` | メインEp1Ch1の1番目ノード |
| `Q_03_01_01` | Quest03の1番目ノード |
| `S_01_02_05` | サブEp1Ch2の5番目ノード |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-18
