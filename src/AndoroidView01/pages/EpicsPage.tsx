// ============================================================
// AndroidView01 — EpicsPage
// モバイル版Epic一覧 → 詳細はページ遷移（戻るボタンで戻る）
// ============================================================

import { useState } from 'react';
import { useEpicsAdapter } from '../adapters/useEpicsAdapter';
import { MobilePanel } from '../components/MobilePanel';
import type { Epic, EpicReport } from '@/devstudio/core/types';

// ─── Milestone View ───────────────────────────────────────────

function MilestonesView({ adapter }: { adapter: ReturnType<typeof useEpicsAdapter> }) {
  const { milestones, toggleCriterion, addCriterion, deleteCriterion, addMilestone, deleteMilestone } = adapter;
  const [newText, setNewText]     = useState<Record<string, string>>({});
  const [addingId, setAddingId]   = useState<string | null>(null);
  const [newMsTitle, setNewMsTitle] = useState('');
  const [addingMs, setAddingMs]   = useState(false);

  const submitCriterion = (msId: string) => {
    const text = (newText[msId] ?? '').trim();
    if (!text) return;
    addCriterion(msId, { id: `${msId}-${Date.now()}`, text, checked: false });
    setNewText(prev => ({ ...prev, [msId]: '' }));
    setAddingId(null);
  };

  const submitMilestone = () => {
    if (!newMsTitle.trim()) return;
    const nextNum = String(milestones.length + 1).padStart(2, '0');
    addMilestone({ id: `DONE${nextNum}`, title: newMsTitle.trim(), criteria: [] });
    setNewMsTitle('');
    setAddingMs(false);
  };

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ flex: 1, fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em' }}>MILESTONES</span>
        <button onClick={() => setAddingMs(v => !v)} style={{
          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: 6, color: '#34d399', fontSize: '0.65rem', padding: '4px 10px', cursor: 'pointer',
        }}>+ DONE 追加</button>
      </div>

      {addingMs && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <input
            autoFocus
            placeholder="DONEタイトル"
            value={newMsTitle}
            onChange={e => setNewMsTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitMilestone(); if (e.key === 'Escape') setAddingMs(false); }}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: 8, padding: '8px 12px', color: '#d1d5db',
              fontSize: '0.82rem', outline: 'none',
            }}
          />
          <button onClick={submitMilestone} style={{
            background: 'rgba(52,211,153,0.2)', border: 'none', borderRadius: 8,
            color: '#34d399', fontSize: '0.75rem', padding: '0 14px', cursor: 'pointer',
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
            overflow: 'hidden', marginBottom: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: done ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.02)',
            }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700,
                color: done ? '#34d399' : '#c9a227',
                background: done ? 'rgba(52,211,153,0.15)' : 'rgba(201,162,39,0.12)',
                borderRadius: 4, padding: '2px 8px',
              }}>{ms.id}</span>
              <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 700, color: done ? '#34d399' : '#e5e7eb' }}>{ms.title}</span>
              <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>{checked}/{total}</span>
              <div style={{ width: 50, height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: done ? '#34d399' : '#c9a227', transition: 'width 0.3s' }} />
              </div>
              <button onClick={() => deleteMilestone(ms.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.65rem',
              }}>✕</button>
            </div>

            <div style={{ padding: '8px 14px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ms.criteria.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '5px 0' }}>
                  <button onClick={() => toggleCriterion(ms.id, c.id)} style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${c.checked ? '#34d399' : 'rgba(255,255,255,0.2)'}`,
                    background: c.checked ? '#34d399' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {c.checked && <span style={{ fontSize: '0.6rem', color: '#000', fontWeight: 900 }}>✓</span>}
                  </button>
                  <span style={{
                    flex: 1, fontSize: '0.78rem',
                    color: c.checked ? '#4b5563' : '#d1d5db',
                    textDecoration: c.checked ? 'line-through' : 'none',
                    lineHeight: 1.5,
                  }}>{c.text}</span>
                  <button onClick={() => deleteCriterion(ms.id, c.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.62rem',
                  }}>✕</button>
                </div>
              ))}

              {addingId === ms.id ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    autoFocus
                    placeholder="達成条件を入力..."
                    value={newText[ms.id] ?? ''}
                    onChange={e => setNewText(prev => ({ ...prev, [ms.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') submitCriterion(ms.id); if (e.key === 'Escape') setAddingId(null); }}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6, padding: '7px 10px', color: '#d1d5db',
                      fontSize: '0.76rem', outline: 'none',
                    }}
                  />
                  <button onClick={() => submitCriterion(ms.id)} style={{
                    background: 'rgba(201,162,39,0.2)', border: 'none', borderRadius: 6,
                    color: '#c9a227', fontSize: '0.7rem', padding: '0 12px', cursor: 'pointer',
                  }}>追加</button>
                </div>
              ) : (
                <button onClick={() => setAddingId(ms.id)} style={{
                  background: 'none', border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: 6, color: '#4b5563', fontSize: '0.68rem',
                  padding: '7px 0', cursor: 'pointer', marginTop: 2,
                }}>+ 達成条件を追加</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Epic Detail ──────────────────────────────────────────────

function EpicDetail({ epicId, adapter, onBack }: { epicId: string; adapter: ReturnType<typeof useEpicsAdapter>; onBack: () => void }) {
  const { epics, getEpicTasks, getEpicProgress, addReport, deleteReport } = adapter;
  const epic = epics.find(e => e.id === epicId);
  const [tab, setTab]         = useState<'tasks' | 'reports'>('tasks');
  const [addingReport, setAdding] = useState(false);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');

  if (!epic) return null;
  const epicTasks = getEpicTasks(epicId);
  const prog      = getEpicProgress(epicId);

  const submitReport = () => {
    if (!title.trim() || !body.trim()) return;
    addReport(epicId, {
      id: `R-${epicId}-${Date.now()}`,
      title: title.trim(), body: body.trim(),
      date: new Date().toISOString().slice(0, 10),
      author: 'User',
    });
    setTitle(''); setBody(''); setAdding(false);
  };

  const STATUS_DOT: Record<string, string> = {
    done: '#34d399', in_progress: '#fbbf24', pending: '#4b5563', blocked: '#f87171',
  };

  return (
    <div style={{ padding: 14 }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#a78bfa', fontSize: '0.82rem', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4,
      }}>← Epic一覧に戻る</button>

      {/* Epic header */}
      <div style={{
        padding: '12px 14px', borderRadius: 10,
        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c4b5fd', marginBottom: 6 }}>
          {epic.id} — {epic.title}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {epic.tags.map(t => (
            <span key={t} style={{
              fontSize: '0.6rem', color: '#7c3aed',
              background: 'rgba(124,58,237,0.15)', borderRadius: 3, padding: '1px 7px',
            }}>{t}</span>
          ))}
        </div>
        <div style={{ height: 6, borderRadius: 3, background: '#1f2937', overflow: 'hidden', display: 'flex', marginBottom: 4 }}>
          {prog.total > 0 && <>
            <div style={{ width: `${(prog.done / prog.total) * 100}%`, background: '#34d399' }} />
            <div style={{ width: `${(prog.active / prog.total) * 100}%`, background: '#fbbf24' }} />
            <div style={{ width: `${(prog.blocked / prog.total) * 100}%`, background: '#f87171' }} />
          </>}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
          {prog.done}/{prog.total} 完了 · {prog.active} 進行中 · {prog.blocked} ブロック
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['tasks', 'reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.05)',
            color: tab === t ? '#e9d5ff' : '#6b7280',
            fontSize: '0.78rem', fontWeight: tab === t ? 700 : 400,
          }}>
            {t === 'tasks' ? `Tasks (${epicTasks.length})` : `Reports (${epic.reports?.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {epicTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#374151', fontSize: '0.8rem' }}>タスクなし</div>
          )}
          {epicTasks.map(task => (
            <div key={task.id} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              opacity: task.status === 'done' ? 0.5 : 1,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: STATUS_DOT[task.status] ?? '#4b5563',
              }} />
              <span style={{ flex: 1, fontSize: '0.78rem', color: '#d1d5db' }}>{task.title}</span>
              <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{task.id}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {!addingReport && (
            <button onClick={() => setAdding(true)} style={{
              padding: '10px 0', borderRadius: 8,
              border: '1px dashed rgba(139,92,246,0.35)',
              background: 'transparent', color: '#7c3aed',
              fontSize: '0.78rem', cursor: 'pointer', width: '100%',
            }}>+ レポートを納品する</button>
          )}
          {addingReport && (
            <div style={{
              border: '1px solid rgba(167,139,250,0.3)', borderRadius: 10,
              padding: 14, background: 'rgba(139,92,246,0.06)', marginBottom: 8,
            }}>
              <input
                autoFocus placeholder="レポートタイトル"
                value={title} onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.3)',
                  borderRadius: 8, padding: '8px 12px', color: '#d1d5db',
                  fontSize: '0.82rem', outline: 'none', marginBottom: 8,
                }}
              />
              <textarea
                placeholder="レポート本文（Markdown）"
                value={body} onChange={e => setBody(e.target.value)}
                rows={8}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)',
                  borderRadius: 8, padding: '8px 12px', color: '#d1d5db',
                  fontSize: '0.75rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'monospace', lineHeight: 1.6, marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(false)} style={{
                  padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer',
                }}>キャンセル</button>
                <button onClick={submitReport} style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: 'rgba(139,92,246,0.6)', color: '#fff',
                  fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700,
                }}>納品</button>
              </div>
            </div>
          )}
          {[...(epic.reports ?? [])].reverse().map(r => (
            <ReportCard key={r.id} report={r} epicId={epic.id} onDelete={deleteReport} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, epicId, onDelete }: { report: EpicReport; epicId: string; onDelete: (epicId: string, reportId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      border: `1px solid ${expanded ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 8, overflow: 'hidden',
    }}>
      <div onClick={() => setExpanded(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer',
        background: expanded ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{expanded ? '▾' : '▸'}</span>
        <span style={{ flex: 1, fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600 }}>{report.title}</span>
        <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{report.date}</span>
        <button onClick={e => { e.stopPropagation(); onDelete(epicId, report.id); }} style={{
          background: 'rgba(248,113,113,0.15)', border: 'none', borderRadius: 4,
          color: '#f87171', fontSize: '0.65rem', padding: '2px 7px', cursor: 'pointer',
        }}>削除</button>
      </div>
      {expanded && (
        <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <pre style={{
            margin: 0, fontSize: '0.75rem', color: '#9ca3af',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: 'monospace', lineHeight: 1.65,
          }}>{report.body}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Main EpicsPage ───────────────────────────────────────────

export function EpicsPage() {
  const adapter = useEpicsAdapter();
  const { epicsWithProgress } = adapter;
  const [view, setView]           = useState<'epics' | 'milestones'>('epics');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 詳細ページ表示中
  if (selectedId) {
    return <EpicDetail epicId={selectedId} adapter={adapter} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div style={{ padding: 14 }}>
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['epics', 'milestones'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: view === v
              ? (v === 'milestones' ? 'rgba(52,211,153,0.2)' : 'rgba(139,92,246,0.2)')
              : 'rgba(255,255,255,0.05)',
            color: view === v
              ? (v === 'milestones' ? '#34d399' : '#c4b5fd')
              : '#4b5563',
            fontSize: '0.8rem', fontWeight: view === v ? 700 : 400,
          }}>
            {v === 'epics' ? `◈ Epics (${epicsWithProgress.length})` : '✓ Milestones'}
          </button>
        ))}
      </div>

      {/* Milestones view */}
      {view === 'milestones' && <MilestonesView adapter={adapter} />}

      {/* Epics list */}
      {view === 'epics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {epicsWithProgress.map(epic => (
            <button
              key={epic.id}
              onClick={() => setSelectedId(epic.id)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>{epic.id}</span>
                <span style={{ flex: 1, fontSize: '0.82rem', color: '#d1d5db', fontWeight: 600 }}>{epic.title}</span>
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>{epic.progress.pct}%</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>›</span>
              </div>
              {/* progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: '#1f2937', overflow: 'hidden', display: 'flex' }}>
                {epic.progress.total > 0 && <>
                  <div style={{ width: `${(epic.progress.done / epic.progress.total) * 100}%`, background: '#34d399', transition: 'width 0.3s' }} />
                  <div style={{ width: `${(epic.progress.active / epic.progress.total) * 100}%`, background: '#fbbf24' }} />
                  <div style={{ width: `${(epic.progress.blocked / epic.progress.total) * 100}%`, background: '#f87171' }} />
                </>}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
