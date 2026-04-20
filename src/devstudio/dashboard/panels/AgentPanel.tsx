// Mock Orchestra/Agent status panel

const MOCK_AGENTS = [
  { id: 'plot-writer',  label: 'PlotWriter',   status: 'idle',    tags: ['story', 'plot'] },
  { id: 'art-director', label: 'ArtDirector',  status: 'idle',    tags: ['image', 'comfyui'] },
  { id: 'reviewer',     label: 'Reviewer',     status: 'idle',    tags: ['qa', 'review'] },
  { id: 'task-runner',  label: 'TaskRunner',   status: 'idle',    tags: ['task', 'auto'] },
];

const STATUS_COLOR: Record<string, string> = {
  idle:    '#374151',
  running: '#c9a227',
  done:    '#34d399',
  error:   '#f87171',
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'IDLE', running: 'RUN', done: 'DONE', error: 'ERR',
};

export function AgentPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Orchestra (Mock)
        </span>
        <span style={{
          fontSize: '0.55rem', background: 'rgba(107,114,128,0.2)', color: '#6b7280',
          borderRadius: 8, padding: '1px 6px',
        }}>β</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {MOCK_AGENTS.map(agent => (
          <div key={agent.id} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 8px',
            border: `1px solid ${STATUS_COLOR[agent.status]}33`,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', color: '#d1d5db', fontWeight: 600 }}>{agent.label}</span>
              <span style={{
                fontSize: '0.55rem', fontWeight: 700, color: STATUS_COLOR[agent.status],
                background: `${STATUS_COLOR[agent.status]}22`, borderRadius: 3, padding: '1px 5px',
              }}>{STATUS_LABEL[agent.status]}</span>
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {agent.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.55rem', color: '#6b7280',
                  background: 'rgba(255,255,255,0.05)', borderRadius: 3, padding: '0 4px',
                }}>#{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 2, padding: '5px 8px', borderRadius: 5,
        background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)',
        fontSize: '0.65rem', color: '#6b7280', textAlign: 'center',
      }}>
        Orchestra連携は今後実装予定
      </div>
    </div>
  );
}
