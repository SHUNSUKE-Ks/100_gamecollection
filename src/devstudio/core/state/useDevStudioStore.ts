// ============================================================
// DevStudio — Zustand Store v2（localStorage 永続化）
// ============================================================

import { create } from 'zustand';
import type {
  Task, DevLog, Epic, EpicReport, AIOutput, Milestone, MilestoneCriterion,
  DevPhase, StudioUIState, StudioSection, ViewProfile,
} from '../types';

// ─── Storage Keys v2 ─────────────────────────────────────────

const KEYS = {
  tasks:      'devstudio_tasks_v2',
  logs:       'devstudio_logs_v2',
  epics:      'devstudio_epics_v2',
  phase:      'devstudio_phase_v2',
  ui:         'devstudio_ui_v2',
  milestones: 'devstudio_milestones_v1',
} as const;

// ─── Helpers ─────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const now = () => Date.now();
const today = () => new Date().toISOString().slice(0, 10);

// ─── Seed: Epics ─────────────────────────────────────────────

const SEED_EPICS: Epic[] = [
  {
    id: 'E-01', title: 'DevStudio 基盤構築',
    phase: 'IMPLEMENT', tags: ['pm', 'schema'],
    assignedTo: 'Planner01',
    taskIds: ['T-000', 'T-001', 'T-002', 'T-003'],
    reports: [
      {
        id: 'R-E01-001', title: '開発レポート — E-01完了',
        date: '2026-04-19', author: 'Claude',
        body: `## E-01: DevStudio 基盤構築 — 完了レポート

### 完了タスク
| ID | 内容 |
|----|------|
| T-000 | DevStudio 骨格設計・フォルダー構成確定 |
| T-001 | タグシステム（\`tags/\`）構築 — DevTag union型 / ALL_TAGS / TAG_GROUPS |
| T-002 | \`src/studio\` → \`src/devstudio\` リネーム・全importパス更新 |
| T-003 | 開発ログUI（DevLogViewer）移植。AIコメント/修正依頼カラム分離・\`requests/\` \`resolved/\` フォルダー作成 |

### 新規ファイル
\`\`\`
src/devstudio/
├── DevStudioScreen.tsx
├── core/constants/tags/   # DevTag union型・6カテゴリ
├── logs/DevLogViewer.tsx  # AIコメント列 + 修正依頼列
├── logs/requests/
└── logs/resolved/
\`\`\`

### 決定事項
- namespace を \`devstudio\` に分離（他studio追加に備え）
- タグは \`as const\` 配列 + union 型で型安全に管理
- ログの「AIコメント」と「修正依頼」を独立カラムに分離`,
      },
    ],
  },
  {
    id: 'E-02', title: 'Store + 型定義強化',
    phase: 'IMPLEMENT', tags: ['schema', 'implement'],
    assignedTo: 'Planner02',
    taskIds: ['T-004', 'T-005', 'T-006'],
    reports: [
      {
        id: 'R-E02-001', title: '開発レポート — E-02完了',
        date: '2026-04-19', author: 'Claude',
        body: `## E-02: Store + 型定義強化 — 完了レポート

### 完了タスク
| ID | 内容 |
|----|------|
| T-004 | 型定義全面改訂 — DevLog v2 / Task拡張（epicId/request/process/output）/ Epic・AIOutput新型追加 |
| T-005 | Store v2 — localStorageキー \`_v2\` バンプ・epics/aiOutputs追加・旧データ破棄・seed書き直し |
| T-006 | TasksScreen.tsx 実装 → DevStudioScreen に組み込み完了 |

### アーキテクチャ決定
- **seedIfEmpty パターン**: \`localStorage\` が0件のときのみseed投入。キーバンプで旧データを自然に破棄
- **needsHuman()**: \`type === 'decision' || type === 'review' || status === 'blocked'\` のみWorkSpaceへ
- **Planner をデフォルトプロファイル**に変更

### TasksScreen 機能
- ステータスタブ（すべて/進行中/待機/ブロック/完了）+ 件数バッジ
- Epic/Priority/Typeフィルター
- AddTaskForm（Enter確定・Escキャンセル）
- 詳細パネル（inline編集・ステータスボタン・プロセスログ表示）

### ビルド確認
\`✓ built in 7.66s\` — 本番ビルド通過`,
      },
    ],
  },
  {
    id: 'E-03', title: 'Dashboard UI 完成',
    phase: 'IMPLEMENT', tags: ['ui', 'implement'],
    assignedTo: 'Planner03',
    taskIds: ['T-007', 'T-008'],
  },
  {
    id: 'E-04', title: 'Orchestra 実装',
    phase: 'IMPLEMENT', tags: ['ai', 'implement'],
    taskIds: ['T-009', 'T-010'],
  },
];

