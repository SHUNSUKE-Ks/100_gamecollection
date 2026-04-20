// ============================================================
// AndroidView01 — DashboardPage
// モバイル版ダッシュボード (PM / Planner / Programmer / Default)
// ============================================================

import { useDashboardAdapter } from '../adapters/useDashboardAdapter';
import { MobilePanel } from '../components/MobilePanel';
import { PROFILE_COLOR } from '../adapters/useStudioAdapter';
import type { ViewProfile } from '@/devstudio/core/types';

// ─── Phase stepper ────────────────────────────────────────────

const PHASES = [
  { id: 'IDEA',      label: 'Idea',      icon: '💡' },
  { id: 'DESIGN',    label: 'Design',    icon: '✏️' },
  { id: 'IMPLEMENT', label: 'Implement', icon: '⚙️' },
  { id: 'TEST',      label: 'Test',      icon: '🧪' },
  { id: 'RELEASE',   label: 'Release',   icon: '🚀' },
];

// ─── Main ─────────────────────────────────────────────────────

export function DashboardPage() {
  const adapter = useDashboardAdapter();
  const { profile } = adapter;

  if (profile === 'PM') return <PMDash adapter={adapter} />;
  if (profile === 'Planner01' || profile === 'Planner02' || profile === 'Planner03')
    return <PlannerDash adapter={adapter} />;
  if (profile === 'Programmer') return <ProgrammerDash adapter={adapter} />;
  return <DefaultDash adapter={adapter} />;
}

// ─── Phase Panel ──────────────────────────────────────────────

