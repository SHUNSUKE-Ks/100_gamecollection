import { useState } from 'react';
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import { useGameStore } from '@/core/stores/gameStore';
import type { StudioSection, ViewProfile, Epic } from '@/devstudio/core/types';
import { PhasePanel } from '@/devstudio/dashboard/panels/PhasePanel';
import { TasksPanel } from '@/devstudio/dashboard/panels/TasksPanel';
import { LogsPanel } from '@/devstudio/dashboard/panels/LogsPanel';
import { AgentPanel } from '@/devstudio/dashboard/panels/AgentPanel';
import { HelpPopup, type HelpPage } from '@/devstudio/components/HelpPopup';
import { DevLogViewer } from '@/devstudio/logs/DevLogViewer';
import { TasksScreen } from '@/devstudio/tasks/TasksScreen';
import { EpicsScreen } from '@/devstudio/epics/EpicsScreen';
import { SchemaView } from '@/devstudio/schema/SchemaView';

// ─── Nav / Profile config ────────────────────────────────────

const SECTIONS: { id: StudioSection; label: string; icon: string }[] = [
  { id: 'DASHBOARD',  label: 'Dashboard',  icon: '⬡' },
  { id: 'EPIC',       label: 'Epic',       icon: '◈' },
  { id: 'TASKS',      label: 'Tasks',      icon: '☑' },
  { id: 'LOGS',       label: 'Logs',       icon: '📋' },
  { id: 'WORKSPACE',  label: 'WorkSpace',  icon: '🗄' },
  { id: 'ORCHESTRA',  label: 'Orchestra',  icon: '🤖' },
  { id: 'SCHEMA',     label: 'Schema',     icon: '📐' },
];

const PROFILES: ViewProfile[] = ['PM', 'Planner01', 'Planner02', 'Planner03', 'Programmer', 'Writer', 'Designer'];

const PROFILE_COLOR: Record<ViewProfile, string> = {
  PM:         '#c9a227',
  Planner01:  '#a78bfa',
  Planner02:  '#60a5fa',
  Planner03:  '#34d399',
  Programmer: '#f87171',
  Writer:     '#fb923c',
  Designer:   '#e879f9',
};

// ─── Layout ──────────────────────────────────────────────────

export function DevStudioScreen() {
  const setScreen   = useGameStore(s => s.setScreen);
  const { ui, setSection, setProfile, phase } = useDevStudioStore();
  const { section, profile } = ui;

  const color = PROFILE_COLOR[profile] ?? '#9ca3af';

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#0a0a14', color: '#d1d5db', fontFamily: 'monospace',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px', borderBottom: `1px solid ${color}33`,
        background: 'rgba(15,10,30,0.95)', flexShrink: 0,
      }}>
        <span style={{ fontSize: '1.1rem' }}>⬡</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.08em' }}>
          DEV STUDIO
        </span>
        <span style={{
          fontSize: '0.6rem', background: 'rgba(139,92,246,0.3)', color: '#a78bfa',
          borderRadius: 8, padding: '1px 6px',
        }}>β</span>

        <div style={{
          marginLeft: 8, padding: '2px 10px', borderRadius: 12,
          background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)',
          fontSize: '0.65rem', fontWeight: 700, color: '#c9a227',
        }}>{phase}</div>

        {/* Active profile badge */}
        <div style={{
          padding: '2px 10px', borderRadius: 12,
          background: `${color}22`, border: `1px solid ${color}66`,
          fontSize: '0.65rem', fontWeight: 700, color,
        }}>{profile}</div>

        <div style={{ flex: 1 }} />

        {/* Profile switcher */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {PROFILES.map(p => {
            const c = PROFILE_COLOR[p];
            const active = p === profile;
            return (
              <button key={p} onClick={() => setProfile(p)} style={{
                padding: '3px 9px', borderRadius: 12, cursor: 'pointer',
                background: active ? `${c}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? `${c}88` : 'rgba(255,255,255,0.07)'}`,
                color: active ? c : '#4b5563',
                fontSize: '0.62rem', fontWeight: active ? 700 : 400,
                transition: 'all 0.15s',
              }}>{p}</button>
            );
          })}
        </div>

        <button onClick={() => setScreen('TITLE')} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, color: '#6b7280', fontSize: '0.7rem',
          cursor: 'pointer', padding: '4px 12px',
        }}>← Back</button>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar nav */}
        <nav style={{
          width: 120, borderRight: `1px solid ${color}22`,
          display: 'flex', flexDirection: 'column', padding: '12px 0',
          background: 'rgba(0,0,0,0.3)', flexShrink: 0,
        }}>
          {SECTIONS.map(s => {
            const active = s.id === section;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '10px 8px', cursor: 'pointer',
                background: active ? `${color}18` : 'none',
                border: 'none',
                borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
                color: active ? color : '#4b5563',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: active ? 700 : 400 }}>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main content */}
        <main style={{
          flex: 1,
          overflow: (section === 'LOGS' || section === 'EPIC' || section === 'SCHEMA') ? 'hidden' : 'auto',
          padding: section === 'SCHEMA' ? 0 : 20,
          display: 'flex', flexDirection: 'column',
        }}>
          <SectionContent section={section} profile={profile} />
        </main>
      </div>
    </div>
  );
}

