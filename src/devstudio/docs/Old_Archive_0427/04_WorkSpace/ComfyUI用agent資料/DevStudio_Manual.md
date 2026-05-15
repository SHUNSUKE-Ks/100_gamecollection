# DevStudio + Orchestra 設計マニュアル

> **目的**：プロジェクト単位で管理できるツールを構築する。将来的にはClaudeエージェントへ昇格させるためのAgent・Skill設計の試験的運用も含む。

---

## 1. 設計思想

### コアコンセプト

> **「UIを作るな、状態を設計しろ」** **「すべての処理は状態変換として定義する」**

すべての操作は「入力状態 → 処理 → 出力状態」のモデルで統一する。

### システム階層

```
System（環境・認証・API）
  └─ Application（アプリ本体）
        ├─ app/          ← ユーザー体験
        └─ studio/       ← DevStudio（制作OS）
              ├─ Dashboard（管理・俯瞰）
              └─ Workspace（作業・編集）
```

---

## 2. Workspace vs Dashboard の定義

| 観点     | Workspace          | Dashboard        |
| -------- | ------------------ | ---------------- |
| 視点     | ミクロ（1作業）    | マクロ（全体）   |
| 操作     | 直接編集           | 間接操作（遷移） |
| UI密度   | 高い（ツール多い） | 低め（一覧中心） |
| 使用時間 | 長い               | 短い（確認用）   |
| 位置づけ | 手を動かす場所     | 全体を見る場所   |

---

## 3. フォルダー構造（確定版）

```
src/
├─ app/                    ← 本体アプリ（ユーザー体験）
├─ game/                   ← ゲームロジック / SCENARIO.json
├─ shared/                 ← 共通UI / utils

└─ studio/                 ← ★ DevStudio（制作OS）
    │
    ├─ core/               ← 中核（状態管理）
    │   ├─ state/          ← Zustand Store
    │   ├─ history/        ← Undo/Redoロジック
    │   └─ persistence/    ← IndexedDB
    │
    ├─ orchestra/          ← ★ AI司令システム
    │   ├─ agents/
    │   │   ├─ scenarioAgent/
    │   │   │   ├─ scenarioAgent.md   ← 役割・責務
    │   │   │   ├─ skills/            ← スキル（自己完結）
    │   │   │   │   ├─ writeScenario.md
    │   │   │   │   └─ generateTags.md
    │   │   │   └─ dict.json          ← 用語・定義
    │   │   ├─ uiAgent/
    │   │   └─ plannerAgent/
    │   │
    │   ├─ engine/         ← 実行エンジン
    │   │   ├─ runTask.ts
    │   │   ├─ runSkill.ts
    │   │   └─ promptBuilder.ts
    │   │
    │   ├─ tasks/          ← タスクチケット（.jsonc）
    │   └─ logs/           ← AI実行ログ
    │
    ├─ workspace/          ← 作業空間（Editor / Preview）
    │   ├─ scenario/
    │   ├─ ui/
    │   └─ preview/
    │
    ├─ dashboard/          ← 管理（進捗 / 一覧）
    │
    ├─ pm/                 ← タスク・進行管理（人間視点）
    ├─ logs/               ← ★ 開発ログ一元管理
    ├─ ai/                 ← 生成結果キャッシュ
    │
    ├─ docs/               ← 設計資料（現在）
    ├─ schema/             ← JSONスキーマ・型定義
    ├─ archive/            ← 過去資産（旧仕様・没案）
    │
    └─ adapters/           ← 外部連携（Notionなど）
```

### 資料フォルダーの時間軸

| フォルダ   | 時間軸 | 役割                     |
| ---------- | ------ | ------------------------ |
| `docs/`    | 現在   | 今使う設計書・仕様       |
| `schema/`  | 不変   | 構造のルール・型定義     |
| `archive/` | 過去   | 旧バージョン・没案・試作 |

---

## 4. 状態管理（Zustand）

### 採用理由

