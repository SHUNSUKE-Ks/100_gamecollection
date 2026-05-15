# DevStudio + Orchestra 設計マニュアル v2

> **目的**：プロジェクト単位で管理できるツールを構築する。将来的にClaudeエージェントへ昇格させるためのAgent・Skill設計の試験的運用を含む。

---

## 1. 設計思想

> **「UIを作るな、状態を設計しろ」**
> **「すべての処理は状態変換として定義する」**

すべての操作は「入力状態 → 処理 → 出力状態」のモデルで統一する。

### システム階層

```
System（環境・認証・API）
  └─ Application（アプリ本体）
        ├─ app/     ← ユーザー体験
        └─ studio/  ← DevStudio（制作OS）
              ├─ Dashboard（管理・俯瞰）
              └─ Workspace（作業・編集）
```

---

## 2. Workspace vs Dashboard の定義

| 観点 | Workspace | Dashboard |
|------|-----------|-----------|
| 視点 | ミクロ（1作業） | マクロ（全体） |
| 操作 | 直接編集 | 間接操作（遷移） |
| UI密度 | 高い（ツール多い） | 低め（一覧中心） |
| 使用時間 | 長い | 短い（確認用） |
| 位置づけ | 手を動かす場所 | 全体を見る場所 |

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
    │   │   ├─ _useDevStudioStore.ts
    │   │   └─ _initialState.ts
    │   ├─ history/        ← Undo/Redoロジック
    │   ├─ persistence/    ← IndexedDB
    │   └─ constants/
    │       └─ tags/       ← ★ タグ専用フォルダー（全タグ一元定義）
    │           ├─ index.ts
    │           ├─ domainTags.ts
    │           ├─ intentTags.ts
    │           ├─ phaseTags.ts
    │           ├─ statusTags.ts
    │           ├─ systemTags.ts
    │           └─ errorTags.ts
    │
    ├─ orchestra/          ← ★ AI司令システム
    │   ├─ orchestra.md    ← 振り分けルール定義
    │   ├─ agents/
    │   │   ├─ scenarioAgent/
    │   │   │   ├─ scenarioAgent.md   ← 役割・責務
    │   │   │   ├─ skills/
    │   │   │   │   ├─ writeScenario.md
    │   │   │   │   ├─ generateTags.md
    │   │   │   │   └─ structureScenario.md
    │   │   │   └─ dict.json
    │   │   ├─ uiAgent/
    │   │   └─ plannerAgent/
    │   │
    │   ├─ engine/         ← 実行エンジン
    │   │   ├─ runTask.ts
    │   │   ├─ runSkill.ts
    │   │   └─ promptBuilder.ts
    │   │
    │   ├─ core/
    │   │   ├─ _intentDict.json    ← Intent辞書+スコア
    │   │   └─ _detectIntent.ts   ← スコアリング関数
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

| フォルダ | 時間軸 | 役割 |
|---------|--------|------|
| `docs/` | 現在 | 今使う設計書・仕様 |
| `schema/` | 不変 | 構造のルール・型定義 |
| `archive/` | 過去 | 旧バージョン・没案・試作 |

---

## 4. タグシステム（専用フォルダー）

タグは `studio/core/constants/tags/` に集約する。logs・タスクチケット・DocMeta・DashboardフィルターUIすべてで同じ定義を参照する。

### フォルダー構成と型定義

```typescript
// studio/core/constants/tags/domainTags.ts
export const DOMAIN_TAGS = [
  "scenario", "ui", "pm", "ai",
  "schema", "docs", "archive", "game", "assets"
] as const

// studio/core/constants/tags/intentTags.ts
export const INTENT_TAGS = [
  "generate", "transform", "analyze",
  "modify", "manage", "review", "approved", "rejected"
] as const

// studio/core/constants/tags/phaseTags.ts
export const PHASE_TAGS = [
  "idea", "design", "implement",
  "test", "release", "phase-change"
] as const

// studio/core/constants/tags/statusTags.ts
export const STATUS_TAGS = [
  "pending", "running", "done", "archived"
] as const

// studio/core/constants/tags/systemTags.ts
export const SYSTEM_TAGS = [
  "persist", "undo", "redo", "sync", "init", "migration"
] as const

// studio/core/constants/tags/errorTags.ts
export const ERROR_TAGS = [
  "error", "warn", "retry", "timeout"
] as const

// studio/core/constants/tags/index.ts
export type DevTag =
  | typeof DOMAIN_TAGS[number]
  | typeof INTENT_TAGS[number]
  | typeof PHASE_TAGS[number]
  | typeof STATUS_TAGS[number]
  | typeof SYSTEM_TAGS[number]
  | typeof ERROR_TAGS[number]
```

