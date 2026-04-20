// ============================================================
// EpicsScreen — Epic 一覧 + レポート管理
// ============================================================

import { useState } from 'react';
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { Epic, EpicReport, Milestone, Task, TaskStatus } from '@/devstudio/core/types';

// ─── Status helpers ──────────────────────────────────────────

const STATUS_COLOR: Record<TaskStatus, string> = {
  done:        '#34d399',
  in_progress: '#fbbf24',
  pending:     '#4b5563',
  blocked:     '#f87171',
};

function epicProgress(epic: Epic, tasks: Task[]) {
  const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
  const done      = epicTasks.filter(t => t.status === 'done').length;
  const active    = epicTasks.filter(t => t.status === 'in_progress').length;
  const blocked   = epicTasks.filter(t => t.status === 'blocked').length;
  const total     = epicTasks.length;
  return { done, active, blocked, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// ─── Report Form ─────────────────────────────────────────────

function ReportForm({ epicId, onDone }: { epicId: string; onDone: () => void }) {
  const { addReport } = useDevStudioStore();
  const [title, setTitle] = useState('');
  const [body,  setBody]  = useState('');

  function submit() {
    if (!title.trim() || !body.trim()) return;
    addReport(epicId, {
      id:    `R-${epicId}-${Date.now()}`,
      title: title.trim(),
      body:  body.trim(),
      date:  new Date().toISOString().slice(0, 10),
      author: 'User',
    });
    onDone();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        autoFocus
        placeholder="レポートタイトル"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 6, padding: '6px 10px', color: '#d1d5db', fontSize: '0.8rem',
          outline: 'none',
        }}
      />
      <textarea
        placeholder="レポート本文（Markdown）"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={12}
        style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 6, padding: '8px 10px', color: '#d1d5db', fontSize: '0.75rem',
          outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6,
        }}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onDone} style={{
          padding: '5px 14px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: '#6b7280', fontSize: '0.75rem', cursor: 'pointer',
        }}>キャンセル</button>
        <button onClick={submit} style={{
          padding: '5px 14px', borderRadius: 5, border: 'none',
          background: 'rgba(139,92,246,0.6)', color: '#fff', fontSize: '0.75rem',
          cursor: 'pointer', fontWeight: 700,
        }}>納品</button>
      </div>
    </div>
  );
}

// ─── Report Card ─────────────────────────────────────────────