- `useReducer` はスコープが狭く複数コンポーネントで共有しにくい
- Zustand は グローバル共有・関数直叩き・非同期が楽
- **今の規模ではZustandのみでOK**（Actionが50以上になったらreducer併用を検討）

### DevStudio Storeの型定義

```typescript
// src/studio/core/state/_useDevStudioStore.ts

type DevPhase = "IDEA" | "DESIGN" | "IMPLEMENT" | "TEST" | "RELEASE";

type DevStudioStore = {
  projectId: string;
  phase: DevPhase;

  logs: DevLog[];
  tasks: Task[];
  aiOutputs: AIOutput[];

  documents: DocMeta[];
  schemas: SchemaMeta[];
  archives: ArchiveMeta[];

  ui: {
    currentView: "DASHBOARD" | "WORKSPACE";
    selectedDocId: string | null;
    selectedTaskId: string | null;
  };

  // Actions
  setPhase: (phase: DevPhase) => void;
  addLog: (log: DevLog) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addAIOutput: (output: AIOutput) => void;
  setView: (view: "DASHBOARD" | "WORKSPACE") => void;
  selectDoc: (docId: string | null) => void;
  selectTask: (taskId: string | null) => void;
};
```

### Undo/Redo付き履歴管理

```typescript
type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

// 操作例
const { addTask, undo, redo } = useDevStudioStore();
addTask({ id: "1", title: "シナリオ作成" });
undo();
redo();
```

> **重要**: 必ず `setState(newState)` 経由で更新する（直接setしない）

### IndexedDB 永続化

```typescript
// src/studio/core/persistence/_db.ts
import { openDB } from "idb"  // npm install idb

export const saveState = async (state: any) => { ... }
export const loadState = async () => { ... }

// Zustandと連携
subscribe((state) => { saveState(state.history) })
```

---

## 5. 開発ログ設計（logs一元管理）

すべての成果物・報告・履歴は `studio/logs/` に集約する。タグで分類する。

### ログ型定義

```typescript
type DevLog = {
  id: string;
  type: "TASK" | "AI_PROCESS" | "USER_ACTION" | "SYSTEM";
  message: string;
  meta?: {
    taskId?: string;
    agent?: string;
    skill?: string;
    tags?: string[];
  };
  timestamp: number;
};
```

### ログ例

```json
{
  "type": "AI_PROCESS",
  "message": "プロットを会話シナリオ化",
  "meta": {
    "agent": "scenarioAgent",
    "skill": "writeScenario",
    "tags": ["scenario", "generate"]
  }
}
```

### 履歴の3分類（混ぜない）

| 種別         | 場所          | 内容                             |
| ------------ | ------------- | -------------------------------- |
| AIの処理履歴 | Task.process  | どのAgentが何のSkillで何をしたか |
| 編集履歴     | core/history/ | Undo/Redo（人間の編集）          |
| メタログ     | studio/logs/  | 全操作の時系列記録               |

---

## 6. Orchestra（AI司令システム）

### 役割

> タスクを解析し、適切なAgentとSkillに振り分ける

```
入力タスク
  ↓ Intent検出
Agent決定
  ↓
Skill選択
  ↓ 〇〇化実行
成果物 + 実行履歴
```

### 6-1. Agent 設計

各AgentはフォルダーとしてOrchestraに自己完結する。

**ファイル例: `scenarioAgent/scenarioAgent.md`**

```markdown
# scenarioAgent

## role

ノベルゲームのシナリオ制作

## responsibility

- ストーリー構造の生成
- 会話生成
- タグ付与

## skills

- writeScenario
- generateTags
- structureScenario

## output

- SCENARIO.json
```

**dict.json（用語・定義）**

```json
{
  "感情タグ": ["happy", "sad", "angry"],
  "背景": ["bg_room", "bg_night"]
}
```

> dictはAIのブレを抑える言語定義。AIに渡すプロンプトの辞書として機能する。

---

### 6-2. Skill 設計

**1 Skill = 1状態変換（〇〇化）**

**ファイル例: `skills/writeScenario.md`**