// ─── Section Router ───────────────────────────────────────────

function SectionContent({ section, profile }: { section: StudioSection; profile: ViewProfile }) {
  switch (section) {
    case 'DASHBOARD':  return <DashboardView profile={profile} />;
    case 'EPIC':       return <EpicsScreen />;
    case 'TASKS':      return <TasksScreen />;
    case 'LOGS':       return <LogsFullView />;
    case 'WORKSPACE':  return <WorkspaceView />;
    case 'ORCHESTRA':  return <OrchestraView />;
    case 'SCHEMA':     return <SchemaView />;
    default:           return <DashboardView profile={profile} />;
  }
}

// ─── Help pages ───────────────────────────────────────────────

const HELP_PHASE: HelpPage[] = [
  { title: 'Phase — 概要', body: '**現在の開発フェーズ**を管理するパネルです。\nプロジェクトを5段階で追跡します。\n\nクリックすると任意のフェーズに移動できます。' },
  { title: 'Phase — フェーズ一覧', body: '**IDEA** → アイデア・企画段階\n**DESIGN** → 設計・スキーマ定義\n**IMPLEMENT** → 実装・コーディング\n**TEST** → テスト・検証\n**RELEASE** → リリース・デプロイ' },
];

const HELP_TODAY: HelpPage[] = [
  { title: 'Today\'s Tasks — 概要', body: '**本日あなたが行うタスク**（未完了）を表示します。\n\nクリックするとWorkSpaceのそのタスク作業画面に移動します。' },
  { title: 'Today\'s Tasks — タスク種別', body: '`decision` 人間の判断が必要な決定依頼\n`review` レビュー・確認\n`blocked` 障害で止まっているタスク\n\nWorkSpaceで選択肢・記入欄が表示されます。' },
];

const HELP_EPICS: HelpPage[] = [
  { title: 'Epic — 概要', body: '**Epicは複数のTaskをまとめる目標単位**です。\n\n`Phase > Epic > Task > Skill` の階層で管理します。' },
  { title: 'Epic — 進捗の読み方', body: '**緑** 完了 / **黄** 進行中 / **グレー** 未着手\n\n右の `割り当て` からPlanner01/02/03を指定できます。' },
];

const HELP_REPORTS: HelpPage[] = [
  { title: 'Reports Inbox — 概要', body: '**全EpicのReportがここに集まります**。\n\nPMはここで納品物を確認・チェックします。' },
];

const HELP_MILESTONES: HelpPage[] = [
  { title: 'Milestones — 概要', body: '**DONE01/02/03はリリース可能ラインの定義**です。\n\n全チェックが埋まると「その完成度でリリースできる」状態になります。\n\n詳細は Epic > Milestones タブで編集できます。' },
];

