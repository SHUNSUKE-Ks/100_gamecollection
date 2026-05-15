# Hono MiniForge — API テスト資料

**Base URL:** `https://<your-url>.vercel.app`  
**ローカル URL:** `http://localhost:3000`

> `<your-url>` は Vercel のデプロイ URL に置き換えてください。

---

## エンドポイント一覧

| # | Method | Path | 説明 |
|---|--------|------|------|
| 1 | GET  | `/` | サーバー死活確認 |
| 2 | POST | `/api/pzl/start` | パズル初期化 |
| 3 | POST | `/api/pzl/action` | 操作送信（スライド移動など） |
| 4 | POST | `/api/pzl/check` | 解答最終判定 |
| 5 | GET  | `/api/pzl/hint/:id/:step` | ヒント取得 |
| 6 | GET  | `/api/pzl/skin/:id` | スキンJSON取得 |
| 7 | GET  | `/api/pzl/list` | パズル一覧 |
| 8 | GET  | `/api/pzl/state/:sess` | セッション状態復元 |
| 9 | GET  | `/api/bs01/start` | バトル初期化 |
| 10 | POST | `/api/bs01/action` | コマンド実行 |

---

## 1. サーバー死活確認

```
GET /
```

**期待レスポンス:**
```
Hono MiniForge Server
```

---

## 2. POST /api/pzl/start — パズル初期化

**リクエスト:**
```json
{
  "puzzle_id": "PZL-002",
  "skin_id": "skin_detective_dark"
}
```

> `puzzle_id` / `skin_id` は省略可（デフォルト: `PZL-002` / `skin_detective_dark`）

**利用可能な puzzle_id:**
| ID | 名前 |
|----|------|
| PZL-001 | NumberBridge |
| PZL-002 | SlidePuzzle（スライドパズル） |
| PZL-003 | Matchstick |
| PZL-004 | Balance |
| PZL-005 | CaesarCipher |
| PZL-006 | SilhouetteMatch |
| PZL-007 | ColorSort |
| PZL-008 | MemoryMatch |
| PZL-009 | Maze |
| PZL-010 | LightSwitch |

**成功レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "sess": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "puzzle_id": "PZL-002",
    "title": "スライドパズル",
    "category": "slide",
    "difficulty": 2,
    "question_text": "バラバラになった絵を並べ直せ",
    "state": [1, 2, 3, 4, 5, 6, 7, 8, 0],
    "extra": null,
    "hint_count": 3,
    "skin_url": "/assets/skins/skin_detective_dark.json"
  }
}
```

> `sess` は以降のリクエストで必要。必ず保存してください。

---

## 3. POST /api/pzl/action — 操作送信

**リクエスト（スライドパズル専用）:**
```json
{
  "sess": "<start で取得した sess>",
  "move_index": 5
}
```

> `move_index`: 0〜8 の数値（3×3グリッドのインデックス）。空白マスに隣接するマスのみ有効。

**リクエスト（汎用 state 送信）:**
```json
{
  "sess": "<sess>",
  "state": [1, 2, 3, 4, 5, 6, 0, 7, 8]
}
```

**成功レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "state": [1, 2, 3, 4, 5, 6, 0, 7, 8],
    "cleared": false
  }
}
```

**エラー（無効な移動）:**
```json
{
  "status": "error",
  "error": "invalid move"
}
```

---

## 4. POST /api/pzl/check — 解答最終判定

**リクエスト:**
```json
{
  "sess": "<sess>"
}
```

**クリア時レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "cleared": true,
    "state": [1, 2, 3, 4, 5, 6, 7, 8, 0],
    "clear_text": "見事！パズルを解いた！",
    "reward_item_id": "item_magnifier",
    "next_scene_id": "scene_after_PZL-002"
  }
}
```

**未クリア時レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "cleared": false,
    "state": [...],
    "clear_text": null,
    "reward_item_id": null,
    "next_scene_id": null
  }
}
```

---