### タグの5レイヤー

| レイヤー | 役割 | 例 |
|---------|------|-----|
| ドメイン | 何の領域か | `scenario` `ui` `pm` `ai` |
| インテント | 何をしたか（〇〇化の軸） | `generate` `transform` `approved` |
| フェーズ | 制作のどの段階か | `design` `implement` `release` |
| ステータス | 今どういう状態か | `pending` `done` `archived` |
| システム/エラー | 自動処理・問題 | `persist` `error` `retry` |

### よく使う組み合わせパターン

```
シナリオ生成:   ["scenario",  "generate",  "implement"]
タスク承認:     ["pm",        "approved",  "done"]
エラー発生:     ["ai",        "error",     "retry"]
フェーズ移行:   ["pm",        "phase-change", "manage"]
スキーマ更新:   ["schema",    "modify",    "done"]
```

**ルール：** ドメイン + インテントを必ず組み合わせる。フェーズ・ステータス・エラーは該当するときのみ追加。1エントリ最大4タグを目安にする。

---

## 5. 状態管理（Zustand）

### 採用理由

`useReducer` はスコープが狭く複数コンポーネントで共有しにくい。今の規模はZustandのみでOK。Actionが50以上になったらreducer併用を検討。

### DevStudio Storeの型定義

```typescript
// src/studio/core/state/_useDevStudioStore.ts

type DevPhase = "IDEA" | "DESIGN" | "IMPLEMENT" | "TEST" | "RELEASE"

type DevStudioStore = {
  projectId: string
  phase: DevPhase

  logs: DevLog[]
  tasks: Task[]
  aiOutputs: AIOutput[]

  documents: DocMeta[]
  schemas: SchemaMeta[]
  archives: ArchiveMeta[]

  ui: {
    currentView: "DASHBOARD" | "WORKSPACE"
    selectedDocId: string | null
    selectedTaskId: string | null
  }

  // Actions
  setPhase: (phase: DevPhase) => void
  addLog: (log: DevLog) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  deleteTask: (taskId: string) => void
  addAIOutput: (output: AIOutput) => void
  setView: (view: "DASHBOARD" | "WORKSPACE") => void
  selectDoc: (docId: string | null) => void
  selectTask: (taskId: string | null) => void
}
```

### Undo/Redo付き履歴管理

```typescript
type HistoryState<T> = {
  past: T[]
  present: T
  future: T[]
}

// 必ず setState() 経由で更新する（直接setしない）
const { addTask, undo, redo } = useDevStudioStore()
addTask({ id: "1", title: "シナリオ作成" })
undo()
redo()
```

### IndexedDB 永続化

```typescript
// src/studio/core/persistence/_db.ts
import { openDB } from "idb"  // npm install idb

export const saveState = async (state: any) => { ... }
export const loadState = async () => { ... }

// Zustandと連携（subscribe経由）
subscribe((state) => { saveState(state.history) })
```

---

## 6. 開発ログ設計（logs/ 一元管理）

承認済みの全操作を `studio/logs/` に集約する。NG・差し戻し中は積まない。

### ログ型定義

```typescript
// DevTag は tags/ フォルダーから import する
import type { DevTag } from "../core/constants/tags"

type DevLog = {
  id: string
  type: "AI_PROCESS" | "TASK" | "USER_ACTION" | "SYSTEM"
  message: string          // 「〇〇化」の言葉で書く
  meta?: {
    taskId?: string
    agent?:  string
    skill?:  string
    intent?: string
    tags?:   DevTag[]      // 型安全なタグ参照
  }
  timestamp: number
}
```

### 4種のログタイプ

| type | 記録タイミング | 内容 |
|------|--------------|------|
| `AI_PROCESS` | Skill実行完了後 | どのAgentが何を〇〇化したか |
| `TASK` | チケット発行・承認時 | タスクのライフサイクル |
| `USER_ACTION` | 人間の意思決定時 | フェーズ移行・承認・設定変更 |
| `SYSTEM` | 自動処理時 | IndexedDB保存・エラー・初期化 |

### 履歴の3分類（混ぜない）

