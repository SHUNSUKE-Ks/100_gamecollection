# BS01_CommandBattle_API — 連携マニュアル
**バージョン**: v1.0  
**更新日**: 2026-03-03  
**対象**: 本APIを呼び出す外部アプリケーション / AI

---

## 1. 概要

BS01_CommandBattle_API は、**コマンドバトル（ドラクエ風）の戦闘ロジック**をAPI経由で提供するサーバーです。  
クライアント側は「表示と入力」に徹し、**ダメージ計算・勝敗判定・報酬配布**はすべてサーバーが処理します。

```
┌──────────────┐        JSON        ┌──────────────────┐
│  クライアント  │ ◄─────────────── │  BS01 API Server  │
│  (表示/入力)   │ ──────────────► │  (ロジック/素材)   │
└──────────────┘    HTTP REST       └──────────────────┘
```

---

## 2. 接続情報

| 項目 | 値 |
|------|----|
| ベースURL | `http://localhost:3000` |
| プロトコル | HTTP REST (JSON) |
| CORS | 全オリジン許可済み |
| Content-Type | `application/json` |

---

## 3. API エンドポイント

### 3.1 ヘルスチェック

```
GET /api/bs01/health
```

サーバーの状態とデータ整合性を確認します。

**レスポンス例:**
```json
{
  "status": "ok",
  "checks": [
    { "id": "M001", "file": "/assets/images/enemies/slime.svg", "exists": true },
    { "id": "M001", "field": "HP", "type": "number", "valid": true }
  ]
}
```

---

### 3.2 バトル開始

```
GET /api/bs01/start
```

新しいバトルを開始し、モンスター情報・シーン情報・コマンド一覧を返します。  
**※ 必ずバトル開始前に呼び出してください。**

**レスポンス例:**
```json
{
  "status": "start",
  "monster": {
    "id": "M001",
    "name": "スライム",
    "hp": 15,
    "maxHp": 15,
    "at": 5,
    "df": 3,
    "speed": 2,
    "image": "<svg>...（インラインSVG）...</svg>"
  },
  "scene": {
    "name": "森のほこら",
    "bg": "<svg>...（背景SVG）...</svg>"
  },
  "commands": [
    { "id": "cmd_attack", "name": "たたかう", "type": "physical", "effect": { "target": "enemy", "baseDamage": "AT", "variance": 3 } },
    { "id": "cmd_magic",  "name": "じゅもん", "type": "magic",    "effect": { "target": "enemy", "baseDamage": 10, "mpCost": 5 } },
    { "id": "cmd_flee",   "name": "にげる",   "type": "utility",  "effect": { "successRate": 0.5 } }
  ]
}
```

---

### 3.3 アクション実行

```
POST /api/bs01/action
Content-Type: application/json
```

プレイヤーのコマンドを送信し、結果を受け取ります。

**リクエストボディ:**
```json
{
  "commandId": "cmd_attack"
}
```

| commandId | 説明 |
|-----------|------|
| `cmd_attack` | 物理攻撃（AT基準 ± 乱数ダメージ） |
| `cmd_magic` | 魔法攻撃（固定10 + 乱数） |
| `cmd_flee` | 逃走（50%で成功） |

**レスポンス例（通常攻撃）:**
```json
{
  "damage": 6,
  "message": "6 のダメージを与えた！",
  "remainingHp": 9,
  "isDefeated": false
}
```

**レスポンス例（敵撃破）:**
```json
{
  "damage": 7,
  "message": "7 のダメージを与えた！",
  "remainingHp": 0,
  "isDefeated": true,
  "reward": {
    "gold": 10,
    "item": "やくそう"
  }
}
```

**レスポンス例（逃走成功）:**
```json
{
  "fled": true,
  "message": "うまく逃げ切れた！"
}
```

**レスポンス例（逃走失敗）:**
```json
{
  "damage": 0,
  "message": "しかし まわりこまれてしまった！",
  "remainingHp": 15,
  "isDefeated": false
}
```

