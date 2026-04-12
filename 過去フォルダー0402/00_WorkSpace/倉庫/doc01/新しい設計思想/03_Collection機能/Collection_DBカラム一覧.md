# Collection ライブラリ DB カラム一覧
## 全テーブル・全フィールド定義

---

## 1. サマリ表

| DB | レコード数 | カラム数 | カテゴリ有 |
|----|-----------|---------|----------|
| characters.json | 3 | 7 | ❌ |
| npcs.json | 6+ | 11 | ❌ |
| enemies.json | 7 | 10 | ✅ |
| items.json | 6+ | 9 | ✅ |
| backgrounds.json | 7 | 13 | ✅ |
| gallery.json | 10+ | 9 | ✅ |
| tags.json | 30+ | 5 | ❌ |

---

## 2. characters.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | 一意ID（snake_case） | `"remi_unant"` |
| `name` | string | ✓ | 日本語表示名 | `"レミ・ウナント"` |
| `dict` | string | ✓ | 説明文・プロファイル | `"A mysterious..."` |
| `tags` | string[] | ✓ | タグID配列 | `["ALLY", "GOTHIC_LOLI"]` |
| `image` | string | ✓ | メイン画像パス | `"remi_unant/standing_01.png"` |
| `standing` | string[] | - | 立ち絵パス配列 | `["remi_unant/standing_01.png"]` |
| `cgs` | string[] | - | CGパス配列 | `["remi_unant/cg_event_01.png"]` |

---

## 3. npcs.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | ID（`npc_{role}_{3digit}`） | `"npc_merchant_001"` |
| `name` | string | ✓ | 日本語名 | `"マルコ"` |
| `role` | string | ✓ | 役割 | `"商人"` |
| `dict` | string | ✓ | 説明文 | `"王都で雑貨店を営む..."` |
| `tags` | string[] | ✓ | タグ配列 | `["MERCHANT", "FRIENDLY"]` |
| `location` | string | ✓ | 出現場所タグ | `"CAPITAL_CITY"` |
| `relatedEvents` | string[] | - | 関連イベントID | `["event_ch1_01"]` |
| `image` | string | - | メイン画像 | `"npc/merchant_marco.png"` |
| `standing` | string[] | - | 立ち絵パス配列 | `["npc/merchant_marco.png"]` |
| `icons` | string[] | - | アイコンパス配列 | `[]` |

---

## 4. enemies.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | ID（`monster_{number}`） | `"monster_01"` |
| `name` | string | ✓ | 敵名 | `"シャドウウルフ"` |
| `label` | string | ✓ | 種族ラベル | `"Beast"` |
| `tags` | string[] | ✓ | タグ配列 | `["ENEMY", "BEAST", "DARK"]` |
| `image` | string | ✓ | 画像ファイル名 | `"Monster_01.png"` |
| `rarity` | number | ✓ | レアリティ（1-5） | `2` |
| `stats` | object | ✓ | ステータス | `{hp, mp, atk, def}` |
| `stats.hp` | number | ✓ | HP | `85` |
| `stats.mp` | number | ✓ | MP | `15` |
| `stats.atk` | number | ✓ | 攻撃力 | `28` |
| `stats.def` | number | ✓ | 防御力 | `12` |
| `skills` | string[] | - | スキル名配列 | `["咬みつき", "シャドウバイト"]` |
| `description` | string | ✓ | 説明文 | `"闇に潜む獣..."` |

### categories 配列

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | string | ラベルID | `"Beast"` |
| `label` | string | 表示名 | `"ビースト"` |

---

