# PHASE 2: CONTENT — コンテンツ入れ込みフェーズ

**期間:** 約5日（2026-04-29 ～ 2026-05-03 想定）  
**目標:** 実シナリオ・素材を入れ込み、短編ゲームを完成させ、1周通しプレイを完了させる

---

## Phase 2 Done 定義

以下がすべて完了したら、Phase 2 は **DONE** とします。

### チェックリスト（すべて必須）

```
■ シナリオ系
  □ WriterView でシナリオメモが作成できる
  □ 作成したメモが localStorage に保存される
  □ ページをリロードしてもメモが復元される
  □ シナリオメモが Markdown 形式で記述できる

■ ノベル系（実シナリオ）
  □ NovelScreen が実シナリオ JSON を読み込む
  □ 全チャプター（複数話）が順に表示される
  □ 選択肢でストーリー分岐が動作する
  □ エンド（最終チャプター）に到達できる

■ GamePackage系
  □ GamePackageScreen にゲーム設定JSON が入力できる
  □ JSON スキーマの検証が動作する（不正なJSON でエラー表示）
  □ GamePackageScreen で「Play」ボタンで再生できる
  □ GamePackageScreen のプレイヤーで、ノベル・バトルが通しプレイできる

■ その他コンテンツ
  □ キャラクター立ち絵が表示される（あれば）
  □ 背景画像が表示される（あれば）
  □ BGM・効果音が再生される（あれば）

■ 統合系
  □ Phase 1 で実装した全画面が引き続き動作する（回帰テスト）
  □ DevStudio への最終 REPORT が記録される

■ デプロイ系
  □ npm run build が成功する（0 errors）
  □ npm run dev で正常起動する
  □ ブラウザコンソールに重大エラーがない
```

---

## タスク分割サンプル

以下は推奨されるタスク分割の例です。

### グループ 1: シナリオ作成基盤（Day 1-2）

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T2-001** | WriterView UI 実装 | WriterView | Markdown エディタ＋プレビューが表示 |
| **T2-002** | ScenarioMemo localStorage | ScenarioMemo | メモ作成・保存・復元が動作 |
| **T2-003** | 実シナリオJSON スキーマ定義 | （design） | 実シナリオ用 JSON 構造を決定 |

### グループ 2: 実シナリオ入れ込み（Day 2-3）

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T2-004** | シナリオ本編 作成 | （manual） | 短編ゲームのシナリオ（複数チャプター）を markdown で作成 |
| **T2-005** | シナリオ JSON 変換 | （manual + utility） | 作成したシナリオを JSON 形式に変換・整形 |
| **T2-006** | NovelScreen 実シナリオ対応 | NovelScreen | 実シナリオ JSON を読み込み・表示 |
| **T2-007** | シナリオ分岐 実装 | ChapterScreen, ChoiceButtons | 選択肢で分岐が動作 |

### グループ 3: GamePackage（Day 3-4）

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T2-008** | GamePackageScreen JSON入力 | GamePackageScreen | JSON を入力できるテキストエリア |
| **T2-009** | GamePackageScreen JSON検証 | GamePackageScreen | JSON スキーマを検証し、エラー表示 |
| **T2-010** | GamePackageScreen プレイヤー | GamePackageScreen | 登録JSON でゲームが再生できる |

### グループ 4: 素材・統合（Day 4-5）

| Task ID | Task名 | 説明 | 期待する振る舞い |
|---|---|---|---|
| **T2-011** | キャラクター素材 入れ込み | （manual） | 立ち絵画像をゲームに配置 |
| **T2-012** | 背景素材 入れ込み | （manual） | 背景画像をシーンに配置 |
| **T2-013** | BGM・SE 実装 | （optional） | 必要に応じてオーディオを追加 |
| **T2-014** | 全体 通しプレイ テスト | （manual） | GamePackageScreen で1周エンドまで遊べる |

---

## PLAN テンプレート（T2-006 の例）

