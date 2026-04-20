import { useState } from 'react';
import schemaScenarioV51 from '../docs/schema_v51_reference_v2.html?raw';

// ─── Genre / Schema registry ──────────────────────────────────
// Add new genres/schemas here as they become available.

interface SchemaEntry {
  id:      string;
  version: string;
  label:   string;
  html:    string;
}

interface SchemaGenre {
  id:      string;
  label:   string;
  icon:    string;
  color:   string;
  schemas: SchemaEntry[];
}

const GENRES: SchemaGenre[] = [
  {
    id: 'scenario', label: 'シナリオ', icon: '📖', color: '#5DCAA5',
    schemas: [
      { id: 'scenario-v51', version: 'Ver5.1', label: 'シナリオ Ver5.1', html: schemaScenarioV51 },
    ],
  },
  {
    id: 'character', label: 'キャラクター', icon: '👤', color: '#a78bfa',
    schemas: [],
  },
  {
    id: 'background', label: '背景', icon: '🌄', color: '#60a5fa',
    schemas: [],
  },
  {
    id: 'item', label: 'アイテム', icon: '🎒', color: '#fbbf24',
    schemas: [],
  },
];

// ─── CSS variables injected into each iframe ──────────────────

const IFRAME_ROOT_CSS = `
  :root {
    --color-text-primary:      #d1d5db;
    --color-text-secondary:    #9ca3af;
    --color-text-tertiary:     #6b7280;
    --color-background-primary:   #0d0d1a;
    --color-background-secondary: #13132a;
    --color-background-tertiary:  #1a1a30;
    --color-border-primary:   rgba(255,255,255,0.15);
    --color-border-secondary: rgba(255,255,255,0.10);
    --color-border-tertiary:  rgba(255,255,255,0.07);
    --border-radius-md: 6px;
    --border-radius-lg: 10px;
    --font-mono: 'Courier New', Courier, monospace;
  }
  html, body {
    background: #0a0a14 !important;
    color: var(--color-text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    margin: 0; padding: 0;
  }
`;

function buildSrcDoc(html: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${IFRAME_ROOT_CSS}</style>
</head><body>${html}</body></html>`;
}

// ─── SchemaView ───────────────────────────────────────────────

export function SchemaView() {
  const [activeGenreId, setActiveGenreId] = useState<string>(GENRES[0].id);
  const [activeSchemaId, setActiveSchemaId] = useState<string>(
    GENRES[0].schemas[0]?.id ?? ''
  );

  const genre = GENRES.find(g => g.id === activeGenreId) ?? GENRES[0];
  const schema = genre.schemas.find(s => s.id === activeSchemaId)
    ?? genre.schemas[0]
    ?? null;

  const handleGenreClick = (g: SchemaGenre) => {
    setActiveGenreId(g.id);
    if (g.schemas.length > 0) setActiveSchemaId(g.schemas[0].id);
    else setActiveSchemaId('');
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, overflow: 'hidden' }}>

      {/* ── Genre sidebar ── */}
      <aside style={{
        width: 160, flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        padding: '12px 0', overflowY: 'auto',
        background: 'rgba(0,0,0,0.25)',
      }}>
        <div style={{
          fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
          color: '#4b5563', padding: '0 14px 8px', textTransform: 'uppercase',
        }}>Genre</div>

        {GENRES.map(g => {
          const active = g.id === activeGenreId;
          return (
            <button key={g.id} onClick={() => handleGenreClick(g)} style={{
              display: 'flex', flexDirection: 'column',
              padding: '9px 14px', cursor: 'pointer', textAlign: 'left',
              background: active ? `${g.color}14` : 'none',
              border: 'none',
              borderLeft: active ? `3px solid ${g.color}` : '3px solid transparent',
              gap: 3,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.9rem' }}>{g.icon}</span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: active ? 700 : 400,
                  color: active ? g.color : '#6b7280',
                }}>{g.label}</span>
              </div>
              {g.schemas.length === 0 ? (
                <span style={{ fontSize: '0.58rem', color: '#374151', marginLeft: 22 }}>準備中</span>
              ) : (
                <span style={{ fontSize: '0.58rem', color: active ? g.color : '#4b5563', marginLeft: 22 }}>
                  {g.schemas.length} スキーマ
                </span>
              )}
            </button>
          );
        })}

        {/* Version selector for selected genre */}
        {genre.schemas.length > 1 && (
          <>
            <div style={{
              height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0',
            }} />
            <div style={{
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
              color: '#4b5563', padding: '0 14px 6px', textTransform: 'uppercase',
            }}>Version</div>
            {genre.schemas.map(s => {
              const active = s.id === activeSchemaId;
              return (
                <button key={s.id} onClick={() => setActiveSchemaId(s.id)} style={{
                  padding: '6px 14px', textAlign: 'left', cursor: 'pointer',
                  background: active ? `${genre.color}14` : 'none',
                  border: 'none',
                  borderLeft: active ? `3px solid ${genre.color}` : '3px solid transparent',
                  fontSize: '0.68rem',
                  color: active ? genre.color : '#6b7280',
                  fontWeight: active ? 700 : 400,
                }}>
                  {s.version}
                </button>
              );
            })}
          </>
        )}
      </aside>

      {/* ── Content area ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {schema ? (
          <iframe
            key={schema.id}
            srcDoc={buildSrcDoc(schema.html)}
            style={{ flex: 1, width: '100%', border: 'none' }}
            title={schema.label}
          />
        ) : (
          <ComingSoon genre={genre} />
        )}
      </div>
    </div>
  );
}

function ComingSoon({ genre }: { genre: SchemaGenre }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
      color: '#374151',
    }}>
      <span style={{ fontSize: '2.5rem' }}>{genre.icon}</span>
      <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{genre.label} スキーマ</div>
      <div style={{
        fontSize: '0.68rem', color: '#2d2d3f',
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.06)',
        borderRadius: 8, padding: '8px 20px',
      }}>
        スキーマ定義が登録されるとここに表示されます
      </div>
    </div>
  );
}
