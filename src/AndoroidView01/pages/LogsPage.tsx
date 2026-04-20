// ============================================================
// AndroidView01 — LogsPage
// モバイル版 Dev Logs 一覧
// ============================================================

import { useLogsAdapter } from '../adapters/useLogsAdapter';

export function LogsPage() {
  const { logs, formatTime, formatDate, typeLabel, typeColor } = useLogsAdapter();

  return (
    <div style={{ padding: 14 }}>
      <div style={{
        fontSize: '0.65rem', color: '#4b5563',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Dev Logs ({logs.length})
      </div>

      {logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#374151', fontSize: '0.82rem' }}>
          ログなし
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {logs.map(log => {
          const color = typeColor[log.type];
          const label = typeLabel[log.type];
          return (
            <div key={log.id} style={{
              borderRadius: 8, overflow: 'hidden',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Header row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                borderLeft: `3px solid ${color}`,
              }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700,
                  color, background: `${color}22`,
                  borderRadius: 4, padding: '1px 6px', flexShrink: 0,
                }}>{label}</span>
                <span style={{
                  flex: 1, fontSize: '0.75rem', color: '#d1d5db',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{log.message}</span>
                <span style={{ fontSize: '0.6rem', color: '#4b5563', flexShrink: 0 }}>
                  {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                </span>
              </div>

              {/* Meta */}
              {log.meta && (
                <div style={{
                  padding: '5px 12px 7px',
                  display: 'flex', gap: 8, flexWrap: 'wrap',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  {log.meta.agent && (
                    <span style={{ fontSize: '0.62rem', color: '#a78bfa' }}>
                      {log.meta.agent}{log.meta.skill ? `/${log.meta.skill}` : ''}
                    </span>
                  )}
                  {log.meta.taskId && (
                    <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>
                      Task: {log.meta.taskId}
                    </span>
                  )}
                  {log.meta.epicId && (
                    <span style={{ fontSize: '0.62rem', color: '#c9a227' }}>
                      Epic: {log.meta.epicId}
                    </span>
                  )}
                  {log.meta.tags && log.meta.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 3 }}>
                      {log.meta.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          fontSize: '0.58rem', color: '#4b5563',
                          background: 'rgba(255,255,255,0.04)', borderRadius: 3, padding: '0 4px',
                        }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                  {log.meta.files && log.meta.files.length > 0 && (
                    <span style={{
                      fontSize: '0.6rem', color: '#374151',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{log.meta.files[0]}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
