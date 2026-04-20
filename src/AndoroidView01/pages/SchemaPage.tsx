// ============================================================
// AndroidView01 — SchemaPage
// モバイル版 Schema（ジャンル選択 → コンテンツ表示）
// ============================================================

import { useState } from 'react';
import schemaScenarioV51 from '@/devstudio/docs/schema_v51_reference_v2.html?raw';

interface SchemaEntry {
  id:      string;
  version: string;
  label:   string;
  html:    string;
}

interface SchemaGenre {
  id:     string;
  label:  string;
  icon:   string;
  color:  string;
  schemas: SchemaEntry[];
}

const GENRES: SchemaGenre[] = [
  {
    id: 'scenario', label: 'シナリオ', icon: '📖', color: '#5DCAA5',
    schemas: [
      { id: 'scenario-v51', version: 'Ver5.1', label: 'シナリオ Ver5.1', html: schemaScenarioV51 },
    ],
  },
  { id: 'character',  label: 'キャラクター', icon: '👤', color: '#a78bfa', schemas: [] },
  { id: 'background', label: '背景',         icon: '🌄', color: '#60a5fa', schemas: [] },
  { id: 'item',       label: 'アイテム',     icon: '🎒', color: '#fbbf24', schemas: [] },
];

const IFRAME_CSS = `
  :root {
    --color-text-primary: #d1d5db;
    --color-background-primary: #0d0d1a;
    --color-background-secondary: #13132a;
    --color-border-primary: rgba(255,255,255,0.15);
  }
  html, body {
    background: #0a0a14 !important;
    color: var(--color-text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    margin: 0; padding: 0;
  }
`;

function buildSrcDoc(html: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${IFRAME_CSS}</style></head><body>${html}</body></html>`;
}

export function SchemaPage() {
  const [activeGenreId, setActiveGenreId] = useState<string>(GENRES[0].id);
  const [activeSchemaId, setActiveSchemaId] = useState<string>(GENRES[0].schemas[0]?.id ?? '');

  const genre = GENRES.find(g => g.id === activeGenreId) ?? GENRES[0];
  const schema = genre.schemas.find(s => s.id === activeSchemaId) ?? genre.schemas[0] ?? null;

  const handleGenreClick = (g: SchemaGenre) => {
    setActiveGenreId(g.id);
    if (g.schemas.length > 0) setActiveSchemaId(g.schemas[0].id);
    else setActiveSchemaId('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ジャンル選択（横スクロールタブ） */}
      <div style={{
        display: 'flex', gap: 6,
        padding: '10px 14px',
        overflowX: 'auto', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {GENRES.map(g => {
          const active = g.id === activeGenreId;
          return (
            <button key={g.id} onClick={() => handleGenreClick(g)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
              background: active ? `${g.color}18` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? `${g.color}60` : 'rgba(255,255,255,0.08)'}`,
              color: active ? g.color : '#6b7280',
              fontSize: '0.8rem', fontWeight: active ? 700 : 400,
            }}>
              <span>{g.icon}</span>
              <span>{g.label}</span>
              {g.schemas.length === 0 && (
                <span style={{ fontSize: '0.58rem', color: '#374151' }}>準備中</span>
              )}
            </button>
          );
        })}
      </div>

      {/* バージョン選択（複数ある場合） */}
      {genre.schemas.length > 1 && (
        <div style={{
          display: 'flex', gap: 5, padding: '6px 14px',
          flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {genre.schemas.map(s => {
            const active = s.id === activeSchemaId;
            return (
              <button key={s.id} onClick={() => setActiveSchemaId(s.id)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: active ? `${genre.color}22` : 'rgba(255,255,255,0.05)',
                color: active ? genre.color : '#6b7280',
                fontSize: '0.72rem', fontWeight: active ? 700 : 400,
              }}>{s.version}</button>
            );
          })}
        </div>
      )}

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {schema ? (
          <iframe
            key={schema.id}
            srcDoc={buildSrcDoc(schema.html)}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={schema.label}
          />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12, height: '100%',
            color: '#374151',
          }}>
            <span style={{ fontSize: '3rem' }}>{genre.icon}</span>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{genre.label} スキーマ</div>
            <div style={{
              fontSize: '0.72rem', color: '#2d2d3f',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '8px 20px',
            }}>
              スキーマ定義が登録されるとここに表示されます
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
