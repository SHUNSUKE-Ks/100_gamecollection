# JSONスキーマ定義

## 1. characters.json
```json
{
  "characters": [{
    "id": "string",           // ユニークID
    "name": "string",         // 表示名
    "description": "string",  // 説明文
    "tags": ["string"],       // タグ配列
    "image": "string",        // サムネイル
    "standing": ["string"],   // 立ち絵パス配列
    "cgs": ["string"]         // CGパス配列
  }]
}
```

## 2. enemies.json
```json
{
  "enemies": [{
    "id": "string",
    "name": "string",
    "label": "string",        // カテゴリラベル
    "tags": ["string"],
    "image": "string",
    "rarity": 1,              // レア度 1-5
    "stats": { "hp": 0, "mp": 0, "atk": 0, "def": 0 },
    "skills": ["string"],
    "description": "string"
  }],
  "categories": [{ "id": "string", "label": "string" }]
}
```

## 3. npcs.json
```json
{
  "npcs": [{
    "id": "string",
    "name": "string",
    "role": "string",         // MERCHANT, GUARD等
    "dict": "string",         // 説明
    "tags": ["string"],
    "location": "string",     // ロケーションID
    "image": "string"
  }],
  "roles": [{ "id": "string", "label": "string" }]
}
```

## 4. backgrounds.json
```json
{
  "schema": "collection.location.v1",
  "categories": [{ "id": "string", "label": "string", "color": "#hex" }],
  "locations": [{
    "id": "string",
    "name": "string",
    "category": "string",
    "description": "string",
    "images": ["string"],
    "tags": ["string"],
    "region": "string"
  }]
}
```

## 5. bgm.json / se.json
```json
{
  "bgm": [{  // または "se"
    "id": "string",
    "title": "string",
    "filename": "string",
    "description": "string",
    "tags": ["string"],
    "category": "string",     // theme, battle, field等
    "duration": null,
    "artist": "string"
  }],
  "categories": [{ "id": "string", "name": "string", "icon": "🎼" }]
}
```

## 6. events.json
```json
{
  "events": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",         // main, quest, sub
    "location": "string",
    "episode": "string",
    "chapter": "string",
    "reward": "string",
    "difficulty": 1,
    "startStoryID": "string",
    "relatedAssets": { "background": "", "bgm": "", "items": [], "enemies": [] }
  }],
  "types": [{ "id": "string", "label": "string", "color": "#hex" }]
}
```

## 7. gallery.json
```json
{
  "schema": "collection.gallery.v1",
  "categories": [{ "id": "string", "label": "string", "color": "#hex" }],
  "images": [{
    "id": "string",
    "title": "string",
    "filename": "string",
    "category": "string",
    "tags": ["string"],
    "description": "string"
  }]
}
```

## 8. items.json
```json
{
  "categories": [{ "id": "string", "label": "string" }],
  "items": [{
    "id": "string",
    "name": "string",
    "category": "string",
    "icon": "string",
    "tags": ["string"],
    "rarity": 1,
    "price": 0,
    "effect": "string",
    "description": "string"
  }]
}
```
