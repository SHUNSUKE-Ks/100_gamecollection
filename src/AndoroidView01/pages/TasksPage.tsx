// ============================================================
// AndroidView01 — TasksPage
// モバイル版タスク一覧
// ============================================================

import { useState } from 'react';
import { useTasksAdapter } from '../adapters/useTasksAdapter';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/devstudio/core/types';

const STATUS_TABS: { id: TaskStatus | 'all'; label: string }[] = [
  { id: 'all',         label: 'すべて' },
  { id: 'in_progress', label: '進行中' },
  { id: 'pending',     label: '待機' },
  { id: 'blocked',     label: 'ブロック' },
  { id: 'done',        label: '完了' },
];

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: '#60a5fa', in_progress: '#c9a227', done: '#34d399', blocked: '#f87171',
};
const STATUS_ICON: Record<TaskStatus, string> = {
  pending: '○', in_progress: '▶', done: '✓', blocked: '✕',
};
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  P0: '#f87171', P1: '#c9a227', P2: '#60a5fa',
};
const TYPE_LABEL: Record<TaskType, string> = {
  implement: '実装', decision: '決定依頼', review: 'レビュー', research: '調査',
};
const TYPE_COLOR: Record<TaskType, string> = {
  implement: '#6b7280', decision: '#fbbf24', review: '#34d399', research: '#a78bfa',
};