## 5. GET /api/pzl/hint/:id/:step — ヒント取得

```
GET /api/pzl/hint/PZL-002/1
```

**レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "puzzle_id": "PZL-002",
    "step": 1,
    "text": "まず角のピースから動かしてみよう",
    "cost": 10
  }
}
```

---

## 6. GET /api/pzl/skin/:id — スキンJSON取得

```
GET /api/pzl/skin/skin_detective_dark
```

**レスポンス:**
```json
{
  "status": "ok",
  "data": { ...skin定義オブジェクト... }
}
```

---

## 7. GET /api/pzl/list — パズル一覧

```
GET /api/pzl/list
```

**レスポンス:**
```json
{
  "status": "ok",
  "data": [
    { "id": "PZL-001", "title": "...", "category": "...", "difficulty": 1 },
    { "id": "PZL-002", "title": "...", "category": "slide", "difficulty": 2 },
    ...
  ]
}
```

---

## 8. GET /api/pzl/state/:sess — セッション状態復元

```
GET /api/pzl/state/<sess>
```

**レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "sess": "<sess>",
    "puzzle_id": "PZL-002",
    "state": [1, 2, 3, 4, 5, 6, 7, 8, 0]
  }
}
```

---

## 9. GET /api/bs01/start — バトル初期化

```
GET /api/bs01/start
```

**レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "enemy": { "id": "goblin", "name": "ゴブリン", "hp": 70, "maxHp": 70, "atk": 12, "def": 5 },
    "player": { "hp": 100, "maxHp": 100, "mp": 30, "maxMp": 30 },
    "commands": ["攻撃", "魔法", "アイテム", "逃げる"]
  }
}
```

---

## 10. POST /api/bs01/action — コマンド実行

**リクエスト:**
```json
{
  "command": "攻撃",
  "enemy_hp": 70,
  "enemy_maxHp": 70,
  "player_hp": 100,
  "player_maxHp": 100
}
```

**利用可能なコマンド:** `攻撃` / `魔法` / `アイテム` / `逃げる`

**レスポンス:**
```json
{
  "status": "ok",
  "data": {
    "result": "hit",
    "damage": 12,
    "enemy_damage": 7,
    "message": "12のダメージ！",
    "enemy": { "hp": 58, "maxHp": 70 },
    "player": { "hp": 93, "maxHp": 100 }
  }
}
```

**result の種類:**
| result | 説明 |
|--------|------|
| `hit` | 攻撃が当たった（敵の反撃あり） |
| `enemy_dead` | 敵を倒した |
| `heal` | アイテムで回復 |
| `escape` | 逃げた |

---

## curl サンプル集

```bash
BASE=https://<your-url>.vercel.app

# 死活確認
curl $BASE/

# パズル一覧
curl $BASE/api/pzl/list

# パズル開始
curl -X POST $BASE/api/pzl/start \
  -H "Content-Type: application/json" \
  -d '{"puzzle_id":"PZL-002"}'

# スライド移動（sess は start レスポンスから取得）
curl -X POST $BASE/api/pzl/action \
  -H "Content-Type: application/json" \
  -d '{"sess":"<sess>","move_index":5}'

# ヒント取得
curl $BASE/api/pzl/hint/PZL-002/1

# バトル開始
curl $BASE/api/bs01/start

# バトルコマンド
curl -X POST $BASE/api/bs01/action \
  -H "Content-Type: application/json" \
  -d '{"command":"攻撃","enemy_hp":70,"enemy_maxHp":70,"player_hp":100,"player_maxHp":100}'
```

---

## 注意事項

- **セッションはサーバー再起動で消えます。** Vercel Serverless はステートレスなため、デプロイ・関数の再起動のたびにセッションがリセットされます。テスト時は `start` → `action` → `check` を1セッション内で連続実行してください。
- **CORS許可オリジン:** `localhost:5173`, `localhost:4173`, `localhost:3000`（本番追加は Vercel 環境変数 `GAME_CENTER_ORIGIN` で設定）
