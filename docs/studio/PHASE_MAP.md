# PHASE_MAP — 画面 × Phase 対応表

各画面が **どの Phase で「完成状態」になるか** を示すマップ。

---

## Phase 1: Engine（モック完成フェーズ）

**目標：** すべての画面が表示でき、JSON差し替えで動作が変わる「動くモック」を完成させる

### 対象画面と Done状態

| 画面 | 対象Component | P1 Done状態 |
|---|---|---|
| **TitleScreen** | TitleScreen | タイトル表示 + 全画面遷移ボタン表示・動作 |
| **NovelScreen** | NovelScreen, ChapterScreen, ChapterText, ChoiceButtons | モックJSON読み込み + 本文・選択肢表示 + 選択肢クリック反応 |
| **BattleScreen** | BattleScreen, BattleUI, CommandPanel | モックデータで戦闘UI表示 + コマンド操作反応 |
| **MenuScreen** | MenuScreen, PartyView, ItemView | モックデータでパーティ・アイテム表示 |
| **WorkSpaceScreen** | WorkSpaceDashboard, DevLogViewer | ダッシュボード表示 + ログビューア表示 + addLog で記録 |
| **DevStudioScreen** | PhasePanel, TasksPanel, LogsPanel, EpicsScreen | UI表示 + addLog / addReport が動作 |

### P1 Done チェックリスト

```
□ TitleScreen → 各画面遷移ボタンでnavigationが変わる
□ NovelScreen → モックJSON（chapter1, chapter2...）で本文・選択肢が表示
□ BattleScreen → モックデータで敵HP・自キャラHP・コマンドボタンが表示
□ MenuScreen → パーティメンバー・アイテム一覧がモックデータで表示
□ WorkSpaceScreen ダッシュボード → Component表示
□ DevStudioScreen → タブ切り替え可能 + addLog でログが記録される
□ 全画面遷移がスムーズ（画面が黒くなったり崩れたりしない）
□ npm run build が成功する
```

---

## Phase 2: Content（コンテンツ入れ込みフェーズ）

**目標：** 実シナリオ・素材を入れ込み、短編を完成させ、1周通しプレイを完了させる

### 対象画面と Done状態

| 画面 | 対象Component | P2 Done状態 |
|---|---|---|
| **NovelScreen** | NovelScreen, ChapterScreen | 実シナリオJSONで全話が表示でき、通しプレイ完了 |
| **BattleScreen** | BattleScreen | (Optional) 実ゲームバランスのテスト |
| **MenuScreen** | MenuScreen, PartyView | 実キャラ・実アイテムの表示 |
| **WorkSpaceScreen** | WriterView, ScenarioMemo | シナリオメモが保存・読み込みされている |
| **DevStudioScreen** | GamePackageScreen | ゲームPackage（JSON）が登録・検証済み、再生可能 |

### P2 Done チェックリスト

```
□ WriterView でシナリオメモが作成・保存・読み込み可能
□ NovelScreen で実シナリオJSONが読み込まれ、全チャプターが順に表示
□ 選択肢でストーリー分岐が動作する
□ GamePackageScreen に GamePackageJSON が登録済み
□ GamePackageScreen で「Play」ボタンでゲーム再生可能
□ 1周全通しプレイが完了（エンドまで到達）
□ キャラクター立ち絵・背景などの素材が表示されている（あれば）
□ npm run build が成功し、デプロイ準備完了
```

---

## イベント：Phase 遷移

### Phase 1 → Phase 2 への遷移条件

✓ Phase 1 Done チェックリスト全項目が完了  
✓ DevStudioScreen の REPORT が「ENGINE」Epic に追加済み  
→ Phase 2 開始

### Phase 2 完了 → 試作運用終了

✓ Phase 2 Done チェックリスト全項目が完了  
✓ DevStudioScreen の REPORT が「CONTENT」Epic に追加済み  
→ **試作運用 完了**

---

## 参考：フォルダマッピング

プロジェクト内のファイル構成：

```
src/
  screens/
    01_Title/       ← TitleScreen
    02_Novel/       ← NovelScreen, ChapterScreen
    03_Battle/      ← BattleScreen
    13_Menu/        ← MenuScreen, PartyView
    workspace/      ← WorkSpaceScreen, WriterView
  devstudio/
    DevStudioScreen.tsx
    components/
      PhasePanel.tsx
      TasksPanel.tsx
      LogsPanel.tsx
      GamePackageScreen.tsx
      
0420_WorkSpace/
  mock/
    chapter.json    ← Phase 1 用モックシナリオ
    battle.json     ← Phase 1 用モックバトルデータ
    
  scenario/         ← Phase 2 用実シナリオ
    story_ch01.json
    story_ch02.json
    ...
```

---

**最終更新:** 2026-04-24
