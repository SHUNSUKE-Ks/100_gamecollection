// ============================================================
// AndroidView01 — useLogsAdapter
// Logs 用データ整形
// 新規ロジック禁止 / hooks は既存からimportのみ
// ============================================================

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { LogType } from '@/devstudio/core/types';

export const TYPE_LABEL: Record<LogType, string> = {
  AI_PROCESS:  'AI',
  TASK:        'TASK',
  USER_ACTION: 'USER',
  SYSTEM:      'SYS',
};

export const TYPE_COLOR: Record<LogType, string> = {
  AI_PROCESS:  '#a78bfa',
  TASK:        '#34d399',
  USER_ACTION: '#60a5fa',
  SYSTEM:      '#6b7280',
};

export const useLogsAdapter = () => {
  const {
    logs,
    addLog,
    updateLog,
    deleteLog,
    ui,
    selectLog,
  } = useDevStudioStore();

  // ── 時系列降順ソート済み ──────────────────────────────────
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  // ── 件数制限版（ダッシュボード用） ───────────────────────
  const recentLogs = sortedLogs.slice(0, 5);

  // ── タイムスタンプフォーマット ────────────────────────────
  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });

  return {
    logs: sortedLogs,
    recentLogs,
    selectedLogId: ui.selectedLogId,
    formatTime,
    formatDate,
    typeLabel: TYPE_LABEL,
    typeColor: TYPE_COLOR,
    // Actions（透過）
    addLog,
    updateLog,
    deleteLog,
    selectLog,
  };
};
