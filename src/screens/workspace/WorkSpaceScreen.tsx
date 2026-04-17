// ============================================================
// WorkSpaceScreen — フルページ ワークスペースビューア
// サイドバー常時表示の2カラムレイアウト
// テーブル / プログレスバー / PM バッジ 対応
// ============================================================

import { useState } from 'react';
import { FileText, ArrowLeft, FolderOpen, BarChart2 } from 'lucide-react';
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
  isPM: boolean;
}

// ─── Helpers ───────────────────────────────────────────────

function parseFiles(): MdFile[] {
  return Object.entries(rawModules)
    .map(([key, content]) => {
      const filename  = key.split('/').pop() ?? key;
      const name      = filename.replace(/\.md$/, '');
      const dateMatch = name.match(/(\d{4}-\d{2}-\d{2})/);
      const isPM      = name.startsWith('PM_');
      return { key, name, date: dateMatch?.[1] ?? '', content, isPM };
    })
    .sort((a, b) => {
      // PM ファイルを先頭に、その後は日付降順
      if (a.isPM !== b.isPM) return a.isPM ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
}

function prettifyName(name: string): string {
  return name
    .replace(/^PM_/, '')
    .replace(/_(\d{4}-\d{2}-\d{2})$/, '')
    .replace(/_/g, ' ');
}

// ─── Markdown レンダラー ────────────────────────────────────

function renderMd(src: string): string {
  // 1. HTML エスケープ
  let out = src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. テーブル（複数行をまとめて処理）
  out = out.replace(
    /((?:\|[^\n]+\|\n?)+)/g,
    (block) => {
      const rows = block.trim().split('\n').filter(r => r.trim());
      if (rows.length < 2) return block;

      const isSep = (r: string) => /^\|[-| :]+\|$/.test(r.trim());
      const sepIdx = rows.findIndex(isSep);
      const hasHeader = sepIdx === 1;

      const thStyle = 'padding:7px 14px;text-align:left;font-size:0.73rem;font-weight:700;color:#9ca3af;border-bottom:2px solid #374151;background:#0d0d14;white-space:nowrap';
      const tdStyle = 'padding:7px 14px;font-size:0.8rem;color:#d1d5db;border-bottom:1px solid #1f2937;vertical-align:top';

      const parseRow = (row: string, tag: 'th' | 'td') => {
        const cells = row.split('|').slice(1, -1);
        return `<tr>${cells.map(c => `<${tag} style="${tag === 'th' ? thStyle : tdStyle}">${c.trim()}</${tag}>`).join('')}</tr>`;
      };

      const tableRows = rows
        .filter((_, i) => !isSep(rows[i]))
        .map((row, i) => parseRow(row, hasHeader && i === 0 ? 'th' : 'td'))
        .join('');

      return `<div style="overflow-x:auto;margin:0.75em 0"><table style="width:100%;border-collapse:collapse;border:1px solid #1f2937;border-radius:8px;overflow:hidden">${tableRows}</table></div>`;
    }
  );

  // 3. プログレスバー: [progress:75]
  out = out.replace(/\[progress:(\d+)\]/g, (_, pct) => {
    const n     = Math.min(100, Math.max(0, parseInt(pct)));
    const color = n >= 80 ? '#34d399' : n >= 60 ? '#c9a227' : n >= 35 ? '#f59e0b' : '#ef4444';
    const bg    = n >= 80 ? 'rgba(52,211,153,0.12)' : n >= 60 ? 'rgba(201,162,39,0.1)' : n >= 35 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
    return [
      `<div style="display:flex;align-items:center;gap:10px;margin:6px 0;padding:8px 12px;background:${bg};border-radius:8px;border:1px solid ${color}33">`,
        `<div style="flex:1;height:10px;background:#1f2937;border-radius:5px;overflow:hidden">`,
          `<div style="height:100%;width:${n}%;background:${color};border-radius:5px"></div>`,
        `</div>`,
        `<span style="font-size:0.82rem;font-weight:700;color:${color};min-width:40px;text-align:right">${n}%</span>`,
      `</div>`,
    ].join('');
  });

  // 4. 見出し
  out = out
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.88rem;color:#c9a227;margin:1.2em 0 0.35em;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1rem;color:#e5e7eb;margin:1.6em 0 0.5em;font-weight:700;border-bottom:1px solid #1f2937;padding-bottom:0.3em">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.25rem;color:#f3f4f6;margin:0 0 0.2em;font-weight:700">$1</h1>');

  // 5. インライン装飾
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e5e7eb;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em style="color:#9ca3af">$1</em>')
    .replace(/`([^`]+)`/g,     '<code style="background:#1f2937;padding:2px 6px;border-radius:3px;font-size:0.82em;color:#60a5fa;font-family:monospace">$1</code>');

  // 6. チェックリスト / リスト
  out = out
    .replace(/^- \[x\] (.+)$/gim, '<div style="display:flex;gap:8px;align-items:flex-start;color:#34d399;padding:2px 0"><span style="flex-shrink:0;font-size:0.9em">✓</span><span>$1</span></div>')
    .replace(/^- \[ \] (.+)$/gim, '<div style="display:flex;gap:8px;align-items:flex-start;color:#6b7280;padding:2px 0"><span style="flex-shrink:0;font-size:0.9em">☐</span><span>$1</span></div>')
    .replace(/^- (.+)$/gm,        '<div style="display:flex;gap:8px;align-items:flex-start;padding:1px 0"><span style="color:#c9a227;flex-shrink:0">•</span><span>$1</span></div>');

  // 7. 区切り線
  out = out.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #1f2937;margin:1.2em 0">');

  // 8. blockquote: > ...
  out = out.replace(/^&gt; (.+)$/gm,
    '<div style="border-left:3px solid #374151;padding:4px 12px;color:#6b7280;font-style:italic;margin:4px 0">$1</div>');

  // 9. 改行
  out = out
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  return out;
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
            {selected.isPM && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(167,139,250,0.12)',
                border: '1px solid rgba(167,139,250,0.35)',
                color: '#a78bfa', fontSize: '0.65rem', fontWeight: 700,
                padding: '2px 6px', borderRadius: 4,
              }}>
                <BarChart2 size={10} /> PM
              </span>
            )}
            <span style={{
              fontSize: '0.8rem', color: '#9ca3af',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {prettifyName(selected.name)}
            </span>
            {selected.date && (
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#4b5563' }}>
                {selected.date}
              </span>
            )}
          </>
        )}
      </header>

      {/* ── 本体: 2カラム ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── 左サイドバー ── */}
        <aside style={{
          width: 240, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'var(--color-bg-medium)',
          borderRight: '1px solid var(--color-border)',
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '0.6rem 0.875rem',
            fontSize: '0.65rem', fontWeight: 700,
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
                    background: active
                      ? f.isPM ? 'rgba(167,139,250,0.1)' : 'rgba(201,162,39,0.1)'
                      : 'none',
                    border: 'none',
                    borderLeft: `3px solid ${
                      active
                        ? f.isPM ? '#a78bfa' : 'var(--color-primary)'
                        : 'transparent'
                    }`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {f.isPM
                    ? <BarChart2 size={13} color={active ? '#a78bfa' : '#6b7280'} style={{ marginTop: 2, flexShrink: 0 }} />
                    : <FileText  size={13} color={active ? '#c9a227' : '#4b5563'} style={{ marginTop: 2, flexShrink: 0 }} />
                  }
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: active ? 600 : f.isPM ? 500 : 400,
                      color: active
                        ? f.isPM ? '#a78bfa' : 'var(--color-primary)'
                        : f.isPM ? '#c4b5fd' : 'var(--color-text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {f.isPM && !active && (
                        <span style={{ fontSize: '0.6rem', color: '#a78bfa', marginRight: 4 }}>PM</span>
                      )}
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
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2.5rem' }}>
          {selected ? (
            <div
              style={{
                maxWidth: 860, margin: '0 auto',
                fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.9,
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