// ─── Seed: Tasks ─────────────────────────────────────────────

const SEED_TASKS: Task[] = [
  // ── E-01: DevStudio 基盤構築 ── 完了済み
  {
    id: 'T-000', epicId: 'E-01', type: 'implement',
    title: 'DevStudio 骨格設計・フォルダー構成確定',
    status: 'done', priority: 'P0', tags: ['pm', 'schema'],
    date: '2026-04-19',
    description: 'DevStudioScreen / store / types / tags/ フォルダー構成を確定',
  },
  {
    id: 'T-001', epicId: 'E-01', type: 'implement',
    title: 'Step 1: タグシステム（tags/）構築',
    status: 'done', priority: 'P0', tags: ['schema', 'implement'],
    date: '2026-04-19',
    description: 'DevTag union型 / ALL_TAGS / TAG_GROUPS を6ファイル分割で実装',
  },
  {
    id: 'T-002', epicId: 'E-01', type: 'implement',
    title: 'src/studio → src/devstudio リネーム',
    status: 'done', priority: 'P0', tags: ['pm', 'manage'],
    date: '2026-04-19',
    description: '他のstudio追加に備えた名前空間分離。全importパス更新済み',
  },
  {
    id: 'T-003', epicId: 'E-01', type: 'implement',
    title: '開発ログUI（DevLogViewer）をDevStudioに移植',
    status: 'done', priority: 'P1', tags: ['ui', 'implement'],
    date: '2026-04-19',
    description: 'AIコメント/修正依頼カラム分離・requests/ resolved/ フォルダー作成',
  },
  // ── E-02: Store + 型定義強化 ── 進行中
  {
    id: 'T-004', epicId: 'E-02', type: 'implement',
    title: 'Step 2: 型定義全面改訂（DevLog v2 / Task拡張 / Epic追加）',
    status: 'in_progress', priority: 'P0', tags: ['schema', 'implement'],
    date: today(),
    description: 'DevLog → type/meta/timestamp:number。Task → type/epicId/request/process/output。新型: Epic / AIOutput / ProcessLog',
  },
  {
    id: 'T-005', epicId: 'E-02', type: 'implement',
    title: 'Step 3: Store v2（キーバンプ・Epic追加・seed書き直し）',
    status: 'in_progress', priority: 'P0', tags: ['schema', 'implement'],
    date: today(),
    description: 'localStorageキー _v2 へ。epics / aiOutputs 追加。旧データ破棄・クリーンスタート',
  },
  {
    id: 'T-006', epicId: 'E-02', type: 'implement',
    title: 'Step 4: 既存コンポーネントを新型に更新',
    status: 'pending', priority: 'P1', tags: ['ui', 'modify'],
    date: today(),
    description: 'LogsPanel / TasksPanel を v2 DevLog / Task 型に対応',
  },
  // ── E-03: Dashboard UI ── 待機
  {
    id: 'T-007', epicId: 'E-03', type: 'implement',
    title: 'Tasks フルビュー（TasksScreen）実装',
    status: 'pending', priority: 'P1', tags: ['ui', 'implement'],
    date: today(),
    description: 'フィルタ・ソート・ステータス別タブ・タスク詳細パネル',
  },
  {
    id: 'T-008', epicId: 'E-03', type: 'implement',
    title: 'DevLogViewer ↔ Store 統合',
    status: 'pending', priority: 'P1', tags: ['schema', 'implement'],
    date: today(),
    description: '現在は独自localStorage。Store の logs（v2）と一元化',
  },
  // ── E-04: Orchestra ── 待機
  {
    id: 'T-009', epicId: 'E-04', type: 'implement',
    title: 'Orchestra: intent検出 / Agent-Skill ルーティング実装',
    status: 'pending', priority: 'P2', tags: ['ai', 'implement'],
    date: today(),
    description: '_intentDict.json / _detectIntent.ts / runTask.ts / runSkill.ts',
  },
  {
    id: 'T-010', epicId: 'E-04', type: 'implement',
    title: 'WORKSPACE: Decision フォームレンダラー実装',
    status: 'pending', priority: 'P2', tags: ['ui', 'implement'],
    date: today(),
    description: 'Task.type === decision のとき WorkSpace に Decision フォームを動的生成',
  },
];

// ─── Seed: Logs ──────────────────────────────────────────────