// ─── Dashboard (profile-aware) ────────────────────────────────

function DashboardView({ profile }: { profile: ViewProfile }) {
  if (profile === 'PM') return <PMDashboard />;
  if (profile === 'Planner01' || profile === 'Planner02' || profile === 'Planner03') {
    return <PlannerDashboard profile={profile} />;
  }
  if (profile === 'Programmer') return <ProgrammerDashboard />;
  return <DefaultDashboard />;
}

// ─── PM Dashboard ─────────────────────────────────────────────

function PMDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000 }}>
      {/* Row 1: Phase + Today's Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Phase" icon="📍" helpPages={HELP_PHASE}><PhasePanel /></Panel>
        <Panel title="Today's Tasks" icon="🎯" helpPages={HELP_TODAY}><TodayTasksPanel /></Panel>
      </div>
      {/* Row 2: Epic 割り振り + Reports Inbox */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Epics" icon="◈" helpPages={HELP_EPICS}><PMEpicsPanel /></Panel>
        <Panel title="Reports Inbox" icon="📥" helpPages={HELP_REPORTS}><ReportsInboxPanel /></Panel>
      </div>
      {/* Row 3: Milestones */}
      <Panel title="Milestones — DONE 定義" icon="✓" helpPages={HELP_MILESTONES}>
        <MilestonesOverviewPanel />
      </Panel>
    </div>
  );
}

