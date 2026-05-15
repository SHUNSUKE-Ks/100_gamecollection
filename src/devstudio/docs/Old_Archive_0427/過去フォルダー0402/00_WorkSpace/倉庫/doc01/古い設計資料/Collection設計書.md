# Collection ライブラリ設計書
## Novel-PWA Engine - Collection Module Specification v1.0

---

## 1. Collection概要

### 1.1 定義
Collectionは**ゲーム内の素材ライブラリDB**であり、プレイヤーが閲覧可能な全ての情報資産を管理する。

### 1.2 責務
- 図鑑・ライブラリUIへのデータ提供
- フィルター・検索機能のデータソース
- AI発注書（Assets_OrderList）との連携

---

## 2. UI構造：Header / SubHeader

### 2.1 Navigation階層

```
Collection
├── [Header] ライブラリー (library)
│   ├── [SubHeader] 地名辞典 (background)
│   ├── [SubHeader] キャラクター図鑑 (character)
│   ├── [SubHeader] NPC図鑑 (npc)
│   ├── [SubHeader] エネミー図鑑 (enemy)
│   ├── [SubHeader] アイテム図鑑 (item_dict)
│   ├── [SubHeader] TipsDB (tips)
│   └── [SubHeader] CG・Gallery (cg_gallery)
│
├── [Header] Sound
│   ├── [SubHeader] BGM (bgm)
│   ├── [SubHeader] SE (se)
│   └── [SubHeader] Voice (voice)
│
└── [Header] ストーリー (story)
    ├── [SubHeader] メイン (main)
    └── [SubHeader] イベント (event)
```

### 2.2 Header/SubHeader対応表

| Header ID | Header名 | SubHeader ID | SubHeader名 | 対応JSON |
|-----------|----------|--------------|-------------|----------|
| library | ライブラリー | background | 地名辞典 | backgrounds.json |
| library | ライブラリー | character | キャラクター図鑑 | characters.json |
| library | ライブラリー | npc | NPC図鑑 | npcs.json |
| library | ライブラリー | enemy | エネミー図鑑 | enemies.json |
| library | ライブラリー | item_dict | アイテム図鑑 | items.json |
| library | ライブラリー | tips | TipsDB | tags.json, tips.json |
| library | ライブラリー | cg_gallery | CG・Gallery | gallery.json |
| sound | Sound | bgm | BGM | BGM/00_bgmlist01.json |
| story | ストーリー | main | メイン | episodes.json |
| story | ストーリー | event | イベント | events.json |

---

## 3. タグシステム

### 3.1 タグカテゴリ

| Category | 用途 | 例 |
|----------|------|-----|
| Affiliation | 所属・陣営 | ALLY, ENEMY |
| Class | 職業・クラス | WARRIOR, KNIGHT |
| Role | 役割 | TACTICIAN, MERCHANT |
| Type | 種別 | MONSTER |
| Species | 種族 | SLIME, DRAGON |
| Appearance | 外見特徴 | GOTHIC_LOLI, WHITE_HAIR |
| Trait | 性格・特性 | MYSTERIOUS, CHEERFUL |
| Location | 場所 | STARTING_VILLAGE, CAPITAL_CITY |
| NPCRole | NPC役割 | BLACKSMITH, INNKEEPER |
| Character | キャラ関連 | （v1.2追加） |
| Background | 背景関連 | （v1.2追加） |
| Music | 音楽関連 | （v1.2追加） |

### 3.2 タグスキーマ

```json
{
  "id": "UPPER_SNAKE_CASE",
  "name": "日本語表示名",
  "category": "CategoryName",
  "color": "#hexcolor",
  "description": "説明文"
}
```

---

## 4. フォルダ構造

### 4.1 現行構成（v1.1）

```
src/assets/data/
├── backgrounds.json
├── characters.json
├── enemies.json
├── episodes.json
├── events.json
├── gallery.json
├── items.json
├── npcs.json
├── scenario.json
├── scenarios/
├── tags.json
└── tips.json
```

