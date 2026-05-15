# WORKFLOW — シンプル開発ループ

Game Studio 試作運用の **超シンプル4ステップ開発ループ** の仕様書。

---

## 概要

開発は以下の4ステップを何度も繰り返す：

```
┌─────────┐
│ 1. PLAN │ ← タスク定義（1-3行）
└────┬────┘
     │
     ▼
┌─────────┐
│ 2. DEV  │ ← AI実装 + ログ記録
└────┬────┘
     │
     ▼
┌─────────┐
│ 3. CHECK│ ← 手動確認（チェックリスト）
└────┬────┘
     │
     ▼
┌──────────┐
│ 4. REPORT│ ← Phase 完了時のみ
└──────────┘
```

---

## 1. PLAN（5-10分）

### 何をする

タスク実装前に **「何を作るか」「期待する振る舞い」** を簡潔に定義する。

### フォーマット

```markdown
## Task: [タスク名]

**概要:** [1行で何を実装するか]

**期待する振る舞い:**
- [ ] ○○が表示される
- [ ] △△をクリックで××になる
- [ ] JSONデータで◎◎が変わる

**参考ファイル/コンポーネント:**
- COMPONENT_MAP.md の `ComponentName` 参照
- src/0420_WorkSpace/mock/sample.json
```

### 例

```markdown
## Task: ChapterScreen テキスト表示の実装

**概要:** NovelScreen 内でモックシナリオのテキストを表示できるようにする

**期待する振る舞い:**
- [ ] ChapterScreen がモック JSON （src/0420_WorkSpace/mock/chapter.json）を読み込む
- [ ] 本文がテキスト要素として画面に表示される
- [ ] JSONの title, text, choices フィールドが反映される

**参考:**
- COMPONENT_MAP.md の `ChapterScreen`, `ChapterText` 参照
- src/0420_WorkSpace/mock/chapter.json の構造を参照
```

---

## 2. DEV（30分～数時間）

### 何をする

AI がコンポーネントを実装する。実装後、**DevStudio にログを記録する**。

### ステップ

1. **実装** — AI が PLAN に従ってコードを書く
2. **テスト（ローカル確認）** — ブラウザで期待する振る舞いが実現されているか確認
3. **ログ記録** — `useDevStudioStore.getState().addLog()` で記録

### DevLog フォーマット

```typescript
{
  type: "AI_PROCESS",           // ログのタイプ（固定）
  message: "○○を実装した",      // 動詞で完結（日本語でOK）
  timestamp: new Date(),         // 自動挿入
  meta: {
    taskId: "TASK_001",          // （あれば）タスクID
    files: [                      // 変更したファイルパス
      "src/screens/02_Novel/ChapterScreen.tsx",
      "src/0420_WorkSpace/mock/chapter.json"
    ],
    tags: ["novel", "p1"]        // （オプション）タグ
  }
}
```

### 実装例（TypeScript）

```typescript
// 実装完了後、どこかのComponent内（例：useEffect内）または 
// AI の作業完了レポートスクリプト内で以下を実行：

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';

// ログ記録
useDevStudioStore.getState().addLog({
  type: "AI_PROCESS",
  message: "ChapterScreen にテキスト表示機能を実装した",
  meta: {
    taskId: "TASK_CH01",
    files: [
      "src/screens/02_Novel/ChapterScreen.tsx",
      "src/screens/02_Novel/components/ChapterText.tsx"
    ],
    tags: ["novel", "phase1"]
  }
});

console.log("✓ ログが記録されました");
```

### ログ記録を忘れた場合

後から手動で DevStudio の UI からログを追加できます（Logs パネルの "Add Log" ボタン）。

---

## 3. CHECK（10-20分）

### 何をする

**手動で期待する振る舞いを確認する**。期待と異なれば、AI に修正を指示。

### チェックリスト形式

PLAN の「期待する振る舞い」をチェックリストに変換：

```
□ ChapterScreen がモックJSON を読み込む
□ テキストが画面に表示される
□ JSONの title, text フィールドが反映されている
□ ブラウザコンソールにエラーが出ていない
□ 他の画面に遷移できる（回帰テスト）
```

### 確認方法

1. **ローカルサーバーで確認** — `npm run dev`
2. **DevStudioScreen → Logs** を確認 → AI ログが記録されているか
3. **ブラウザコンソール** を確認 → エラー・警告がないか