| 種別 | 場所 | 内容 |
|------|------|------|
| AIの処理履歴 | Task.process | Agentが何をしたか |
| 編集履歴 | core/history/ | Undo/Redo（人間の編集） |
| メタログ | studio/logs/ | 承認済み全操作の時系列 |

### ログエントリの例

```json
{
  "type": "AI_PROCESS",
  "message": "プロットを会話シナリオ化",
  "meta": {
    "taskId": "task_001",
    "agent": "scenarioAgent",
    "skill": "writeScenario",
    "intent": "CREATE",
    "tags": ["scenario", "generate", "implement"]
  },
  "timestamp": 1710000000000
}
```

---

## 7. Orchestra（AI司令システム）

### 役割

> タスクを解析し、適切なAgentとSkillに振り分ける

```
入力タスク
  ↓ Intent検出（スコアリング）
Agent決定
  ↓
Skill選択
  ↓ 〇〇化実行
成果物 + process記録
```

### 7-1. orchestra.md（振り分けルール）

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
- 「構造」        → structureScenario

## 〇〇化（本質）
タスクを「処理可能な状態変換パイプライン」に分解する
```

### 7-2. Agent設計

各AgentはフォルダーとしてOrchestraに自己完結する。

**`scenarioAgent/scenarioAgent.md`**

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

**`scenarioAgent/dict.json`**（AIのブレを抑える言語定義）

```json
{
  "感情タグ": ["happy", "sad", "angry"],
  "背景": ["bg_room", "bg_night"]
}
```

### 7-3. Skill設計

**1 Skill = 1状態変換（〇〇化）**

**`skills/writeScenario.md`**

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

### 7-4. Intent辞書 + スコアリング

**`orchestra/core/_intentDict.json`**

```json
{
  "CREATE":    { "keywords": { "作る": 3, "生成": 3, "書く": 2, "作成": 2 } },
  "TRANSFORM": { "keywords": { "変換": 3, "構造化": 3, "タグ": 2, "JSON": 2 } },
  "ANALYZE":   { "keywords": { "分解": 3, "分析": 3, "整理": 2, "抽出": 2 } },
  "MODIFY":    { "keywords": { "修正": 3, "改善": 2, "変更": 2, "リファクタ": 3 } },
  "MANAGE":    { "keywords": { "管理": 3, "進捗": 2, "タスク": 2, "保存": 1 } }
}
```

**`orchestra/core/_detectIntent.ts`**

```typescript
import dict from "./_intentDict.json"

