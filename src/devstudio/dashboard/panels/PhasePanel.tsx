import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { DevPhase } from '@/devstudio/core/types';

const PHASES: { id: DevPhase; label: string; icon: string }[] = [
  { id: 'IDEA',      label: 'Idea',      icon: '💡' },
  { id: 'DESIGN',    label: 'Design',    icon: '✏️' },
  { id: 'IMPLEMENT', label: 'Implement', icon: '⚙️' },
  { id: 'TEST',      label: 'Test',      icon: '🧪' },
  { id: 'RELEASE',   label: 'Release',   icon: '🚀' },
];

export function PhasePanel() {
  const { phase, setPhase, tasks } = useDevStudioStore();
  const idx = PHASES.findIndex(p => p.id === phase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Phase stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {PHASES.map((p, i) => {
          const active  = p.id === phase;
          const past    = i < idx;
          const color   = active ? '#c9a227' : past ? '#34d399' : '#374151';
          const textCol = active ? '#c9a227' : past ? '#6b7280' : '#374151';
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <button onClick={() => setPhase(p.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: active ? 'rgba(201,162,39,0.15)' : past ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem',
                }}>
                  {past ? '✓' : p.icon}
                </div>
                <span style={{ fontSize: '0.6rem', color: textCol, fontWeight: active ? 700 : 400 }}>
                  {p.label}
                </span>
              </button>
              {i < PHASES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < idx ? '#34d399' : '#1f2937', marginBottom: 16 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Task counts */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['pending', 'in_progress', 'done', 'blocked'] as const).map(s => {
          const n = tasks.filter(t => t.status === s).length;
          const colors = {
            pending:     { bg: 'rgba(96,165,250,0.1)',  text: '#60a5fa',  label: '待機' },
            in_progress: { bg: 'rgba(201,162,39,0.1)',  text: '#c9a227',  label: '進行中' },
            done:        { bg: 'rgba(52,211,153,0.1)',  text: '#34d399',  label: '完了' },
            blocked:     { bg: 'rgba(239,68,68,0.1)',   text: '#f87171',  label: 'ブロック' },
          }[s];
          return (
            <div key={s} style={{
              flex: 1, background: colors.bg, borderRadius: 6,
              padding: '5px 6px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>{n}</div>
              <div style={{ fontSize: '0.58rem', color: '#6b7280' }}>{colors.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
