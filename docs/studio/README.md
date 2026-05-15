# Game Studio 試作運用ドキュメント

**プロジェクト:** 短編ゲーム製作 with DevStudio  
**期間:** 10日（2026-04-24 ～ 2026-05-04 想定）  
**スコープ:** Engine完成 → Content入れ込み → 1周通しプレイ完了  
**実施者:** 一人

---

## 目的

DevStudioの試作運用を通じて、以下を達成する：

1. DevStudio の実践的な運用フロー（Plan → Dev → Check → Report）を検証
2. AI開発ログの記録・レポーティング機構を動作確認
3. 短編ゲームを1製作サイクル完成させ、フィードバックループを実感

---

## 2Phase構造

### Phase 1: Engine（~5日）
**目標:** 「動くモック」を作成し、JSON差し替えで内容が変わる状態

- スクリーンの表示・遷移が動く
- DevStudio の addLog / addReport が正常動作する
- モックデータ（JSON）で全スクリーンが表示される

**対象コンポーネント:** [COMPONENT_MAP.md](COMPONENT_MAP.md) の **Phase P1** 参照

**Done定義:** [PHASE_01_ENGINE.md](phases/PHASE_01_ENGINE.md) 参照

### Phase 2: Content（~5日）
**目標:** 実シナリオ・素材を入れ込み、短編を完成させる

- 実シナリオJSON の登録・表示
- シナリオメモの作成・保存
- GamePackage の登録・プレイ確認

**対象コンポーネント:** [COMPONENT_MAP.md](COMPONENT_MAP.md) の **Phase P2** 参照

**Done定義:** [PHASE_02_CONTENT.md](phases/PHASE_02_CONTENT.md) 参照

---

## ファイル一覧と読む順序

| ファイル | 用途 | いつ読むか |
|---|---|---|
| [COMPONENT_MAP.md](COMPONENT_MAP.md) | **AI指示の共通用語テーブル** | 毎回のタスク作成時 |
| [PHASE_MAP.md](PHASE_MAP.md) | 画面×Phase対応表 | Phase遷移時 |
| [WORKFLOW.md](WORKFLOW.md) | 開発ループの仕様 | 初回＋スタックしたとき |
| [phases/PHASE_01_ENGINE.md](phases/PHASE_01_ENGINE.md) | Phase1の詳細＆Done定義 | Phase1開始時 |
| [phases/PHASE_02_CONTENT.md](phases/PHASE_02_CONTENT.md) | Phase2の詳細＆Done定義 | Phase2開始時 |

---

## 運用フロー（超シンプル版）

### 1. PLAN（5-10分）
タスクを実装する前に、「何を作る」「期待する振る舞い」を1-3行で定義する。

```
【タスク名】TitleScreen 画面遷移ボタン実装
【期待する振る舞い】TitleScreenにボタンが表示され、クリックで各画面に遷移する
【参考】COMPONENT_MAP.md の TitleScreen 参照
```

### 2. DEV（30分～）
AI がコンポーネントを実装し、実装完了後に以下でログを記録：

```ts
useDevStudioStore.getState().addLog({
  type: "AI_PROCESS",
  message: "TitleScreen に各画面遷移ボタンを実装した",
  meta: {
    files: ["src/screens/01_Title/TitleScreen.tsx"],
    taskId: "TASK_001"
  }
})
```

### 3. CHECK（10-20分）
期待する振る舞いが実現されているか手動で確認。

```
□ TitleScreenが表示される
□ ボタンがクリックできる
□ ボタン: Novel → NovelScreen へ遷移
□ ボタン: Battle → BattleScreen へ遷移
```

### 4. REPORT（Phase完了時）
Phase 完了時に、実装内容をまとめてレポートを作成：

```ts
useDevStudioStore.getState().addReport("EPIC_001", {
  title: "開発レポート — Engine Phase 完了",
  body: `
## 完了タスク
- TitleScreen 遷移機構
- NovelScreen ADV表示
- BattleScreen UI
- DevStudio ログ記録機構

## アーキテクチャ決定事項
- JSON差し替えで動作変更可能な設計
- モックデータは src/0420_WorkSpace/mock/ に集約

## ビルド確認
✓ npm run build 成功
✓ デプロイ不要（ローカル検証済み）
  `
})
```

---

## DevStudio への連携

このプロジェクトでは **DevStudio 内の Epic** として以下を登録：

- **Epic 1:** `ENGINE` — Phase 1 全タスク
- **Epic 2:** `CONTENT` — Phase 2 全タスク

各Task完了時に `addLog` で記録。各Epic（Phase）完了時に `addReport` で提出。

---

## トラブルシューティング

### Q. コンポーネント名が分からない
→ [COMPONENT_MAP.md](COMPONENT_MAP.md) を確認して、Screen ごとのコンポーネント一覧を参照

### Q. この画面は Phase 1 でやるの？ Phase 2 でやるの？
→ [PHASE_MAP.md](PHASE_MAP.md) を確認

### Q. 開発ログの形式が分からない
→ [WORKFLOW.md](WORKFLOW.md) の DevLog フォーマットを参照

### Q. Phase 1 の Done 条件は？
→ [PHASE_01_ENGINE.md](phases/PHASE_01_ENGINE.md) の "Done定義" を確認

---

**作成日:** 2026-04-24  
**最終更新:** 2026-04-24
