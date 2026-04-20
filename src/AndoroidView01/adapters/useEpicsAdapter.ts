// ============================================================
// AndroidView01 — useEpicsAdapter
// Epics 用データ整形
// 新規ロジック禁止 / hooks は既存からimportのみ
// ============================================================

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';

export const useEpicsAdapter = () => {
  const {
    epics,
    tasks,
    milestones,
    addEpic,
    updateEpic,
    addReport,
    deleteReport,
    toggleCriterion,
    addCriterion,
    deleteCriterion,
    addMilestone,
    deleteMilestone,
  } = useDevStudioStore();

  // ── Epicの進捗計算ヘルパー ────────────────────────────────
  const getEpicProgress = (epicId: string) => {
    const epic = epics.find(e => e.id === epicId);
    if (!epic) return { total: 0, done: 0, active: 0, blocked: 0, pct: 0 };
    const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
    const total   = epicTasks.length;
    const done    = epicTasks.filter(t => t.status === 'done').length;
    const active  = epicTasks.filter(t => t.status === 'in_progress').length;
    const blocked = epicTasks.filter(t => t.status === 'blocked').length;
    return { total, done, active, blocked, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  // ── Epicの全タスク ────────────────────────────────────────
  const getEpicTasks = (epicId: string) => {
    const epic = epics.find(e => e.id === epicId);
    if (!epic) return [];
    return tasks.filter(t => epic.taskIds.includes(t.id));
  };

  // ── Epics リストにprogressを付加 ──────────────────────────
  const epicsWithProgress = epics.map(epic => ({
    ...epic,
    progress: getEpicProgress(epic.id),
  }));

  return {
    epics,
    epicsWithProgress,
    milestones,
    getEpicProgress,
    getEpicTasks,
    // Actions（透過）
    addEpic,
    updateEpic,
    addReport,
    deleteReport,
    toggleCriterion,
    addCriterion,
    deleteCriterion,
    addMilestone,
    deleteMilestone,
  };
};
