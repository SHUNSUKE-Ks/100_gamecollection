import { useState } from 'react';
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { Task, TaskStatus, TaskPriority } from '@/devstudio/core/types';

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: '#60a5fa', in_progress: '#c9a227', done: '#34d399', blocked: '#f87171',
};
const STATUS_ICON: Record<TaskStatus, string> = {
  pending: '○', in_progress: '▶', done: '✓', blocked: '✕',
};
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  P0: '#f87171', P1: '#c9a227', P2: '#60a5fa',
};

export function TasksPanel() {
  const { tasks, updateTask, addTask, deleteTask } = useDevStudioStore();
  const [showDone, setShowDone] = useState(false);

  const active = tasks.filter(t => t.status !== 'done').slice(0, 6);
  const done   = tasks.filter(t => t.status === 'done');

  const cycleStatus = (task: Task) => {
    const order: TaskStatus[] = ['pending', 'in_progress', 'done', 'blocked'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    updateTask({ ...task, status: next });
  };

  const addQuick = () => {
    const title = prompt('タスク名');
    if (!title) return;
    addTask({
      id: crypto.randomUUID(),
      title,
      status: 'pending',
      priority: 'P1',
      tags: [],
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Active ({active.length})
        </span>
        <button onClick={addQuick} style={{
          background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)',
          borderRadius: 4, color: '#c9a227', fontSize: '0.65rem', cursor: 'pointer', padding: '2px 8px',
        }}>+ Add</button>
      </div>

      {/* ── Active tasks ── */}
      {active.length === 0 && (
        <div style={{ fontSize: '0.7rem', color: '#374151', textAlign: 'center', padding: '10px 0' }}>
          アクティブなタスクなし
        </div>
      )}

      {active.map(task => (
        <TaskRow key={task.id} task={task}
          onCycle={() => cycleStatus(task)}
          onDelete={() => deleteTask(task.id)}
        />
      ))}

      {/* ── Done アコーディオン ── */}
      {done.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <button onClick={() => setShowDone(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 2px',
          }}>
            <span style={{ fontSize: '0.6rem', color: '#374151' }}>
              {showDone ? '▾' : '▸'}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#374151', letterSpacing: '0.06em' }}>
              完了済み
            </span>
            <span style={{
              background: 'rgba(52,211,153,0.15)', color: '#34d399',
              fontSize: '0.58rem', fontWeight: 700,
              borderRadius: 8, padding: '0 6px',
            }}>
              {done.length}
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(52,211,153,0.1)', marginLeft: 4 }} />
          </button>

          {showDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 }}>
              {done.map(task => (
                <TaskRow key={task.id} task={task}
                  onCycle={() => cycleStatus(task)}
                  onDelete={() => deleteTask(task.id)}
                  dimmed
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TaskRow ────────────────────────────────────────────────

function TaskRow({ task, onCycle, onDelete, dimmed }: {
  task: Task;
  onCycle: () => void;
  onDelete: () => void;
  dimmed?: boolean;
}) {
  const isDone = task.status === 'done';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: isDone ? 'transparent' : 'rgba(255,255,255,0.03)',
      borderRadius: 6, padding: '5px 8px',
      borderLeft: `3px solid ${isDone ? 'rgba(52,211,153,0.25)' : STATUS_COLOR[task.status]}`,
      opacity: dimmed ? 0.55 : 1,
      transition: 'opacity 0.15s',
    }}>
      <button onClick={onCycle} title="ステータス切替" style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: isDone ? 'rgba(52,211,153,0.15)' : 'none',
        border: `2px solid ${STATUS_COLOR[task.status]}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.5rem', color: STATUS_COLOR[task.status],
      }}>
        {STATUS_ICON[task.status]}
      </button>

      <span style={{
        flex: 1, fontSize: '0.7rem',
        color: isDone ? '#374151' : '#d1d5db',
        textDecoration: isDone ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {task.title}
      </span>

      <span style={{
        fontSize: '0.55rem', fontWeight: 700,
        color: isDone ? '#374151' : PRIORITY_COLOR[task.priority],
        background: isDone ? 'transparent' : `${PRIORITY_COLOR[task.priority]}22`,
        borderRadius: 3, padding: '1px 4px',
      }}>
        {isDone ? '' : task.priority}
      </span>

      <button onClick={onDelete} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#2d2d3f', fontSize: '0.6rem', padding: 0,
        opacity: 0, transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
      >✕</button>
    </div>
  );
}