function ReportCard({ report, epicId }: { report: EpicReport; epicId: string }) {
  const { deleteReport } = useDevStudioStore();
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover]       = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${expanded ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 7, overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', cursor: 'pointer',
          background: expanded ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: '0.65rem', color: '#6b7280', flexShrink: 0 }}>{expanded ? '▾' : '▸'}</span>
        <span style={{ flex: 1, fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600 }}>
          {report.title}
        </span>
        <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{report.date}</span>
        {report.author && (
          <span style={{
            fontSize: '0.6rem', color: '#6b7280',
            background: 'rgba(255,255,255,0.05)', borderRadius: 3, padding: '1px 5px',
          }}>{report.author}</span>
        )}
        {hover && (
          <button
            onClick={e => { e.stopPropagation(); deleteReport(epicId, report.id); }}
            style={{
              background: 'rgba(248,113,113,0.15)', border: 'none', borderRadius: 3,
              color: '#f87171', fontSize: '0.65rem', padding: '1px 6px', cursor: 'pointer',
            }}
          >削除</button>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <div style={{
          padding: '12px 14px',
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <pre style={{
            margin: 0, fontSize: '0.72rem', color: '#9ca3af',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: 'monospace', lineHeight: 1.65,
          }}>{report.body}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Epic Detail Panel ────────────────────────────────────────

function EpicDetail({ epic }: { epic: Epic }) {
  const { tasks, deleteReport: _dr } = useDevStudioStore();
  const [tab,        setTab]        = useState<'tasks' | 'reports'>('tasks');
  const [addingReport, setAdding]   = useState(false);

  const epicTasks = tasks.filter(t => epic.taskIds.includes(t.id));
  const reports   = epic.reports ?? [];
  const prog      = epicProgress(epic, tasks);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c4b5fd', marginBottom: 4 }}>
          {epic.id} — {epic.title}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {epic.tags.map(t => (
            <span key={t} style={{
              fontSize: '0.6rem', color: '#7c3aed',
              background: 'rgba(124,58,237,0.15)', borderRadius: 3, padding: '1px 6px',
            }}>{t}</span>
          ))}
        </div>
        {/* progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: '#1f2937', overflow: 'hidden', display: 'flex' }}>
          {prog.total > 0 && <>
            <div style={{ width: `${(prog.done / prog.total) * 100}%`, background: '#34d399' }} />
            <div style={{ width: `${(prog.active / prog.total) * 100}%`, background: '#fbbf24' }} />
            <div style={{ width: `${(prog.blocked / prog.total) * 100}%`, background: '#f87171' }} />
          </>}
        </div>
        <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: 3 }}>
          {prog.done}/{prog.total} 完了 · {prog.active} 進行中 · {prog.blocked} ブロック
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8 }}>
        {(['tasks', 'reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: tab === t ? 'rgba(139,92,246,0.4)' : 'transparent',
            color: tab === t ? '#e9d5ff' : '#6b7280',
            fontSize: '0.72rem', fontWeight: tab === t ? 700 : 400,
          }}>
            {t === 'tasks'   ? `Tasks (${epicTasks.length})` : `Reports (${reports.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {epicTasks.length === 0 && (
              <div style={{ fontSize: '0.72rem', color: '#374151', textAlign: 'center', padding: '20px 0' }}>
                タスクなし
              </div>
            )}
            {epicTasks.map(task => (
              <div key={task.id} style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '6px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                opacity: task.status === 'done' ? 0.5 : 1,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: STATUS_COLOR[task.status],
                }} />
                <span style={{ flex: 1, fontSize: '0.75rem', color: '#d1d5db' }}>{task.title}</span>
                <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{task.id}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {!addingReport && (
              <button onClick={() => setAdding(true)} style={{
                padding: '7px 0', borderRadius: 6,
                border: '1px dashed rgba(139,92,246,0.35)',
                background: 'transparent', color: '#7c3aed',
                fontSize: '0.73rem', cursor: 'pointer', width: '100%',
                marginBottom: 4,
              }}>+ レポートを納品する</button>
            )}
            {addingReport && (
              <div style={{
                border: '1px solid rgba(167,139,250,0.3)', borderRadius: 7,
                padding: 12, background: 'rgba(139,92,246,0.06)',
                marginBottom: 8,
              }}>
                <ReportForm epicId={epic.id} onDone={() => setAdding(false)} />
              </div>
            )}
            {reports.length === 0 && !addingReport && (
              <div style={{ fontSize: '0.72rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>
                レポートなし
              </div>
            )}
            {[...reports].reverse().map(r => (
              <ReportCard key={r.id} report={r} epicId={epic.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Epic List Item ───────────────────────────────────────────

function EpicListItem({
  epic, selected, onClick,
}: { epic: Epic; selected: boolean; onClick: () => void }) {
  const { tasks } = useDevStudioStore();
  const prog = epicProgress(epic, tasks);

  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px', borderRadius: 7, cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.07)'}`,
        background: selected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>{epic.id}</span>
        <span style={{ flex: 1, fontSize: '0.78rem', color: selected ? '#c4b5fd' : '#d1d5db', fontWeight: 600 }}>
          {epic.title}
        </span>
        <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700 }}>{prog.pct}%</span>
      </div>
      {/* mini progress bar */}
      <div style={{ height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden', display: 'flex' }}>
        {prog.total > 0 && <>
          <div style={{ width: `${(prog.done / prog.total) * 100}%`, background: '#34d399', transition: 'width 0.3s' }} />
          <div style={{ width: `${(prog.active / prog.total) * 100}%`, background: '#fbbf24' }} />
          <div style={{ width: `${(prog.blocked / prog.total) * 100}%`, background: '#f87171' }} />
        </>}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
        {epic.tags.slice(0, 3).map(t => (
          <span key={t} style={{
            fontSize: '0.58rem', color: '#6b7280',
            background: 'rgba(255,255,255,0.05)', borderRadius: 3, padding: '1px 5px',
          }}>{t}</span>
        ))}
        {(epic.reports?.length ?? 0) > 0 && (
          <span style={{
            fontSize: '0.58rem', color: '#a78bfa',
            background: 'rgba(167,139,250,0.12)', borderRadius: 3, padding: '1px 5px', marginLeft: 'auto',
          }}>📄 {epic.reports!.length}</span>
        )}
      </div>
    </div>
  );
}

// ─── Milestones View ─────────────────────────────────────────

function MilestonesView() {
  const { milestones, toggleCriterion, addCriterion, deleteCriterion, addMilestone, deleteMilestone } = useDevStudioStore();
  const [newText, setNewText]         = useState<Record<string, string>>({});
  const [addingId, setAddingId]       = useState<string | null>(null);
  const [newMsTitle, setNewMsTitle]   = useState('');
  const [addingMs, setAddingMs]       = useState(false);

  function submitCriterion(msId: string) {
    const text = (newText[msId] ?? '').trim();
    if (!text) return;
    addCriterion(msId, { id: `${msId}-${Date.now()}`, text, checked: false });
    setNewText(prev => ({ ...prev, [msId]: '' }));
    setAddingId(null);
  }

  function submitMilestone() {
    if (!newMsTitle.trim()) return;
    const nextNum = String(milestones.length + 1).padStart(2, '0');
    addMilestone({ id: `DONE${nextNum}`, title: newMsTitle.trim(), criteria: [] });
    setNewMsTitle('');
    setAddingMs(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.65rem', color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Milestones — DONE 定義
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setAddingMs(v => !v)} style={{
          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: 5, color: '#34d399', fontSize: '0.65rem', padding: '3px 10px', cursor: 'pointer',
        }}>+ DONE 追加</button>
      </div>

      {addingMs && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            autoFocus
            placeholder="DONE タイトル（例：最低限リリース可能）"
            value={newMsTitle}
            onChange={e => setNewMsTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitMilestone(); if (e.key === 'Escape') setAddingMs(false); }}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: 6, padding: '6px 10px', color: '#d1d5db', fontSize: '0.78rem', outline: 'none',
            }}
          />
          <button onClick={submitMilestone} style={{
            background: 'rgba(52,211,153,0.2)', border: 'none', borderRadius: 5,
            color: '#34d399', fontSize: '0.72rem', padding: '0 12px', cursor: 'pointer',
          }}>追加</button>
        </div>
      )}

      {milestones.map(ms => {
        const total   = ms.criteria.length;
        const checked = ms.criteria.filter(c => c.checked).length;
        const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;
        const done    = total > 0 && checked === total;

        return (
          <div key={ms.id} style={{
            borderRadius: 10,
            border: `1px solid ${done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: done ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}>
            {/* Milestone header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: done ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.02)',
            }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700,
                color: done ? '#34d399' : '#c9a227',
                background: done ? 'rgba(52,211,153,0.15)' : 'rgba(201,162,39,0.12)',
                borderRadius: 4, padding: '2px 8px', flexShrink: 0,
              }}>{ms.id}</span>
              <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 700, color: done ? '#34d399' : '#e5e7eb' }}>
                {ms.title}
              </span>
              {/* progress */}
              <span style={{ fontSize: '0.62rem', color: done ? '#34d399' : '#6b7280', flexShrink: 0 }}>
                {checked}/{total}
              </span>
              <div style={{ width: 60, height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: done ? '#34d399' : '#c9a227', transition: 'width 0.3s' }} />
              </div>
              {done && <span style={{ fontSize: '0.72rem', flexShrink: 0 }}>✓</span>}
              <button
                onClick={() => deleteMilestone(ms.id)}
                title="削除"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#374151', fontSize: '0.65rem', padding: '0 4px',
                  flexShrink: 0,
                }}>✕</button>
            </div>

            {/* Description */}
            {ms.description && (
              <div style={{ padding: '6px 14px 0', fontSize: '0.65rem', color: '#4b5563' }}>
                {ms.description}
              </div>
            )}

            {/* Criteria */}
            <div style={{ padding: '8px 14px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ms.criteria.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '5px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <button
                    onClick={() => toggleCriterion(ms.id, c.id)}
                    style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      border: `1.5px solid ${c.checked ? '#34d399' : 'rgba(255,255,255,0.2)'}`,
                      background: c.checked ? '#34d399' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {c.checked && <span style={{ fontSize: '0.55rem', color: '#000', fontWeight: 900 }}>✓</span>}
                  </button>
                  <span style={{
                    flex: 1, fontSize: '0.75rem',
                    color: c.checked ? '#4b5563' : '#d1d5db',
                    textDecoration: c.checked ? 'line-through' : 'none',
                    lineHeight: 1.5,
                  }}>{c.text}</span>
                  <button
                    onClick={() => deleteCriterion(ms.id, c.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#374151', fontSize: '0.6rem', padding: '0 2px', flexShrink: 0,
                    }}>✕</button>
                </div>
              ))}

              {/* Add criterion */}
              {addingId === ms.id ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    autoFocus
                    placeholder="達成条件を入力..."
                    value={newText[ms.id] ?? ''}
                    onChange={e => setNewText(prev => ({ ...prev, [ms.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') submitCriterion(ms.id);
                      if (e.key === 'Escape') setAddingId(null);
                    }}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 5, padding: '5px 8px',
                      color: '#d1d5db', fontSize: '0.73rem', outline: 'none',
                    }}
                  />
                  <button onClick={() => submitCriterion(ms.id)} style={{
                    background: 'rgba(201,162,39,0.2)', border: 'none', borderRadius: 4,
                    color: '#c9a227', fontSize: '0.68rem', padding: '0 10px', cursor: 'pointer',
                  }}>追加</button>
                </div>
              ) : (
                <button onClick={() => setAddingId(ms.id)} style={{
                  background: 'none', border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: 5, color: '#4b5563', fontSize: '0.65rem',
                  padding: '5px 0', cursor: 'pointer', marginTop: 2,
                }}>+ 達成条件を追加</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────

export function EpicsScreen() {
  const { epics } = useDevStudioStore();
  const [view, setView]               = useState<'epics' | 'milestones'>('epics');
  const [selectedId, setSelectedId]   = useState<string | null>(epics[0]?.id ?? null);
  const selected = epics.find(e => e.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top tab toggle */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 14,
        borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 10,
      }}>
        {(['epics', 'milestones'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '4px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
            background: view === v
              ? (v === 'milestones' ? 'rgba(52,211,153,0.2)' : 'rgba(139,92,246,0.2)')
              : 'transparent',
            color: view === v
              ? (v === 'milestones' ? '#34d399' : '#c4b5fd')
              : '#4b5563',
            fontSize: '0.73rem', fontWeight: view === v ? 700 : 400,
            transition: 'all 0.15s',
          }}>
            {v === 'epics' ? `◈ Epics (${epics.length})` : `✓ Milestones`}
          </button>
        ))}
      </div>

      {view === 'milestones' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <MilestonesView />
        </div>
      )}

      {view === 'epics' && (
    <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden' }}>
      {/* Left: Epic list */}
      <div style={{
        width: 260, flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        overflowY: 'auto', padding: '0 12px 0 0',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{
          fontSize: '0.62rem', color: '#4b5563',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 4, paddingBottom: 6,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          Epics ({epics.length})
        </div>
        {epics.map(e => (
          <EpicListItem
            key={e.id}
            epic={e}
            selected={selectedId === e.id}
            onClick={() => setSelectedId(e.id)}
          />
        ))}
      </div>

      {/* Right: Detail */}
      <div style={{ flex: 1, paddingLeft: 20, overflowY: 'auto' }}>
        {selected
          ? <EpicDetail key={selected.id} epic={selected} />
          : <div style={{ color: '#374151', fontSize: '0.8rem', padding: '40px 0', textAlign: 'center' }}>
              Epic を選択してください
            </div>
        }
      </div>
    </div>
      )}
    </div>
  );
}