### 期待と異なる場合

AI に修正を指示：
```
ChapterScreen の修正をお願いします：
- 期待：JSONの choices 配列が選択肢として表示される
- 実現：表示されていない

src/0420_WorkSpace/mock/chapter.json の構造を確認しながら修正をお願いします
```

---

## 4. REPORT（Phase 完了時のみ）

### 何をする

**Phase が完了したら**、実装内容をまとめて **Epic にレポートを追加する**。

### フォーマット

```typescript
{
  title: "開発レポート — [Phase名] 完了",
  body: `
# [Phase名] 完了レポート

## 実装タスク一覧
- [ ] Task 1: ...
- [ ] Task 2: ...
- [ ] Task 3: ...

## アーキテクチャ / 設計決定
- JSON差し替え式で動作変更可能
- モックデータは src/0420_WorkSpace/mock/ に集約

## ビルド確認結果
✓ npm run build — 成功
✓ npm run dev — 正常起動
✓ 各画面の遷移・表示を確認済み

## 所要時間
- Phase 実装：X時間Y分
- テスト・デバッグ：A時間B分
- 計：合計 C時間D分

## 次のPhase へ向けた備考
- 〇〇について××のように設計したため、Phase 2では...
- 〇〇は手作業で入れ込む予定

## その他
（特記事項があれば）
  `
}
```

### 実装例

```typescript
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';

useDevStudioStore.getState().addReport("EPIC_001", {
  title: "開発レポート — ENGINE 完了",
  body: `
# ENGINE Phase 完了レポート

## 実装完了タスク
- [x] TitleScreen 遷移機構
- [x] NovelScreen テキスト・選択肢表示
- [x] BattleScreen UI
- [x] MenuScreen パーティ・アイテム
- [x] DevStudio ログ記録機構

## アーキテクチャ
- JSON差し替え式で全画面が動作
- モックデータは src/0420_WorkSpace/mock/ に集約
- コンポーネント命名は COMPONENT_MAP.md を遵守

## ビルド確認
✓ npm run build — 成功（0 errors, 0 warnings）
✓ npm run dev — 正常起動
✓ 全画面の表示・遷移を確認

## 所要時間
Phase 実装: 50時間 / 予定 60時間（予定内）
  `
});
```

---

## Tips & トラブルシューティング

### Q. 「PLAN」が分からない

**A.** 「どんなUIが表示されて、何がクリックできるか」を箇条書きする感じ。詳しさは不要です。

```
好例：
  期待する振る舞い：
  - モックJSONが読み込まれる
  - 本文が画面に表示される
  - 選択肢をクリックで次章へ遷移

悪例（詳すぎる）：
  JSON ファイルを src/utils/loadJSON.ts の loadChapter() メソッドで
  読み込み、その後 ChapterRenderer コンポーネント内の useEffect にて
  state にセットし...
```

### Q. ログ記録のコードが分からない

**A.** [WORKFLOW.md の 2. DEV セクション](README.md)の実装例をコピペして、`message` と `files` だけ修正してください。

### Q. チェックリストで「期待と異なる」となった。どうする？

**A.** AI に修正指示を出します。その時点では新しいログは記録せず、修正完了後に改めて「修正完了ログ」を記録します。

```typescript
// 修正前のログが既にあれば、新しい修正ログを追加
useDevStudioStore.getState().addLog({
  type: "AI_PROCESS",
  message: "ChapterScreen の選択肢表示バグを修正した",
  meta: {
    files: ["src/screens/02_Novel/ChapterScreen.tsx"],
    tags: ["bugfix"]
  }
});
```

### Q. 4ステップを進めている途中だが、別のバグを見つけた

**A.** その場では「メモ」して、現在のタスクをチェックして REPORT まで完了してから、新しいタスク（PLAN）として開始してください。

---

## チェックシート（各タスク開始時）

各タスク開始時に以下を確認：

- [ ] PLAN を1-3行で書いた
- [ ] 参考ファイル・コンポーネント（COMPONENT_MAP.md）を確認した
- [ ] AI に実装してもらった
- [ ] ローカル（npm run dev）で確認した
- [ ] addLog でログを記録した
- [ ] チェックリストで期待通りか確認した
- [ ] 問題があれば AI に修正指示した
- [ ] Phase完了 → addReport を記録した

---

**最終更新:** 2026-04-24
