// ============================================================
// AndroidView01 — WorkspacePage
// モバイル版 WorkSpace
// ============================================================

import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';

export function WorkspacePage() {
  const { tasks, ui, selectTask, setSection } = useDevStudioStore();
  const selectedTask = ui.selectedTaskId
    ? tasks.find(t => t.id === ui.selectedTaskId) ?? null
    : null;

  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    return t.type === 'decision' || t.type === 'review' || t.status === 'blocked';
  });

  if (selectedTask) {
    const isDecision = selectedTask.type === 'decision';
    const c = isDecision ? '#fbbf24' : '#a78bfa';
    return (
      <div style={{ padding: 14 }}>
        {/* 戻るボタン */}
        <button onClick={() => selectTask(null)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#a78bfa', fontSize: '0.82rem', padding: '0 0 12px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>← タスク選択に戻る</button>

        {/* Task card */}
        <div style={{
          background: isDecision ? 'rgba(251,191,36,0.06)' : 'rgba(167,139,250,0.06)',
          border: `1px solid ${c}33`,
          borderRadius: 12, padding: '16px 16px', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>{isDecision ? '🔷' : '⚙️'}</span>
            <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, color: '#e5e7eb' }}>
              {selectedTask.title}
            </span>
            <span style={{
              fontSize: '0.62rem', color: c,
              background: `${c}18`, borderRadius: 8, padding: '2px 8px',
            }}>{isDecision ? '決定依頼' : selectedTask.priority}</span>
          </div>
          {selectedTask.description && (
            <p style={{ fontSize: '0.76rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
              {selectedTask.description}
            </p>
          )}
        </div>

        {/* Decision form placeholder */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: 10,
          border: `1px solid ${c}22`, overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.7rem', color: c, fontWeight: 700,
          }}>
            📋 Decision Form
          </div>
          <div style={{ padding: '14px 16px', fontSize: '0.72rem', color: '#6b7280' }}>
            このタスクの決定フォームはまだ設計されていません。
            <div style={{ marginTop: 8, color: '#374151' }}>
              AIに「このタスクのDecisionフォームを作って」と依頼してください
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 14 }}>
      <div style={{
        padding: '28px 20px', textAlign: 'center',
        background: 'rgba(255,255,255,0.02)', borderRadius: 12,
        border: '1px dashed rgba(255,255,255,0.08)',
        color: '#374151', fontSize: '0.85rem', marginBottom: 14,
      }}>
        タスクを選択してください
        <div style={{ fontSize: '0.68rem', color: '#2d2d3f', marginTop: 5 }}>
          下のリストからタスクを選択
        </div>
      </div>

      {todayTasks.length > 0 && (
        <>
          <div style={{ fontSize: '0.62rem', color: '#4b5563', letterSpacing: '0.1em', marginBottom: 8 }}>
            ヒューマンインプット待ちタスク
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {todayTasks.map(t => {
              const c = t.type === 'decision' ? '#fbbf24' : t.status === 'blocked' ? '#f87171' : '#34d399';
              return (
                <button key={t.id} onClick={() => selectTask(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: `${c}06`, border: `1px solid ${c}18`,
                  borderLeft: `3px solid ${c}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                  <span style={{ flex: 1, fontSize: '0.78rem', color: '#d1d5db' }}>{t.title}</span>
                  <span style={{ fontSize: '0.62rem', color: '#374151' }}>→ 開く</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