const SEED_LOGS: DevLog[] = [
  {
    id: 'log_001', type: 'TASK', timestamp: new Date('2026-04-19T00:00:00Z').getTime(),
    message: 'タスクチケット発行：DevStudio 基盤構築（E-01）',
    meta: { epicId: 'E-01', tags: ['pm', 'manage'] },
  },
  {
    id: 'log_002', type: 'AI_PROCESS', timestamp: new Date('2026-04-19T00:01:00Z').getTime(),
    message: 'タグ定数を型安全なモジュール群に構造化',
    meta: {
      taskId: 'T-001', agent: 'uiAgent', skill: 'structureSchema',
      intent: 'TRANSFORM', tags: ['schema', 'transform'],
      files: ['devstudio/core/constants/tags/index.ts'],
    },
  },
  {
    id: 'log_003', type: 'USER_ACTION', timestamp: new Date('2026-04-19T00:10:00Z').getTime(),
    message: 'src/studio → src/devstudio リネーム承認・反映',
    meta: { taskId: 'T-002', tags: ['pm', 'manage'] },
  },
  {
    id: 'log_004', type: 'SYSTEM', timestamp: new Date('2026-04-19T00:20:00Z').getTime(),
    message: 'DevStudio Store v2 初期化・旧データ破棄',
    meta: { tags: ['persist', 'migration', 'init'] },
  },
];

// ─── Seed: Milestones ────────────────────────────────────────

const SEED_MILESTONES: Milestone[] = [
  {
    id: 'DONE01', title: '最低限リリース可能',
    description: 'レイアウト・ダミーデータ・初期機能が揃い、動作確認できる状態',
    criteria: [
      { id: 'D01-01', text: 'レイアウト完成（画面構成が確定している）', checked: false },
      { id: 'D01-02', text: 'SVG / ダミーデータで画面が埋まっている', checked: false },
      { id: 'D01-03', text: '最低限の機能が初期実装されている', checked: false },
    ],
  },
  {
    id: 'DONE02', title: 'ビジュアル導入完了',
    description: 'キャラクター画像・UIコンポーネントが導入された状態',
    criteria: [
      { id: 'D02-01', text: 'Character 画像が組み込まれている', checked: false },
      { id: 'D02-02', text: 'UI デザインが導入されている', checked: false },
    ],
  },
  {
    id: 'DONE03', title: '演出・体験完成',
    description: 'アニメーション・演出が入り、体験として完成している状態',
    criteria: [
      { id: 'D03-01', text: '演出（アニメーション・トランジション等）が実装されている', checked: false },
    ],
  },
];

// ─── Store Shape ─────────────────────────────────────────────

interface DevStudioStore {
  // ── State ──
  phase:      DevPhase;
  tasks:      Task[];
  logs:       DevLog[];
  epics:      Epic[];
  milestones: Milestone[];
  aiOutputs: AIOutput[];
  ui:        StudioUIState;

  // ── Phase ──
  setPhase: (phase: DevPhase) => void;

  // ── Tasks ──
  addTask:    (task: Task)   => void;
  updateTask: (task: Task)   => void;
  deleteTask: (id: string)   => void;

  // ── Logs ──
  addLog:    (log: DevLog)  => void;
  updateLog: (log: DevLog)  => void;
  deleteLog: (id: string)   => void;

  // ── Epics ──
  addEpic:      (epic: Epic)                              => void;
  updateEpic:   (epic: Epic)                              => void;
  addReport:    (epicId: string, report: EpicReport)      => void;
  deleteReport: (epicId: string, reportId: string)        => void;

  // ── Milestones ──
  addMilestone:      (milestone: Milestone)                               => void;
  updateMilestone:   (milestone: Milestone)                               => void;
  deleteMilestone:   (id: string)                                         => void;
  toggleCriterion:   (milestoneId: string, criterionId: string)           => void;
  addCriterion:      (milestoneId: string, criterion: MilestoneCriterion) => void;
  deleteCriterion:   (milestoneId: string, criterionId: string)           => void;

  // ── AI Outputs ──
  addAIOutput: (output: AIOutput) => void;

  // ── UI ──
  setSection:  (section: StudioSection) => void;
  setProfile:  (profile: ViewProfile)   => void;
  selectTask:  (id: string | null)      => void;
  selectLog:   (id: string | null)      => void;
}

// ─── Seed loader（0件のとき挿入） ────────────────────────────

function seedIfEmpty<T>(key: string, seed: T[]): T[] {
  const s = load<T[]>(key, []);
  return s.length === 0 ? seed : s;
}

// ─── Store ───────────────────────────────────────────────────