function PMEpicsPanel() {
  const { epics, updateEpic } = useDevStudioStore();
  const planners: Array<string | undefined> = [undefined, 'Planner01', 'Planner02', 'Planner03'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {epics.map(epic => (
        <div key={epic.id} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderRadius: 6,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '0.6rem', color: '#c9a227', flexShrink: 0 }}>{epic.id}</span>
          <span style={{ flex: 1, fontSize: '0.73rem', color: '#d1d5db' }}>{epic.title}</span>
          <EpicMiniBar epic={epic} />
          {/* Assign dropdown */}
          <select
            value={epic.assignedTo ?? ''}
            onChange={e => updateEpic({ ...epic, assignedTo: e.target.value || undefined })}
            style={{
              background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, color: epic.assignedTo
                ? PROFILE_COLOR[epic.assignedTo as ViewProfile] ?? '#9ca3af'
                : '#4b5563',
              fontSize: '0.62rem', padding: '2px 4px', cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">未割り当て</option>
            {(['Planner01', 'Planner02', 'Planner03'] as ViewProfile[]).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function EpicMiniBar({ epic }: { epic: Epic }) {
  const { tasks } = useDevStudioStore();
  const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
  const total   = epicTasks.length;
  const done    = epicTasks.filter(t => t.status === 'done').length;
  const active  = epicTasks.filter(t => t.status === 'in_progress').length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
      <div style={{ width: 50, height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${(done / (total || 1)) * 100}%`, background: '#34d399' }} />
        <div style={{ width: `${(active / (total || 1)) * 100}%`, background: '#fbbf24' }} />
      </div>
      <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{pct}%</span>
    </div>
  );
}

function ReportsInboxPanel() {
  const { epics, setSection } = useDevStudioStore();
  const allReports = epics.flatMap(epic =>
    (epic.reports ?? []).map(r => ({ ...r, epicId: epic.id, epicTitle: epic.title }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  if (allReports.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#374151', fontSize: '0.72rem' }}>
        レポートなし
        <div style={{ fontSize: '0.62rem', color: '#2d2d3f', marginTop: 4 }}>
          Planner が Epic に納品するとここに届きます
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {allReports.slice(0, 5).map(r => (
        <div key={r.id} style={{
          padding: '8px 10px', borderRadius: 6,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
          onClick={() => setSection('EPIC')}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', color: '#c9a227', flexShrink: 0 }}>{r.epicId}</span>
            <span style={{ flex: 1, fontSize: '0.73rem', color: '#c4b5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.title}
            </span>
            <span style={{ fontSize: '0.6rem', color: '#4b5563', flexShrink: 0 }}>{r.date}</span>
          </div>
          {r.author && (
            <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: 2 }}>
              by {r.author} · {r.epicTitle}
            </div>
          )}
        </div>
      ))}
      {allReports.length > 5 && (
        <button onClick={() => setSection('EPIC')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: '0.65rem', textAlign: 'right', padding: '2px 0',
        }}>
          + {allReports.length - 5} 件 → Epic で確認
        </button>
      )}
    </div>
  );
}

function MilestonesOverviewPanel() {
  const { milestones, toggleCriterion, setSection } = useDevStudioStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {milestones.map(ms => {
        const total   = ms.criteria.length;
        const checked = ms.criteria.filter(c => c.checked).length;
        const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;
        const done    = total > 0 && checked === total;

        return (
          <div key={ms.id} style={{
            borderRadius: 8,
            border: `1px solid ${done ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.07)'}`,
            background: done ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700,
                color: done ? '#34d399' : '#c9a227',
                background: done ? 'rgba(52,211,153,0.12)' : 'rgba(201,162,39,0.1)',
                borderRadius: 3, padding: '1px 6px', flexShrink: 0,
              }}>{ms.id}</span>
              <span style={{ flex: 1, fontSize: '0.75rem', color: done ? '#34d399' : '#d1d5db', fontWeight: 600 }}>
                {ms.title}
              </span>
              <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{checked}/{total}</span>
              <div style={{ width: 50, height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: done ? '#34d399' : '#c9a227', transition: 'width 0.3s' }} />
              </div>
              {done && <span style={{ fontSize: '0.7rem' }}>✓</span>}
            </div>
            {/* Criteria (compact) */}
            <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {ms.criteria.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => toggleCriterion(ms.id, c.id)}
                    style={{
                      width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                      border: `1.5px solid ${c.checked ? '#34d399' : 'rgba(255,255,255,0.15)'}`,
                      background: c.checked ? '#34d399' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {c.checked && <span style={{ fontSize: '0.5rem', color: '#000', fontWeight: 900 }}>✓</span>}
                  </button>
                  <span style={{
                    fontSize: '0.68rem',
                    color: c.checked ? '#4b5563' : '#9ca3af',
                    textDecoration: c.checked ? 'line-through' : 'none',
                  }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <button onClick={() => setSection('EPIC')} style={{
        background: 'none', border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: 5, color: '#4b5563', fontSize: '0.65rem',
        padding: '5px 0', cursor: 'pointer',
      }}>+ 達成条件を編集 → Epic</button>
    </div>
  );
}

// ─── Planner Dashboard ────────────────────────────────────────

function PlannerDashboard({ profile }: { profile: 'Planner01' | 'Planner02' | 'Planner03' }) {
  const { epics, tasks, setSection } = useDevStudioStore();
  const color = PROFILE_COLOR[profile];

  const assignedEpics = epics.filter(e => e.assignedTo === profile);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960 }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderRadius: 8,
        background: `${color}11`, border: `1px solid ${color}33`,
        fontSize: '0.75rem', color,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontWeight: 700 }}>{profile}</span>
        <span style={{ color: '#6b7280' }}>·</span>
        <span style={{ color: '#9ca3af' }}>担当 Epic: {assignedEpics.length} 件</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setSection('EPIC')} style={{
          background: `${color}22`, border: `1px solid ${color}44`,
          borderRadius: 5, color, fontSize: '0.62rem', padding: '3px 10px', cursor: 'pointer',
        }}>Epic 詳細 →</button>
      </div>

      {assignedEpics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#374151', fontSize: '0.8rem' }}>
          PM から Epic が割り当てられていません
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assignedEpics.map(epic => {
            const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
            const done    = epicTasks.filter(t => t.status === 'done').length;
            const active  = epicTasks.filter(t => t.status === 'in_progress').length;
            const blocked = epicTasks.filter(t => t.status === 'blocked').length;
            const total   = epicTasks.length;
            const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
            const activeTasks    = epicTasks.filter(t => t.status === 'in_progress');
            const pendingTasks   = epicTasks.filter(t => t.status === 'pending');
            const blockedTasks   = epicTasks.filter(t => t.status === 'blocked');

            return (
              <Panel key={epic.id} title={`${epic.id} — ${epic.title}`} icon="◈">
                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                      {done}/{total} 完了 · {active} 進行中 · {blocked} ブロック
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: pct === 100 ? '#34d399' : color }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: '#1f2937', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(done / (total || 1)) * 100}%`, background: '#34d399', transition: 'width 0.3s' }} />
                    <div style={{ width: `${(active / (total || 1)) * 100}%`, background: '#fbbf24' }} />
                    <div style={{ width: `${(blocked / (total || 1)) * 100}%`, background: '#f87171' }} />
                  </div>
                </div>

                {/* Task groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PlannerTaskGroup label="進行中" tasks={activeTasks} color="#fbbf24" />
                  <PlannerTaskGroup label="待機" tasks={pendingTasks} color="#4b5563" />
                  {blockedTasks.length > 0 && <PlannerTaskGroup label="ブロック" tasks={blockedTasks} color="#f87171" />}
                </div>

                {/* Reports count + quick deliver */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                    📄 Reports: {epic.reports?.length ?? 0}
                  </span>
                  <button onClick={() => setSection('EPIC')} style={{
                    marginLeft: 'auto', background: `${color}22`,
                    border: `1px solid ${color}44`, borderRadius: 5,
                    color, fontSize: '0.62rem', padding: '3px 10px', cursor: 'pointer',
                  }}>+ レポート納品</button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlannerTaskGroup({ label, tasks, color }: {
  label: string;
  tasks: ReturnType<typeof useDevStudioStore.getState>['tasks'];
  color: string;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <div style={{ fontSize: '0.6rem', color, letterSpacing: '0.08em', marginBottom: 4 }}>
        {label} ({tasks.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tasks.map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 8px', borderRadius: 5,
            background: 'rgba(255,255,255,0.02)',
            borderLeft: `2px solid ${color}`,
          }}>
            <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{t.id}</span>
            <span style={{ flex: 1, fontSize: '0.72rem', color: '#d1d5db' }}>{t.title}</span>
            <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{t.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Programmer Dashboard ─────────────────────────────────────

function ProgrammerDashboard() {
  const { tasks, selectTask, setSection } = useDevStudioStore();
  const implTasks = tasks
    .filter(t => t.type === 'implement' && t.status !== 'done')
    .sort((a, b) => {
      const pOrder = { P0: 0, P1: 1, P2: 2 };
      return (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Phase" icon="📍" helpPages={HELP_PHASE}><PhasePanel /></Panel>
        <Panel title="Recent Logs" icon="📋"><LogsPanel /></Panel>
      </div>
      <Panel title="Implement Queue" icon="⚙">
        {implTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#374151', fontSize: '0.72rem' }}>
            実装タスクなし
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {implTasks.map(t => (
              <button key={t.id} onClick={() => { selectTask(t.id); setSection('WORKSPACE'); }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                background: 'rgba(248,113,113,0.05)',
                border: '1px solid rgba(248,113,113,0.12)',
                borderLeft: `3px solid ${t.priority === 'P0' ? '#f87171' : t.priority === 'P1' ? '#fbbf24' : '#4b5563'}`,
              }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700,
                  color: t.priority === 'P0' ? '#f87171' : t.priority === 'P1' ? '#fbbf24' : '#6b7280',
                  background: t.priority === 'P0' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                }}>{t.priority}</span>
                <span style={{ flex: 1, fontSize: '0.75rem', color: '#d1d5db' }}>{t.title}</span>
                <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{t.epicId ?? '—'}</span>
                <span style={{ fontSize: '0.65rem', color: '#374151' }}>→</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── Default Dashboard (Writer / Designer) ────────────────────

function DefaultDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
      <Panel title="Phase" icon="📍" helpPages={HELP_PHASE}><PhasePanel /></Panel>
      <Panel title="Tasks" icon="☑"><TasksPanel /></Panel>
      <Panel title="Recent Logs" icon="📋"><LogsPanel /></Panel>
      <Panel title="Orchestra" icon="🤖"><AgentPanel /></Panel>
    </div>
  );
}

// ─── TodayTasksPanel ─────────────────────────────────────────

function needsHuman(t: { type?: string; status: string }) {
  if (t.status === 'done') return false;
  return t.type === 'decision' || t.type === 'review' || t.status === 'blocked';
}

function TodayTasksPanel() {
  const { tasks, setSection, selectTask } = useDevStudioStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.date === today && needsHuman(t));

  const handleClick = (taskId: string) => {
    selectTask(taskId);
    setSection('WORKSPACE');
  };

  const TYPE_COLOR: Record<string, { bg: string; bar: string; label: string }> = {
    decision:  { bg: 'rgba(251,191,36,0.08)',  bar: '#fbbf24', label: '決定依頼' },
    implement: { bg: 'rgba(96,165,250,0.06)',  bar: '#60a5fa', label: '実装' },
    review:    { bg: 'rgba(52,211,153,0.06)',  bar: '#34d399', label: 'レビュー' },
    default:   { bg: 'rgba(255,255,255,0.03)', bar: '#4b5563', label: 'タスク' },
  };

  const STATUS_ICON: Record<string, string> = {
    pending: '○', in_progress: '▶', blocked: '✕',
  };

  if (todayTasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#374151', fontSize: '0.75rem' }}>
        あなたの判断が必要なタスクはありません
        <div style={{ marginTop: 6, fontSize: '0.65rem', color: '#2d2d3f' }}>
          `decision` / `review` / `blocked` タスクがここに表示されます
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {todayTasks.map(task => {
        const taskType = task.type === 'decision' ? 'decision'
          : task.type === 'review' ? 'review' : 'default';
        const c = TYPE_COLOR[taskType];
        return (
          <button key={task.id} onClick={() => handleClick(task.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: c.bg, border: '1px solid rgba(255,255,255,0.05)',
            borderLeft: `3px solid ${c.bar}`,
            borderRadius: '0 6px 6px 0',
            padding: '7px 10px', cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <span style={{ fontSize: '0.65rem', color: c.bar, flexShrink: 0 }}>
              {STATUS_ICON[task.status] ?? '○'}
            </span>
            <span style={{
              flex: 1, fontSize: '0.72rem', color: '#d1d5db',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {task.title}
            </span>
            <span style={{
              fontSize: '0.55rem', color: c.bar,
              background: `${c.bar}22`, borderRadius: 8, padding: '1px 6px', flexShrink: 0,
            }}>{c.label}</span>
            <span style={{ fontSize: '0.65rem', color: '#374151', flexShrink: 0 }}>→</span>
          </button>
        );
      })}
      <div style={{ fontSize: '0.6rem', color: '#2d2d3f', textAlign: 'right', marginTop: 2 }}>
        クリックで WorkSpace へ
      </div>
    </div>
  );
}

// ─── Logs full ───────────────────────────────────────────────

function LogsFullView() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader title="Dev Logs" icon="📋" />
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
        <DevLogViewer />
      </div>
    </div>
  );
}

// ─── WorkSpace ───────────────────────────────────────────────

function WorkspaceView() {
  const { tasks, ui } = useDevStudioStore();
  const selectedTask = tasks.find(t => t.id === ui.selectedTaskId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
      <SectionHeader title="WorkSpace" icon="🗄" />
      {selectedTask ? <DecisionCard task={selectedTask} /> : <WorkspaceEmpty />}
    </div>
  );
}

function WorkspaceEmpty() {
  const { tasks, selectTask } = useDevStudioStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.date === today && needsHuman(t));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        padding: '24px', textAlign: 'center',
        background: 'rgba(255,255,255,0.02)', borderRadius: 8,
        border: '1px dashed rgba(255,255,255,0.08)',
        color: '#374151', fontSize: '0.8rem',
      }}>
        タスクを選択してください
        <div style={{ fontSize: '0.65rem', color: '#2d2d3f', marginTop: 4 }}>
          Today's Tasks をクリックするか、下から選択
        </div>
      </div>
      {todayTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: '0.62rem', color: '#4b5563', letterSpacing: '0.08em' }}>TODAY'S TASKS</span>
          {todayTasks.map(t => (
            <button key={t.id} onClick={() => selectTask(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 6, padding: '8px 12px', cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>→ 開く</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DecisionCard({ task }: { task: ReturnType<typeof useDevStudioStore.getState>['tasks'][0] }) {
  const { selectTask } = useDevStudioStore();
  const isDecision = task.type === 'decision';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={() => selectTask(null)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#6b7280', fontSize: '0.7rem', textAlign: 'left', padding: 0,
      }}>← タスク選択に戻る</button>

      <div style={{
        background: isDecision ? 'rgba(251,191,36,0.06)' : 'rgba(167,139,250,0.06)',
        border: `1px solid ${isDecision ? 'rgba(251,191,36,0.25)' : 'rgba(167,139,250,0.2)'}`,
        borderRadius: 8, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>{isDecision ? '🔷' : '⚙️'}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e5e7eb' }}>{task.title}</span>
          <span style={{
            fontSize: '0.58rem', color: isDecision ? '#fbbf24' : '#a78bfa',
            background: isDecision ? 'rgba(251,191,36,0.15)' : 'rgba(167,139,250,0.15)',
            borderRadius: 8, padding: '1px 6px', flexShrink: 0,
          }}>{isDecision ? '決定依頼' : task.priority}</span>
        </div>
        {task.description && (
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
            {task.description}
          </p>
        )}
      </div>

      {isDecision ? <DecisionForm task={task} /> : (
        <div style={{
          padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 8,
          border: '1px dashed rgba(255,255,255,0.08)',
          fontSize: '0.75rem', color: '#4b5563', textAlign: 'center',
        }}>
          このタスクの作業フォームは実装中です。
          <div style={{ fontSize: '0.65rem', marginTop: 4, color: '#2d2d3f' }}>
            AIに「このタスクのDecisionフォームを作って」と依頼してください
          </div>
        </div>
      )}
    </div>
  );
}

function DecisionForm({ task: _task }: { task: any }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: 8,
      border: '1px solid rgba(251,191,36,0.15)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700,
      }}>
        📋 Decision Form — v1 (MD形式)
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>
          このタスクの決定フォームはまだ設計されていません。
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '10px 12px',
          fontSize: '0.65rem', color: '#4b5563', lineHeight: 1.8,
        }}>
          <div style={{ color: '#9ca3af', marginBottom: 6, fontWeight: 700 }}>フォームテンプレート（例）</div>
          <div>## 背景</div>
          <div style={{ color: '#374151', marginBottom: 8 }}>（AIがここに記入）</div>
          <div>## 選択肢</div>
          <div>- [ ] A: ...</div>
          <div style={{ marginBottom: 8 }}>- [ ] B: ...</div>
          <div>## 記入欄</div>
          <div style={{ color: '#374151' }}>（あなたの回答）</div>
        </div>
      </div>
    </div>
  );
}

// ─── Orchestra ───────────────────────────────────────────────

function OrchestraView() {
  return (
    <div>
      <SectionHeader title="Orchestra" icon="🤖" />
      <AgentPanel />
    </div>
  );
}

// ─── Shared ──────────────────────────────────────────────────

function Panel({ title, icon, helpPages, children }: {
  title: string; icon: string; helpPages?: HelpPage[]; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.07)', padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8,
      }}>
        <span>{icon}</span>
        <span style={{ flex: 1 }}>{title}</span>
        {helpPages && <HelpPopup pages={helpPages} />}
      </div>
      {children}
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <h2 style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: '1rem', fontWeight: 700, color: '#c4b5fd',
      borderBottom: '1px solid rgba(167,139,250,0.2)',
      margin: '0 0 16px 0', paddingBottom: 8,
    }}>
      <span>{icon}</span> {title}
    </h2>
  );
}