function PhaseMini({ adapter }: { adapter: ReturnType<typeof useDashboardAdapter> }) {
  const { phase, taskCountByStatus, setPhase } = adapter;
  const idx = PHASES.findIndex(p => p.id === phase);

  return (
    <div>
      {/* ステッパー */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        {PHASES.map((p, i) => {
          const active = p.id === phase;
          const past   = i < idx;
          const color  = active ? '#c9a227' : past ? '#34d399' : '#374151';
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <button onClick={() => setPhase(p.id as any)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                flex: 1,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: active ? 'rgba(201,162,39,0.15)' : past ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                }}>
                  {past ? '✓' : p.icon}
                </div>
                <span style={{
                  fontSize: '0.6rem',
                  color: active ? '#c9a227' : past ? '#6b7280' : '#374151',
                  fontWeight: active ? 700 : 400,
                }}>
                  {p.label}
                </span>
              </button>
              {i < PHASES.length - 1 && (
                <div style={{
                  height: 2, width: 6, flexShrink: 0,
                  background: i < idx ? '#34d399' : '#1f2937',
                  marginBottom: 16,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ステータス件数 */}
      <div style={{ display: 'flex', gap: 6 }}>
        {([
          { key: 'pending',     label: '待機',   bg: 'rgba(96,165,250,0.1)',  text: '#60a5fa' },
          { key: 'in_progress', label: '進行中', bg: 'rgba(201,162,39,0.1)', text: '#c9a227' },
          { key: 'done',        label: '完了',   bg: 'rgba(52,211,153,0.1)', text: '#34d399' },
          { key: 'blocked',     label: 'ブロック', bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
        ] as const).map(({ key, label, bg, text }) => (
          <div key={key} style={{
            flex: 1, background: bg, borderRadius: 8, padding: '6px 4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: text }}>
              {taskCountByStatus[key]}
            </div>
            <div style={{ fontSize: '0.58rem', color: '#6b7280' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PM Dashboard ─────────────────────────────────────────────

function PMDash({ adapter }: { adapter: ReturnType<typeof useDashboardAdapter> }) {
  const { epicsWithProgress, allReports, milestones, todayTasks, toggleCriterion, updateEpic, setSection, selectTask } = adapter;

  return (
    <div style={{ padding: 14 }}>
      {/* Phase */}
      <MobilePanel title="Phase" icon="📍">
        <PhaseMini adapter={adapter} />
      </MobilePanel>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <MobilePanel title="Today's Tasks" icon="🎯">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayTasks.map(task => {
              const c = task.type === 'decision' ? '#fbbf24' : task.status === 'blocked' ? '#f87171' : '#34d399';
              return (
                <button key={task.id} onClick={() => { selectTask(task.id); setSection('WORKSPACE'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: `${c}09`, border: `1px solid ${c}22`,
                  borderLeft: `3px solid ${c}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 12px', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                  <span style={{ flex: 1, fontSize: '0.78rem', color: '#d1d5db' }}>{task.title}</span>
                  <span style={{ fontSize: '0.6rem', color: c, background: `${c}22`, borderRadius: 8, padding: '2px 7px' }}>
                    {task.type === 'decision' ? '決定依頼' : task.status === 'blocked' ? 'ブロック' : 'レビュー'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#374151' }}>→</span>
                </button>
              );
            })}
          </div>
        </MobilePanel>
      )}

      {/* Epics Overview */}
      <MobilePanel title="Epics" icon="◈">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {epicsWithProgress.map(epic => (
            <div key={epic.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: '0.6rem', color: '#c9a227', flexShrink: 0 }}>{epic.id}</span>
              <span style={{ flex: 1, fontSize: '0.78rem', color: '#d1d5db' }}>{epic.title}</span>
              {/* mini progress */}
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden' }}>
                <div style={{ width: `${epic.pct}%`, height: '100%', background: '#34d399' }} />
              </div>
              <span style={{ fontSize: '0.6rem', color: '#6b7280', width: 28, textAlign: 'right' }}>{epic.pct}%</span>
              {/* Assignee selector */}
              <select
                value={epic.assignedTo ?? ''}
                onChange={e => updateEpic({ ...epic, assignedTo: e.target.value || undefined })}
                style={{
                  background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4, color: epic.assignedTo ? PROFILE_COLOR[epic.assignedTo as ViewProfile] ?? '#9ca3af' : '#4b5563',
                  fontSize: '0.6rem', padding: '2px 4px', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="">—</option>
                {(['Planner01', 'Planner02', 'Planner03'] as ViewProfile[]).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </MobilePanel>

      {/* Reports Inbox */}
      {allReports.length > 0 && (
        <MobilePanel title="Reports Inbox" icon="📥">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allReports.slice(0, 4).map(r => (
              <button key={r.id} onClick={() => setSection('EPIC')} style={{
                display: 'flex', flexDirection: 'column', gap: 3,
                padding: '9px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.6rem', color: '#c9a227' }}>{r.epicId}</span>
                  <span style={{ flex: 1, fontSize: '0.75rem', color: '#c4b5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                  <span style={{ fontSize: '0.58rem', color: '#4b5563' }}>{r.date}</span>
                </div>
                {r.author && <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>by {r.author} · {r.epicTitle}</div>}
              </button>
            ))}
          </div>
        </MobilePanel>
      )}

      {/* Milestones */}
      <MobilePanel title="Milestones" icon="✓">
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
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700,
                    color: done ? '#34d399' : '#c9a227',
                    background: done ? 'rgba(52,211,153,0.12)' : 'rgba(201,162,39,0.1)',
                    borderRadius: 3, padding: '1px 6px',
                  }}>{ms.id}</span>
                  <span style={{ flex: 1, fontSize: '0.78rem', color: done ? '#34d399' : '#d1d5db', fontWeight: 600 }}>{ms.title}</span>
                  <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{checked}/{total}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: done ? '#34d399' : '#c9a227', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {ms.criteria.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => toggleCriterion(ms.id, c.id)} style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${c.checked ? '#34d399' : 'rgba(255,255,255,0.18)'}`,
                        background: c.checked ? '#34d399' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {c.checked && <span style={{ fontSize: '0.6rem', color: '#000', fontWeight: 900 }}>✓</span>}
                      </button>
                      <span style={{
                        fontSize: '0.73rem',
                        color: c.checked ? '#4b5563' : '#9ca3af',
                        textDecoration: c.checked ? 'line-through' : 'none',
                      }}>{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </MobilePanel>
    </div>
  );
}

// ─── Planner Dashboard ────────────────────────────────────────

function PlannerDash({ adapter }: { adapter: ReturnType<typeof useDashboardAdapter> }) {
  const { profile, color, assignedEpicsWithTasks, setSection } = adapter;

  return (
    <div style={{ padding: 14 }}>
      {/* Phase */}
      <MobilePanel title="Phase" icon="📍">
        <PhaseMini adapter={adapter} />
      </MobilePanel>

      {/* プロファイルヘッダー */}
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: `${color}11`, border: `1px solid ${color}33`,
        fontSize: '0.78rem', color,
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontWeight: 700 }}>{profile}</span>
        <span style={{ color: '#6b7280' }}>·</span>
        <span style={{ color: '#9ca3af' }}>担当 Epic: {assignedEpicsWithTasks.length} 件</span>
        <button onClick={() => setSection('EPIC')} style={{
          marginLeft: 'auto', background: `${color}22`, border: `1px solid ${color}44`,
          borderRadius: 5, color, fontSize: '0.62rem', padding: '3px 10px', cursor: 'pointer',
        }}>Epic →</button>
      </div>

      {assignedEpicsWithTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#374151', fontSize: '0.8rem' }}>
          PM から Epic が割り当てられていません
        </div>
      ) : (
        assignedEpicsWithTasks.map(epic => (
          <MobilePanel key={epic.id} title={`${epic.id} — ${epic.title}`} icon="◈">
            {/* Progress bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                  {epic.done}/{epic.total} 完了 · {epic.active} 進行中 · {epic.blocked} ブロック
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: epic.pct === 100 ? '#34d399' : color }}>
                  {epic.pct}%
                </span>
              </div>
              <div style={{ height: 5, background: '#1f2937', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(epic.done / (epic.total || 1)) * 100}%`, background: '#34d399' }} />
                <div style={{ width: `${(epic.active / (epic.total || 1)) * 100}%`, background: '#fbbf24' }} />
                <div style={{ width: `${(epic.blocked / (epic.total || 1)) * 100}%`, background: '#f87171' }} />
              </div>
            </div>

            {/* Task groups */}
            {[
              { label: '進行中', tasks: epic.activeTasks,  tc: '#fbbf24' },
              { label: '待機',   tasks: epic.pendingTasks, tc: '#4b5563' },
              { label: 'ブロック', tasks: epic.blockedTasks, tc: '#f87171' },
            ].filter(g => g.tasks.length > 0).map(g => (
              <div key={g.label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.6rem', color: g.tc, marginBottom: 4 }}>{g.label} ({g.tasks.length})</div>
                {g.tasks.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '6px 8px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: `2px solid ${g.tc}`,
                    marginBottom: 3,
                  }}>
                    <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{t.id}</span>
                    <span style={{ flex: 1, fontSize: '0.74rem', color: '#d1d5db' }}>{t.title}</span>
                    <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{t.priority}</span>
                  </div>
                ))}
              </div>
            ))}
          </MobilePanel>
        ))
      )}
    </div>
  );
}

// ─── Programmer Dashboard ──────────────────────────────────────

function ProgrammerDash({ adapter }: { adapter: ReturnType<typeof useDashboardAdapter> }) {
  const { implQueue, setSection, selectTask } = adapter;

  return (
    <div style={{ padding: 14 }}>
      <MobilePanel title="Phase" icon="📍">
        <PhaseMini adapter={adapter} />
      </MobilePanel>

      <MobilePanel title="Implement Queue" icon="⚙">
        {implQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#374151', fontSize: '0.75rem' }}>
            実装タスクなし
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {implQueue.map(t => {
              const pColor = t.priority === 'P0' ? '#f87171' : t.priority === 'P1' ? '#fbbf24' : '#4b5563';
              return (
                <button key={t.id} onClick={() => { selectTask(t.id); setSection('WORKSPACE'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: 'rgba(248,113,113,0.04)',
                  border: '1px solid rgba(248,113,113,0.1)',
                  borderLeft: `3px solid ${pColor}`,
                }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, color: pColor,
                    background: `${pColor}18`, borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                  }}>{t.priority}</span>
                  <span style={{ flex: 1, fontSize: '0.78rem', color: '#d1d5db' }}>{t.title}</span>
                  <span style={{ fontSize: '0.65rem', color: '#374151' }}>→</span>
                </button>
              );
            })}
          </div>
        )}
      </MobilePanel>
    </div>
  );
}

// ─── Default Dashboard (Writer / Designer) ────────────────────

function DefaultDash({ adapter }: { adapter: ReturnType<typeof useDashboardAdapter> }) {
  return (
    <div style={{ padding: 14 }}>
      <MobilePanel title="Phase" icon="📍">
        <PhaseMini adapter={adapter} />
      </MobilePanel>
    </div>
  );
}
