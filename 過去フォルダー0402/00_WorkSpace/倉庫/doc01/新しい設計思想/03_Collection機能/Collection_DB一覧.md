# Collection DB一覧
## 全JSONスキーマ詳細

---

## 1. characters.json

### スキーマ
```json
{
  "characters": [{
    "id": "snake_case",
    "name": "表示名",
    "dict": "キャラクター説明（AIプロンプト兼用）",
    "tags": ["TAG_KEY"],
    "image": "relative/path/to/main.png",
    "standing": ["path/to/standing1.png"],
    "cgs": ["path/to/cg1.png"]
  }]
}
```

### フィールド定義
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | 一意ID（snake_case） |
| `name` | string | ✓ | 日本語表示名 |
| `dict` | string | ✓ | 説明文・プロファイル |
| `tags` | array | - | タグID配列 |
| `image` | string | ✓ | メイン画像パス |
| `standing` | array | - | 立ち絵パス配列 |
| `cgs` | array | - | CGパス配列 |

### サンプルデータ
```json
{
  "id": "remi_unant",
  "name": "レミ宇ナント",
  "dict": "理の塔に住む謎の魔法使い...",
  "tags": ["ALLY", "GOTHIC_LOLI", "WHITE_HAIR", "MYSTERIOUS"],
  "image": "chara/remi_unant/standing.png",
  "standing": ["chara/remi_unant/standing.png"],
  "cgs": []
}
```

---

## 2. npcs.json