```markdown
## Task: T2-006 NovelScreen 実シナリオ対応

**概要:**
NovelScreen を実シナリオ JSON を読み込み・表示できるように拡張する。
Phase 1 のモック JSON との互換性を保つ。

**期待する振る舞い:**
- [ ] src/0420_WorkSpace/scenario/story_01.json が読み込まれる
- [ ] 実シナリオの全チャプターが順に表示される
- [ ] JSON の title, text, choices フィールドが反映される
- [ ] 選択肢をクリックで次チャプターへ遷移
- [ ] JSON を切り替えると別の物語が表示される
- [ ] Phase 1 のモック JSON でも動作する（後方互換）

**参考:**
- COMPONENT_MAP.md の `NovelScreen`, `ChapterScreen` 参照
- src/0420_WorkSpace/scenario/story_01.json の構造
- PHASE_01_ENGINE.md の モックJSON例

**実シナリオJSON例:**
```json
{
  "title": "短編「迷いの森」",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "第1章 森の入口",
      "text": "目が覚めると、そこは深い森だった...",
      "choices": [
        { "label": "右の道を行く", "nextChapter": 2 },
        { "label": "左の道を行く", "nextChapter": 3 }
      ]
    },
    ...
  ]
}
```
```

---

## CHECK リスト例（T2-006）

```
□ npm run dev で起動する
□ DevStudio → TitleScreen → NovelScreen へ遷移できる
□ NovelScreen で実シナリオが読み込まれている（タイトルで判定）
□ 第1章が表示される
□ 本文テキストが見える
□ 選択肢が表示される
□ 選択肢をクリック → 第2章または第3章へ遷移する
□ 各チャプターの本文が正しく表示される（文字化けなし）
□ ブラウザコンソールに Error が出ていない
□ Phase 1 のモック JSON でも動作確認（後方互換性）
```

---

## シナリオ作成フロー（重要）

### Step 1: シナリオ本編をMarkdown で作成

WriterView を使って、以下のような形式でシナリオを記述：

```markdown
# 短編「迷いの森」

## 第1章 森の入口
目が覚めると、そこは深い森だった。
周囲には大きな樹木と、二本の道が見える。

### 選択肢
1. 右の道を行く → 第2章へ
2. 左の道を行く → 第3章へ

## 第2章 右の道
右の道を行くと、やがて小さな小屋が見えた...

### 選択肢
1. 小屋に入る → 第4章へ
2. 先へ進む → 第5章へ

## 第3章 左の道
左の道を行くと...
```

### Step 2: JSON 形式に変換

記述したMarkdown シナリオを、以下の JSON スキーマに合わせて変換：

```json
{
  "title": "短編「迷いの森」",
  "author": "Game Creator",
  "description": "選択肢で分岐する短編冒険譚",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "第1章 森の入口",
      "text": "目が覚めると、そこは深い森だった。周囲には大きな樹木と、二本の道が見える。",
      "background": "forest_entrance.png",
      "choices": [
        {
          "label": "右の道を行く",
          "nextChapter": 2
        },
        {
          "label": "左の道を行く",
          "nextChapter": 3
        }
      ]
    },
    {
      "chapterNumber": 2,
      "title": "第2章 右の道",
      "text": "右の道を行くと、やがて小さな小屋が見えた...",
      "background": "forest_right.png",
      "choices": [
        {
          "label": "小屋に入る",
          "nextChapter": 4
        },
        {
          "label": "先へ進む",
          "nextChapter": 5
        }
      ]
    }
    // ... 以降のチャプターも同様
  ],
  "endings": [
    {
      "chapterNumber": 4,
      "title": "エンド A - 再会",
      "text": "小屋の中には...",
      "isEnding": true
    },
    {
      "chapterNumber": 5,
      "title": "エンド B - 迷宮へ",
      "text": "先へ進むと...",
      "isEnding": true
    }
  ]
}
```

### Step 3: JSON ファイルに保存

作成した JSON を以下に保存：

```
src/0420_WorkSpace/
  scenario/
    story_01.json       ← 実シナリオ（第1弾）
    story_02.json       ← （複数話あれば）
```

### Step 4: NovelScreen で読み込み

AI が NovelScreen で実シナリオ JSON を読み込むコード を実装。

---

## GamePackage JSON スキーマ

GamePackageScreen で登録するゲーム設定 JSON：

```json
{
  "gameId": "short_game_001",
  "title": "迷いの森",
  "version": "1.0.0",
  "genre": "novel",
  "scenario": {
    "type": "novel",
    "jsonUrl": "/src/0420_WorkSpace/scenario/story_01.json"
  },
  "characters": [
    {
      "characterId": "hero",
      "name": "主人公",
      "description": "冒険者",
      "asset": "/assets/characters/hero.png"
    }
  ],
  "metadata": {
    "playtime": "10-15",
    "rating": "G",
    "tags": ["冒険", "選択肢", "ファンタジー"]
  }
}
```

