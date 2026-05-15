# Hono_MiniForge — テスト実施ガイド

**バージョン:** v1.0  
**作成日:** 2026-04-13  
**対象者:** テスター

---

## 1. 事前準備

### 必要な環境

| ソフトウェア | バージョン | 確認コマンド |
|---|---|---|
| Node.js | v18 以上 | `node --version` |
| npm | v9 以上 | `npm --version` |
| Git (任意) | 最新 | `git --version` |

> Node.js が未インストールの場合は https://nodejs.org からインストールしてください。

---

## 2. セットアップ手順

### ① プロジェクトフォルダを受け取る

テスト対象フォルダ：`Hono_MiniForge/`  
以下の構成が揃っていることを確認してください。

```
Hono_MiniForge/
├── 01_Server/          ← APIサーバー本体
├── 03_APITest/         ← テスト用HTML
└── START_SERVER.bat    ← サーバー起動ショートカット
```

### ② 依存パッケージをインストール

```bash
cd 01_Server
npm install
```

インストール完了後、`01_Server/node_modules/` フォルダが生成されます。

### ③ サーバーを起動する

**方法A — バッチファイル（Windows推奨）**

`START_SERVER.bat` をダブルクリックする。

**方法B — ターミナル**

```bash
cd 01_Server
npm run dev
```

**起動成功の確認**

ターミナルに以下が表示されれば成功です。

```
Server running at http://localhost:3000
```

---

## 3. テスト方法

### 方法A — ブラウザ UIテスト（推奨）

1. サーバーが起動した状態で、ブラウザで以下を開く  
   `03_APITest/client_test.html`  
   （ファイルをダブルクリック、または `file://` で開く）

2. 各ボタンをクリックして動作を確認する

3. 画面下の `<pre>` エリアに JSON レスポンスが表示される

### 方法B — curl コマンドでテスト

ターミナルから直接APIを叩きます。各コマンドは **チェックリスト** に記載しています。

### 方法C — ブラウザアドレスバーから直接アクセス（GET のみ）

```
http://localhost:3000/api/bs01/start
http://localhost:3000/api/pzl/hint/PZL-002/1
http://localhost:3000/api/pzl/skin/skin_detective_dark
```

---

## 4. テスト対象 API 一覧

### BS01 コマンドバトル

| # | メソッド | URL | 説明 |
|---|---|---|---|
| B-1 | GET | `/api/bs01/start` | バトル開始・敵生成 |
| B-2 | POST | `/api/bs01/action` | コマンド実行（攻撃／魔法／アイテム／逃げる） |

### PZL パズルミニゲーム

| # | メソッド | URL | 説明 |
|---|---|---|---|
| P-1 | POST | `/api/pzl/start` | パズル初期化・セッション発行 |
| P-2 | POST | `/api/pzl/action` | タイル操作 |
| P-3 | POST | `/api/pzl/check` | 解答判定 |
| P-4 | GET | `/api/pzl/hint/PZL-002/1` | ヒント取得（step 1〜3） |
| P-5 | GET | `/api/pzl/skin/skin_detective_dark` | スキンデータ取得 |
| P-6 | GET | `/api/pzl/state/{sess}` | セッション状態復元 |

---

## 5. 期待するレスポンス例

### GET /api/bs01/start

```json
{
  "status": "ok",
  "data": {
    "enemy":    { "id": "slime", "name": "スライム", "hp": 50, "maxHp": 50, "atk": 8, "def": 3 },
    "player":   { "hp": 100, "maxHp": 100, "mp": 30, "maxMp": 30 },
    "commands": ["攻撃", "魔法", "アイテム", "逃げる"]
  }
}
```

### POST /api/pzl/start

```json
{
  "status": "ok",
  "data": {
    "sess":          "（UUIDが入る）",
    "puzzle_id":     "PZL-002",
    "title":         "スライドパズル",
    "category":      "SLIDE",
    "difficulty":    2,
    "question_text": "バラバラになった時計の文字盤を元に戻しなさい",
    "state":         [3, 1, 2, 6, 0, 5, 7, 8, 4],
    "hint_count":    3,
    "skin_url":      "/assets/skins/skin_detective_dark.json"
  }
}
```

---

## 6. よくあるエラーと対処法

| エラー | 原因 | 対処 |
|---|---|---|
| `EADDRINUSE: port 3000` | 別のサーバーがポートを使用中 | タスクマネージャーで Node.js を終了してから再起動 |
| `Cannot find package 'hono'` | npm install 未実行 | `cd 01_Server && npm install` を実行 |
| `{"status":"error","error":"invalid session"}` | セッションが切れている | `/api/pzl/start` を再度実行してsessを取得する |
| ブラウザに何も表示されない | サーバー未起動 | `START_SERVER.bat` を実行してから再度開く |

---

## 7. テスト結果の報告

テスト後は **HonoMiniForge_TestChecklist.md** の各項目に結果を記入し、  
以下の情報と合わせて送付してください。

- 実施日
- OS・ブラウザのバージョン
- Node.js バージョン（`node --version` の出力）
- NGの場合はエラーメッセージのスクリーンショットまたはコピー