export const useDevStudioStore = create<DevStudioStore>((set, get) => ({
  phase:      load<DevPhase>(KEYS.phase, 'IMPLEMENT'),
  tasks:      seedIfEmpty(KEYS.tasks,      SEED_TASKS),
  logs:       seedIfEmpty(KEYS.logs,       SEED_LOGS),
  epics:      seedIfEmpty(KEYS.epics,      SEED_EPICS),
  milestones: seedIfEmpty(KEYS.milestones, SEED_MILESTONES),
  aiOutputs: [],
  ui: load<StudioUIState>(KEYS.ui, {
    section:        'DASHBOARD',
    profile:        'PM',
    selectedTaskId: null,
    selectedLogId:  null,
  }),

  // ── Phase ──
  setPhase: (phase) => { set({ phase }); save(KEYS.phase, phase); },

  // ── Tasks ──
  addTask: (task) => {
    const tasks = [task, ...get().tasks];
    set({ tasks }); save(KEYS.tasks, tasks);
  },
  updateTask: (task) => {
    const tasks = get().tasks.map(t => t.id === task.id ? task : t);
    set({ tasks }); save(KEYS.tasks, tasks);
  },
  deleteTask: (id) => {
    const tasks = get().tasks.filter(t => t.id !== id);
    set({ tasks }); save(KEYS.tasks, tasks);
  },

  // ── Logs ──
  addLog: (log) => {
    const logs = [log, ...get().logs];
    set({ logs }); save(KEYS.logs, logs);
  },
  updateLog: (log) => {
    const logs = get().logs.map(l => l.id === log.id ? log : l);
    set({ logs }); save(KEYS.logs, logs);
  },
  deleteLog: (id) => {
    const logs = get().logs.filter(l => l.id !== id);
    set({ logs }); save(KEYS.logs, logs);
  },

  // ── Epics ──
  addEpic: (epic) => {
    const epics = [...get().epics, epic];
    set({ epics }); save(KEYS.epics, epics);
  },
  updateEpic: (epic) => {
    const epics = get().epics.map(e => e.id === epic.id ? epic : e);
    set({ epics }); save(KEYS.epics, epics);
  },
  addReport: (epicId, report) => {
    const epics = get().epics.map(e =>
      e.id === epicId ? { ...e, reports: [...(e.reports ?? []), report] } : e
    );
    set({ epics }); save(KEYS.epics, epics);
  },
  deleteReport: (epicId, reportId) => {
    const epics = get().epics.map(e =>
      e.id === epicId ? { ...e, reports: (e.reports ?? []).filter(r => r.id !== reportId) } : e
    );
    set({ epics }); save(KEYS.epics, epics);
  },

  // ── AI Outputs ──
  addAIOutput: (output) => {
    const aiOutputs = [output, ...get().aiOutputs];
    set({ aiOutputs });
  },

  // ── Milestones ──
  addMilestone: (milestone) => {
    const milestones = [...get().milestones, milestone];
    set({ milestones }); save(KEYS.milestones, milestones);
  },
  updateMilestone: (milestone) => {
    const milestones = get().milestones.map(m => m.id === milestone.id ? milestone : m);
    set({ milestones }); save(KEYS.milestones, milestones);
  },
  deleteMilestone: (id) => {
    const milestones = get().milestones.filter(m => m.id !== id);
    set({ milestones }); save(KEYS.milestones, milestones);
  },
  toggleCriterion: (milestoneId, criterionId) => {
    const milestones = get().milestones.map(m =>
      m.id !== milestoneId ? m : {
        ...m,
        criteria: m.criteria.map(c =>
          c.id === criterionId ? { ...c, checked: !c.checked } : c
        ),
      }
    );
    set({ milestones }); save(KEYS.milestones, milestones);
  },
  addCriterion: (milestoneId, criterion) => {
    const milestones = get().milestones.map(m =>
      m.id !== milestoneId ? m : { ...m, criteria: [...m.criteria, criterion] }
    );
    set({ milestones }); save(KEYS.milestones, milestones);
  },
  deleteCriterion: (milestoneId, criterionId) => {
    const milestones = get().milestones.map(m =>
      m.id !== milestoneId ? m : {
        ...m, criteria: m.criteria.filter(c => c.id !== criterionId),
      }
    );
    set({ milestones }); save(KEYS.milestones, milestones);
  },

  // ── UI ──
  setSection: (section) => {
    const ui = { ...get().ui, section };
    set({ ui }); save(KEYS.ui, ui);
  },
  setProfile: (profile) => {
    const ui = { ...get().ui, profile };
    set({ ui }); save(KEYS.ui, ui);
  },
  selectTask: (selectedTaskId) => {
    const ui = { ...get().ui, selectedTaskId };
    set({ ui }); save(KEYS.ui, ui);
  },
  selectLog: (selectedLogId) => {
    const ui = { ...get().ui, selectedLogId };
    set({ ui }); save(KEYS.ui, ui);
  },
}));