GamePackageScreen では、このJSON を入力・検証し、「Play」ボタンでゲームを再生できることを目指します。

---

## DevLog 記録例（T2-006）

```typescript
useDevStudioStore.getState().addLog({
  type: "AI_PROCESS",
  message: "NovelScreen を実シナリオ JSON 対応にした",
  meta: {
    taskId: "T2-006",
    files: [
      "src/screens/02_Novel/NovelScreen.tsx",
      "src/screens/02_Novel/ChapterScreen.tsx",
      "src/0420_WorkSpace/scenario/story_01.json"
    ],
    tags: ["novel", "p2", "content"]
  }
});
```

---

## Phase 2 完了時の REPORT（テンプレート）

```typescript
useDevStudioStore.getState().addReport("EPIC_002", {
  title: "開発レポート — CONTENT 完了",
  body: `
# CONTENT Phase 完了レポート

## 実装完了タスク
- [x] WriterView シナリオメモ機能
- [x] ScenarioMemo localStorage 保存
- [x] NovelScreen 実シナリオ対応
- [x] シナリオ分岐機構
- [x] GamePackageScreen JSON管理
- [x] GamePackageScreen プレイヤー

## 製作成果物

### シナリオ
- 作品名：「[シナリオ名]」
- チャプター数：X章
- 分岐：Y箇所
- エンディング：Z種類

### 素材
- キャラクター立ち絵：X枚
- 背景：Y枚
- BGM：Z曲

## ビルド確認
✓ npm run build — 成功（0 errors）
✓ npm run dev — 正常起動
✓ DevStudio 画面遷移 — 正常
✓ NovelScreen 1周通しプレイ — 完了

## 所要時間
Phase 実装: 50時間 / 予定 60時間（予定内）
シナリオ作成: 10時間
合計: 60時間

## 試作運用の成果
- DevStudio の4ステップループ（PLAN→DEV→CHECK→REPORT）が確立した
- AI開発ログ機構が正常動作
- 短編1作品を完成させた

## 次の段階へ向けた提言
- 本格運用では Epic-Task 階層をもう一段階細分化するとスケーラビリティが上がる
- AI指示の共通用語（COMPONENT_MAP）が有効に機能した
- JSON差し替え式アーキテクチャは Phase 分離に適している
  `
});
```

---

## よくある質問

### Q. シナリオはどのくらいボリュームが必要？

**A.** 10日スコープなので、**3000～5000字程度**（短編1話）を目安に。Phase 2 を5日で完了させるには、シナリオ作成 + コンテンツ入れ込み + テストを並行させる必要があります。

### Q. 立ち絵や背景がない場合は？

**A.** なくても Phase 2 は完了できます。その場合、GamePackageScreen の「プレイ」でテキストとテキスト選択肢だけ表示される形になります。素材がある場合は T2-011, T2-012 で追加実装。

### Q. GamePackageScreen の JSON検証はどこまで?

**A.** スキーマの必須フィールドがあるか、型が正しいか程度でOK。詳細な検証ロジックはPhase 2 では不要。

### Q. 複数のシナリオ・ゲームを登録したい

**A.** Phase 2 の目標は「短編1作品を完成させ、1周通しプレイを完了する」ので、複数作品登録は次の段階以降の課題です。

---

## Phase 2 完了時の成果物

以下がそろった状態で Phase 2 は完了です：

```
src/
  screens/
    02_Novel/NovelScreen.tsx          ← 実シナリオ対応
    workspace/WriterView.tsx          ← シナリオメモ
  devstudio/
    components/GamePackageScreen.tsx  ← JSON管理・プレイ
    
0420_WorkSpace/
  scenario/
    story_01.json                     ← 実シナリオ JSON
    
assets/（素材がある場合）
  characters/
    character_01.png
  backgrounds/
    background_01.png
  audio/
    bgm_01.mp3
    
docs/studio/（本ドキュメント）
```

**最重要：** GamePackageScreen で短編ゲームが1周通しプレイでき、エンドまで到達できることが Done 条件です。

---

**最終更新:** 2026-04-24