## 5. items.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | ID（`{category}_{type}_{3digit}`） | `"potion_hp_001"` |
| `name` | string | ✓ | アイテム名 | `"回復薬"` |
| `category` | string | ✓ | カテゴリID | `"consumable"` |
| `icon` | string | - | アイコン画像 | `"potion_red.png"` |
| `tags` | string[] | - | タグ配列 | `["HEAL", "CONSUMABLE"]` |
| `rarity` | number | ✓ | レアリティ（1-5） | `1` |
| `price` | number | ✓ | 価格（0=売却不可） | `50` |
| `effect` | string\|null | - | 効果説明 | `"HPを30回復する"` |
| `description` | string | ✓ | 説明文 | `"傷を癒やす赤い薬..."` |

### categories 配列

| id | label |
|----|-------|
| `consumable` | 消耗品 |
| `material` | 素材 |
| `key` | 大事なもの |
| `equipment` | 装備品 |

---

## 6. backgrounds.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | ID（`loc_{name}`） | `"loc_starting_village"` |
| `name` | string | ✓ | 地名 | `"始まりの村"` |
| `category` | string | ✓ | カテゴリID | `"village"` |
| `description` | string | ✓ | 説明文 | `"主人公の冒険が始まる..."` |
| `images` | string[] | ✓ | 背景画像パス配列 | `["bg/village_day.png"]` |
| `tags` | string[] | - | タグ配列 | `["STARTING_VILLAGE", "peaceful"]` |
| `region` | string | - | 地域情報 | `"東部地方"` |
| `climate` | string | - | 気候情報 | `"温暖"` |
| `population` | string | - | 人口情報 | `"約200人"` |
| `relatedNpcs` | string[] | - | 関連NPC ID | `["npc_elder_001"]` |
| `relatedEvents` | string[] | - | 関連イベントID | `["event-4"]` |
| `dangerLevel` | number | - | 危険度（ダンジョン用） | `3` |
| `order` | number | - | 表示順 | `10` |

### categories 配列

| id | label | color |
|----|-------|-------|
| `village` | 村 | #22c55e |
| `city` | 都市 | #f59e0b |
| `nature` | 自然 | #10b981 |
| `dungeon` | ダンジョン | #8b5cf6 |
| `building` | 建物 | #6b7280 |

---

## 7. gallery.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | ID | `"cg_001"` |
| `title` | string | ✓ | タイトル | `"主人公との邂逅"` |
| `filename` | string | ✓ | ファイルパス | `"cg/meeting_scene.png"` |
| `category` | string | ✓ | カテゴリID | `"cg"` |
| `tags` | string[] | - | タグ配列 | `["メインストーリー", "レミ"]` |
| `description` | string | - | 説明 | `"魔法塔での運命的な出会い"` |
| `episode` | string | - | エピソードID | `"ep1"` |
| `chapter` | string | - | チャプターID | `"ep1-ch1"` |
| `videoUrl` | string | - | 動画URL（動画用） | `"movie/xxx.mp4"` |
| `duration` | string | - | 尺（動画用） | `"2:30"` |

### categories 配列

| id | label | color |
|----|-------|-------|
| `cg` | CG | #ec4899 |
| `cutin` | カットイン | #f59e0b |
| `event_movie` | イベント動画 | #8b5cf6 |
| `character` | キャラクター | #3b82f6 |
| `background` | 背景 | #10b981 |

---

## 8. tags.json

### カラム定義

| カラム | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `id` | string | ✓ | ID（UPPER_SNAKE_CASE） | `"ALLY"` |
| `name` | string | ✓ | 日本語名 | `"味方"` |
| `category` | string | ✓ | カテゴリ名 | `"Affiliation"` |
| `color` | string | ✓ | 表示色（hex） | `"#22c55e"` |
| `description` | string | ✓ | 説明文 | `"主人公と共に戦う仲間。"` |

### category 一覧

| Category | 用途 |
|----------|------|
| `Affiliation` | 所属・陣営 |
| `Class` | 職業・クラス |
| `Role` | 役割 |
| `Type` | 種別 |
| `Species` | 種族 |
| `Appearance` | 外見特徴 |
| `Trait` | 性格・特性 |
| `Location` | 場所 |
| `NPCRole` | NPC役割 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
