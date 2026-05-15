# ゲーム素材制作スタジオ

## 概要
ComfyUI v0.11.1 を使ったゲーム素材・立ち絵・音楽の
自動生成ワークフローを管理するAI制作スタジオ。

## 所属Agent

| Agent名 | 役割 | 起動キーワード例 |
|---------|------|----------------|
| Illustrator | 立ち絵・差分・表情生成 | 「立ち絵」「差分」「表情」 |
| Refiner | 加工・ControlNet・背景除去 | 「加工」「ポーズ」「背景除去」 |
| Pixeler | ピクセルアート・タイル素材 | 「ピクセル」「ドット」「タイル」 |
| Composer | BGM・音楽・SE生成 | 「BGM」「音楽」「ACE」 |
| Planner | 計画・資料・スプリント管理 | 「計画」「WBS」「スプリント」 |
| Manager | 成果物レビュー・品質管理 | 「レビュー」「評価」「チェック」 |

## 全Agent共通ルール

1. **ENV.md を必ず最初に参照する**
   `agents/_shared/ENV.md` を読んでからタスクを開始する

2. **納品は delivery/ に統一する**
   `agents/_shared/SUBMISSION_RULE.md` のフォーマットを守る

3. **既存ワークフローを流用する**
   ゼロから作らず、ENV.md のワークフロー一覧から選ぶ

4. **モデルを勝手に変更しない**
   ENV.md のモデル選定ルールに従う

5. **パスはハードコーディング禁止**
   必ずENV.md のパス一覧を参照する

## ComfyUI環境
- バージョン: v0.11.1
- 起動: BAT経由必須（直接CMD禁止）
- 詳細: `agents/_shared/ENV.md` 参照

## 納品・レビューフロー
```
各Agent → delivery/YYYY-MM-DD_task/ に納品
                    ↓
Manager → /review で評価
                    ↓
PASS → delivery/reviewed/ に移動
REVISION → 担当Agentに差戻し
```