### 4.2 推奨構成（v1.2）

```
src/assets/data/
├── Collection/           # ← 全ライブラリDB
│   ├── backgrounds.json
│   ├── characters.json
│   ├── enemies.json
│   ├── gallery.json
│   ├── items.json
│   ├── npcs.json
│   ├── tags.json
│   └── tips.json
├── Novel/
│   ├── scenario.json
│   ├── scenarios/
│   ├── episodes.json
│   └── events.json
├── Battle/
└── Result/
```

---

## 5. DB別フルスキーマ

### 5.1 characters.json

```json
{
  "characters": [{
    "id": "snake_case",           // 必須：一意ID
    "name": "表示名",              // 必須
    "dict": "説明文（AIプロンプト兼用）",  // 必須
    "tags": ["TAG_KEY"],          // タグ配列
    "image": "path/to/main.png",  // メイン画像
    "standing": ["path/..."],     // 立ち絵配列
    "cgs": ["path/..."]           // CG配列
  }]
}
```

### 5.2 npcs.json

```json
{
  "npcs": [{
    "id": "npc_{role}_{3digit}",  // 例: npc_merchant_001
    "name": "表示名",
    "role": "役割",
    "dict": "説明文",
    "tags": ["TAG_KEY"],
    "location": "LOCATION_TAG",
    "relatedEvents": ["event_id"],
    "image": "npc/filename.png",
    "standing": [],
    "icons": []
  }],
  "roles": [{ "id": "ROLE_KEY", "label": "表示名" }],
  "locations": [{ "id": "LOCATION_KEY", "label": "表示名" }]
}
```

### 5.3 enemies.json

```json
{
  "enemies": [{
    "id": "monster_{number}",     // 例: monster_01
    "name": "表示名",
    "label": "種族ラベル",          // カテゴリ分類用
    "tags": ["ENEMY", ...],
    "image": "Monster_XX.png",
    "rarity": 1-5,
    "stats": { "hp": 0, "mp": 0, "atk": 0, "def": 0 },
    "skills": ["スキル名"],
    "description": "説明文"
  }],
  "categories": [{ "id": "label値", "label": "表示名" }]
}
```

### 5.4 items.json

```json
{
  "categories": [{ "id": "consumable|material|key|equipment", "label": "表示名" }],
  "items": [{
    "id": "{category}_{type}_{3digit}",  // 例: potion_hp_001
    "name": "表示名",
    "category": "category_id",
    "icon": "filename.png",
    "tags": ["TAG"],
    "rarity": 1-5,
    "price": 0,
    "effect": "効果説明 or null",
    "description": "説明文"
  }]
}
```

### 5.5 backgrounds.json

```json
{
  "schema": "collection.location.v1",
  "categories": [{ "id": "village|city|nature|dungeon|building", "label": "表示名", "color": "#hex" }],
  "locations": [{
    "id": "loc_{name}",           // 例: loc_starting_village
    "name": "表示名",
    "category": "category_id",
    "description": "説明文",
    "images": ["bg/filename.png"],
    "tags": ["TAG"],
    "region": "地域名",
    "climate": "気候",
    "population": "人口",
    "relatedNpcs": ["npc_id"],
    "relatedEvents": ["event_id"],
    "order": 10
  }]
}
```

### 5.6 gallery.json

```json
{
  "schema": "collection.gallery.v1",
  "categories": [{ "id": "cg|cutin|event_movie|character|background", "label": "表示名", "color": "#hex" }],
  "images": [{
    "id": "img|cg|cutin|movie_{number}",
    "title": "タイトル",
    "filename": "path/to/file.png",
    "category": "category_id",
    "tags": ["タグ"],
    "description": "説明",
    "episode": "ep1",           // オプション
    "chapter": "ep1-ch1",       // オプション
    "videoUrl": "for movies",   // 動画用
    "duration": "2:30"          // 動画用
  }],
  "availableTags": ["使用可能タグ"]
}
```