export function TasksPage() {
  const adapter = useTasksAdapter();
  const { tasks, epics, getFiltered, countByStatus, cycleStatus, setTaskStatus, updateTaskField, openInWorkspace, addTask, deleteTask } = adapter;

  const [statusTab, setStatusTab]   = useState<TaskStatus | 'all'>('all');
  const [epicFilter, setEpicFilter] = useState<string>('all');
  const [prioFilter, setPrioFilter] = useState<TaskPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [detailId, setDetailId]     = useState<string | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const visible = getFiltered(statusTab, epicFilter, prioFilter, typeFilter);
  const detailTask = detailId ? tasks.find(t => t.id === detailId) ?? null : null;

  const selStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '6px 10px', color: '#d1d5db',
    fontSize: '0.73rem', cursor: 'pointer', outline: 'none',
    flex: 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Status tabs — 横スクロール */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 14px',
        overflowX: 'auto', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {STATUS_TABS.map(t => {
          const active = statusTab === t.id;
          const count  = t.id === 'all' ? tasks.length : countByStatus(t.id as TaskStatus);
          return (
            <button key={t.id} onClick={() => setStatusTab(t.id)} style={{
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
              background: active ? 'rgba(167,139,250,0.15)' : 'none',
              border: 'none',
              borderBottom: active ? '2px solid #a78bfa' : '2px solid transparent',
              color: active ? '#c4b5fd' : '#6b7280',
              fontSize: '0.75rem', fontWeight: active ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t.label}
              <span style={{
                fontSize: '0.62rem',
                background: active ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)',
                color: active ? '#c4b5fd' : '#4b5563',
                borderRadius: 8, padding: '0 5px',
              }}>{count}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowAdd(v => !v)} style={{
          padding: '6px 12px', flexShrink: 0,
          background: showAdd ? 'rgba(201,162,39,0.2)' : 'rgba(201,162,39,0.1)',
          border: '1px solid rgba(201,162,39,0.4)',
          borderRadius: 8, color: '#c9a227', fontSize: '0.75rem', cursor: 'pointer',
        }}>+ 新規</button>
      </div>

      {/* フィルター */}
      <div style={{ flexShrink: 0, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => setShowFilters(v => !v)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: '0.68rem', padding: 0,
        }}>
          {showFilters ? '▾' : '▸'} フィルター
          {(epicFilter !== 'all' || prioFilter !== 'all' || typeFilter !== 'all') && (
            <span style={{ color: '#c9a227', marginLeft: 6 }}>●</span>
          )}
        </button>
        {showFilters && (
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <select value={epicFilter} onChange={e => setEpicFilter(e.target.value)} style={selStyle}>
              <option value="all">Epic: すべて</option>
              {epics.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
              <option value="">Epicなし</option>
            </select>
            <select value={prioFilter} onChange={e => setPrioFilter(e.target.value as any)} style={selStyle}>
              <option value="all">優先度: すべて</option>
              {(['P0', 'P1', 'P2'] as TaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={selStyle}>
              <option value="all">タイプ: すべて</option>
              {(Object.keys(TYPE_LABEL) as TaskType[]).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <AddTaskForm epics={epics} onAdd={t => { addTask(t); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />
      )}

      {/* Task list（スクロール領域） */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#374151', fontSize: '0.82rem' }}>
            タスクがありません
          </div>
        )}
        {visible.map(task => {
          const epic = epics.find(e => e.id === task.epicId);
          const isDone = task.status === 'done';
          return (
            <div key={task.id} style={{
              borderRadius: 8, overflow: 'hidden',
              border: `1px solid ${detailId === task.id ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.06)'}`,
              background: detailId === task.id ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.02)',
            }}>
              {/* Row */}
              <div
                onClick={() => setDetailId(id => id === task.id ? null : task.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', cursor: 'pointer',
                  borderLeft: `3px solid ${isDone ? 'rgba(52,211,153,0.3)' : STATUS_COLOR[task.status]}`,
                  opacity: isDone ? 0.65 : 1,
                }}
              >
                {/* Status button */}
                <button onClick={e => { e.stopPropagation(); cycleStatus(task.id); }} style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'rgba(52,211,153,0.15)' : 'none',
                  border: `2px solid ${STATUS_COLOR[task.status]}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', color: STATUS_COLOR[task.status],
                }}>
                  {STATUS_ICON[task.status]}
                </button>
                <span style={{ fontSize: '0.6rem', color: '#374151', flexShrink: 0, fontFamily: 'monospace' }}>{task.id}</span>
                {!isDone && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, color: PRIORITY_COLOR[task.priority],
                    background: `${PRIORITY_COLOR[task.priority]}22`, borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                  }}>{task.priority}</span>
                )}
                <span style={{
                  flex: 1, fontSize: '0.76rem',
                  color: isDone ? '#374151' : '#d1d5db',
                  textDecoration: isDone ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{task.title}</span>
                {epic && (
                  <span style={{
                    fontSize: '0.58rem', color: '#6b7280',
                    background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                  }}>{epic.id}</span>
                )}
              </div>

              {/* Detail panel（inline） */}
              {detailId === task.id && (
                <TaskDetailInline
                  task={task}
                  epic={epic}
                  onSetStatus={s => setTaskStatus(task.id, s)}
                  onUpdateField={fields => updateTaskField(task.id, fields)}
                  onOpenWorkspace={() => openInWorkspace(task.id)}
                  onDelete={() => { deleteTask(task.id); setDetailId(null); }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Task Detail Inline ───────────────────────────────────────

function TaskDetailInline({ task, epic, onSetStatus, onUpdateField, onOpenWorkspace, onDelete }: {
  task: Task;
  epic?: { id: string; title: string };
  onSetStatus: (s: TaskStatus) => void;
  onUpdateField: (fields: Partial<Task>) => void;
  onOpenWorkspace: () => void;
  onDelete: () => void;
}) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc]   = useState(task.description ?? '');

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 10px', color: '#d1d5db',
    fontSize: '0.78rem', outline: 'none',
  };

  return (
    <div style={{
      padding: '10px 14px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Title edit */}
      <div>
        <label style={{ fontSize: '0.6rem', color: '#6b7280', display: 'block', marginBottom: 4 }}>タイトル</label>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={() => { if (editTitle.trim() && editTitle !== task.title) onUpdateField({ title: editTitle.trim() }); }}
          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ fontSize: '0.6rem', color: '#6b7280', display: 'block', marginBottom: 4 }}>説明</label>
        <textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          onBlur={() => { if (editDesc !== (task.description ?? '')) onUpdateField({ description: editDesc || undefined }); }}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6, fontFamily: 'monospace' }}
          placeholder="タスクの詳細..."
        />
      </div>

      {/* ステータス変更 */}
      <div>
        <label style={{ fontSize: '0.6rem', color: '#6b7280', display: 'block', marginBottom: 6 }}>ステータス</label>
        <div style={{ display: 'flex', gap: 5 }}>
          {(['pending', 'in_progress', 'done', 'blocked'] as TaskStatus[]).map(s => (
            <button key={s} onClick={() => onSetStatus(s)} style={{
              flex: 1, fontSize: '0.65rem', padding: '7px 4px', borderRadius: 8, cursor: 'pointer',
              background: task.status === s ? `${STATUS_COLOR[s]}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${task.status === s ? STATUS_COLOR[s] : 'rgba(255,255,255,0.08)'}`,
              color: task.status === s ? STATUS_COLOR[s] : '#6b7280',
            }}>
              {STATUS_ICON[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div style={{ fontSize: '0.68rem', color: '#6b7280', display: 'flex', gap: 12 }}>
        {epic && <span>Epic: <span style={{ color: '#9ca3af' }}>{epic.id}</span></span>}
        <span>日付: <span style={{ color: '#9ca3af' }}>{task.date}</span></span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(task.type === 'decision' || task.type === 'review' || task.status === 'blocked') && task.status !== 'done' && (
          <button onClick={onOpenWorkspace} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: 8, padding: '9px 0', cursor: 'pointer',
            color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600,
          }}>🗄 WorkSpaceで開く</button>
        )}
        <button onClick={onDelete} style={{
          padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          color: '#f87171', fontSize: '0.72rem',
        }}>削除</button>
      </div>
    </div>
  );
}

// ─── AddTaskForm ──────────────────────────────────────────────

function AddTaskForm({ epics, onAdd, onCancel }: {
  epics: { id: string; title: string }[];
  onAdd: (t: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle]     = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P1');
  const [type, setType]       = useState<TaskType>('implement');
  const [epicId, setEpicId]   = useState('');

  const selStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '7px 10px', color: '#d1d5db',
    fontSize: '0.75rem', outline: 'none', flex: 1,
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      id: `T-${Date.now()}`, title: title.trim(),
      status: 'pending', priority, type,
      epicId: epicId || undefined,
      tags: [], date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div style={{
      padding: '10px 14px', flexShrink: 0,
      background: 'rgba(201,162,39,0.05)',
      borderBottom: '1px solid rgba(201,162,39,0.15)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <input
        autoFocus value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel(); }}
        placeholder="タスク名を入力... (Enter で追加)"
        style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,162,39,0.35)',
          borderRadius: 8, padding: '9px 12px', color: '#d1d5db',
          fontSize: '0.82rem', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} style={selStyle}>
          {(['P0', 'P1', 'P2'] as TaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value as TaskType)} style={selStyle}>
          {(Object.keys(TYPE_LABEL) as TaskType[]).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <select value={epicId} onChange={e => setEpicId(e.target.value)} style={selStyle}>
          <option value="">Epicなし</option>
          {epics.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={handleAdd} style={{
          flex: 1, background: 'rgba(201,162,39,0.2)', border: '1px solid rgba(201,162,39,0.5)',
          borderRadius: 8, color: '#c9a227', fontSize: '0.78rem', cursor: 'pointer', padding: '8px',
        }}>追加</button>
        <button onClick={onCancel} style={{
          padding: '8px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer',
        }}>✕</button>
      </div>
    </div>
  );
}