```markdown
# writeScenario

## 概要

プロットから会話形式のシナリオを生成

## 入力状態

- plot

## 出力状態

- dialogue

## 〇〇化

👉 プロットを「会話シナリオ化」する

## intent

CREATE

## tags

- scenario
- generate
```

### Skillパイプライン（状態変換の連鎖）

```
プロット
  ↓ writeScenario     → 会話シナリオ化
会話
  ↓ generateTags      → 演出付きデータ化
タグ付き会話
  ↓ structureScenario → 構造化JSONデータ化
SCENARIO.json
```

---

### 6-3. Intent辞書 + スコアリング

**`orchestra/core/_intentDict.json`**

```json
{
  "CREATE": { "keywords": { "作る": 3, "生成": 3, "書く": 2, "作成": 2 } },
  "TRANSFORM": { "keywords": { "変換": 3, "構造化": 3, "タグ": 2, "JSON": 2 } },
  "ANALYZE": { "keywords": { "分解": 3, "分析": 3, "整理": 2, "抽出": 2 } },
  "MODIFY": { "keywords": { "修正": 3, "改善": 2, "変更": 2, "リファクタ": 3 } },
  "MANAGE": { "keywords": { "管理": 3, "進捗": 2, "タスク": 2, "保存": 1 } }
}
```

**スコアリング関数**

```typescript
// src/studio/orchestra/core/_detectIntent.ts
export function detectIntent(text: string) {
  // テキストに含まれるキーワードのスコアを合算
  // 最大スコアのIntentを返す
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  // 例: ["CREATE", 5]
}
```

### Intent → Agentマッピング

| Intent    | Agent                   |
| --------- | ----------------------- |
| CREATE    | scenarioAgent / uiAgent |
| TRANSFORM | scenarioAgent           |
| ANALYZE   | plannerAgent            |
| MODIFY    | 各Agent                 |
| MANAGE    | plannerAgent            |

---

### 6-4. タスクチケット設計（JSONC形式）

タスクチケットは「指示書 + 実行ログ + 成果物」をひとまとめにしたコンテナ。

**`orchestra/tasks/task_001.jsonc`**

```jsonc
{
  // ===== メタ =====
  "id": "task_001",
  "title": "プロローグシナリオ作成",
  "status": "done", // pending | running | done | error

  // ===== 指示 =====
  "request": {
    "agent": "scenarioAgent",
    "skill": "writeScenario",
    "input": {
      "plot": "騎士が魔女に出会う"
    }
  },

  // ===== 実行履歴 =====
  "process": [
    {
      "agent": "scenarioAgent",
      "skill": "writeScenario",
      "intent": "CREATE",
      "transform": "プロット → 会話シナリオ", // 〇〇化の記録
      "changes": ["会話形式に変換", "キャラクターに発話割当"],
      "timestamp": 1710000000000
    },
    {
      "agent": "scenarioAgent",
      "skill": "generateTags",
      "intent": "TRANSFORM",
      "transform": "会話 → 演出付きデータ",
      "changes": ["背景タグ追加", "感情タグ付与"],
      "timestamp": 1710000005000
    }
  ],

  // ===== 成果物 =====
  "output": {
    "type": "SCENARIO",
    "data": {}
  }

  // ===== オプション（将来拡張） =====
  // "diff": { "before": {}, "after": {} },
  // "version": 1
}
```

> **核心**: タスクチケットは「誰が・何の目的で・どう変換したか」を再現可能にする記録単位。

---

### 6-5. 実行エンジン

```typescript
// src/studio/orchestra/engine/runTask.ts
async function runTask(task: Task) {
  const { agent, skill, input } = task.request;

  // 1. Intent検出 → Agent・Skill選択
  const intent = detectIntent(task.title + task.description);
  const selectedSkill = findSkillByIntent(agent, intent);

  // 2. Skill実行（AI呼び出し）
  const result = await runSkill(agent, selectedSkill, input);

  // 3. processLog生成
  const processLog = {
    agent,
    skill: selectedSkill,
    intent,
    transform: getSkillTransform(agent, selectedSkill),
    changes: result.changes,
    timestamp: Date.now()
  };

  // 4. DevStudio logsに記録
  addLog({
    type: "AI_PROCESS",
    message: processLog.transform,
    meta: { taskId: task.id, agent, skill: selectedSkill, tags: [intent.toLowerCase()] }
  });

  return {
    ...task,
    process: [...task.process, processLog],
    output: result.output,
    status: "done"
  };
}
```

