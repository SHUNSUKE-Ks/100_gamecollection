// ============================================================
// AndroidView01 — useStudioAdapter
// 既存 useDevStudioStore をラップしてモバイル UI 用に整形
// 新規ロジック禁止 / hooks は既存からimportのみ
// ============================================================

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { StudioSection, ViewProfile } from '@/devstudio/core/types';

// ─── Nav config（devstudio/DevStudioScreen.tsx と同内容） ───

export const SECTIONS: { id: StudioSection; label: string; icon: string }[] = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: '⬡' },
  { id: 'EPIC',      label: 'Epic',      icon: '◈' },
  { id: 'TASKS',     label: 'Tasks',     icon: '☑' },
  { id: 'LOGS',      label: 'Logs',      icon: '📋' },
  { id: 'WORKSPACE', label: 'WorkSpace', icon: '🗄' },
// { id: 'ORCHESTRA', label: 'Orchestra', icon: '🤖' },
  { id: 'SCHEMA',    label: 'Schema',    icon: '📐' },
];

export const PROFILES: ViewProfile[] = [
  'PM', 'Planner01', 'Planner02', 'Planner03', 'Programmer', 'Writer', 'Designer',
];

export const PROFILE_COLOR: Record<ViewProfile, string> = {
  PM:         '#c9a227',
  Planner01:  '#a78bfa',
  Planner02:  '#60a5fa',
  Planner03:  '#34d399',
  Programmer: '#f87171',
  Writer:     '#fb923c',
  Designer:   '#e879f9',
};

// ─── Adapter ────────────────────────────────────────────────

export const useStudioAdapter = () => {
  const {
    ui,
    phase,
    setSection,
    setProfile,
    setPhase,
  } = useDevStudioStore();

  const color = PROFILE_COLOR[ui.profile] ?? '#9ca3af';

  return {
    // UI State
    currentSection: ui.section,
    currentProfile: ui.profile,
    currentPhase:   phase,
    accentColor:    color,

    // Actions（そのまま透過）
    setSection,
    setProfile,
    setPhase,

    // Config data
    sections: SECTIONS,
    profiles: PROFILES,
    profileColor: PROFILE_COLOR,
  };
};
