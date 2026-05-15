# PHASE 1: ENGINE — モック完成フェーズ

**期間:** 約5日（2026-04-24 ～ 2026-04-28 想定）  
**目標:** すべての画面が表示でき、JSONデータを差し替えると動作が変わる「動くモック」を完成させる

---

## Phase 1 Done 定義

以下がすべて完了したら、Phase 1 は **DONE** とします。

### チェックリスト（すべて必須）

```
■ UI表示系
  □ TitleScreen が表示される
  □ NovelScreen（チャプター表示）が動作する
  □ BattleScreen が表示される
  □ MenuScreen（パーティ・アイテム）が表示される
  □ WorkSpaceScreen（ダッシュボード・ログ）が表示される
  □ DevStudioScreen が表示される

■ インタラクション系
  □ TitleScreen のボタンクリックで各画面に遷移できる
  □ NovelScreen で選択肢をクリックすると次チャプターに進む
  □ BattleScreen でコマンドボタンが反応する
  □ MenuScreen でパーティ・アイテムタブが切り替わる

■ JSON差し替え系
  □ NovelScreen が JSON を読み込み、チャプタータイトル・本文・選択肢が反映される
  □ JSON を修正するとNovelScreen の表示が変わる
  □ BattleScreen がモック JSON で敵・味方情報が表示される

■ DevStudio連携系
  □ addLog で開発ログが記録される
  □ DevStudio の Logs パネルに記録されたログが表示される
  □ DevStudio の PhasePanel・TasksPanel・LogsPanel が表示される

■ ビルド系
  □ npm run build が成功する（0 errors）
  □ npm run dev で正常起動する
  □ ブラウザコンソールに重大エラーがない

■ 全体系
  □ 画面遷移がスムーズ（黒くなったり崩れたりしない）
  □ すべての画面を一通り遊べる（1周通しプレイ可能）
```

---

## タスク分割サンプル

以下は推奨されるタスク分割の例です。すべてをこなす必要はなく、柔軟に調整してください。

### グループ 1: 基盤 (Day 1)

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T1-001** | TitleScreen 基本表示 | TitleScreen | タイトル画像・テキストが表示される |
| **T1-002** | TitleScreen 遷移ボタン | TitleScreen | 各画面へのボタンが配置でき、クリックで遷移 |
| **T1-003** | モックJSON 構造定義 | （design） | chapter, battle, menu の JSON スキーマを定義 |

### グループ 2: ノベル（Day 2-3）

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T1-004** | NovelScreen 基本表示 | NovelScreen | 画面コンテナが表示される |
| **T1-005** | ChapterScreen テキスト | ChapterScreen, ChapterText | モックJSON で本文が表示される |
| **T1-006** | ChapterScreen 選択肢 | ChapterScreen, ChoiceButtons | 選択肢が表示され、クリックで反応 |
| **T1-007** | NovelScreen チャプター遷移 | NovelScreen | 選択肢クリックで次チャプターへ遷移 |

### グループ 3: バトル・メニュー（Day 3-4）

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T1-008** | BattleScreen 基本表示 | BattleScreen, BattleUI | モック敵・自キャラHP が表示 |
| **T1-009** | BattleScreen コマンド | BattleScreen, CommandPanel | コマンドボタンが反応する |
| **T1-010** | MenuScreen 基本表示 | MenuScreen, PartyView, ItemView | パーティ・アイテムタブが表示 |
| **T1-011** | MenuScreen タブ切り替え | MenuScreen | タブをクリックで画面が切り替わる |

### グループ 4: DevStudio 連携（Day 4-5）

| Task ID | Task名 | コンポーネント | 期待する振る舞い |
|---|---|---|---|
| **T1-012** | DevStudio PhasePanel | PhasePanel | 現在 Phase の情報が表示 |
| **T1-013** | DevStudio ログ記録 | （utility） | addLog でログが記録される |
| **T1-014** | DevStudio Logs表示 | LogsPanel | 記録されたログが表示される |
| **T1-015** | DevStudio Report送信 | （utility） | addReport で Report が追加される |

---

## PLAN テンプレート（T1-005 の例）

