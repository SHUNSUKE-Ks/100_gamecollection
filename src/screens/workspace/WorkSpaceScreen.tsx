// ============================================================
// WorkSpaceScreen — フルページ ワークスペースビューア
// サイドバー常時表示の2カラムレイアウト
// ============================================================

import { useState } from 'react';
import { FileText, ArrowLeft, FolderOpen } from 'lucide-react';
import { useGameStore } from '@/core/stores/gameStore';

// ─── Build-time import ─────────────────────────────────────

const rawModules = import.meta.glob('/04_WorkSpace/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// ─── Types ─────────────────────────────────────────────────

interface MdFile {
  key: string;
  name: string;
  date: string;
  content: string;
}

// ─── Helpers ───────────────────────────────────────────────

function parseFiles(): MdFile[] {
  return Object.entries(rawModules)
    .map(([key, content]) => {
      const filename  = key.split('/').pop() ?? key;
      const name      = filename.replace(/\.md$/, '');
      const dateMatch = name.match(/(\d{4}-\d{2}-\d{2})/);
      return { key, name, date: dateMatch?.[1] ?? '', content };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function prettifyName(name: string): string {
  return name
    .replace(/_(\d{4}-\d{2}-\d{2})$/, '')
    .replace(/_/g, ' ');
}

function renderMd(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.9rem;color:#c9a227;margin:1.2em 0 0.4em;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1.05rem;color:#e5e7eb;margin:1.5em 0 0.5em;font-weight:700;border-bottom:1px solid #1f2937;padding-bottom:0.3em">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.2rem;color:#f3f4f6;margin:0 0 1em;font-weight:700">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#d1d5db;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em style="color:#9ca3af">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:2px 6px;border-radius:3px;font-size:0.85em;color:#60a5fa;font-family:monospace">$1</code>')
    .replace(/^- \[x\] (.+)$/gim, '<div style="display:flex;gap:8px;align-items:flex-start;color:#34d399;padding:3px 0"><span style="flex-shrink:0">✓</span><span>$1</span></div>')
    .replace(/^- \[ \] (.+)$/gim, '<div style="display:flex;gap:8px;align-items:flex-start;color:#6b7280;padding:3px 0"><span style="flex-shrink:0">☐</span><span>$1</span></div>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;align-items:flex-start;padding:2px 0"><span style="color:#c9a227;flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #1f2937;margin:1em 0">')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ─── Component ─────────────────────────────────────────────

export function WorkSpaceScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const files     = parseFiles();
  const [selected, setSelected] = useState<MdFile | null>(files[0] ?? null);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100vw',
      background: 'var(--color-bg-dark)',
      color: 'var(--color-text-primary)',
      fontFamily: 'sans-serif',
      overflow: 'hidden',
    }}>

      {/* ── ヘッダー ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0 1.25rem', height: 52, flexShrink: 0,
        background: 'var(--color-bg-medium)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button
          onClick={() => setScreen('TITLE')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '0.82rem', padding: '4px 6px',
            borderRadius: 6,
          }}
        >
          <ArrowLeft size={16} />
          戻る
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

        <FolderOpen size={16} color="var(--color-primary)" />
        <span style={{
          fontSize: '0.95rem', fontWeight: 700,
          color: 'var(--color-primary)', letterSpacing: '0.05em',
        }}>
          WorkSpace
        </span>

        {selected && (
          <>
            <span style={{ color: '#374151', fontSize: '0.8rem' }}>/</span>
            <span style={{
              fontSize: '0.8rem', color: '#9ca3af',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {prettifyName(selected.name)}
            </span>
            {selected.date && (
              <span style={{
                marginLeft: 'auto', fontSize: '0.72rem', color: '#4b5563',
              }}>
                {selected.date}
              </span>
            )}
          </>
        )}
      </header>

      {/* ── 本体: 2カラム ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── 左サイドバー: ファイル一覧 ── */}
        <aside style={{
          width: 240, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'var(--color-bg-medium)',
          borderRight: '1px solid var(--color-border)',
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '0.6rem 0.875rem',
            fontSize: '0.68rem', fontWeight: 700,
            color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase',
            borderBottom: '1px solid var(--color-border)',
          }}>
            04_WorkSpace
          </div>

          {files.length === 0 ? (
            <div style={{
              padding: '2rem 1rem', textAlign: 'center',
              color: '#4b5563', fontSize: '0.78rem',
            }}>
              .md ファイルがありません
            </div>
          ) : (
            files.map(f => {
              const active = selected?.key === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setSelected(f)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    width: '100%', padding: '0.6rem 0.875rem',
                    background: active ? 'rgba(201,162,39,0.1)' : 'none',
                    border: 'none',
                    borderLeft: `3px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <FileText
                    size={13}
                    color={active ? '#c9a227' : '#4b5563'}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                      color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {prettifyName(f.name)}
                    </div>
                    {f.date && (
                      <div style={{ fontSize: '0.63rem', color: '#4b5563', marginTop: 1 }}>
                        {f.date}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </aside>

        {/* ── 右コンテンツ ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2.25rem' }}>
          {selected ? (
            <div
              style={{
                maxWidth: 820, margin: '0 auto',
                fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.9,
                letterSpacing: '0.01em',
              }}
              dangerouslySetInnerHTML={{ __html: renderMd(selected.content) }}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '60vh', gap: '0.5rem',
              color: '#4b5563', fontSize: '0.875rem',
            }}>
              <span style={{ fontSize: '2rem' }}>📂</span>
              ファイルを選択してください
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
