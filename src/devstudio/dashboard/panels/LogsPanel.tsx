import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { LogType } from '@/devstudio/core/types';

const TYPE_LABEL: Record<LogType, string> = {
  AI_PROCESS:  'AI',
  TASK:        'TASK',
  USER_ACTION: 'USER',
  SYSTEM:      'SYS',
};
const TYPE_COLOR: Record<LogType, string> = {
  AI_PROCESS:  '#a78bfa',
  TASK:        '#34d399',
  USER_ACTION: '#60a5fa',
  SYSTEM:      '#6b7280',
};

export function LogsPanel() {
  const { logs } = useDevStudioStore();
  const recent = [...logs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: '0.65rem', color: '#6b7280',
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2,
      }}>
        Recent ({recent.length})
      </span>

      {recent.length === 0 && (
        <div style={{ fontSize: '0.7rem', color: '#374151', textAlign: 'center', padding: '10px 0' }}>
          ログなし
        </div>
      )}

      {recent.map(log => (
        <div key={log.id} style={{
          display: 'flex', gap: 7, alignItems: 'flex-start',
          background: 'rgba(255,255,255,0.02)', borderRadius: 5, padding: '5px 8px',
        }}>
          <span style={{
            fontSize: '0.55rem', fontWeight: 700,
            color: TYPE_COLOR[log.type],
            background: `${TYPE_COLOR[log.type]}22`,
            borderRadius: 3, padding: '1px 5px', flexShrink: 0, marginTop: 1,
          }}>
            {TYPE_LABEL[log.type]}
          </span>
          <span style={{
            flex: 1, fontSize: '0.7rem', color: '#9ca3af',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {log.message}
          </span>
          <span style={{ fontSize: '0.58rem', color: '#4b5563', flexShrink: 0 }}>
            {new Date(log.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
}
