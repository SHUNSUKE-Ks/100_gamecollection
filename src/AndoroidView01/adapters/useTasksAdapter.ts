// ============================================================
// AndroidView01 — useTasksAdapter
// Tasks 用データ整形
// 新規ロジック禁止 / hooks は既存からimportのみ
// ============================================================

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { TaskStatus, TaskPriority, TaskType } from '@/devstudio/core/types';

export const useTasksAdapter = () => {
  const {
    tasks,
    epics,
    ui,
    updateTask,
    addTask,
    deleteTask,
    selectTask,
    setSection,
  } = useDevStudioStore();

  // ── フィルター後のタスクを取得するヘルパー ──────────────────
  const getFiltered = (
    statusTab: TaskStatus | 'all',
    epicFilter: string,
    prioFilter: TaskPriority | 'all',
    typeFilter: TaskType | 'all',
  ) => tasks.filter(t => {
    if (statusTab !== 'all' && t.status !== statusTab) return false;
    if (epicFilter !== 'all' && t.epicId !== epicFilter) return false;
    if (prioFilter !== 'all' && t.priority !== prioFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  // ── ステータスごとの件数 ──────────────────────────────────
  const countByStatus = (s: TaskStatus) => tasks.filter(t => t.status === s).length;

  // ── ステータスを次に進める ────────────────────────────────
  const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
    pending: 'in_progress', in_progress: 'done', done: 'blocked', blocked: 'pending',
  };
  const cycleStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    updateTask({ ...task, status: STATUS_NEXT[task.status] });
  };

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    updateTask({ ...task, status });
  };

  const updateTaskField = (taskId: string, fields: Partial<Parameters<typeof updateTask>[0]>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    updateTask({ ...task, ...fields });
  };

  // ── WorkSpace へ遷移 ──────────────────────────────────────
  const openInWorkspace = (taskId: string) => {
    selectTask(taskId);
    setSection('WORKSPACE');
  };

  // ── 選択中タスク ────────────────────────────────────────
  const selectedTask = ui.selectedTaskId
    ? tasks.find(t => t.id === ui.selectedTaskId) ?? null
    : null;

  return {
    tasks,
    epics,
    selectedTask,
    getFiltered,
    countByStatus,
    cycleStatus,
    setTaskStatus,
    updateTaskField,
    openInWorkspace,
    addTask,
    deleteTask,
    selectTask,
  };
};
