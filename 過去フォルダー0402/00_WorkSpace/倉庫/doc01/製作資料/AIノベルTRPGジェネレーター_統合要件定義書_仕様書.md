# AIノベル/TRPGジェネレーター 統合要件定義書・仕様書

**バージョン**: v2.0  
**最終更新**: 2026-01-07  
**ドキュメント種別**: 統合要件定義書・仕様書

---

## 📑 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [フォルダ構成仕様](#3-フォルダ構成仕様)
4. [データ仕様（JSON Schema）](#4-データ仕様json-schema)
5. [アセット管理仕様](#5-アセット管理仕様)
6. [画面構成仕様](#6-画面構成仕様)
7. [コア機能仕様](#7-コア機能仕様)
8. [開発フェーズ計画](#8-開発フェーズ計画)
9. [設計原則とルール](#9-設計原則とルール)

---

## 1. プロジェクト概要

### 🎯 目的

Google AI Studio + ナノバナナ連携により、以下を実現するAI駆動ノベルゲーム基盤を構築する：

- シーン切替ごとに**背景・キャラクター画像を自動生成**
- ノベルゲームUIで物語を進行
- 生成した画像を**タグ付きで管理・再利用**
- TRPG的な分岐・選択肢に対応
- バトルシステム統合
- コレクション・ギャラリー機能

### 🎮 主要機能

| 機能カテゴリ | 内容 |
|------------|------|
| **ノベルパート** | シナリオ進行、選択肢分岐、タグ駆動演出 |
| **バトルパート** | 戦闘ロジック、敵AI、スキル処理 |
| **コレクション** | 画像ギャラリー、Tips閲覧、進捗管理 |
| **AI画像生成** | ナノバナナ連携による自動画像生成 |
| **セーブ/ロード** | 進行状態の永続化 |

### 🛠 技術スタック

- **フロントエンド**: React + Vite
- **AI連携**: Google AI Studio + ナノバナナ
- **状態管理**: useReducer / Zustand
- **データ形式**: JSON
- **デプロイ**: PWA対応

---

## 2. システムアーキテクチャ

### 🧩 システム構成

```
[UI (Web/PWA)]
   │
   ├─ JSON Data Layer
   │   ├─ scenario.json
   │   ├─ characters.json
   │   ├─ enemy.json
   │   ├─ skill.json
   │   ├─ tips.json
   │   ├─ sound.json
   │   └─ image_registry.json
   │
   ├─ Core Layer
   │   ├─ Managers (Asset/Sound/Save/Tag)
   │   ├─ Hooks (useScenario/useSound/useAsset)
   │   └─ Utilities
   │
   ├─ Parts Layer
   │   ├─ Novel Part
   │   ├─ Battle Part
   │   └─ Collection Part
   │
   └─ Google AI Studio
       ├─ テキスト生成
       └─ 画像生成（ナノバナナ）
```

### 🔄 パート分離アーキテクチャ

各パートは完全に独立モジュール化され、以下が可能：

- ✅ 別プロジェクトへコピペ移植
- ✅ 新パート差し替え
- ✅ 単体アプリ化（ノベルのみ/バトルのみ）

```
AppShell（共通）
   ├─ PartRouter
   │     ├─ NovelPart
   │     ├─ BattlePart
   │     └─ CollectionPart
   │
   ├─ Core（共通ロジック）
   └─ Assets / Data
```

---

## 3. フォルダ構成仕様

### 📁 推奨ディレクトリ構造

```
src/
 ├─ app/                     # アプリ起点
 │   ├─ App.tsx
 │   └─ PartRouter.tsx
 │
 ├─ parts/                   # ★差し替え可能パート群
 │   ├─ novel/
 │   │    ├─ screens/       # UI専用
 │   │    │   ├─ TitleScreen.tsx
 │   │    │   ├─ ChapterScreen.tsx
 │   │    │   ├─ NovelScreen.tsx
 │   │    │   └─ ResultScreen.tsx
 │   │    ├─ components/
 │   │    ├─ hooks/
 │   │    ├─ NovelManager.ts
 │   │    ├─ README.md      # パート仕様
 │   │    └─ index.ts
 │   │
 │   ├─ battle/
 │   │    ├─ screens/
 │   │    ├─ components/
 │   │    ├─ hooks/
 │   │    ├─ BattleManager.ts
 │   │    ├─ README.md
 │   │    └─ index.ts
 │   │
 │   └─ collection/
 │        ├─ screens/
 │        ├─ components/
 │        ├─ CollectionManager.ts
 │        ├─ README.md
 │        └─ index.ts
 │
 ├─ core/                    # ★完全共通エンジン層
 │   ├─ managers/
 │   │    ├─ AssetManager.ts
 │   │    ├─ SoundManager.ts
 │   │    ├─ SaveManager.ts
 │   │    ├─ TagResolver.ts
 │   │    └─ ScenarioManager.ts
 │   │
 │   ├─ hooks/
 │   │    ├─ useGameState.ts
 │   │    ├─ useScenario.ts
 │   │    ├─ useAsset.ts
 │   │    ├─ useSound.ts
 │   │    ├─ useFlags.ts
 │   │    ├─ useSaveData.ts
 │   │    └─ useTagMatch.ts
 │   │
 │   ├─ stores/              # reducer / Zustand
 │   ├─ types/
 │   └─ README.md
 │
 ├─ data/                    # ★JSON群（仕様の正）
 │   ├─ scenario.json
 │   ├─ characters.json
 │   ├─ enemy.json
 │   ├─ skill.json
 │   ├─ tips.json
 │   ├─ sound.json
 │   ├─ image_registry.json
 │   ├─ title.json
 │   ├─ game_config.json
 │   └─ README.md            # ★最重要
 │
 ├─ assets/                  # タグベース管理
 │   ├─ bg/                  # 背景画像
 │   ├─ chara/               # キャラクター画像
 │   ├─ item/                # アイテム画像
 │   ├─ effect/              # 演出画像・動画
 │   ├─ skill/               # スキルアイコン
 │   ├─ ui/                  # UI素材
 │   ├─ sound/               # 音楽・効果音（将来）
 │   │   ├─ bgm/
 │   │   └─ se/
 │   ├─ tags/
 │   │   └─ tags_for_notion.csv
 │   └─ README.md
 │
 └─ GameStyles/              # スタイル定義
```

### 📋 README.md配置ルール

各フォルダに必ずREADME.mdを配置：

| 配置場所 | 目的 |
|---------|------|
| `parts/*/README.md` | パート責務・依存関係明記 |
| `core/README.md` | 共通層ルール定義 |
| `data/README.md` | **データ仕様の正（最重要）** |
| `assets/README.md` | アセット命名規則 |

---

## 4. データ仕様（JSON Schema）

### 4.1 title.json

```json
{
  "title": "string",
  "subtitle": "string",
  "backgroundTag": "string",
  "logoPath": "string",
  "ui": {
    "startLabel": "string",
    "continueLabel": "string"
  }
}
```

**例**:
```json
{
  "title": "AI Chronicles",
  "subtitle": "生成される物語",
  "backgroundTag": "bg_castle_sunset_1280x720",
  "logoPath": "/assets/ui/logo.png",
  "ui": {
    "startLabel": "Start",
    "continueLabel": "Continue"
  }
}
```

---

### 4.2 characters.json

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "defaultTags": ["string"],
    "portraitTag": "string",
    "promptTemplate": "string",
    "status": {
      "hp": "number",
      "mp": "number",
      "str": "number",
      "dex": "number",
      "int": "number"
    },
    "skills": ["skill_id"]
  }
]
```

**例**:
```json
[
  {
    "id": "hero",
    "name": "主人公",
    "description": "記憶を失った剣士",
    "defaultTags": ["chara_hero_normal_1024x1024"],
    "portraitTag": "chara_hero_face_512x512",
    "promptTemplate": "young swordsman, fantasy, anime style",
    "status": {
      "hp": 120,
      "mp": 40,
      "str": 15,
      "dex": 12,
      "int": 8
    },
    "skills": ["slash", "guard"]
  }
]
```

---

### 4.3 scenario.json（中核）

#### Schema

```json
[
  {
    "storyID": "string",           // EP_CH_TXT形式（例: 01_01_01）
    "speaker": "string",
    "text": "string",
    "tags": ["string"],            // タグ駆動制御
    "event": {
      "type": "CHOICE | BATTLE | FLAG | ITEM | JUMP | NONE",
      "payload": {}
    },
    "flags": {
      "string": "boolean | number | string"
    },
    "effects": ["string"],
    "tips": ["tip_id"],
    "note": "string"
  }
]
```

#### storyID命名規則

```
EP_CH_TXT

例:
01_01_01  → Episode 1, Chapter 1, Text 1
01_01_02  → Episode 1, Chapter 1, Text 2
02_03_015 → Episode 2, Chapter 3, Text 15
```

**桁ルール**:

| 区分 | 桁数 | 説明 |
|-----|------|------|
| EP  | 2桁  | エピソード |
| CH  | 2桁  | チャプター |
| TXT | 2〜4桁 | テキスト連番 |

**メリット**:
- ✅ 人間が見て意味が分かる
- ✅ ソートが安定
- ✅ Notion/CSV/GitHub連携しやすい
- ✅ 正規表現パースが簡単

#### event.payload詳細

**CHOICE**:
```json
{
  "choices": [
    {
      "label": "string",
      "nextStoryID": "string",
      "conditions": {
        "flag": "string",
        "operator": "== | != | > | <",
        "value": "any"
      }
    }
  ]
}
```

**BATTLE**:
```json
{
  "enemyIDs": ["character_id"],
  "reward": {
    "items": ["item_id"],
    "exp": "number"
  }
}
```

**ITEM**:
```json
{
  "itemID": "string",
  "count": "number"
}
```

**FLAG**:
```json
{
  "key": "string",
  "value": "any"
}
```

**JUMP**:
```json
{
  "nextStoryID": "string"
}
```

#### 実装例

```json
{
  "storyID": "01_01_01",
  "speaker": "主人公",
  "text": "この森は…妙に静かだ。",
  "tags": ["bg_forest_morning_1280x720"],
  "event": {
    "type": "CHOICE",
    "payload": {
      "choices": [
        { "label": "進む", "nextStoryID": "01_01_02" },
        { "label": "戻る", "nextStoryID": "01_01_03" }
      ]
    }
  },
  "flags": {
    "entered_forest": true
  },
  "effects": ["fade_in"],
  "tips": ["forest"],
  "note": "初回分岐"
}
```

---

### 4.4 enemy.json

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "imageTag": "string",
    "promptTemplate": "string",
    "status": {
      "hp": "number",
      "mp": "number",
      "str": "number",
      "dex": "number",
      "int": "number"
    },
    "skills": ["skill_id"],
    "drop": {
      "items": ["item_id"],
      "exp": "number",
      "gold": "number"
    },
    "ai": {
      "pattern": "aggressive | defensive | random",
      "thinkDelay": "number"
    }
  }
]
```

**例**:
```json
{
  "id": "goblin",
  "name": "ゴブリン",
  "description": "森に棲む小型の魔物。",
  "imageTag": "chara_enemy_goblin_1024x1024",
  "promptTemplate": "small goblin monster, fantasy, anime style",
  "status": {
    "hp": 40,
    "mp": 0,
    "str": 8,
    "dex": 10,
    "int": 3
  },
  "skills": ["bite", "slash"],
  "drop": {
    "items": ["item_small_potion"],
    "exp": 15,
    "gold": 5
  },
  "ai": {
    "pattern": "aggressive",
    "thinkDelay": 0.8
  }
}
```

---

### 4.5 skill.json

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "iconTag": "string",
    "cost": {
      "mp": "number",
      "cooldown": "number"
    },
    "power": {
      "base": "number",
      "scale": "str | int | dex"
    },
    "target": "enemy | self | ally | all",
    "effects": ["effect_id"],
    "tags": ["string"]
  }
]
```

**例**:
```json
{
  "id": "slash",
  "name": "斬撃",
  "description": "剣で敵を切りつける基本攻撃。",
  "iconTag": "item_skill_slash_256x256",
  "cost": {
    "mp": 0,
    "cooldown": 0
  },
  "power": {
    "base": 10,
    "scale": "str"
  },
  "target": "enemy",
  "effects": ["hit_slash"],
  "tags": ["physical", "melee"]
}
```

---

### 4.6 tips.json

```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "relatedTags": ["string"],
    "unlockCondition": {
      "flag": "string",
      "value": "any"
    }
  }
]
```

**例**:
```json
{
  "id": "forest",
  "title": "魔境の森",
  "description": "古代魔力に汚染された危険な森。",
  "relatedTags": ["bg_forest_morning_1280x720"],
  "unlockCondition": {
    "flag": "entered_forest",
    "value": true
  }
}
```

---

### 4.7 sound.json

> ⚠️ 現時点では音源なし。雰囲気管理・将来作曲用メタデータ。

```json
[
  {
    "id": "string",
    "scene": "title | chapter | prologue | novel | battle | result",
    "title": "string",
    "key": "none",               // 作曲未納品のため固定
    "mood": "string",
    "tempo": "number",
    "chordProgression": ["string"],
    "tags": ["string"],          // 再生トリガー用
    "path": "none",              // 納品後に接続
    "note": "string"
  }
]
```

**例**:
```json
{
  "id": "bgm_forest_01",
  "scene": "novel",
  "title": "静寂の森",
  "key": "none",
  "mood": "神秘・緊張",
  "tempo": 70,
  "chordProgression": ["Dm", "Bb", "F", "C"],
  "tags": ["bg_forest", "scene_forest"],
  "path": "none",
  "note": "後日BGM納品予定"
}
```

#### 再生仕様（タグ駆動）

```typescript
// tagsに一致するsoundを検索して再生
scenario.tags -> sound.tags マッチング