```markdown
## Task: T1-005 ChapterScreen テキスト表示

**概要:** 
NovelScreen 内で、モックJSONのチャプター情報（タイトル・本文）を読み込み、画面に表示する

**期待する振る舞い:**
- [ ] src/0420_WorkSpace/mock/chapter.json が読み込まれる
- [ ] JSON の title フィールドが画面に表示される
- [ ] JSON の text フィールドが本文として表示される
- [ ] JSON を修正すると、NovelScreen の表示が変わる
- [ ] ブラウザコンソールにエラーが出ない

**参考:**
- COMPONENT_MAP.md の `ChapterScreen`, `ChapterText` 参照
- src/0420_WorkSpace/mock/chapter.json の構造

**モックJSON例:**
```json
{
  "chapterNumber": 1,
  "title": "第1章 始まり",
  "text": "主人公はある朝、目が覚めた...",
  "choices": [
    { "label": "外に出る", "nextChapter": 2 },
    { "label": "寝る", "nextChapter": 1 }
  ]
}
```
```

---

## CHECK リスト例（T1-005）

```
□ npm run dev で起動する
□ TitleScreen から NovelScreen に遷移できる
□ ChapterScreen が表示される
□ 本文テキストが見える
□ JSON の title が画面に反映されている
□ JSON を修正して localhost をリロード → 内容が変わる
□ ブラウザコンソールに Error が出ていない
```

---

## DevLog 記録例（T1-005）

```typescript
useDevStudioStore.getState().addLog({
  type: "AI_PROCESS",
  message: "ChapterScreen にテキスト表示機能を実装した",
  meta: {
    taskId: "T1-005",
    files: [
      "src/screens/02_Novel/ChapterScreen.tsx",
      "src/screens/02_Novel/components/ChapterText.tsx",
      "src/0420_WorkSpace/mock/chapter.json"
    ],
    tags: ["novel", "p1", "ch01"]
  }
});
```

---

## モックデータ配置

モックデータは以下に集約してください：

```
src/0420_WorkSpace/
  mock/
    chapter.json      ← ノベルのチャプター情報
    battle.json       ← バトルのモックデータ
    menu.json         ← メニュー（パーティ・アイテム）のモック
    index.ts          ← 各JSON をエクスポート
```

`index.ts` の例：
```typescript
export { default as mockChapter } from './chapter.json';
export { default as mockBattle } from './battle.json';
export { default as mockMenu } from './menu.json';
```

コンポーネント側での読み込み：
```typescript
import { mockChapter } from '@/0420_WorkSpace/mock';

useEffect(() => {
  // mockChapter を使ってUI を描画
}, []);
```

---

## よくある質問

### Q. すべてのタスクをこなす必要がある？

**A.** いいえ。Phase 1 Done チェックリストの項目がすべて完了すれば、タスク分割は柔軟に調整してOK。

### Q. JSON の正確なスキーマを決めておくべき？

**A.** Phase 1 では大まかなスキーマで十分。「chapter に title と text と choices があればOK」くらいで。Phase 2 でシナリオを作りながら細かく整える。

### Q. バグを見つけたら、すぐに修正すべき？

**A.** 現在のタスクを完了してから、新しいタスク（PLAN）として開始してください。

### Q. 途中で「こういう構造にしたほうがいい」と気づいた

**A.** 次のタスクとして「リファクタリング」を作成して、PLAN → DEV → CHECK → 必要に応じて REPORT としてください。

---

## Phase 1 完了時の成果物

以下がそろった状態で Phase 1 は完了です：

```
src/
  screens/
    01_Title/TitleScreen.tsx          ← 画面遷移ハブ
    02_Novel/NovelScreen.tsx          ← ノベルコンテナ
    02_Novel/ChapterScreen.tsx        ← チャプター表示
    02_Novel/components/
      ChapterText.tsx
      ChoiceButtons.tsx
    03_Battle/BattleScreen.tsx        ← バトルUI
    13_Menu/MenuScreen.tsx            ← メニュー
    workspace/WorkSpaceScreen.tsx     ← ワークスペース
  devstudio/DevStudioScreen.tsx       ← DevStudio
  
0420_WorkSpace/
  mock/
    chapter.json                      ← ノベルモック
    battle.json                       ← バトルモック
    menu.json                         ← メニューモック
    index.ts
    
docs/studio/（本ドキュメント）
```

すべてのコンポーネントが **JSON差し替えで動作が変わる** 構造になっていることが重要。

---

**最終更新:** 2026-04-24
