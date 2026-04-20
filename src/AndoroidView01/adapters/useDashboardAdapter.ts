// ============================================================
// AndroidView01 — useDashboardAdapter
// Dashboard 用データ整形（PM / Planner / Programmer 別）
// 新規ロジック禁止 / hooks は既存からimportのみ
// ============================================================

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import { PROFILE_COLOR } from './useStudioAdapter';
import type { ViewProfile } from '@/devstudio/core/types';

export const useDashboardAdapter = () => {
  const {
    ui,
    phase,
    tasks,
    epics,
    milestones,
    updateEpic,
    toggleCriterion,
    setSection,
    selectTask,
  } = useDevStudioStore();

  const profile = ui.profile;
  const color = PROFILE_COLOR[profile] ?? '#9ca3af';

  // ── PM用: 全Epicsの進捗データ ─────────────────────────────
  const epicsWithProgress = epics.map(epic => {
    const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
    const total   = epicTasks.length;
    const done    = epicTasks.filter(t => t.status === 'done').length;
    const active  = epicTasks.filter(t => t.status === 'in_progress').length;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...epic, total, done, active, pct };
  });

  // ── PM用: 全Reportsを時系列でまとめる ──────────────────────
  const allReports = epics.flatMap(epic =>
    (epic.reports ?? []).map(r => ({ ...r, epicId: epic.id, epicTitle: epic.title }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  // ── Planner用: 担当Epicのみ ───────────────────────────────
  const assignedEpics = epics.filter(e => e.assignedTo === profile);
  const assignedEpicsWithTasks = assignedEpics.map(epic => {
    const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
    return {
      ...epic,
      tasks: epicTasks,
      activeTasks:  epicTasks.filter(t => t.status === 'in_progress'),
      pendingTasks: epicTasks.filter(t => t.status === 'pending'),
      blockedTasks: epicTasks.filter(t => t.status === 'blocked'),
      total:        epicTasks.length,
      done:         epicTasks.filter(t => t.status === 'done').length,
      active:       epicTasks.filter(t => t.status === 'in_progress').length,
      blocked:      epicTasks.filter(t => t.status === 'blocked').length,
      pct: epicTasks.length > 0
        ? Math.round((epicTasks.filter(t => t.status === 'done').length / epicTasks.length) * 100)
        : 0,
    };
  });

  // ── Programmer用: 実装タスクキュー ───────────────────────
  const implQueue = tasks
    .filter(t => t.type === 'implement' && t.status !== 'done')
    .sort((a, b) => {
      const pOrder = { P0: 0, P1: 1, P2: 2 };
      return (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9);
    });

  // ── 今日のタスク（PM用） ─────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    if (t.date !== today) return false;
    return t.type === 'decision' || t.type === 'review' || t.status === 'blocked';
  });

  // ── Phase tasks count ────────────────────────────────────
  const taskCountByStatus = {
    pending:     tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
    blocked:     tasks.filter(t => t.status === 'blocked').length,
  };

  return {
    profile,
    color,
    phase,
    // PM
    epicsWithProgress,
    allReports,
    milestones,
    todayTasks,
    taskCountByStatus,
    // Planner
    assignedEpicsWithTasks,
    // Programmer
    implQueue,
    // Actions（透過）
    updateEpic,
    toggleCriterion,
    setSection,
    selectTask,
  };
};
