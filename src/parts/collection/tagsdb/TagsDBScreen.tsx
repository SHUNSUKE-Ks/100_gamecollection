// ============================================================
// TagsDBScreen — TagsDB メイン画面
// Sub-tabs: ScenarioTagsDB | TitleDB | ectTab
// Full-page (Notion-like) + 双方向タグリレーション
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, ArrowLeft, ExternalLink, X, ChevronDown } from 'lucide-react';
import tagsData from '@/data/collection/tags.json';

// ── 型定義 ────────────────────────────────────────────────────

interface TagItem {
  id: string;
  tag_key: string;
  description: string;
  category: string;
}

interface TitleEntry {
  id: string;
  title: string;
  subtitle: string;
  genre: string[];
  status: 'planning' | 'writing' | 'done';
  description: string;
  tags: string[];
  note: string;
}

interface EctEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  scope: string[];
  note: string;
}

type SubTab = 'scenario' | 'title' | 'ect';

type FullPageItem =
  | { kind: 'tag';   item: TagItem }
  | { kind: 'title'; item: TitleEntry }
  | { kind: 'ect';   item: EctEntry };

// ── 定数 ─────────────────────────────────────────────────────

const CAT: Record<string, { label: string; color: string; bg: string }> = {
  theme:    { label: 'テーマ',   color: '#a78bfa', bg: 'rgba(167,139,250,.15)' },
  beat:     { label: 'ビート',   color: '#34d399', bg: 'rgba(52,211,153,.15)'  },
  trope:    { label: 'トロープ', color: '#fbbf24', bg: 'rgba(251,191,36,.15)'  },
  emotion:  { label: '感情',     color: '#f87171', bg: 'rgba(248,113,113,.15)' },
  relation: { label: '関係',     color: '#60a5fa', bg: 'rgba(96,165,250,.15)'  },
};

const STATUS: Record<string, { label: string; color: string }> = {
  planning: { label: '企画中', color: '#a78bfa' },
  writing:  { label: '執筆中', color: '#fbbf24' },
  done:     { label: '完成',   color: '#34d399' },
};

const GENRES  = ['ファンタジー', 'SF', '現代', 'ホラー', 'ミステリー', 'ロマンス', 'アクション', '歴史', 'その他'];
const SCOPES  = ['characters', 'npcs', 'events', 'items', 'scenes', 'episodes', 'titles'];
const CAT_KEYS = Object.keys(CAT);

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── ストレージ ────────────────────────────────────────────────

function loadScenarioTags(): TagItem[] {
  try {
    const raw = localStorage.getItem('nanonovel_tags_v1');
    if (raw) {
      const arr = JSON.parse(raw) as any[];
      return arr.map(t => ({ id: t.id ?? t.tag_key, tag_key: t.tag_key ?? '', description: t.description ?? '', category: t.category ?? 'theme' }));
    }
  } catch {}
  return (tagsData.tags as any[]).map(t => ({ id: t.tag_key, ...t }));
}
const saveTags   = (d: TagItem[])   => { try { localStorage.setItem('nanonovel_tags_v1',  JSON.stringify(d)); } catch {} };
const saveTitles = (d: TitleEntry[]) => { try { localStorage.setItem('tagsdb_titles_v1',  JSON.stringify(d)); } catch {} };
const saveEcts   = (d: EctEntry[])  => { try { localStorage.setItem('tagsdb_ect_v1',      JSON.stringify(d)); } catch {} };

function loadJSON<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}

// ── TagChip ──────────────────────────────────────────────────

function TagChip({ tagKey, allTags, onClick, onRemove }: {
  tagKey: string; allTags: TagItem[];
  onClick?: () => void; onRemove?: () => void;
}) {
  const tag = allTags.find(t => t.tag_key === tagKey);
  const cfg = CAT[tag?.category ?? ''] ?? { color: '#6b7280', bg: 'rgba(107,114,128,.15)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
      borderRadius: 4, padding: '1px 6px', fontSize: '.65rem', fontFamily: 'monospace',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <span onClick={onClick}>{tagKey}</span>
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '.6rem' }}>×</button>
      )}
    </span>
  );
}

// ── TagSelectorPopup ─────────────────────────────────────────