---

## 6. Assets_OrderList連携チェック

### 6.1 対応マトリクス

| Collection DB | Order JSON | TYPE値 | 互換性 |
|---------------|------------|--------|--------|
| characters.json | character_order.json | CHARACTER | ✅ 完全対応 |
| npcs.json | npc_order.json | NPC | ✅ 完全対応 |
| enemies.json | enemy_order.json | ENEMY_SPRITE | ✅ 完全対応 |
| backgrounds.json | bg_order.json | BACKGROUND | ✅ 完全対応 |
| items.json | item_order.json | ITEM_ICON | ✅ 完全対応 |
| gallery.json | cg_gallery_order.json | CG_GALLERY | ✅ 完全対応 |
| tips.json | tips_order.json | TIPS_IMAGE | ✅ 完全対応 |
| tags.json | - | - | ⚠ 発注対象外 |

### 6.2 フィールドマッピング（NanoBanana発注用）

#### Character

| Collection Field | Order Field | 変換ルール |
|------------------|-------------|-----------|
| `id` | `ID` | そのまま |
| `name` | `NAME` | そのまま |
| `dict` | `DESCRIPTION` | そのまま |
| `tags` | `VISUAL_REFERENCE.*` | タグからパース |
| `image` | `ASSETS.STANDING[0].FILENAME` | パス変換 |
| `standing` | `ASSETS.STANDING[].FILENAME` | 配列展開 |
| `cgs` | `ASSETS.CGS[].FILENAME` | 配列展開 |

#### Enemy

| Collection Field | Order Field | 変換ルール |
|------------------|-------------|-----------|
| `id` | `ID` | そのまま |
| `name` | `NAME` | そのまま |
| `description` | `DESCRIPTION` | そのまま |
| `label` | `VISUAL_REFERENCE.SPECIES` | 種族として使用 |
| `tags` | `VISUAL_REFERENCE.*` | タグからパース |
| `image` | `OUTPUT_FILENAME` | フルパス生成 |

#### Background

| Collection Field | Order Field | 変換ルール |
|------------------|-------------|-----------|
| `id` | `ID` | そのまま |
| `name` | `NAME` | そのまま |
| `description` | `DESCRIPTION` | そのまま |
| `category` | `VISUAL_REFERENCE.SETTING` | カテゴリ変換 |
| `images[0]` | `OUTPUT_FILENAME` | パス変換 |

### 6.3 発注フロー

```
1. Collection DBからエントリ選択
2. VISUAL_REFERENCE生成（tags + description解析）
3. Order JSON生成
4. NanoBanana発注
5. 生成物受領・配置
6. Collection DB更新（pathフィールド）
```

### 6.4 互換性検証結果

| チェック項目 | 結果 |
|-------------|------|
| ID形式の一貫性 | ✅ 両方snake_case |
| ファイルパス形式 | ✅ `src/assets/...` 形式で統一 |
| サイズ指定 | ✅ TECHNICAL_SPECSに記載 |
| 必須フィールド網羅 | ✅ DB→Order変換可能 |
| 逆変換（Order→DB） | ✅ 可能（OUTPUT_FILENAME→image） |

> **結論**: NanoBanana発注に必要な情報はCollection DBから全て取得可能

---

## 7. 付録：ID命名規則一覧

| DB | ID形式 | 例 |
|----|--------|-----|
| characters | `{snake_case}` | `remi_unant` |
| npcs | `npc_{role}_{3digit}` | `npc_merchant_001` |
| enemies | `monster_{number}` | `monster_01` |
| items | `{category}_{type}_{3digit}` | `potion_hp_001` |
| backgrounds | `loc_{snake_case}` | `loc_starting_village` |
| gallery | `{type}_{3digit}` | `cg_001`, `cutin_001` |
| tags | `UPPER_SNAKE_CASE` | `CAPITAL_CITY` |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16  
**Author**: AI Assistant
