// ============================================================
// DevStudio — 共通型定義 v2
// ============================================================

import type { DevTag } from './constants/tags';

// ─── Phase ──────────────────────────────────────────────────

export type DevPhase = 'IDEA' | 'DESIGN' | 'IMPLEMENT' | 'TEST' | 'RELEASE';

// ─── Task ────────────────────────────────────────────────────

export type TaskStatus   = 'pending' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'P0' | 'P1' | 'P2';
export type TaskType     = 'implement' | 'decision' | 'review' | 'research';

export interface TaskRequest {
  agent?: string;
  skill?: string;
  input?: Record<string, unknown>;
}

export interface ProcessLog {
  agent:     string;
  skill:     string;
  intent:    string;
  transform: string;
  changes:   string[];
  timestamp: number;
}

export interface Task {
  id:           string;
  title:        string;
  description?: string;
  status:       TaskStatus;
  priority:     TaskPriority;
  type?:        TaskType;
  epicId?:      string;
  tags:         DevTag[];
  date:         string;        // YYYY-MM-DD
  request?:     TaskRequest;
  process?:     ProcessLog[];
  output?:      { type: string; data: unknown };
}

// ─── DevLog v2 ───────────────────────────────────────────────

export type LogType = 'AI_PROCESS' | 'TASK' | 'USER_ACTION' | 'SYSTEM';

export interface DevLog {
  id:       string;
  type:     LogType;
  message:  string;          // 「〇〇化」の動詞で書く
  meta?: {
    taskId?:  string;
    epicId?:  string;
    agent?:   string;
    skill?:   string;
    intent?:  string;
    tags?:    DevTag[];
    files?:   string[];
  };
  timestamp: number;          // epoch ms
}

// ─── Epic ────────────────────────────────────────────────────

export interface EpicReport {
  id:        string;
  title:     string;
  body:      string;          // Markdown
  date:      string;          // YYYY-MM-DD
  author?:   string;
}

export interface Epic {
  id:           string;
  title:        string;
  description?: string;
  phase:        DevPhase;
  tags:         DevTag[];
  taskIds:      string[];
  reports?:     EpicReport[];
  assignedTo?:  string;   // ViewProfile (e.g. 'Planner01')
}

// ─── Milestone (DONE) ────────────────────────────────────────

export interface MilestoneCriterion {
  id:      string;
  text:    string;
  checked: boolean;
}

export interface Milestone {
  id:          string;   // 'DONE01', 'DONE02', ...
  title:       string;
  description?: string;
  criteria:    MilestoneCriterion[];
}

// ─── AIOutput ────────────────────────────────────────────────

export interface AIOutput {
  id:        string;
  taskId:    string;
  agent:     string;
  skill:     string;
  type:      string;
  data:      unknown;
  timestamp: number;
}

// ─── Profile / UI ────────────────────────────────────────────

export type ViewProfile   = 'PM' | 'Planner01' | 'Planner02' | 'Planner03' | 'Programmer' | 'Writer' | 'Designer';
export type StudioSection = 'DASHBOARD' | 'EPIC' | 'TASKS' | 'LOGS' | 'WORKSPACE' | 'ORCHESTRA' | 'SCHEMA' | 'GAME_PACKAGE';

export interface StudioUIState {
  section:        StudioSection;
  profile:        ViewProfile;
  selectedTaskId: string | null;
  selectedLogId:  string | null;
}