### スキーマ
```json
{
  "npcs": [{
    "id": "npc_{role}_{3digit}",
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

### フィールド定義
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | `npc_{role}_{3digit}` 形式 |
| `name` | string | ✓ | 日本語名 |
| `role` | string | ✓ | 役割（商人、長老等） |
| `dict` | string | ✓ | 説明文 |
| `tags` | array | - | タグ配列 |
| `location` | string | ✓ | 出現場所タグ |
| `relatedEvents` | array | - | 関連イベントID |
| `image` | string | - | メイン画像 |

### サンプルデータ
```json
{
  "id": "npc_merchant_001",
  "name": "マルコ",
  "role": "商人",
  "dict": "王都で雑貨店を営む陽気な商人。",
  "tags": ["MERCHANT", "FRIENDLY"],
  "location": "CAPITAL_CITY",
  "relatedEvents": ["event_ch1_01", "event_ch2_03"],
  "image": "npc/merchant_marco.png"
}
```

---

## 3. enemies.json

### スキーマ
```json
{
  "enemies": [{
    "id": "monster_{number}",
    "name": "表示名",
    "label": "種族ラベル",
    "tags": ["ENEMY", "SPECIES"],
    "image": "Monster_XX.png",
    "rarity": 1,
    "stats": { "hp": 0, "mp": 0, "atk": 0, "def": 0 },
    "skills": ["スキル名"],
    "description": "説明文"
  }],
  "categories": [{ "id": "label値", "label": "表示名" }]
}
```

### フィールド定義
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | `monster_{number}` 形式 |
| `name` | string | ✓ | 敵名 |
| `label` | string | ✓ | 種族カテゴリ |
| `tags` | array | ✓ | タグ配列 |
| `image` | string | ✓ | 画像ファイル名 |
| `rarity` | number | ✓ | レアリティ（1-5） |
| `stats` | object | ✓ | `{hp, mp, atk, def}` |
| `skills` | array | - | スキル名配列 |
| `description` | string | ✓ | 説明文 |

### サンプルデータ
```json
{
  "id": "monster_01",
  "name": "スライム",
  "label": "スライム",
  "tags": ["ENEMY", "MONSTER", "SLIME"],
  "image": "Monster_01.png",
  "rarity": 1,
  "stats": { "hp": 20, "mp": 0, "atk": 5, "def": 2 },
  "skills": ["体当たり"],
  "description": "最も弱い魔物だが、数が多いと危険。"
}
```

---

## 4. items.json

### スキーマ
```json
{
  "categories": [
    { "id": "consumable", "label": "消耗品" },
    { "id": "material", "label": "素材" },
    { "id": "key", "label": "大事なもの" },
    { "id": "equipment", "label": "装備品" }
  ],
  "items": [{
    "id": "{category}_{type}_{3digit}",
    "name": "表示名",
    "category": "category_id",
    "icon": "filename.png",
    "tags": ["TAG"],
    "rarity": 1,
    "price": 0,
    "effect": "効果説明 or null",
    "description": "説明文"
  }]
}
```

### フィールド定義
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | `{category}_{type}_{3digit}` |
| `name` | string | ✓ | アイテム名 |
| `category` | string | ✓ | カテゴリID |
| `icon` | string | - | アイコン画像 |
| `tags` | array | - | タグ配列 |
| `rarity` | number | ✓ | レアリティ（1-5） |
| `price` | number | ✓ | 価格（0=売却不可） |
| `effect` | string | - | 効果説明 |
| `description` | string | ✓ | 説明文 |

### サンプルデータ
```json
{
  "id": "potion_hp_001",
  "name": "回復薬",
  "category": "consumable",
  "icon": "potion_red.png",
  "tags": ["HEAL", "CONSUMABLE"],
  "rarity": 1,
  "price": 50,
  "effect": "HPを30回復する",
  "description": "傷を癒やす赤い薬。冒険者の必需品。"
}
```

---

## 5. backgrounds.json

### スキーマ
```json
{
  "schema": "collection.location.v1",
  "categories": [
    { "id": "village", "label": "村", "color": "#22c55e" },
    { "id": "city", "label": "都市", "color": "#f59e0b" },
    { "id": "nature", "label": "自然", "color": "#10b981" },
    { "id": "dungeon", "label": "ダンジョン", "color": "#dc2626" },
    { "id": "building", "label": "建物", "color": "#8b5cf6" }
  ],
  "locations": [{
    "id": "loc_{name}",
    "name": "表示名",
    "category": "category_id",
    "description": "説明文",
    "images": ["bg/filename.png"],
    "tags": ["TAG"],
    "region": "地域名",
    "climate": "気候",
    "population": "人口情報",
    "relatedNpcs": ["npc_id"],
    "relatedEvents": ["event_id"],
    "order": 10
  }]
}
```

### フィールド定義
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | `loc_{name}` 形式 |
| `name` | string | ✓ | 地名 |
| `category` | string | ✓ | カテゴリID |
| `description` | string | ✓ | 説明文 |
| `images` | array | ✓ | 背景画像パス配列 |
| `tags` | array | - | タグ配列 |
| `region` | string | - | 地域情報 |
| `climate` | string | - | 気候情報 |
| `relatedNpcs` | array | - | 関連NPC ID |
| `relatedEvents` | array | - | 関連イベントID |
| `order` | number | - | 表示順 |

---

## 6. gallery.json

### スキーマ
```json
{
  "schema": "collection.gallery.v1",
  "categories": [
    { "id": "cg", "label": "CG", "color": "#ec4899" },
    { "id": "cutin", "label": "カットイン", "color": "#f59e0b" },
    { "id": "event_movie", "label": "イベント動画", "color": "#8b5cf6" },
    { "id": "character", "label": "キャラクター", "color": "#3b82f6" },
    { "id": "background", "label": "背景", "color": "#10b981" }
  ],
  "images": [{
    "id": "cg_{number}",
    "title": "タイトル",
    "filename": "path/to/file.png",
    "category": "category_id",
    "tags": ["タグ"],
    "description": "説明",
    "episode": "ep1",
    "chapter": "ep1-ch1",
    "videoUrl": "movie/xxx.mp4",
    "duration": "2:30"
  }],
  "availableTags": ["使用可能タグ一覧"]
}
```

---

## 7. tags.json

### スキーマ
```json
{
  "tags": [{
    "id": "UPPER_SNAKE_CASE",
    "name": "日本語名",
    "category": "CategoryName",
    "color": "#hexcolor",
    "description": "説明文"
  }]
}
```

### タグカテゴリ一覧
| Category | 用途 | 例 |
|----------|------|-----|
| Affiliation | 所属・陣営 | ALLY, ENEMY |
| Class | 職業・クラス | WARRIOR, KNIGHT |
| Role | 役割 | TACTICIAN |
| Type | 種別 | MONSTER |
| Species | 種族 | SLIME, DRAGON |
| Appearance | 外見特徴 | GOTHIC_LOLI, WHITE_HAIR |
| Trait | 性格・特性 | MYSTERIOUS |
| Location | 場所 | STARTING_VILLAGE |
| NPCRole | NPC役割 | MERCHANT |

---

## 8. tips.json（TipsDB）

世界観Tips用。tags.jsonと連携してTipsDBとして表示。

---

## ID命名規則一覧

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
