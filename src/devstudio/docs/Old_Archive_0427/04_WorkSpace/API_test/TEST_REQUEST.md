# API テスト依頼書 — Hono MiniForge Server (Vercel)

**依頼日:** 2026-04-13  
**依頼元:** 開発チーム  
**テスト対象:** Vercel デプロイ済み Hono サーバー  
**テスト画面:** `100_gamecollection` → タイトル画面 → 🔌 HONO_API テスト

---

## テスト前の準備

> ローカルサーバーの起動は**不要**です。Vercel に常時デプロイ済みのサーバーへ通信します。

1. `100_gamecollection` を Vite で起動する（または既存のブラウザで開く）
2. タイトル画面から **🔌 HONO_API テスト** を選択
3. 画面右上の **Base URL** を以下に変更する

```
https://<your-vercel-url>.vercel.app
```

> ⚠️ `localhost:3000` のままだとローカルサーバーが必要になります。必ず Vercel URL に変更してください。

---

## テスト項目

### ■ サーバー疎通

- [ ] **① 死活確認**（GET `/`）
  - サイドバーの「① 死活確認」を選択 → ▶ Send をクリック
  - **期待値:** `Status: 200` / レスポンス本文 `Hono MiniForge Server`

---

### ■ パズル API

- [ ] **② パズル初期化**（POST `/api/pzl/start`）
  - Body: `{ "puzzle_id": "PZL-002", "skin_id": "skin_detective_dark" }`
  - **期待値:** `status: "ok"` / `sess` フィールドが返る / 画面上部に `sess: xxxxxxxx…` が表示される

- [ ] **③ 操作送信**（POST `/api/pzl/action`）
  - ② 実行後に `sess` が自動補完されていることを確認
  - Body: `{ "sess": "<自動補完>", "move_index": 5 }`
  - **期待値:** `status: "ok"` / `state` 配列が更新される / `cleared: false`

- [ ] **④ 解答判定**（POST `/api/pzl/check`）
  - **期待値:** `status: "ok"` / `cleared: false`（未クリア状態）

- [ ] **⑤ ヒント取得**（GET `/api/pzl/hint/PZL-002/1`）
  - **期待値:** `status: "ok"` / `text` フィールドにヒント文が入る

- [ ] **⑥ スキン取得**（GET `/api/pzl/skin/skin_detective_dark`）
  - **期待値:** `status: "ok"` / `data` にスキン定義オブジェクトが返る

- [ ] **⑦ パズル一覧**（GET `/api/pzl/list`）
  - **期待値:** `status: "ok"` / PZL-001〜010 の配列が返る

- [ ] **⑧ セッション復元**（GET `/api/pzl/state/:sess`）
  - ② 実行後に sess が取得済みであることを確認してから実行
  - **期待値:** `status: "ok"` / `puzzle_id` と `state` が返る

---

### ■ バトル API

- [ ] **⑨ バトル初期化**（GET `/api/bs01/start`）
  - **期待値:** `status: "ok"` / `enemy`・`player`・`commands` が返る

- [ ] **⑩ コマンド実行**（POST `/api/bs01/action`）
  - Body: `{ "command": "攻撃", "enemy_hp": 70, "enemy_maxHp": 70, "player_hp": 100, "player_maxHp": 100 }`
  - **期待値:** `status: "ok"` / `result: "hit"` または `"enemy_dead"` / `damage` が 0 より大きい

---

### ■ ゲームモーダル 実プレイ

- [ ] **ゲームスタートボタン動作確認**
  - ヘッダーの **🧩 ゲームスタート** をクリック → モーダルが開く

- [ ] **パズル選択 → スタート**
  - ドロップダウンで `PZL-002` を選択 → **▶ ゲームスタート** をクリック
  - **期待値:** 3×3 スライドパズルが表示される / 右側 API LOG に `→ REQ POST /api/pzl/start` と `← RES 200 OK` が表示される

- [ ] **タイル操作**
  - 光っているタイルをクリックして移動できる
  - **期待値:** タイルが動く / API LOG に `action` のリクエスト・レスポンスが追記される

- [ ] **ヒントボタン**
  - 💡 ヒント をクリック
  - **期待値:** ボード下にヒントテキストが表示される / API LOG に hint の通信が記録される

- [ ] **エラーなし確認**
  - ブラウザの DevTools（F12）→ Console にエラーが出ていないことを確認

---

## エラーパターンと対処

| 症状 | 原因 | 対処 |
|------|------|------|
| `Network Error` / `Failed to fetch` | Base URL が localhost のまま | Vercel URL に変更 |
| `Status: 404` | puzzle_id が存在しない | `PZL-001`〜`PZL-010` を使用 |
| `Status: 400 invalid session` | sess が古い or 空 | ② を再実行して sess を取得 |
| ゲームモーダルで「取得に失敗しました」 | Base URL が localhost のまま | 同上 |
| `Status: 500` | サーバー内部エラー | 開発チームに報告（ログ添付） |

---

## テスト完了後の報告方法

テストが完了したら、以下のテンプレートをコピーして開発ログとしてコメントしてください。

### 報告テンプレート

```markdown
## テスト報告 — YYYY-MM-DD

**テスト実施者:**  
**対象 Vercel URL:** https://  
**使用ブラウザ:**  

### 結果サマリー
- 全テスト項目数: 15
- 合格: __
- 失敗: __

### 失敗した項目
<!-- 失敗した番号と症状を記載 -->
- 項目番号: 
- 症状: 
- ブラウザコンソールのエラー:
  ```
  （エラーメッセージをここに貼る）
  ```

### レスポンスで気になった点
<!-- 期待値と違った点があれば記載 -->

### 総合判定
- [ ] 全項目合格 → デプロイ OK
- [ ] 一部失敗 → 開発チームへ差し戻し
```

### 報告の提出先

1. このファイルと同じフォルダ（`00_WorkSpace/API_Test/`）に以下の名前で保存
   ```
   TEST_REPORT_YYYY-MM-DD.md
   ```
2. または開発チームの Slack / チャットに貼り付け

---

## 参考

詳細な API 仕様は [README.md](./README.md) を参照してください。
