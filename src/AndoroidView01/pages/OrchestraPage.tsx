// ============================================================
// AndroidView01 — OrchestraPage
// モバイル版 Orchestra（Agent状態一覧）
// ============================================================

const MOCK_AGENTS = [
  { id: 'plot-writer',  label: 'PlotWriter',   status: 'idle',    tags: ['story', 'plot'] },
  { id: 'art-director', label: 'ArtDirector',  status: 'idle',    tags: ['image', 'comfyui'] },
  { id: 'reviewer',     label: 'Reviewer',     status: 'idle',    tags: ['qa', 'review'] },
  { id: 'task-runner',  label: 'TaskRunner',   status: 'idle',    tags: ['task', 'auto'] },
];

const STATUS_COLOR: Record<string, string> = {
  idle: '#374151', running: '#c9a227', done: '#34d399', error: '#f87171',
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'IDLE', running: 'RUN', done: 'DONE', error: 'ERR',
};

export function OrchestraPage() {
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ flex: 1, fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em' }}>
          ORCHESTRA (Mock)
        </span>
        <span style={{
          fontSize: '0.6rem', background: 'rgba(107,114,128,0.2)',
          color: '#6b7280', borderRadius: 8, padding: '2px 7px',
        }}>β</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MOCK_AGENTS.map(agent => (
          <div key={agent.id} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px',
            border: `1px solid ${STATUS_COLOR[agent.status]}33`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.85rem', color: '#d1d5db', fontWeight: 600 }}>{agent.label}</span>
              <span style={{
                fontSize: '0.6rem', fontWeight: 700, color: STATUS_COLOR[agent.status],
                background: `${STATUS_COLOR[agent.status]}22`, borderRadius: 4, padding: '2px 8px',
              }}>{STATUS_LABEL[agent.status]}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {agent.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.6rem', color: '#6b7280',
                  background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px',
                }}>#{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, padding: '12px 14px', borderRadius: 10,
        background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)',
        fontSize: '0.72rem', color: '#6b7280', textAlign: 'center',
      }}>
        Orchestra連携は今後実装予定
      </div>
    </div>
  );
}