function TagSelectorPopup({ selected, allTags, onToggle, onClose }: {
  selected: string[]; allTags: TagItem[];
  onToggle: (key: string) => void; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const filtered = allTags.filter(t =>
    t.tag_key.toLowerCase().includes(search.toLowerCase()) ||
    t.description.includes(search)
  );
  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 50, top: '110%', left: 0,
      background: '#1f2937', border: '1px solid #374151', borderRadius: 8,
      padding: '0.5rem', width: 300, maxHeight: 280, overflowY: 'auto',
      boxShadow: '0 8px 24px rgba(0,0,0,.6)',
    }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
          placeholder="検索..." style={{
            flex: 1, background: '#111827', border: '1px solid #374151', borderRadius: 4,
            color: '#e5e7eb', padding: '3px 7px', fontSize: '.73rem', boxSizing: 'border-box',
          }} />
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0 4px' }}>×</button>
      </div>
      {filtered.map(t => {
        const cfg = CAT[t.category] ?? { color: '#6b7280', bg: '' };
        const on = selected.includes(t.tag_key);
        return (
          <button key={t.tag_key} onClick={() => onToggle(t.tag_key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              background: on ? cfg.bg : 'none', border: 'none',
              color: on ? cfg.color : '#d1d5db', padding: '3px 6px', borderRadius: 4,
              cursor: 'pointer', fontSize: '.72rem', textAlign: 'left',
            }}>
            <span style={{
              width: 12, height: 12, border: `1px solid ${cfg.color}60`, borderRadius: 2,
              background: on ? cfg.color : 'transparent', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.5rem', color: '#111',
            }}>{on ? '✓' : ''}</span>
            <span style={{ fontFamily: 'monospace', color: cfg.color, fontSize: '.68rem', flexShrink: 0 }}>{t.tag_key}</span>
            <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.65rem' }}>{t.description}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── ScenarioTagsPanel ─────────────────────────────────────────

function ScenarioTagsPanel({ tags, onAdd, onUpdate, onDelete, onOpenPage }: {
  tags: TagItem[]; onAdd: () => void;
  onUpdate: (t: TagItem) => void; onDelete: (id: string) => void;
  onOpenPage: (t: TagItem) => void;
}) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [editing, setEditing] = useState<{ id: string; field: 'tag_key' | 'description' } | null>(null);
  const [editVal, setEditVal] = useState('');

  const filtered = tags.filter(t => {
    const matchCat = catFilter === 'all' || t.category === catFilter;
    const matchSearch = !search || t.tag_key.includes(search) || t.description.includes(search);
    return matchCat && matchSearch;
  });

  const startEdit = (t: TagItem, field: 'tag_key' | 'description') => {
    setEditing({ id: t.id, field });
    setEditVal(t[field]);
  };

  const commitEdit = (t: TagItem) => {
    if (!editing) return;
    onUpdate({ ...t, [editing.field]: editVal.trim() || t[editing.field] });
    setEditing(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: '1px solid #1f2937', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="検索..." style={{
            background: '#1f2937', border: '1px solid #374151', borderRadius: 5,
            color: '#e5e7eb', padding: '4px 10px', fontSize: '.78rem',
          }} />
        <div style={{ display: 'flex', gap: 3 }}>
          {['all', ...CAT_KEYS].map(c => {
            const cfg = CAT[c];
            return (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                background: catFilter === c ? (cfg?.bg ?? 'rgba(255,255,255,.1)') : 'transparent',
                border: `1px solid ${catFilter === c ? (cfg?.color ?? '#9ca3af') + '60' : 'transparent'}`,
                color: catFilter === c ? (cfg?.color ?? '#e5e7eb') : '#6b7280',
                borderRadius: 4, padding: '2px 9px', cursor: 'pointer', fontSize: '.7rem',
              }}>{c === 'all' ? 'ALL' : cfg.label}</button>
            );
          })}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#4b5563' }}>{filtered.length} 件</span>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(201,162,39,.12)', border: '1px solid rgba(201,162,39,.35)',
          color: '#c9a227', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '.75rem',
        }}><Plus size={12} /> 追加</button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
          <thead>
            <tr style={{ background: '#0a0f1a', position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={th}>#</th>
              <th style={th}>tag_key</th>
              <th style={th}>説明</th>
              <th style={th}>カテゴリ</th>
              <th style={{ ...th, width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const cfg = CAT[t.category] ?? CAT.theme;
              const isEditKey  = editing?.id === t.id && editing.field === 'tag_key';
              const isEditDesc = editing?.id === t.id && editing.field === 'description';
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid #0f172a' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <td style={{ ...td, color: '#4b5563', width: 36 }}>{i + 1}</td>
                  <td style={td}>
                    {isEditKey ? (
                      <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                        onBlur={() => commitEdit(t)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(t); if (e.key === 'Escape') setEditing(null); }}
                        style={{ ...inlineInput, fontFamily: 'monospace', color: cfg.color }} />
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => onOpenPage(t)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: '1px 3px' }}
                          title="フルページで開く"><ExternalLink size={11} /></button>
                        <code onClick={() => startEdit(t, 'tag_key')}
                          style={{ color: cfg.color, cursor: 'text', fontFamily: 'monospace' }}>{t.tag_key}</code>
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    {isEditDesc ? (
                      <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                        onBlur={() => commitEdit(t)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(t); if (e.key === 'Escape') setEditing(null); }}
                        style={{ ...inlineInput, color: '#e5e7eb' }} />
                    ) : (
                      <span onClick={() => startEdit(t, 'description')} style={{ cursor: 'text', color: '#9ca3af' }}>
                        {t.description || <span style={{ color: '#374151' }}>クリックして入力...</span>}
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    <select value={t.category} onChange={e => onUpdate({ ...t, category: e.target.value })}
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color, borderRadius: 4, padding: '1px 5px', fontSize: '.68rem', cursor: 'pointer' }}>
                      {CAT_KEYS.map(c => <option key={c} value={c} style={{ background: '#1f2937', color: '#e5e7eb' }}>{CAT[c].label}</option>)}
                    </select>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button onClick={() => onDelete(t.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 4 }}
                      title="削除"><Trash2 size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563', fontSize: '.85rem' }}>
            タグがありません。「追加」で新規作成してください。
          </div>
        )}
      </div>
    </div>
  );
}

// ── TitleDBPanel ──────────────────────────────────────────────

function TitleDBPanel({ titles, allTags, onAdd, onUpdate, onDelete, onOpenPage }: {
  titles: TitleEntry[]; allTags: TagItem[];
  onAdd: () => void; onUpdate: (t: TitleEntry) => void;
  onDelete: (id: string) => void; onOpenPage: (t: TitleEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectorId, setSelectorId] = useState<string | null>(null);

  const filtered = titles.filter(t =>
    !search || t.title.includes(search) || t.description.includes(search)
  );

  const toggleTag = useCallback((titleId: string, tagKey: string) => {
    const t = titles.find(x => x.id === titleId);
    if (!t) return;
    onUpdate({ ...t, tags: t.tags.includes(tagKey) ? t.tags.filter(k => k !== tagKey) : [...t.tags, tagKey] });
  }, [titles, onUpdate]);

  const toggleGenre = (titleId: string, genre: string) => {
    const t = titles.find(x => x.id === titleId);
    if (!t) return;
    onUpdate({ ...t, genre: t.genre.includes(genre) ? t.genre.filter(g => g !== genre) : [...t.genre, genre] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: '1px solid #1f2937', flexShrink: 0, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="検索..." style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 5, color: '#e5e7eb', padding: '4px 10px', fontSize: '.78rem' }} />
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#4b5563' }}>{filtered.length} 件</span>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(201,162,39,.12)', border: '1px solid rgba(201,162,39,.35)',
          color: '#c9a227', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '.75rem',
        }}><Plus size={12} /> 追加</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(t => {
          const sc = STATUS[t.status] ?? STATUS.planning;
          return (
            <div key={t.id} style={{
              background: '#0f172a', border: '1px solid #1f2937', borderRadius: 8,
              padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem',
            }}>
              {/* Left: info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                  <button onClick={() => onOpenPage(t)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e5e7eb', fontWeight: 700, fontSize: '.92rem', padding: 0, textAlign: 'left' }}
                    title="フルページで開く">{t.title}</button>
                  <ExternalLink size={11} style={{ color: '#374151', flexShrink: 0 }} />
                  <span style={{ marginLeft: 'auto', background: `${sc.color}20`, border: `1px solid ${sc.color}40`, color: sc.color, borderRadius: 4, padding: '1px 7px', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>
                    {sc.label}
                  </span>
                </div>
                {t.subtitle && <p style={{ color: '#6b7280', fontSize: '.75rem', margin: '0 0 4px' }}>{t.subtitle}</p>}
                {t.description && <p style={{ color: '#9ca3af', fontSize: '.75rem', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {/* Genre chips */}
                  {t.genre.map(g => (
                    <span key={g} style={{ background: 'rgba(107,114,128,.15)', color: '#9ca3af', border: '1px solid #374151', borderRadius: 4, padding: '1px 6px', fontSize: '.63rem' }}>{g}</span>
                  ))}
                  {/* Tag chips */}
                  {t.tags.map(k => (
                    <TagChip key={k} tagKey={k} allTags={allTags} />
                  ))}
                </div>
              </div>
              {/* Right: actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <button onClick={() => onDelete(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 4 }}><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563', fontSize: '.85rem' }}>
            タイトルがありません。「追加」で新規作成してください。
          </div>
        )}
      </div>
    </div>
  );
}

// ── EctTabPanel ───────────────────────────────────────────────

function EctTabPanel({ ects, allTags, onAdd, onUpdate, onDelete, onOpenPage }: {
  ects: EctEntry[]; allTags: TagItem[];
  onAdd: () => void; onUpdate: (e: EctEntry) => void;
  onDelete: (id: string) => void; onOpenPage: (e: EctEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = ects.filter(e => !search || e.name.includes(search) || e.description.includes(search));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: '1px solid #1f2937', flexShrink: 0, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="検索..." style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 5, color: '#e5e7eb', padding: '4px 10px', fontSize: '.78rem' }} />
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#4b5563' }}>{filtered.length} 件</span>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(201,162,39,.12)', border: '1px solid rgba(201,162,39,.35)',
          color: '#c9a227', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '.75rem',
        }}><Plus size={12} /> 追加</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(e => (
          <div key={e.id} style={{
            background: '#0f172a', border: '1px solid #1f2937', borderRadius: 8,
            padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                <button onClick={() => onOpenPage(e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e5e7eb', fontWeight: 700, fontSize: '.88rem', padding: 0, textAlign: 'left' }}>
                  {e.name}
                </button>
                <ExternalLink size={11} style={{ color: '#374151', flexShrink: 0 }} />
              </div>
              {e.description && <p style={{ color: '#9ca3af', fontSize: '.75rem', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</p>}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {e.tags.map(k => <TagChip key={k} tagKey={k} allTags={allTags} />)}
                {e.scope.map(s => (
                  <span key={s} style={{ background: 'rgba(52,211,153,.08)', color: '#34d399', border: '1px solid #34d39940', borderRadius: 4, padding: '1px 5px', fontSize: '.62rem' }}>{s}</span>
                ))}
              </div>
            </div>
            <button onClick={() => onDelete(e.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 4, alignSelf: 'flex-start' }}><Trash2 size={13} /></button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563', fontSize: '.85rem' }}>
            エントリーがありません。「追加」で新規作成してください。
          </div>
        )}
      </div>
    </div>
  );
}

// ── FullPageView ──────────────────────────────────────────────

function FullPageView({ page, pageStack, allTags, allTitles, allEcts, onBack, onNavigate, onUpdateTag, onUpdateTitle, onUpdateEct }: {
  page: FullPageItem; pageStack: FullPageItem[];
  allTags: TagItem[]; allTitles: TitleEntry[]; allEcts: EctEntry[];
  onBack: () => void;
  onNavigate: (p: FullPageItem) => void;
  onUpdateTag: (t: TagItem) => void;
  onUpdateTitle: (t: TitleEntry) => void;
  onUpdateEct: (e: EctEntry) => void;
}) {
  const [tagSelector, setTagSelector] = useState(false);

  // ── Tag page ──────────────────────────────────────────────

  if (page.kind === 'tag') {
    const tag = page.item;
    const cfg = CAT[tag.category] ?? CAT.theme;

    // Bidirectional: Titles and Ects that reference this tag
    const relatedTitles = allTitles.filter(t => t.tags.includes(tag.tag_key));
    const relatedEcts   = allEcts.filter(e => e.tags.includes(tag.tag_key));

    return (
      <div style={fpWrap}>
        <FullPageHeader stack={pageStack} onBack={onBack} />
        <div style={fpBody}>
          {/* Tag key (title) */}
          <EditableField label="tag_key" value={tag.tag_key} mono
            onSave={v => onUpdateTag({ ...tag, tag_key: v })} />

          <EditableField label="説明" value={tag.description}
            onSave={v => onUpdateTag({ ...tag, description: v })} />

          <div style={propRow}>
            <span style={propLabel}>カテゴリ</span>
            <select value={tag.category} onChange={e => onUpdateTag({ ...tag, category: e.target.value })}
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color, borderRadius: 4, padding: '3px 8px', fontSize: '.78rem' }}>
              {CAT_KEYS.map(c => <option key={c} value={c} style={{ background: '#1f2937', color: '#e5e7eb' }}>{CAT[c].label}</option>)}
            </select>
          </div>

          {/* Relations */}
          <RelationSection title={`このタグを使っているタイトル (${relatedTitles.length})`}>
            {relatedTitles.length === 0
              ? <span style={{ color: '#4b5563', fontSize: '.78rem' }}>なし</span>
              : relatedTitles.map(t => (
                <RelationCard key={t.id} label={t.title} sub={STATUS[t.status]?.label}
                  onClick={() => onNavigate({ kind: 'title', item: t })} />
              ))}
          </RelationSection>

          <RelationSection title={`このタグを使っているectエントリー (${relatedEcts.length})`}>
            {relatedEcts.length === 0
              ? <span style={{ color: '#4b5563', fontSize: '.78rem' }}>なし</span>
              : relatedEcts.map(e => (
                <RelationCard key={e.id} label={e.name}
                  onClick={() => onNavigate({ kind: 'ect', item: e })} />
              ))}
          </RelationSection>
        </div>
      </div>
    );
  }

  // ── Title page ────────────────────────────────────────────

  if (page.kind === 'title') {
    const t = page.item;
    const sc = STATUS[t.status] ?? STATUS.planning;

    // Bidirectional: titles sharing tags, ects sharing tags
    const sharedTitles = allTitles.filter(x => x.id !== t.id && x.tags.some(k => t.tags.includes(k)));
    const sharedEcts   = allEcts.filter(e => e.tags.some(k => t.tags.includes(k)));

    return (
      <div style={fpWrap}>
        <FullPageHeader stack={pageStack} onBack={onBack} />
        <div style={fpBody}>
          <EditableField label="タイトル" value={t.title} large
            onSave={v => onUpdateTitle({ ...t, title: v })} />

          <EditableField label="サブタイトル" value={t.subtitle}
            onSave={v => onUpdateTitle({ ...t, subtitle: v })} />

          <div style={propRow}>
            <span style={propLabel}>ステータス</span>
            <select value={t.status} onChange={e => onUpdateTitle({ ...t, status: e.target.value as any })}
              style={{ background: `${sc.color}20`, border: `1px solid ${sc.color}40`, color: sc.color, borderRadius: 4, padding: '3px 8px', fontSize: '.78rem' }}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} style={{ background: '#1f2937', color: '#e5e7eb' }}>{v.label}</option>)}
            </select>
          </div>

          {/* Genre multi-select */}
          <div style={propRow}>
            <span style={propLabel}>ジャンル</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {GENRES.map(g => {
                const on = t.genre.includes(g);
                return (
                  <button key={g} onClick={() => onUpdateTitle({ ...t, genre: on ? t.genre.filter(x => x !== g) : [...t.genre, g] })}
                    style={{
                      background: on ? 'rgba(107,114,128,.3)' : 'transparent',
                      border: `1px solid ${on ? '#9ca3af60' : '#374151'}`,
                      color: on ? '#e5e7eb' : '#6b7280', borderRadius: 4,
                      padding: '2px 8px', cursor: 'pointer', fontSize: '.7rem',
                    }}>{g}</button>
                );
              })}
            </div>
          </div>

          <EditableField label="説明" value={t.description} multiline
            onSave={v => onUpdateTitle({ ...t, description: v })} />

          <EditableField label="ノート" value={t.note} multiline
            onSave={v => onUpdateTitle({ ...t, note: v })} />

          {/* Tags */}
          <div style={propRow}>
            <span style={propLabel}>タグ</span>
            <div style={{ position: 'relative', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              {t.tags.map(k => (
                <TagChip key={k} tagKey={k} allTags={allTags}
                  onClick={() => { const tag = allTags.find(x => x.tag_key === k); if (tag) onNavigate({ kind: 'tag', item: tag }); }}
                  onRemove={() => onUpdateTitle({ ...t, tags: t.tags.filter(x => x !== k) })} />
              ))}
              <button onClick={() => setTagSelector(v => !v)}
                style={{ background: 'rgba(255,255,255,.05)', border: '1px dashed #374151', color: '#6b7280', borderRadius: 4, padding: '1px 8px', cursor: 'pointer', fontSize: '.68rem' }}>
                + タグ
              </button>
              {tagSelector && (
                <TagSelectorPopup selected={t.tags} allTags={allTags}
                  onToggle={k => onUpdateTitle({ ...t, tags: t.tags.includes(k) ? t.tags.filter(x => x !== k) : [...t.tags, k] })}
                  onClose={() => setTagSelector(false)} />
              )}
            </div>
          </div>

          {/* Relations */}
          <RelationSection title={`共通タグを持つタイトル (${sharedTitles.length})`}>
            {sharedTitles.length === 0
              ? <span style={{ color: '#4b5563', fontSize: '.78rem' }}>なし</span>
              : sharedTitles.map(x => (
                <RelationCard key={x.id} label={x.title} sub={STATUS[x.status]?.label}
                  tags={x.tags.filter(k => t.tags.includes(k))} allTags={allTags}
                  onClick={() => onNavigate({ kind: 'title', item: x })} />
              ))}
          </RelationSection>

          <RelationSection title={`共通タグを持つectエントリー (${sharedEcts.length})`}>
            {sharedEcts.length === 0
              ? <span style={{ color: '#4b5563', fontSize: '.78rem' }}>なし</span>
              : sharedEcts.map(e => (
                <RelationCard key={e.id} label={e.name}
                  tags={e.tags.filter(k => t.tags.includes(k))} allTags={allTags}
                  onClick={() => onNavigate({ kind: 'ect', item: e })} />
              ))}
          </RelationSection>
        </div>
      </div>
    );
  }

  // ── Ect page ──────────────────────────────────────────────

  if (page.kind === 'ect') {
    const e = page.item;
    const relatedTitles = allTitles.filter(t => t.tags.some(k => e.tags.includes(k)));

    return (
      <div style={fpWrap}>
        <FullPageHeader stack={pageStack} onBack={onBack} />
        <div style={fpBody}>
          <EditableField label="名前" value={e.name} large
            onSave={v => onUpdateEct({ ...e, name: v })} />

          <EditableField label="説明" value={e.description} multiline
            onSave={v => onUpdateEct({ ...e, description: v })} />

          <EditableField label="ノート" value={e.note} multiline
            onSave={v => onUpdateEct({ ...e, note: v })} />

          {/* Scope */}
          <div style={propRow}>
            <span style={propLabel}>スコープ</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {SCOPES.map(s => {
                const on = e.scope.includes(s);
                return (
                  <button key={s} onClick={() => onUpdateEct({ ...e, scope: on ? e.scope.filter(x => x !== s) : [...e.scope, s] })}
                    style={{
                      background: on ? 'rgba(52,211,153,.12)' : 'transparent',
                      border: `1px solid ${on ? '#34d39950' : '#374151'}`,
                      color: on ? '#34d399' : '#6b7280', borderRadius: 4,
                      padding: '2px 8px', cursor: 'pointer', fontSize: '.7rem', fontFamily: 'monospace',
                    }}>{s}</button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div style={propRow}>
            <span style={propLabel}>タグ</span>
            <div style={{ position: 'relative', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              {e.tags.map(k => (
                <TagChip key={k} tagKey={k} allTags={allTags}
                  onClick={() => { const tag = allTags.find(t => t.tag_key === k); if (tag) onNavigate({ kind: 'tag', item: tag }); }}
                  onRemove={() => onUpdateEct({ ...e, tags: e.tags.filter(x => x !== k) })} />
              ))}
              <button onClick={() => setTagSelector(v => !v)}
                style={{ background: 'rgba(255,255,255,.05)', border: '1px dashed #374151', color: '#6b7280', borderRadius: 4, padding: '1px 8px', cursor: 'pointer', fontSize: '.68rem' }}>
                + タグ
              </button>
              {tagSelector && (
                <TagSelectorPopup selected={e.tags} allTags={allTags}
                  onToggle={k => onUpdateEct({ ...e, tags: e.tags.includes(k) ? e.tags.filter(x => x !== k) : [...e.tags, k] })}
                  onClose={() => setTagSelector(false)} />
              )}
            </div>
          </div>

          <RelationSection title={`関連するタイトル (${relatedTitles.length})`}>
            {relatedTitles.length === 0
              ? <span style={{ color: '#4b5563', fontSize: '.78rem' }}>なし</span>
              : relatedTitles.map(t => (
                <RelationCard key={t.id} label={t.title} sub={STATUS[t.status]?.label}
                  tags={t.tags.filter(k => e.tags.includes(k))} allTags={allTags}
                  onClick={() => onNavigate({ kind: 'title', item: t })} />
              ))}
          </RelationSection>
        </div>
      </div>
    );
  }

  return null;
}

// ── FullPage Sub-components ───────────────────────────────────

function FullPageHeader({ stack, onBack }: { stack: FullPageItem[]; onBack: () => void }) {
  const kindLabel = (p: FullPageItem) =>
    p.kind === 'tag' ? p.item.tag_key
    : p.kind === 'title' ? p.item.title
    : p.item.name;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
        color: '#6b7280', cursor: 'pointer', fontSize: '.8rem', padding: '4px 8px', borderRadius: 5,
      }}><ArrowLeft size={14} /> 戻る</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4b5563', fontSize: '.75rem' }}>
        <span>TagsDB</span>
        {stack.map((p, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>/</span>
            <span style={{ color: i === stack.length - 1 ? '#e5e7eb' : '#6b7280' }}>{kindLabel(p)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function EditableField({ label, value, onSave, large, multiline, mono }: {
  label: string; value: string; onSave: (v: string) => void;
  large?: boolean; multiline?: boolean; mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onSave(draft); setEditing(false); };

  return (
    <div style={propRow}>
      <span style={propLabel}>{label}</span>
      {editing ? (
        multiline ? (
          <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            rows={4}
            style={{
              background: '#1f2937', border: '1px solid #374151', borderRadius: 5,
              color: '#e5e7eb', padding: '6px 10px', fontSize: large ? '1.1rem' : '.85rem',
              fontFamily: mono ? 'monospace' : 'inherit', resize: 'vertical', width: '100%', boxSizing: 'border-box',
            }} />
        ) : (
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            style={{
              background: '#1f2937', border: '1px solid #374151', borderRadius: 5,
              color: '#e5e7eb', padding: '4px 10px', fontSize: large ? '1.3rem' : '.85rem',
              fontFamily: mono ? 'monospace' : 'inherit', fontWeight: large ? 700 : 400, flex: 1,
            }} />
        )
      ) : (
        <div onClick={() => { setDraft(value); setEditing(true); }}
          style={{
            color: value ? '#e5e7eb' : '#374151', cursor: 'text',
            fontSize: large ? '1.3rem' : '.85rem', fontWeight: large ? 700 : 400,
            fontFamily: mono ? 'monospace' : 'inherit', flex: 1, padding: '2px 0',
            borderBottom: '1px solid transparent',
            minHeight: multiline ? '3rem' : 'auto', whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
          }}>
          {value || (large ? 'タイトルを入力...' : 'クリックして入力...')}
        </div>
      )}
    </div>
  );
}

function RelationSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#4b5563', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid #1f2937' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

function RelationCard({ label, sub, tags, allTags, onClick }: {
  label: string; sub?: string; tags?: string[]; allTags?: TagItem[]; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      background: 'rgba(255,255,255,.03)', border: '1px solid #1f2937', borderRadius: 6,
      padding: '0.5rem 0.75rem', cursor: 'pointer', textAlign: 'left', width: '100%',
    }}>
      <ExternalLink size={11} style={{ color: '#374151', flexShrink: 0 }} />
      <span style={{ color: '#d1d5db', fontSize: '.82rem', fontWeight: 600 }}>{label}</span>
      {sub && <span style={{ color: '#6b7280', fontSize: '.7rem' }}>{sub}</span>}
      {tags && allTags && tags.map(k => (
        <TagChip key={k} tagKey={k} allTags={allTags} />
      ))}
    </button>
  );
}

// ── スタイル定数 ─────────────────────────────────────────────

const th: React.CSSProperties = {
  textAlign: 'left', padding: '6px 12px', color: '#4b5563',
  fontSize: '.7rem', fontWeight: 600, borderBottom: '1px solid #1f2937',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = { padding: '6px 12px', verticalAlign: 'middle' };
const inlineInput: React.CSSProperties = {
  background: '#1f2937', border: '1px solid #374151', borderRadius: 4,
  padding: '2px 6px', fontSize: '.78rem', width: '100%', boxSizing: 'border-box',
};
const fpWrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
};
const fpBody: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '2rem 3rem', maxWidth: 800, width: '100%',
};
const propRow: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.5rem 0',
  borderBottom: '1px solid #0f172a',
};
const propLabel: React.CSSProperties = {
  width: 100, flexShrink: 0, color: '#6b7280', fontSize: '.75rem',
  fontWeight: 600, paddingTop: '0.3rem',
};

// ── TagsDBScreen (エクスポート) ──────────────────────────────

export function TagsDBScreen() {
  const [scenarioTags, setScenarioTagsRaw] = useState<TagItem[]>(loadScenarioTags);
  const [titles,       setTitlesRaw]       = useState<TitleEntry[]>(() => loadJSON<TitleEntry>('tagsdb_titles_v1'));
  const [ects,         setEctsRaw]         = useState<EctEntry[]>(()   => loadJSON<EctEntry>('tagsdb_ect_v1'));

  const setTags   = (n: TagItem[])   => { setScenarioTagsRaw(n); saveTags(n);   };
  const setTitles = (n: TitleEntry[]) => { setTitlesRaw(n);       saveTitles(n); };
  const setEcts   = (n: EctEntry[])  => { setEctsRaw(n);          saveEcts(n);   };

  const [subTab, setSubTab] = useState<SubTab>('scenario');
  const [pageStack, setPageStack] = useState<FullPageItem[]>([]);
  const currentPage = pageStack[pageStack.length - 1] ?? null;

  const openPage  = (p: FullPageItem)  => setPageStack(prev => [...prev, p]);
  const goBack    = ()                 => setPageStack(prev => prev.slice(0, -1));

  // CRUD + sync open pages
  const syncPage = useCallback((updated: FullPageItem) => {
    setPageStack(prev => prev.map(p =>
      p.kind === updated.kind && (p.item as any).id === (updated.item as any).id ? updated : p
    ));
  }, []);

  const addTag    = () => { const t: TagItem = { id: genId(), tag_key: 'new_tag_' + Date.now().toString(36), description: '', category: 'theme' }; setTags([...scenarioTags, t]); };
  const updateTag = (t: TagItem) => { setTags(scenarioTags.map(x => x.id === t.id ? t : x)); syncPage({ kind: 'tag', item: t }); };
  const deleteTag = (id: string) => setTags(scenarioTags.filter(t => t.id !== id));

  const addTitle    = () => { const t: TitleEntry = { id: genId(), title: '新しいタイトル', subtitle: '', genre: [], status: 'planning', description: '', tags: [], note: '' }; setTitles([...titles, t]); openPage({ kind: 'title', item: t }); };
  const updateTitle = (t: TitleEntry) => { setTitles(titles.map(x => x.id === t.id ? t : x)); syncPage({ kind: 'title', item: t }); };
  const deleteTitle = (id: string) => setTitles(titles.filter(t => t.id !== id));

  const addEct    = () => { const e: EctEntry = { id: genId(), name: '新しいエントリー', description: '', tags: [], scope: [], note: '' }; setEcts([...ects, e]); };
  const updateEct = (e: EctEntry) => { setEcts(ects.map(x => x.id === e.id ? e : x)); syncPage({ kind: 'ect', item: e }); };
  const deleteEct = (id: string) => setEcts(ects.filter(e => e.id !== id));

  if (currentPage) {
    return (
      <FullPageView
        page={currentPage} pageStack={pageStack}
        allTags={scenarioTags} allTitles={titles} allEcts={ects}
        onBack={goBack} onNavigate={openPage}
        onUpdateTag={updateTag} onUpdateTitle={updateTitle} onUpdateEct={updateEct}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tab nav */}
      <div style={{ display: 'flex', gap: 2, padding: '0.5rem 1rem', borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
        {([
          { id: 'scenario' as SubTab, label: 'ScenarioTagsDB' },
          { id: 'title'    as SubTab, label: 'TitleDB' },
          { id: 'ect'      as SubTab, label: 'ectTab' },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{
            background: subTab === tab.id ? 'rgba(201,162,39,.15)' : 'transparent',
            border:     subTab === tab.id ? '1px solid rgba(201,162,39,.4)' : '1px solid transparent',
            color:      subTab === tab.id ? '#c9a227' : '#6b7280',
            borderRadius: 6, padding: '0.35rem 0.875rem',
            cursor: 'pointer', fontSize: '.8rem', fontWeight: subTab === tab.id ? 700 : 400,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Panel */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {subTab === 'scenario' && (
          <ScenarioTagsPanel tags={scenarioTags} onAdd={addTag} onUpdate={updateTag} onDelete={deleteTag}
            onOpenPage={t => openPage({ kind: 'tag', item: t })} />
        )}
        {subTab === 'title' && (
          <TitleDBPanel titles={titles} allTags={scenarioTags} onAdd={addTitle} onUpdate={updateTitle} onDelete={deleteTitle}
            onOpenPage={t => openPage({ kind: 'title', item: t })} />
        )}
        {subTab === 'ect' && (
          <EctTabPanel ects={ects} allTags={scenarioTags} onAdd={addEct} onUpdate={updateEct} onDelete={deleteEct}
            onOpenPage={e => openPage({ kind: 'ect', item: e })} />
        )}
      </div>
    </div>
  );
}
