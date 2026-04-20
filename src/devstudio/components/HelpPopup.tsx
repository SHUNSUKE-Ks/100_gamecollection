import { useState, useEffect, useRef } from 'react';

export interface HelpPage {
  title: string;
  body: string;   // markdown-lite: \n for newlines, **bold**, `code`
}

interface Props {
  pages: HelpPage[];
}

// ─── Inline renderer ─────────────────────────────────────────

function renderLine(line: string, key: number) {
  // Split on **bold** and `code`
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} style={{ color: '#e5e7eb' }}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} style={{
            background: 'rgba(167,139,250,0.15)', color: '#c4b5fd',
            borderRadius: 3, padding: '0 4px', fontSize: '0.9em',
          }}>{part.slice(1, -1)}</code>;
        return part;
      })}
    </span>
  );
}

function renderBody(body: string) {
  return body.split('\n').map((line, i) => (
    <p key={i} style={{ margin: '0 0 6px 0', lineHeight: 1.6 }}>
      {renderLine(line, i)}
    </p>
  ));
}

// ─── Component ───────────────────────────────────────────────

export function HelpPopup({ pages }: Props) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Reset page when opened
  const handleOpen = () => { setPage(0); setOpen(true); };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const total = pages.length;
  const current = pages[page];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ? button */}
      <button
        onClick={handleOpen}
        title="ヘルプ"
        style={{
          width: 18, height: 18, borderRadius: '50%',
          background: open ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.15)'}`,
          color: open ? '#c4b5fd' : '#6b7280',
          fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
          lineHeight: 1,
        }}
      >?</button>

      {/* Popup */}
      {open && (
        <div style={{
          position: 'absolute', top: 24, right: 0, zIndex: 200,
          width: 280, background: '#13112a',
          border: '1px solid rgba(167,139,250,0.35)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(167,139,250,0.1)',
            borderBottom: '1px solid rgba(167,139,250,0.2)',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c4b5fd' }}>
              {current.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {total > 1 && (
                <span style={{ fontSize: '0.58rem', color: '#6b7280' }}>
                  {page + 1}/{total}
                </span>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280', fontSize: '0.75rem', lineHeight: 1,
                padding: '0 2px',
              }}>✕</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '10px 12px', fontSize: '0.7rem', color: '#9ca3af' }}>
            {renderBody(current.body)}
          </div>

          {/* Pagination */}
          {total > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Dots */}
              <div style={{ display: 'flex', gap: 4 }}>
                {pages.map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} style={{
                    width: i === page ? 16 : 6, height: 6, borderRadius: 3,
                    background: i === page ? '#a78bfa' : 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'width 0.15s',
                  }} />
                ))}
              </div>
              {/* Prev / Next */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4, color: page === 0 ? '#2d2d3f' : '#9ca3af',
                    fontSize: '0.65rem', cursor: page === 0 ? 'default' : 'pointer',
                    padding: '2px 8px',
                  }}
                >‹ Prev</button>
                <button
                  onClick={() => setPage(p => Math.min(total - 1, p + 1))}
                  disabled={page === total - 1}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4, color: page === total - 1 ? '#2d2d3f' : '#9ca3af',
                    fontSize: '0.65rem', cursor: page === total - 1 ? 'default' : 'pointer',
                    padding: '2px 8px',
                  }}
                >Next ›</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
