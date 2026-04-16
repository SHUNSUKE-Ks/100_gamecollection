# Hono_MiniForge — テスト検証チェックリスト

**バージョン:** v1.0  
**テスト日:** _______________  
**テスター名:** _______________  
**OS / ブラウザ:** _______________  
**Node.js バージョン:** _______________

> 凡例: `[ ]` 未確認　`[x]` OK　`[!]` NG（備考欄に内容記載）

---

## SETUP — 環境構築

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| S-1 | `node --version` が v18 以上を表示する | `[ ]` | |
| S-2 | `cd 01_Server && npm install` が正常完了する | `[ ]` | |
| S-3 | `npm run dev` または `START_SERVER.bat` でサーバーが起動する | `[ ]` | |
| S-4 | ターミナルに `Server running at http://localhost:3000` が表示される | `[ ]` | |

---

## DONE-01 — サーバー起動確認

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| D1-1 | `http://localhost:3000/` にアクセスして何らかのレスポンスが返る | `[ ]` | |
| D1-2 | サーバーがクラッシュせず継続動作する | `[ ]` | |

---

## DONE-02 / DONE-03 — BS01 コマンドバトル

### B-1: GET /api/bs01/start

```bash
curl http://localhost:3000/api/bs01/start
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| B1-1 | `"status": "ok"` が返る | `[ ]` | |
| B1-2 | `data.enemy` に name / hp / maxHp / atk / def が含まれる | `[ ]` | |
| B1-3 | `data.player` に hp / maxHp / mp / maxMp が含まれる | `[ ]` | |
| B1-4 | `data.commands` が `["攻撃","魔法","アイテム","逃げる"]` | `[ ]` | |
| B1-5 | 複数回実行するとランダムで異なる敵が出現する | `[ ]` | |

### B-2: POST /api/bs01/action — 攻撃

```bash
curl -X POST http://localhost:3000/api/bs01/action \
  -H "Content-Type: application/json" \
  -d '{"command":"攻撃","enemy_hp":70,"enemy_maxHp":70,"player_hp":100,"player_maxHp":100}'
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| B2-1 | `"status": "ok"` が返る | `[ ]` | |
| B2-2 | `data.result` が `"hit"` または `"enemy_dead"` | `[ ]` | |
| B2-3 | `data.damage` が正の整数 | `[ ]` | |
| B2-4 | `data.enemy.hp` が減っている | `[ ]` | |
| B2-5 | `data.message` にダメージ数が含まれる | `[ ]` | |
| B2-6 | 敵のHPが0になると `result: "enemy_dead"` になる | `[ ]` | |

### B-3: POST /api/bs01/action — 魔法

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| B3-1 | `data.damage` が攻撃より大きい傾向がある（15〜40程度） | `[ ]` | |
| B3-2 | `data.message` に炎の文言が含まれる | `[ ]` | |

### B-4: POST /api/bs01/action — アイテム

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| B4-1 | `data.result` が `"heal"` | `[ ]` | |
| B4-2 | `data.player.hp` が増えている（最大値を超えない） | `[ ]` | |

### B-5: POST /api/bs01/action — 逃げる

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| B5-1 | `data.result` が `"escape"` | `[ ]` | |
| B5-2 | `data.enemy_damage` が `0` | `[ ]` | |

### B-6: ブラウザ UIテスト（client_test.html）

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| B6-1 | `client_test.html` をブラウザで開ける | `[ ]` | |
| B6-2 | 「GET /api/bs01/start」ボタンで JSON が表示される | `[ ]` | |
| B6-3 | 「POST 攻撃」ボタンでダメージ結果が表示される | `[ ]` | |
| B6-4 | 「POST 魔法」「POST アイテム」「POST 逃げる」も正常動作する | `[ ]` | |

---

## DONE-04 — PZL パズルミニゲーム

### P-1: POST /api/pzl/start