find(sound => sound.tags.some(tag => scenario.tags.includes(tag)))
```

---

### 4.8 image_registry.json

```json
[
  {
    "id": "string",
    "name": "string",
    "tag": "string",
    "category": "bg | chara | item | effect",
    "prompt": "string",
    "path": "string",
    "size": {
      "width": "number",
      "height": "number"
    },
    "createdAt": "ISODate"
  }
]
```

**例**:
```json
{
  "id": "img_0001",
  "name": "森の朝",
  "tag": "bg_forest_morning_1280x720",
  "category": "bg",
  "prompt": "fantasy forest morning sunlight",
  "path": "/generated/bg_forest_morning_1280x720.png",
  "size": {
    "width": 1280,
    "height": 720
  },
  "createdAt": "2026-01-07T12:00:00"
}
```

---

### 4.9 game_config.json

```json
{
  "worldType": "string",
  "difficulty": "easy | normal | hard",
  "imageGeneration": true,
  "playerCount": "number",
  "seed": "string"
}
```

---

## 5. アセット管理仕様

### 🏷 タグ命名規則（統一）

```
{category}_{name}_{width}x{height}

例:
bg_forest_morning_1280x720
chara_hero_smile_1024x1024
item_magic_sword_512x512
```

### 📂 アセットパス規則

```
src/assets/{category}/{tag_key}.{ext}
```

**例**:

| category | tag_key | path |
|---------|---------|------|
| bg | bg_forest_morning_1280x720 | src/assets/bg/bg_forest_morning_1280x720.png |
| chara | chara_hero_smile_1024x1024 | src/assets/chara/chara_hero_smile_1024x1024.png |
| item | item_magic_sword_512x512 | src/assets/item/item_magic_sword_512x512.png |

### 🔗 JSON参照マッピング

| 参照元 | フィールド | 参照先 |
|-------|----------|--------|
| scenario.tags | tag | tags_for_notion.csv |
| scenario.tips | tip_id | tips.json |
| scenario.event(BATTLE) | enemyIDs | enemy.json |
| characters.skills | skill_id | skill.json |
| enemy.skills | skill_id | skill.json |
| skill.iconTag | tag | assets/skill |
| image_registry.tag | tag | assets/* |
| title.backgroundTag | tag | assets/bg |
| sound.tags | tag | scenario.tags |

### 🖼 AI画像生成フロー

**シーン切替時**:

1. シナリオJSONに画像指定があるか判定
2. 未生成の場合：
   - プロンプト生成
   - ナノバナナへ送信
   - 画像生成
3. 画像を保存
4. image_registry.jsonへ追記
5. Galleryへ即反映

---

## 6. 画面構成仕様

### 🟦 準備画面（Game Setup）

**目的**: ゲームの初期条件を決める

**設定項目**:

| 項目 | 内容 |
|-----|------|
| 世界観 | ファンタジー / SF / 現代 / 自由入力 |
| プレイ人数 | ソロ / 複数 |
| 難易度 | easy / normal / hard |
| キャラクター生成 | AI自動 / 手動設定 |
| 画像生成ON/OFF | コスト管理用 |

**出力**: `game_config.json`

---

### 🟦 Title画面

**表示要素**:
- 背景画像
- タイトルロゴ
- スタートボタン
- 設定ボタン

---

### 🟦 Chapterコール

**表示内容**:
- Chapter番号
- サブタイトル
- 簡易説明テキスト
- 演出（フェード、ズーム等）

---

### 🟦 プロローグ

**役割**:
- 世界観説明
- キャラクター導入
- 最初のシナリオトリガー

---

### 🟦 ノベルパート（メイン画面）

#### Headerエリア

| 機能 | 説明 |
|-----|------|
| 会話ログ | 過去ログ閲覧 |
| オート進行 | 選択肢まで自動再生 |
| メニュー | サブ画面表示 |

**メニュー内**:
- 🎒 アイテムリスト
- 📚 Collection（キャラ・設定）
- 🖼 Gallery
  - 生成画像一覧
  - 名前編集
  - タグ編集（`bg` / `character` / `item`）

#### Mainエリア

**レイヤー構造**:
```
[ Effect Layer ]
[ Item Layer ]
[ Character Layer ]
[ Background Layer ]
```

**表示ルール**:
- 背景：フルスクリーン
- キャラクター：下中央アンカー
- アイテム取得時：
  - 黒背景
  - 透過アイテム画像を中央表示

#### Dialogエリア

| 項目 | 内容 |
|-----|------|
| 名前 | speaker |
| テキスト | message |
| 選択肢 | choices |

---

### 🟦 バトルパート

**責務**:
- バトル進行制御
- enemy × skill の解釈
- ダメージ計算
- 勝敗判定
- 報酬反映

---

### 🟦 コレクションパート

**責務**:
- image_registry表示
- Tips閲覧
- タグ検索・フィルタ
- 進捗可視化

---

## 7. コア機能仕様

### 7.1 Managers（core/managers）

#### AssetManager
- タグからパス解決
- 画像プリロード
- キャッシュ管理

#### SoundManager
- タグ駆動BGM切替
- SE再生
- フェード制御

#### SaveManager
- セーブデータ永続化
- オートセーブ
- 複数スロット管理

#### TagResolver
- タグマッチング
- 優先度解決
- フォールバック処理

#### ScenarioManager
- storyID遷移制御
- event処理
- flag管理

---

### 7.2 Hooks（core/hooks）

| Hook | 役割 |
|------|------|
| useScenario | シナリオ進行制御 |
| useSound | サウンド再生 |
| useAsset | アセット取得 |
| useFlags | フラグ管理 |
| useSaveData | セーブ/ロード |
| useTagMatch | タグマッチング |

---

### 7.3 Part固有Manager

#### NovelManager
- 現在storyID管理
- 次ストーリー遷移
- event処理
- sound/imageトリガー発火

**典型構造**:
```typescript
class NovelManager {
  next()
  jump(storyID)
  applyEvent()
  resolveTags()
}
```

#### BattleManager
- バトルステート管理
- ターン制御
- AI思考

#### CollectionManager
- フィルタリング
- ソート
- 進捗計算

---

### 7.4 External Dependencies Checklist

各パートのREADME.mdに以下を記載：

#### Novel Part

**Managers (core/managers)**:
- [ ] ScenarioManager
- [ ] AssetManager
- [ ] SoundManager
- [ ] TagManager
- [ ] SaveManager

**Hooks (core/hooks)**:
- [ ] useScenario
- [ ] useSound
- [ ] useAsset
- [ ] useFlags
- [ ] useSaveData
- [ ] useTagMatch

**Data (data/)**:
- [ ] scenario.json
- [ ] characters.json
- [ ] sound.json
- [ ] image_registry.json

**Utilities**:
- [ ] storyID parser
- [ ] tag resolver

---

## 8. 開発フェーズ計画

### 📅 アジャイル方針（ノベルパート先行）

#### Sprint 1（優先）

✅ **ノベルパート**
- シナリオ進行
- タグ → 画像表示
- タグ → BGM切替（ダミー）
- Gallery登録
- セーブロード（最低限）

#### Sprint 2

⬜ **バトルパート**
- 戦闘システム基盤
- 敵AI実装
- スキルエフェクト

#### Sprint 3

⬜ **Collection**
- ギャラリー完成
- Tips表示
- 進捗管理

#### Sprint 4

⬜ **統合・最適化**
- パート連携
- パフォーマンス最適化
- PWA対応

---

## 9. 設計原則とルール

### ✅ 設計思想

| 原則 | 内容 |
|-----|------|
| **アセット駆動** | すべてタグで制御 |
| **JSON中心** | データが仕様の正 |
| **パート分離** | 完全独立モジュール化 |
| **再利用性** | 別プロジェクトへ移植可能 |
| **タグ統一** | Notion/CSV運用との整合 |

### 🚫 禁止事項

#### Parts層

- ❌ 永続データ管理禁止（coreへ）
- ❌ Asset直接参照禁止（AssetManager経由）
- ❌ グローバル状態直接操作禁止
- ❌ UIとロジックの混在禁止

#### Core層

- ❌ UIロジック禁止
- ❌ Part依存禁止
- ❌ 副作用はManagerに集約

#### Data層

- ❌ JSON構造を勝手に変更しない
- ❌ tag命名規則を破らない
- ❌ path直書き禁止（tag解決）
- ❌ ID重複禁止

### 📐 命名規則

#### storyID

```
EP_CH_TXT
例: 01_01_01
```

#### tags

```
{category}_{name}_{width}x{height}
例: bg_forest_morning_1280x720
```

#### ファイル名

```
{tag_key}.{ext}
例: bg_forest_morning_1280x720.png
```

### 🔧 実装ルール

#### Screens（UI専用）

- レイアウト
- 入力イベント
- 表示制御のみ
- ❌ 状態遷移ロジック禁止

#### Managers（状態と進行制御）

- 現在状態管理
- 遷移制御
- event処理
- trigger発火

### 🎯 品質基準

- **可読性**: コードよりJSONが読みやすい
- **保守性**: パート差し替えが容易
- **拡張性**: 新機能追加が安全
- **再利用性**: 別プロジェクトで使える
- **テスト性**: モック作成が容易

---

## 📚 参考リンク

- **Notion連携**: tags_for_notion.csv運用
- **React + Vite**: 公式ドキュメント
- **Google AI Studio**: API仕様
- **ナノバナナ**: 画像生成API

---

## 📋 変更履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| v2.0 | 2026-01-07 | 統合要件定義書・仕様書作成 |
| v1.1 | 2026-01-06 | アセット駆動設計拡張 |
| v1.0 | 2026-01-05 | 初版作成 |

---

**このドキュメントはプロジェクトの唯一の真実の情報源（Single Source of Truth）です。**
