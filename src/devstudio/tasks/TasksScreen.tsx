// ============================================================
// DevStudio — Tasks フルビュー
// ステータスタブ + Epic/Priority/Typeフィルター + 詳細パネル
// ============================================================

import { useState } from 'react';
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/devstudio/core/types';

// ─── Constants ───────────────────────────────────────────────

const STATUS_TABS: { id: TaskStatus | 'all'; label: string }[] = [
  { id: 'all',         label: 'すべて' },
  { id: 'in_progress', label: '進行中' },
  { id: 'pending',     label: '待機' },
  { id: 'blocked',     label: 'ブロック' },
  { id: 'done',        label: '完了' },
];

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending:     '#60a5fa',
  in_progress: '#c9a227',
  done:        '#34d399',
  blocked:     '#f87171',
};
const STATUS_ICON: Record<TaskStatus, string> = {
  pending: '○', in_progress: '▶', done: '✓', blocked: '✕',
};
const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress', in_progress: 'done', done: 'blocked', blocked: 'pending',
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

// ─── Main ────────────────────────────────────────────────────

export function TasksScreen() {
  const { tasks, epics, updateTask, addTask, deleteTask, selectTask, setSection, ui } = useDevStudioStore();

  const [statusTab, setStatusTab]   = useState<TaskStatus | 'all'>('all');
  const [epicFilter, setEpicFilter] = useState<string>('all');
  const [prioFilter, setPrioFilter] = useState<TaskPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [detailId, setDetailId]     = useState<string | null>(null);
  const [showAdd, setShowAdd]       = useState(false);

  // ── Filter ────────────────────────────────────────────────

  const visible = tasks.filter(t => {
    if (statusTab !== 'all' && t.status !== statusTab) return false;
    if (epicFilter !== 'all' && t.epicId !== epicFilter) return false;
    if (prioFilter !== 'all' && t.priority !== prioFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  const countByStatus = (s: TaskStatus) => tasks.filter(t => t.status === s).length;

  // ── Actions ───────────────────────────────────────────────

  const cycleStatus = (task: Task) =>
    updateTask({ ...task, status: STATUS_NEXT[task.status] });

  const openWorkSpace = (task: Task) => {
    selectTask(task.id);
    setSection('WORKSPACE');
  };

  const detailTask = detailId ? tasks.find(t => t.id === detailId) ?? null : null;

  // ── Sel style helpers ────────────────────────────────────

  const selStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 5, padding: '3px 8px', color: '#d1d5db',
    fontSize: '0.68rem', cursor: 'pointer', outline: 'none',
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, overflow: 'hidden' }}>

      {/* ── Left: list ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Status tabs + Add */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '0 0 12px 0', flexShrink: 0, flexWrap: 'wrap',
        }}>
          {STATUS_TABS.map(t => {
            const active = statusTab === t.id;
            const count  = t.id === 'all' ? tasks.length : countByStatus(t.id as TaskStatus);
            return (
              <button key={t.id} onClick={() => setStatusTab(t.id)} style={{
                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                background: active ? 'rgba(167,139,250,0.15)' : 'none',
                border: 'none',
                borderBottom: active ? '2px solid #a78bfa' : '2px solid transparent',
                color: active ? '#c4b5fd' : '#6b7280',
                fontSize: '0.72rem', fontWeight: active ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {t.label}
                <span style={{
                  fontSize: '0.6rem', background: active ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)',
                  color: active ? '#c4b5fd' : '#4b5563',
                  borderRadius: 8, padding: '0 5px',
                }}>{count}</span>
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <button onClick={() => setShowAdd(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: showAdd ? 'rgba(201,162,39,0.2)' : 'rgba(201,162,39,0.1)',
            border: '1px solid rgba(201,162,39,0.4)',
            borderRadius: 6, padding: '4px 12px',
            color: '#c9a227', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
          }}>
            + 新規タスク
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <AddTaskForm
            epics={epics}
            onAdd={(task) => { addTask(task); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
          />
        )}

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 6, padding: '6px 0', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 8,
        }}>
          <select value={epicFilter} onChange={e => setEpicFilter(e.target.value)} style={selStyle}>
            <option value="all">Epic: すべて</option>
            {epics.map(e => <option key={e.id} value={e.id}>{e.id}: {e.title}</option>)}
            <option value="">Epic なし</option>
          </select>
          <select value={prioFilter} onChange={e => setPrioFilter(e.target.value as any)} style={selStyle}>
            <option value="all">優先度: すべて</option>
            {(['P0', 'P1', 'P2'] as TaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={selStyle}>
            <option value="all">タイプ: すべて</option>
            {(Object.keys(TYPE_LABEL) as TaskType[]).map(t => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <span style={{ fontSize: '0.62rem', color: '#4b5563', alignSelf: 'center', marginLeft: 4 }}>
            {visible.length} 件
          </span>
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {visible.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#374151', fontSize: '0.8rem' }}>
              タスクがありません
            </div>
          )}
          {visible.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              epic={epics.find(e => e.id === task.epicId)}
              selected={detailId === task.id}
              onSelect={() => setDetailId(id => id === task.id ? null : task.id)}
              onCycle={() => cycleStatus(task)}
              onDelete={() => { deleteTask(task.id); if (detailId === task.id) setDetailId(null); }}
              onOpenWorkspace={() => openWorkSpace(task)}
            />
          ))}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          epic={epics.find(e => e.id === detailTask.epicId)}
          onClose={() => setDetailId(null)}
          onUpdate={updateTask}
          onOpenWorkspace={() => openWorkSpace(detailTask)}
        />
      )}
    </div>
  );
}

// ─── TaskRow ─────────────────────────────────────────────────

function TaskRow({ task, epic, selected, onSelect, onCycle, onDelete, onOpenWorkspace }: {
  task: Task;
  epic?: { id: string; title: string };
  selected: boolean;
  onSelect: () => void;
  onCycle: () => void;
  onDelete: () => void;
  onOpenWorkspace: () => void;
}) {
  const isDone = task.status === 'done';
  return (
    <div onClick={onSelect} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
      background: selected ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${selected ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.05)'}`,
      borderLeft: `3px solid ${isDone ? 'rgba(52,211,153,0.3)' : STATUS_COLOR[task.status]}`,
      opacity: isDone ? 0.6 : 1,
      transition: 'background 0.1s',
    }}>
      {/* Status toggle */}
      <button onClick={e => { e.stopPropagation(); onCycle(); }} style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        background: isDone ? 'rgba(52,211,153,0.15)' : 'none',
        border: `2px solid ${STATUS_COLOR[task.status]}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.5rem', color: STATUS_COLOR[task.status],
      }}>
        {STATUS_ICON[task.status]}
      </button>

      {/* ID */}
      <span style={{ fontSize: '0.6rem', color: '#374151', flexShrink: 0, fontFamily: 'monospace' }}>
        {task.id}
      </span>

      {/* Priority */}
      <span style={{
        fontSize: '0.58rem', fontWeight: 700, flexShrink: 0,
        color: isDone ? '#374151' : PRIORITY_COLOR[task.priority],
        background: isDone ? 'transparent' : `${PRIORITY_COLOR[task.priority]}22`,
        borderRadius: 3, padding: '1px 5px',
      }}>
        {isDone ? '' : task.priority}
      </span>

      {/* Type badge */}
      {task.type && task.type !== 'implement' && (
        <span style={{
          fontSize: '0.55rem', color: TYPE_COLOR[task.type],
          background: `${TYPE_COLOR[task.type]}18`,
          borderRadius: 8, padding: '1px 6px', flexShrink: 0,
        }}>
          {TYPE_LABEL[task.type]}
        </span>
      )}

      {/* Title */}
      <span style={{
        flex: 1, fontSize: '0.73rem',
        color: isDone ? '#374151' : '#d1d5db',
        textDecoration: isDone ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {task.title}
      </span>

      {/* Epic */}
      {epic && (
        <span style={{
          fontSize: '0.55rem', color: '#6b7280',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 3, padding: '1px 5px', flexShrink: 0,
        }}>
          {epic.id}
        </span>
      )}

      {/* WorkSpace button (decision/review/blocked のみ) */}
      {(task.type === 'decision' || task.type === 'review' || task.status === 'blocked') && !isDone && (
        <button onClick={e => { e.stopPropagation(); onOpenWorkspace(); }} style={{
          fontSize: '0.6rem', color: '#fbbf24',
          background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 5, padding: '2px 7px', cursor: 'pointer', flexShrink: 0,
        }}>
          → WS
        </button>
      )}

      {/* Delete */}
      <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#2d2d3f', fontSize: '0.65rem', padding: 0, flexShrink: 0,
        opacity: 0, transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
      >✕</button>
    </div>
  );
}

// ─── AddTaskForm ─────────────────────────────────────────────

function AddTaskForm({ epics, onAdd, onCancel }: {
  epics: { id: string; title: string }[];
  onAdd: (t: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P1');
  const [type, setType]         = useState<TaskType>('implement');
  const [epicId, setEpicId]     = useState('');

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 5, padding: '5px 8px', color: '#d1d5db',
    fontSize: '0.72rem', outline: 'none',
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      id: `T-${Date.now()}`,
      title: title.trim(),
      status: 'pending',
      priority,
      type,
      epicId: epicId || undefined,
      tags: [],
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
      padding: '10px 12px', marginBottom: 8,
      background: 'rgba(201,162,39,0.06)', borderRadius: 8,
      border: '1px solid rgba(201,162,39,0.2)',
    }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel(); }}
        placeholder="タスク名を入力..."
        style={{ ...inputStyle, flex: 1, minWidth: 200 }}
      />
      <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} style={{ ...inputStyle, width: 70 }}>
        {(['P0', 'P1', 'P2'] as TaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={type} onChange={e => setType(e.target.value as TaskType)} style={{ ...inputStyle, width: 90 }}>
        {(Object.keys(TYPE_LABEL) as TaskType[]).map(t => (
          <option key={t} value={t}>{TYPE_LABEL[t]}</option>
        ))}
      </select>
      <select value={epicId} onChange={e => setEpicId(e.target.value)} style={{ ...inputStyle, width: 120 }}>
        <option value="">Epic なし</option>
        {epics.map(e => <option key={e.id} value={e.id}>{e.id}</option>)}
      </select>
      <button onClick={handleAdd} style={{
        background: 'rgba(201,162,39,0.2)', border: '1px solid rgba(201,162,39,0.5)',
        borderRadius: 6, color: '#c9a227', fontSize: '0.72rem', cursor: 'pointer', padding: '5px 14px',
      }}>追加</button>
      <button onClick={onCancel} style={{
        background: 'none', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6, color: '#6b7280', fontSize: '0.72rem', cursor: 'pointer', padding: '5px 10px',
      }}>✕</button>
    </div>
  );
}

// ─── TaskDetailPanel ─────────────────────────────────────────

function TaskDetailPanel({ task, epic, onClose, onUpdate, onOpenWorkspace }: {
  task: Task;
  epic?: { id: string; title: string };
  onClose: () => void;
  onUpdate: (t: Task) => void;
  onOpenWorkspace: () => void;
}) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc]   = useState(task.description ?? '');

  const saveTitle = () => {
    if (editTitle.trim() && editTitle !== task.title)
      onUpdate({ ...task, title: editTitle.trim() });
  };
  const saveDesc = () => {
    if (editDesc !== (task.description ?? ''))
      onUpdate({ ...task, description: editDesc || undefined });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 5, padding: '6px 8px', color: '#d1d5db',
    fontSize: '0.75rem', outline: 'none', fontFamily: 'monospace',
  };

  return (
    <div style={{
      width: 300, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.07)',
      paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 12,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Task Detail
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '0.75rem',
        }}>✕</button>
      </div>

      {/* ID + Status */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: '#374151', fontFamily: 'monospace' }}>{task.id}</span>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700,
          color: STATUS_COLOR[task.status],
          background: `${STATUS_COLOR[task.status]}22`,
          borderRadius: 8, padding: '1px 8px',
        }}>
          {STATUS_ICON[task.status]} {task.status}
        </span>
      </div>

      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: '0.6rem', color: '#6b7280' }}>タイトル</label>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={e => e.key === 'Enter' && saveTitle()}
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: '0.6rem', color: '#6b7280' }}>説明</label>
        <textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          onBlur={saveDesc}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          placeholder="タスクの詳細を記入..."
        />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <MetaRow label="優先度">
          <select value={task.priority}
            onChange={e => onUpdate({ ...task, priority: e.target.value as TaskPriority })}
            style={{ ...inputStyle, padding: '3px 6px', width: 'auto' }}>
            {(['P0', 'P1', 'P2'] as TaskPriority[]).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </MetaRow>
        <MetaRow label="タイプ">
          <select value={task.type ?? 'implement'}
            onChange={e => onUpdate({ ...task, type: e.target.value as TaskType })}
            style={{ ...inputStyle, padding: '3px 6px', width: 'auto' }}>
            {(Object.keys(TYPE_LABEL) as TaskType[]).map(t => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </MetaRow>
        <MetaRow label="Epic">
          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            {epic ? `${epic.id}: ${epic.title}` : '—'}
          </span>
        </MetaRow>
        <MetaRow label="日付">
          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{task.date}</span>
        </MetaRow>
      </div>

      {/* Status actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: '0.6rem', color: '#6b7280' }}>ステータス変更</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['pending', 'in_progress', 'done', 'blocked'] as TaskStatus[]).map(s => (
            <button key={s} onClick={() => onUpdate({ ...task, status: s })} style={{
              fontSize: '0.6rem', padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
              background: task.status === s ? `${STATUS_COLOR[s]}25` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${task.status === s ? STATUS_COLOR[s] : 'rgba(255,255,255,0.08)'}`,
              color: task.status === s ? STATUS_COLOR[s] : '#6b7280',
            }}>
              {STATUS_ICON[s]}
            </button>
          ))}
        </div>
      </div>

      {/* WorkSpace button */}
      {(task.type === 'decision' || task.type === 'review' || task.status === 'blocked') && task.status !== 'done' && (
        <button onClick={onOpenWorkspace} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)',
          borderRadius: 7, padding: '8px 0', cursor: 'pointer',
          color: '#fbbf24', fontSize: '0.72rem', fontWeight: 600,
        }}>
          🗄 WorkSpace で開く
        </button>
      )}

      {/* Process log */}
      {task.process && task.process.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.6rem', color: '#6b7280' }}>実行ログ</label>
          {task.process.map((p, i) => (
            <div key={i} style={{
              fontSize: '0.62rem', color: '#6b7280', lineHeight: 1.6,
              background: 'rgba(167,139,250,0.05)', borderRadius: 5, padding: '5px 8px',
              borderLeft: '2px solid rgba(167,139,250,0.3)',
            }}>
              <span style={{ color: '#a78bfa' }}>{p.agent}/{p.skill}</span>
              <span style={{ color: '#4b5563' }}> — {p.transform}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '0.6rem', color: '#4b5563', width: 48, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}