```bash
curl -X POST http://localhost:3000/api/pzl/start \
  -H "Content-Type: application/json" \
  -d '{"puzzle_id":"PZL-002"}'
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| P1-1 | `"status": "ok"` が返る | `[ ]` | |
| P1-2 | `data.puzzle_id` が `"PZL-002"` | `[ ]` | |
| P1-3 | `data.title` が `"スライドパズル"` | `[ ]` | |
| P1-4 | `data.category` が `"SLIDE"` | `[ ]` | |
| P1-5 | `data.difficulty` が `2` | `[ ]` | |
| P1-6 | `data.question_text` が `"バラバラになった時計の文字盤を元に戻しなさい"` | `[ ]` | |
| P1-7 | `data.state` が `[3,1,2,6,0,5,7,8,4]` | `[ ]` | |
| P1-8 | `data.hint_count` が `3` | `[ ]` | |
| P1-9 | `data.skin_url` が `"/assets/skins/skin_detective_dark.json"` | `[ ]` | |
| P1-10 | `data.sess` に UUID が入っている | `[ ]` | |

### P-2: POST /api/pzl/action（タイル操作）

> `sess` は P-1 で取得した値を使用してください

```bash
curl -X POST http://localhost:3000/api/pzl/action \
  -H "Content-Type: application/json" \
  -d '{"sess":"（P-1で取得したsess）","move_index":4}'
```

※ 初期 state `[3,1,2,6,0,5,7,8,4]` で index=4 が空白(0)のため、隣接する index（1, 3, 5, 7）を指定してください

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| P2-1 | `"status": "ok"` が返る | `[ ]` | |
| P2-2 | `data.state` が移動後の配列になっている | `[ ]` | |
| P2-3 | 隣接していない index を指定すると `"error": "invalid move"` になる | `[ ]` | |
| P2-4 | 不正な sess を指定すると `"error": "invalid session"` になる | `[ ]` | |

### P-3: GET /api/pzl/hint/:id/:step

```bash
curl http://localhost:3000/api/pzl/hint/PZL-002/1
curl http://localhost:3000/api/pzl/hint/PZL-002/2
curl http://localhost:3000/api/pzl/hint/PZL-002/3
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| P3-1 | step 1 でヒントテキストが返る | `[ ]` | |
| P3-2 | step 2 でヒントテキストが返る | `[ ]` | |
| P3-3 | step 3 でヒントテキストが返る | `[ ]` | |
| P3-4 | 存在しない step（例: 9）で `status: "error"` が返る | `[ ]` | |
| P3-5 | 存在しない puzzle_id で `status: "error"` が返る | `[ ]` | |

### P-4: GET /api/pzl/skin/:id

```bash
curl http://localhost:3000/api/pzl/skin/skin_detective_dark
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| P4-1 | `"status": "ok"` が返る | `[ ]` | |
| P4-2 | `data.objects` 配列が含まれる | `[ ]` | |
| P4-3 | 各 object に `object_name` / `scale` / `svg` が含まれる | `[ ]` | |
| P4-4 | 存在しない skin_id で `status: "error"` が返る | `[ ]` | |

### P-5: POST /api/pzl/check（解答判定）

```bash
curl -X POST http://localhost:3000/api/pzl/check \
  -H "Content-Type: application/json" \
  -d '{"sess":"（P-1で取得したsess）"}'
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| P5-1 | `"status": "ok"` が返る | `[ ]` | |
| P5-2 | 未クリア状態で `data.cleared` が `false` | `[ ]` | |
| P5-3 | 未クリア状態で `data.next_scene_id` が `null` | `[ ]` | |

### P-6: GET /api/pzl/state/:sess（状態復元）

```bash
curl http://localhost:3000/api/pzl/state/（P-1で取得したsess）
```

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| P6-1 | `"status": "ok"` が返る | `[ ]` | |
| P6-2 | `data.puzzle_id` が `"PZL-002"` | `[ ]` | |
| P6-3 | `data.state` が現在の盤面と一致している | `[ ]` | |
| P6-4 | 不正な sess で `status: "error"` が返る | `[ ]` | |

---

## DONE-05/06 — Vercel デプロイ（該当する場合のみ）

| # | 確認項目 | 結果 | 備考 |
|---|---|---|---|
| V-1 | `vercel deploy --prod` が正常完了する | `[ ]` | |
| V-2 | デプロイ後に URL が発行される | `[ ]` | URL: |
| V-3 | 発行 URL の `/api/bs01/start` が正常レスポンスを返す | `[ ]` | |
| V-4 | 発行 URL の `/api/pzl/start` が PZL-002 の state を返す | `[ ]` | |

---

## 総合評価

| 区分 | 合格基準 | 結果 |
|---|---|---|
| SETUP | S-1〜S-4 すべて OK | `[ ]` |
| BS01 | B1〜B6 すべて OK | `[ ]` |
| PZL | P1〜P6 すべて OK | `[ ]` |
| Vercel | V-1〜V-4 すべて OK（任意） | `[ ]` |

**総合判定:** `[ ]` 合格 / `[ ]` 条件付き合格 / `[ ]` 再テスト要

---

## 備考・フィードバック

```
（自由記入欄）




```