export function detectIntent(text: string) {
  const scores: Record<string, number> = {}

  for (const intent in dict) {
    scores[intent] = 0
    for (const word in dict[intent].keywords) {
      if (text.includes(word)) {
        scores[intent] += dict[intent].keywords[word]
      }
    }
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  // 例: ["CREATE", 5]
}
```

### Intent → Agentマッピング

| Intent | 主なAgent |
|--------|----------|
| CREATE | scenarioAgent / uiAgent |
| TRANSFORM | scenarioAgent |
| ANALYZE | plannerAgent |
| MODIFY | 各Agent |
| MANAGE | plannerAgent |

---

## 8. タスクチケット設計（JSONC形式）

タスクチケットは「指示書 + 実行ログ + 成果物」のコンテナ。

**`orchestra/tasks/task_001.jsonc`**

```jsonc
{
  // ===== メタ =====
  "id": "task_001",
  "title": "プロローグシナリオ作成",
  "status": "done",  // pending | running | done | error

  // ===== 指示 =====
  "request": {
    "agent": "scenarioAgent",
    "skill": "writeScenario",
    "input": { "plot": "騎士が魔女に出会う" }
  },

  // ===== 実行履歴 =====
  "process": [
    {
      "agent": "scenarioAgent",
      "skill": "writeScenario",
      "intent": "CREATE",
      "transform": "プロット → 会話シナリオ",
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
}
```

---

## 9. 実行エンジン

```typescript
// src/studio/orchestra/engine/runTask.ts
import { detectIntent } from "../core/_detectIntent"
import { useDevStudioStore } from "../../core/state/_useDevStudioStore"

async function runTask(task: Task) {
  const { agent, skill, input } = task.request
  const { addLog } = useDevStudioStore.getState()

  // 1. Intent検出
  const [intent] = detectIntent(task.title + (task.description ?? ""))

  // 2. Skill実行（AI呼び出し）
  const result = await runSkill(agent, skill, input)

  // 3. processLog生成
  const processLog = {
    agent,
    skill,
    intent,
    transform: getSkillTransform(agent, skill),
    changes: result.changes,
    timestamp: Date.now(),
  }

  // 4. logs/ に記録（承認後に呼ぶ）
  addLog({
    type: "AI_PROCESS",
    message: processLog.transform,
    meta: {
      taskId: task.id,
      agent,
      skill,
      intent,
      tags: ["ai", intent.toLowerCase() as DevTag]
    }
  })

  return {
    ...task,
    process: [...task.process, processLog],
    output: result.output,
    status: "done" as const
  }
}
```

---

## 10. 運用フロー（人間 vs AI）

### 人間の責務（意思決定・判断）

| ステップ | 作業 | 場所 |
|---------|------|------|
| ① | プロジェクト起票（目標・フェーズ・スコープ定義） | pm/ |
| ② | タスクチケット作成（title / intent / input を記述） | orchestra/tasks/ |
| ⑥ | 成果物・process・diffのレビュー | Dashboard |
| ⑦ | 承認 → DevStudio logs に記録 | studio/logs/ |
| ⑧ | Workspace / archive へ反映 | workspace/ or archive/ |

### AIの責務（変換・記録）

| ステップ | 作業 | 場所 |
|---------|------|------|
| ③ | Intent検出 & Agent/Skillルーティング | orchestra/engine/ |
| ④ | Skillパイプライン実行（〇〇化） | orchestra/agents/ |
| ⑤ | 成果物生成 + process記録（誰が・何を・なぜ変換したか） | task.process |
| ⑨ | Dashboard state 更新（phase / progress 反映） | core/state/ |

### 受け渡しのルール

タスクチケット（.jsonc）がバトン。人間が意図を書いて発行し、AIが成果物+実行記録で返す。NGなら差し戻してチケットを修正するだけ。**NG段階でlogsを汚さない**。

---

## 11. 設計原則まとめ

| 原則 | 内容 |
|------|------|
| 状態変換モデル | すべての処理を「入力状態 → Skill → 出力状態」で定義 |
| 1 Skill = 1責務 | Skillは1つの〇〇化のみを担当 |
| Agent自己完結 | Agentは役割・Skill・dictをフォルダーに内包 |
| 履歴一元管理 | logs/ に全承認済み記録を集約、タグで分類 |
| タグ一元定義 | tags/ フォルダーから全箇所が import する |
| Intent駆動 | キーワードではなく「何をしたいか（動詞）」で判断 |
| 意図の言語化 | すべての操作に intent・transform を付与 |

---

## 12. 将来のClaudeエージェント化ロードマップ

現在の `studio/orchestra/` はClaudeエージェント化の試験場として機能する。

```
現在（試作）
  studio/orchestra/agents/*.md + skills/*.md
      ↓ Agent.md → Claude system prompt へ
      ↓ skills/*.md の〇〇化 → tool definition（function calling）へ
      ↓ dict.json → knowledge base として注入
      ↓ task.process → conversation history として継続利用

将来（Claude Agent昇格）
  Claude API + tool_use
  ├─ scenarioAgent → Claude instance（system prompt）
  ├─ skills        → tools（function calling）
  └─ tasks         → messages with history
```

### 移行時の対応表

| 現在（.md設計） | 将来（Claude API） |
|----------------|-------------------|
| `agent.md` の `role` / `responsibility` | `system` プロンプト |
| `skill.md` の `入力状態` / `出力状態` / `〇〇化` | tool の `description` |
| `dict.json` | system プロンプトの用語定義セクション |
| `task.process` | conversation history |

---

## 13. 実装優先順位

| 優先度 | タスク | 説明 |
|--------|--------|------|
| ★★★ | tags/ フォルダー構築 | 全タグを型定義して一元化 |
| ★★★ | runTask完全実装 | 複数Skillパイプラインの連結 |
| ★★★ | log自動生成 | 全ActionでaddLogを自動呼び出し |
| ★★ | diff自動生成 | before/afterの変更差分を記録 |
| ★★ | Scenario連携 | 生成結果をgame/へ自動反映 |
| ★ | Agent実行の非同期キュー化 | 複数Agent同時処理対応 |
| ★ | マルチプロジェクト対応 | `db.put("state", state, projectId)` |

---

*DevStudio = 制作プロセスを再現可能にするシステム*
*Orchestra = AIを使うではなく、AIを指揮する司令塔*
*tags/ = システム全体の語彙を一箇所に閉じ込める基盤*