**エラーレスポンス（バトル未開始時）:**
```json
{
  "error": "No active battle"
}
```
HTTP Status: `400`

---

## 4. バトルフロー（実装手順）

AIがクライアントアプリに組み込む際の推奨フローです。

```
Step 1: GET /api/bs01/health     ← サーバー正常確認
  ↓
Step 2: GET /api/bs01/start      ← バトル開始、monster/scene/commands取得
  ↓
Step 3: 画面にモンスター・背景を描画
  ↓                               ┌─────────────────────┐
Step 4: POST /api/bs01/action ←──┤ ユーザーがコマンド選択 │
  ↓                               └─────────────────────┘
Step 5: レスポンスに基づいてHP更新・演出
  ↓
Step 6: isDefeated == true ?
  ├── YES → reward を表示 → バトル終了 → 次のシーンへ
  └── NO  → Step 4 に戻る（ループ）
```

---

## 5. 実装サンプルコード

### JavaScript (fetch)

```javascript
const API = 'http://localhost:3000/api/bs01';

// バトル開始
async function startBattle() {
    const res = await fetch(`${API}/start`);
    const data = await res.json();
    // data.monster.name → "スライム"
    // data.monster.image → SVG文字列（innerHTMLに挿入）
    // data.commands → コマンド一覧
    return data;
}

// アクション実行
async function doAction(commandId) {
    const res = await fetch(`${API}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId })
    });
    const result = await res.json();
    // result.damage → ダメージ値
    // result.remainingHp → 残りHP
    // result.isDefeated → true なら勝利
    // result.reward → { gold, item }（勝利時のみ）
    return result;
}
```

### Python (requests)

```python
import requests

API = 'http://localhost:3000/api/bs01'

# バトル開始
res = requests.get(f'{API}/start')
data = res.json()
print(f"敵: {data['monster']['name']} HP: {data['monster']['hp']}")

# 攻撃
res = requests.post(f'{API}/action', json={'commandId': 'cmd_attack'})
result = res.json()
print(f"ダメージ: {result['damage']}  残りHP: {result['remainingHp']}")
```

---

## 6. JSONカード仕様

### Enemy Card (`data/enemies/`)

| キー | 型 | 説明 |
|------|----|------|
| MonsterID | string | 一意の敵ID（例: "M001"） |
| Name | string | 敵の名前 |
| HP | number | ヒットポイント |
| MP | number | マジックポイント |
| AT | number | 攻撃力 |
| DF | number | 防御力 |
| Speed | number | 素早さ |
| ImagePath | string | SVG画像パス |
| Reward | object | `{ gold: number, item: string }` |

### Action Card (`data/actions/`)

| キー | 型 | 説明 |
|------|----|------|
| commands | array | コマンド配列 |
| commands[].id | string | コマンドID |
| commands[].name | string | 表示名 |
| commands[].type | string | "physical" / "magic" / "utility" |
| commands[].effect | object | 効果定義 |

### Scene Card (`data/scenes/`)

| キー | 型 | 説明 |
|------|----|------|
| sceneId | string | シーンID |
| name | string | シーン名 |
| backgroundPath | string | 背景SVGパス |
| bgmId | string | BGM識別子 |
| weather | string | 天候 |

---

## 7. 注意事項

> [!IMPORTANT]
> - バトルは1つのみ同時進行可能（サーバーメモリ上で管理）
> - `/start` を再度呼ぶと前のバトルはリセットされます
> - SVG画像はインライン文字列として返却されるため、`innerHTML` に直接挿入可能です

> [!WARNING]
> - サーバー再起動でバトル状態は失われます
> - 現時点ではプレイヤーのHP管理は未実装です（敵のみ）

---

## 8. サーバー起動方法

```bash
cd 01_Server
npm install        # 初回のみ
node server.js     # サーバー起動 → http://localhost:3000
```

起動時に以下のログが出力されれば正常です:
```
Test01_"開発環境の構築完了"
  → Enemies loaded: 1
  → Actions loaded: 3
  → Scenes  loaded: 1
========================================
  BS01 API Server: http://localhost:3000
========================================
```
