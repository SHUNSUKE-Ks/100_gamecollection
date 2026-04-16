// ============================================================
// WorkSpaceView — 04_WorkSpace の .md ファイルをブラウザで閲覧
// Vite import.meta.glob で build 時に取り込み
// ============================================================

import { useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';

// ─── Build-time import ─────────────────────────────────────
// 04_WorkSpace/*.md を raw string として読み込む
// path は project root 相対（Vite の絶対パス記法）

const rawModules = import.meta.glob('/04_WorkSpace/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// ─── Types ─────────────────────────────────────────────────

interface MdFile {
  key: string;       // full path key
  name: string;      // display name
  date: string;      // extracted date or ''
  content: string;
}

// ─── Helpers ───────────────────────────────────────────────

function parseFiles(): MdFile[] {
  return Object.entries(rawModules)
    .map(([key, content]) => {
      const filename = key.split('/').pop() ?? key;
      const name     = filename.replace(/\.md$/, '');
      const dateMatch = name.match(/(\d{4}-\d{2}-\d{2})/);
      return { key, name, date: dateMatch?.[1] ?? '', content };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // 新しい順
}

/** 最小限のMarkdown→HTMLレンダー（XSS安全：ローカルファイルのみ） */
function renderMd(src: string): string {
  return src
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.9rem;color:#c9a227;margin:1em 0 0.3em;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1rem;color:#e5e7eb;margin:1.2em 0 0.4em;font-weight:700;border-bottom:1px solid #1f2937;padding-bottom:0.25em">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.1rem;color:#e5e7eb;margin:0 0 0.75em;font-weight:700">$1</h1>')
    // Bold / Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#d1d5db;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em style="color:#9ca3af">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:1px 5px;border-radius:3px;font-size:0.82em;color:#60a5fa;font-family:monospace">$1</code>')
    // Checklist
    .replace(/^- \[x\] (.+)$/gim, '<div style="display:flex;gap:6px;align-items:flex-start;color:#34d399;padding:2px 0"><span>✓</span><span>$1</span></div>')
    .replace(/^- \[ \] (.+)$/gim, '<div style="display:flex;gap:6px;align-items:flex-start;color:#6b7280;padding:2px 0"><span>☐</span><span>$1</span></div>')
    // List items
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:6px;align-items:flex-start;padding:1px 0"><span style="color:#c9a227;flex-shrink:0">•</span><span>$1</span></div>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #1f2937;margin:0.75em 0">')
    // Blank lines → paragraph breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

/** ファイル名を人間向けに整形 */
function prettifyName(name: string): string {
  return name
    .replace(/_(\d{4}-\d{2}-\d{2})$/, '') // 末尾の日付を除去
    .replace(/_/g, ' ');
}

// ─── Component ─────────────────────────────────────────────

export function WorkSpaceView() {
  const files = parseFiles();
  const [selected, setSelected] = useState<MdFile | null>(files[0] ?? null);
  const [listOpen, setListOpen]  = useState(false); // mobile list toggle

  if (files.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '60vh', gap: '0.5rem',
        color: '#6b7280', fontSize: '0.875rem',
      }}>
        <span style={{ fontSize: '2rem' }}>📂</span>
        <div>04_WorkSpace に .md ファイルがありません</div>
        <div style={{ fontSize: '0.72rem', color: '#374151' }}>
          プロジェクトルートの 04_WorkSpace/ フォルダに追加してください
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', height: '100%', overflow: 'hidden',
      flexDirection: 'column',
    }}>
      {/* ── Mobile: ファイル選択バー ── */}
      <div style={{
        flexShrink: 0,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-medium)',
      }}>
        <button
          onClick={() => setListOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.55rem 0.875rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
        >
          <FileText size={13} color="var(--color-primary)" />
          <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, textAlign: 'left',
            color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {selected ? prettifyName(selected.name) : 'ファイルを選択'}
          </span>
          <ChevronRight size={13} color="#6b7280"
            style={{ transform: listOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </button>

        {/* ファイル一覧ドロップダウン */}
        {listOpen && (
          <div style={{
            borderTop: '1px solid var(--color-border)',
            maxHeight: 220, overflowY: 'auto',
          }}>
            {files.map(f => (
              <button
                key={f.key}
                onClick={() => { setSelected(f); setListOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.55rem 1rem',
                  background: selected?.key === f.key ? 'rgba(201,162,39,0.1)' : 'none',
                  border: 'none',
                  borderLeft: `3px solid ${selected?.key === f.key ? 'var(--color-primary)' : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <FileText size={12} color={selected?.key === f.key ? '#c9a227' : '#6b7280'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: selected?.key === f.key ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {prettifyName(f.name)}
                  </div>
                  {f.date && (
                    <div style={{ fontSize: '0.62rem', color: '#4b5563' }}>{f.date}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content エリア ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.125rem' }}>
        {selected ? (
          <>
            {/* ファイルヘッダー */}
            <div style={{
              marginBottom: '1rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(201,162,39,0.06)',
              border: '1px solid rgba(201,162,39,0.18)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <FileText size={12} color="#c9a227" />
              <span style={{ fontSize: '0.7rem', color: '#c9a227', fontWeight: 600 }}>
                {selected.name}.md
              </span>
              {selected.date && (
                <span style={{ fontSize: '0.65rem', color: '#6b7280', marginLeft: 'auto' }}>
                  {selected.date}
                </span>
              )}
            </div>

            {/* Markdown レンダー */}
            <div
              style={{
                fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.8,
                letterSpacing: '0.01em',
              }}
              dangerouslySetInnerHTML={{ __html: renderMd(selected.content) }}
            />
          </>
        ) : (
          <div style={{ color: '#4b5563', fontSize: '0.875rem', textAlign: 'center', marginTop: '3rem' }}>
            ファイルを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