---

## 7. Orchestra.md（振り分けルール定義）

**`studio/orchestra/orchestra.md`**

```markdown
# Orchestra

## role

タスクを解析し、適切なAgentとSkillに振り分ける

## dict（振り分け辞書）

### scenario系

- キーワード：シナリオ / ストーリー / 会話 / プロット / 分岐
- agent：scenarioAgent

### ui系

- キーワード：UI / レイアウト / 画面 / コンポーネント
- agent：uiAgent

### pm系

- キーワード：タスク / 進捗 / 設計 / 管理
- agent：plannerAgent

## skill選択ルール

### scenarioAgent

- 「書く / 作る」→ writeScenario
- 「タグ / 演出」→ generateTags
- 「構造」→ structureScenario

### uiAgent

- 「作る」→ createUI
- 「整理」→ refactorUI

### plannerAgent

- 「分解」→ breakdownTask
- 「整理」→ organizeTasks

## execution（実行戦略）

- 単一処理：1 Skillで完結
- 複合処理：Skillを順番に実行（パイプライン）

## 〇〇化（本質）

タスクを「処理可能な状態変換パイプライン」に分解する
```

---

## 8. 設計原則まとめ

| 原則            | 内容                                                |
| --------------- | --------------------------------------------------- |
| 状態変換モデル  | すべての処理を「入力状態 → Skill → 出力状態」で定義 |
| 1 Skill = 1責務 | Skillは1つの〇〇化のみを担当                        |
| Agent自己完結   | Agentは役割・Skill・dictをフォルダーに内包          |
| 履歴一元管理    | logs/に全記録を集約、タグで分類                     |
| Intent駆動      | キーワードではなく「何をしたいか（動詞）」で判断    |
| 意図の言語化    | すべての操作にintent・transformを付与               |

---

## 9. 将来のClaudeエージェント化ロードマップ

現在の `studio/orchestra/` はClaudeエージェント化の試験場として機能する。

```
現在（試作）
  └─ orchestra/agents/*.md + skills/*.md
      ↓ Agent.md を Claude system promptとして使用
      ↓ skills/ の〇〇化をツール定義に変換
      ↓ dict.json をknowledge baseとして注入
将来（Claude Agent昇格）
  └─ Claude API + tool_use
      ├─ scenarioAgent → Claude instance（systemプロンプト）
      ├─ skills → tools（function calling）
      └─ tasks → messages with history
```

### 移行時のポイント

- `agentName.md` の `role` / `responsibility` → `system` プロンプトへ
- `skillName.md` の `入力状態` / `出力状態` / `〇〇化` → toolの `description` へ
- `dict.json` → systemプロンプトの用語定義セクションへ
- `task.process` → Claude conversation historyとして継続利用可能

---

## 10. 今後の実装優先順位

| 優先度 | タスク                    | 説明                                |
| ------ | ------------------------- | ----------------------------------- |
| ★★★    | runTask完全実装           | 複数Skillパイプラインの連結         |
| ★★★    | log自動生成               | 全ActionでaddLogを自動呼び出し      |
| ★★     | diff自動生成              | before/afterの変更差分を記録        |
| ★★     | Scenario連携              | 生成結果をgame/へ自動反映           |
| ★      | Agent実行の非同期キュー化 | 複数Agent同時処理対応               |
| ★      | マルチプロジェクト対応    | `db.put("state", state, projectId)` |

---

_DevStudio = 制作プロセスを再現可能にするシステム_ _Orchestra = AIを使うではなく、AIを指揮する司令塔_
