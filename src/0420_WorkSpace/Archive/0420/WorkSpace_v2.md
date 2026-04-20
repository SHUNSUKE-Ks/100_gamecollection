```markdown
# WorkSpace PM Dashboard — 構成まとめ

> 作成日: 2026-04-18

---

## 1. WorkSpace の基本構成
```

プロジェクトルート/ ├── docs*workspace/ ← MDファイルを置くフォルダ│ ├── PM_2026-04-18.md ← PM* prefix で先頭ピン留め（紫バッジ）│ ├── DevLog_2026-04-18.md ← 開発ログ │ ├── RevisionRequest_xxx.md ← 修正依頼書 │ └── SkillRegistry.md ← Skill資産台帳 │ └── src/ ├── core/types/ │ └── screen.ts ← ScreenType に 'WORKSPACE' を追加 ├── screens/ │ └── workspace/ │ └── WorkSpaceScreen.tsx └── App.tsx ← case 'WORKSPACE' を追加

````

---

## 2. Dashboard の 5 つの View

### ① PM Overview
**目的**: MDを開いた瞬間にプロジェクト全体を把握

| 要素 | 内容 |
|---|---|
| Metricカード | Sprint進捗 / Open Issues / Pending Review |
| Phase progress | フェーズ別進捗バー（緑/橙/赤で状態を色分け） |
| Today's tasks | P0〜P2タスク + 担当Agentのルーティング先 |

```markdown
[progress:68]

| Phase | 進捗 | 状態 |
|---|---|---|
| Core Loop | 82% | 順調 |
| UI/UX | 54% | 要注意 |
| Audio | 20% | 遅延 |

## Today's tasks
- [ ] バトル画面クラッシュ修正 → Code Agent
- [ ] カード演出レビュー依頼 → Review Agent
- [ ] 仕様書 v1.3 更新 → Doc Agent
````

---

### ② Dev Log Viewer

**目的**: エラー・警告ログを見て修正依頼を即生成

| 要素                     | 内容                                     |
| ------------------------ | ---------------------------------------- |
| ログ一覧                 | ERROR / WARN / OK をレベル別に色分け表示 |
| ファイル名:行番号        | どこで起きたか即わかる                   |
| 「修正依頼を作成」ボタン | ログのコンテキスト付きでClaudeにトス     |
| フィルタ                 | ERRORのみ / WARNのみ で絞り込み          |

将来のSkill: `dev-log-parser` — ビルドログを読み込んでERROR/WARNを抽出、優先度付きリストをMDに書き戻す

---

### ③ Agent Dispatch Board

**目的**: タスクをAgentに振り分けるカンバン

```
Inbox        | Code Agent   | Review Agent | Doc Agent
-------------|--------------|--------------|----------
[P0] クラッシュ | DeckStore   | UI PR #24   | (空き)
[P1] 演出RV   | refactor中  |             |
```

| Agent        | 担当領域                   | 状態    |
| ------------ | -------------------------- | ------- |
| Code Agent   | 実装・バグ修正・リファクタ | Active  |
| Review Agent | PRレビュー・品質チェック   | Active  |
| Doc Agent    | 仕様書・MD更新・翻訳       | Planned |
| Test Agent   | テスト生成・実行           | Idea    |

---

### ④ Revision Request Composer

**目的**: 修正依頼を構造化MDとして発行するフォーム

生成されるMDのフォーマット:

```markdown
# 修正依頼 — BattleResultScreen.tsx [P0]

> 作成日: 2026-04-18 | 担当Agent: Code Agent

## 問題

カード取得時にundefinedが返りクラッシュ。battleResult.cards が空の場合のguardが不足。

## 再現手順

1. バトル終了画面に遷移
2. カードが0枚の状態でresultを表示

## 期待動作 / 完了の定義

- [ ] undefined guard を追加
- [ ] カード0枚でもクラッシュしない

## 参考

- Dev Log: BattleResultScreen.tsx:87
```

---

### ⑤ Skill & Agent Registry

**目的**: Skill・Agentの資産台帳とロードマップ

| Skill                | 状態    | 用途             | 担当         |
| -------------------- | ------- | ---------------- | ------------ |
| notion-inbox         | Live    | タスク保存       | PM           |
| layout-anatomy-game  | Live    | 設計書生成       | Doc Agent    |
| pptx / docx / pdf    | Live    | ドキュメント出力 | Doc Agent    |
| dev-log-parser       | Planned | ログ→優先度変換  | Orchestrator |
| revision-request-gen | Planned | 依頼書自動生成   | Orchestrator |
| test-gen             | Idea    | テスト自動生成   | Test Agent   |

---

## 3. PM Orchestrator の設計骨子（Planned）

```
Input
  docs_workspace/*.md
  + Git ログ
  + ビルドログ
        ↓
  dev-log-parser skill
        ↓
  優先度判定 (P0 / P1 / P2)
        ↓
  ┌─────────────────────┐
  │  Code Agent         │ ← P0 バグ修正・実装
  │  Review Agent       │ ← P1 PRレビュー
  │  Doc Agent          │ ← P2 仕様書更新
  └─────────────────────┘
        ↓
Output
  修正依頼MD → docs_workspace に書き戻し
  Notionタスク → notion-inbox skill
  PR Description → GitHub MCP（将来）
```

---

## 4. 次のアクション候補

- [ ] `PM_2026-04-18.md` をテンプレートに沿って作成
- [ ] `DevLog.md` のフォーマットを決める
- [ ] `dev-log-parser` Skillの仕様書を作成
- [ ] `revision-request-gen` Skillの仕様書を作成
- [ ] PM Orchestratorの設計書を作成

```

そのまま `docs_workspace/` に保存して使えます。次は `dev-log-parser` か `PM Orchestrator` の設計書から着手しますか？
```
