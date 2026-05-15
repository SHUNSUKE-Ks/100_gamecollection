// ============================================================
// DocLibrary — 資料ライブラリ（VS Code タブ式）
//   - 全資料は doc_inbox に投入
//   - DocTag DB（別テーブル）でタグ管理
//   - Doc ↔ DocTag はリレーション（tagIds[]）で紐付け
//   - タブシステム：複数ドキュメントを同時に表示
// ============================================================

import { useState, useMemo } from 'react';
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { Doc, DocTag } from '@/devstudio/core/types';

// ─── Color palette for tags ──────────────────────────────────

const TAG_COLORS = [
  '#a78bfa', '#60a5fa', '#34d399', '#fbbf24',
  '#f87171', '#fb923c', '#e879f9', '#38bdf8',
  '#4ade80', '#f472b6',
];

const now = () => Date.now();
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

// ─── Root ────────────────────────────────────────────────────

export function DocLibraryScreen() {
  const { docs, docTags, addDoc, updateDoc, deleteDoc, addDocTag, updateDocTag, deleteDocTag } =
    useDevStudioStore();

  const [selectedTagId, setSelectedTagId] = useState<string | null>(null); // null = 全て
  const [search, setSearch]               = useState('');

  // ── Tab system ──
  const [openDocIds, setOpenDocIds] = useState<string[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [fullscreenDocId, setFullscreenDocId] = useState<string | null>(null);

  // ── Tab functions ──
  function openDoc(docId: string) {
    if (!openDocIds.includes(docId)) {
      setOpenDocIds([...openDocIds, docId]);
    }
    setActiveDocId(docId);
  }

  function closeDoc(docId: string) {
    const idx = openDocIds.indexOf(docId);
    const newList = openDocIds.filter(id => id !== docId);
    setOpenDocIds(newList);
    if (activeDocId === docId) {
      if (newList.length > 0) {
        setActiveDocId(newList[Math.max(0, idx - 1)]);
      } else {
        setActiveDocId(null);
      }
    }
    if (editingDocId === docId) setEditingDocId(null);
  }

  const activeDoc = activeDocId ? docs.find(d => d.id === activeDocId) : null;

  // フィルタリング
  const filteredDocs = useMemo(() => {
    let list = [...docs].sort((a, b) => b.updatedAt - a.updatedAt);
    if (selectedTagId === '__untagged__') {
      list = list.filter(d => d.tagIds.length === 0);
    } else if (selectedTagId) {
      list = list.filter(d => d.tagIds.includes(selectedTagId));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q)
      );
    }
    return list;
  }, [docs, selectedTagId, search]);

  // タグ別 doc 数
  const countByTag = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of docs) {
      for (const tid of d.tagIds) m[tid] = (m[tid] ?? 0) + 1;
    }
    return m;
  }, [docs]);

  const untaggedCount = docs.filter(d => d.tagIds.length === 0).length;

  // ── 新規 Doc 追加 ──
  function handleAddDoc() {
    const doc: Doc = {
      id: `doc_${uid()}`,
      title: '新規資料',
      body: '',
      tagIds: selectedTagId && selectedTagId !== '__untagged__' ? [selectedTagId] : [],
      createdAt: now(),
      updatedAt: now(),
    };
    addDoc(doc);
    setOpenDocIds([...openDocIds, doc.id]);
  }

  const isFullscreen = fullscreenDocId !== null;

  return (
    <div style={{
      display: 'flex', height: '100%', overflow: 'hidden',
      fontFamily: 'monospace',
    }}>
      {/* ── Left: Tag sidebar (hidden in fullscreen) ── */}
      {!isFullscreen && (
        <TagSidebar
          docTags={docTags}
          selectedTagId={selectedTagId}
          countByTag={countByTag}
          totalCount={docs.length}
          untaggedCount={untaggedCount}
          onSelectTag={id => { setSelectedTagId(id); }}
          onAddTag={addDocTag}
          onUpdateTag={updateDocTag}
          onDeleteTag={deleteDocTag}
        />
      )}

      {/* ── Center: doc_inbox (hidden in fullscreen) ── */}
      {!isFullscreen && (
        <DocInbox
          docs={filteredDocs}
          openDocIds={openDocIds}
          search={search}
          onSearch={setSearch}
          onSelect={openDoc}
          onAdd={handleAddDoc}
        />
      )}

      {/* ── Right: Tab viewer ── */}
      {openDocIds.length > 0 && activeDoc && (
        <DocViewerPanel
          openDocs={openDocIds.map(id => docs.find(d => d.id === id)!)}
          activeDocId={activeDocId}
          editingDocId={editingDocId}
          docTags={docTags}
          isFullscreen={isFullscreen}
          onSelectTab={setActiveDocId}
          onCloseTab={closeDoc}
          onEdit={setEditingDocId}
          onToggleFullscreen={(id) => setFullscreenDocId(isFullscreen ? null : id)}
          onUpdate={updateDoc}
          onDelete={(id) => { deleteDoc(id); closeDoc(id); }}
        />
      )}
    </div>
  );
}

// ─── Tag Sidebar ─────────────────────────────────────────────

interface TagSidebarProps {
  docTags: DocTag[];
  selectedTagId: string | null;
  countByTag: Record<string, number>;
  totalCount: number;
  untaggedCount: number;
  onSelectTag: (id: string | null) => void;
  onAddTag: (tag: DocTag) => void;
  onUpdateTag: (tag: DocTag) => void;
  onDeleteTag: (id: string) => void;
}

function TagSidebar({
  docTags, selectedTagId, countByTag, totalCount, untaggedCount,
  onSelectTag, onAddTag, onUpdateTag, onDeleteTag,
}: TagSidebarProps) {
  const [addingTag, setAddingTag] = useState(false);
  const [newName, setNewName]     = useState('');
  const [newColor, setNewColor]   = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState('');

  function handleAddTag() {
    if (!newName.trim()) return;
    onAddTag({
      id: `dtag_${uid()}`,
      name: newName.trim(),
      color: newColor,
      createdAt: now(),
    });
    setNewName(''); setAddingTag(false);
  }

  function startEdit(tag: DocTag) {
    setEditingId(tag.id);
    setEditName(tag.name);
  }

  function commitEdit(tag: DocTag) {
    if (editName.trim()) onUpdateTag({ ...tag, name: editName.trim() });
    setEditingId(null);
  }

  const itemStyle = (active: boolean, color?: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '6px 10px', borderRadius: 5, cursor: 'pointer',
    background: active ? `${color ?? '#6366f1'}1a` : 'transparent',
    border: `1px solid ${active ? `${color ?? '#6366f1'}55` : 'transparent'}`,
    transition: 'all 0.12s',
  });

  return (
    <aside style={{
      width: 220, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', padding: '12px 8px',
      background: 'rgba(0,0,0,0.25)', overflowY: 'auto',
    }}>
      <div style={{ fontSize: '0.6rem', color: '#4b5563', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>
        DOC TAGS
      </div>

      {/* 全ての資料 */}
      <div
        style={itemStyle(selectedTagId === null, '#9ca3af')}
        onClick={() => onSelectTag(null)}
      >
        <span style={{ fontSize: '0.8rem' }}>📂</span>
        <span style={{ flex: 1, fontSize: '0.72rem', color: selectedTagId === null ? '#d1d5db' : '#6b7280' }}>
          全ての資料
        </span>
        <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{totalCount}</span>
      </div>

      {/* 未タグ */}
      <div
        style={itemStyle(selectedTagId === '__untagged__', '#6b7280')}
        onClick={() => onSelectTag('__untagged__')}
      >
        <span style={{ fontSize: '0.8rem' }}>🏷️</span>
        <span style={{ flex: 1, fontSize: '0.72rem', color: selectedTagId === '__untagged__' ? '#d1d5db' : '#6b7280' }}>
          未タグ
        </span>
        <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{untaggedCount}</span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0' }} />

      {/* Tag list */}
      {docTags.map(tag => {
        const active = selectedTagId === tag.id;
        return (
          <div key={tag.id} style={{ position: 'relative', marginBottom: 2 }}>
            <div
              style={itemStyle(active, tag.color)}
              onClick={() => onSelectTag(tag.id)}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
              {editingId === tag.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => commitEdit(tag)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(tag); if (e.key === 'Escape') setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3, color: '#d1d5db', fontSize: '0.72rem', fontFamily: 'monospace',
                    padding: '1px 4px',
                  }}
                />
              ) : (
                <span
                  style={{ flex: 1, fontSize: '0.72rem', color: active ? '#d1d5db' : '#9ca3af' }}
                  onDoubleClick={e => { e.stopPropagation(); startEdit(tag); }}
                >
                  {tag.name}
                </span>
              )}
              <span style={{ fontSize: '0.62rem', color: '#4b5563' }}>{countByTag[tag.id] ?? 0}</span>
              <button
                onClick={e => { e.stopPropagation(); onDeleteTag(tag.id); if (selectedTagId === tag.id) onSelectTag(null); }}
                style={{
                  background: 'none', border: 'none', color: '#374151', cursor: 'pointer',
                  fontSize: '0.65rem', padding: 0, lineHeight: 1, opacity: 0,
                  transition: 'opacity 0.12s',
                }}
                className="tag-del-btn"
                title="削除"
              >✕</button>
            </div>
          </div>
        );
      })}

      {/* Add tag form */}
      {addingTag ? (
        <div style={{ padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            autoFocus
            placeholder="タグ名"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setAddingTag(false); }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4, color: '#d1d5db', fontSize: '0.72rem', fontFamily: 'monospace',
              padding: '4px 8px', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {TAG_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: 14, height: 14, borderRadius: '50%', background: c, cursor: 'pointer',
                  outline: newColor === c ? `2px solid ${c}` : '2px solid transparent',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleAddTag} style={btnStyle('#6366f1')}>追加</button>
            <button onClick={() => setAddingTag(false)} style={btnStyle('#374151')}>キャンセル</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingTag(true)}
          style={{
            marginTop: 8, background: 'none', border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 5, color: '#4b5563', fontSize: '0.68rem', cursor: 'pointer',
            padding: '5px 8px', textAlign: 'left', fontFamily: 'monospace',
          }}
        >+ タグを追加</button>
      )}

      <style>{`.tag-del-btn { opacity: 0 } div:hover > div > .tag-del-btn { opacity: 1 }`}</style>
    </aside>
  );
}

// ─── Doc Inbox ───────────────────────────────────────────────

interface DocInboxProps {
  docs: Doc[];
  openDocIds: string[];
  search: string;
  onSearch: (q: string) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

function DocInbox({ docs, openDocIds, search, onSearch, onSelect, onAdd }: DocInboxProps) {
  const { docTags } = useDevStudioStore();
  const tagMap = useMemo(() => Object.fromEntries(docTags.map(t => [t.id, t])), [docTags]);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.72rem', color: '#6b7280', letterSpacing: '0.1em' }}>doc_inbox</span>
        <span style={{ fontSize: '0.62rem', color: '#374151' }}>({docs.length})</span>
        <div style={{ flex: 1 }} />
        <input
          placeholder="検索..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5, color: '#9ca3af', fontSize: '0.72rem', fontFamily: 'monospace',
            padding: '3px 10px', outline: 'none', width: 160,
          }}
        />
        <button onClick={onAdd} style={btnStyle('#6366f1')}>＋ 資料追加</button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {docs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#374151', fontSize: '0.72rem', paddingTop: 40 }}>
            資料なし
            <div style={{ color: '#1f2937', fontSize: '0.62rem', marginTop: 6 }}>
              「＋ 資料追加」から最初のドキュメントを作成
            </div>
          </div>
        ) : (
          docs.map(doc => {
            const isOpen = openDocIds.includes(doc.id);
            const preview = doc.body.replace(/#+\s*/g, '').slice(0, 80);
            return (
              <div
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                style={{
                  padding: '9px 12px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  background: isOpen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isOpen ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isOpen ? '#c4b5fd' : '#d1d5db', fontWeight: isOpen ? 600 : 400, marginBottom: 3 }}>
                  {doc.title || '（無題）'}
                </div>
                {preview && (
                  <div style={{
                    fontSize: '0.65rem', color: '#4b5563',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 5,
                  }}>{preview}</div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {doc.tagIds.map(tid => {
                    const tag = tagMap[tid];
                    if (!tag) return null;
                    return (
                      <span key={tid} style={{
                        fontSize: '0.58rem', padding: '1px 6px', borderRadius: 10,
                        background: `${tag.color}22`, color: tag.color,
                        border: `1px solid ${tag.color}44`,
                      }}>{tag.name}</span>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.58rem', color: '#2d3748', marginTop: 4 }}>
                  {new Date(doc.updatedAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Doc Viewer Panel (タブ式、VS Code スタイル) ──────────

interface DocViewerPanelProps {
  openDocs: Doc[];
  activeDocId: string | null;
  editingDocId: string | null;
  docTags: DocTag[];
  isFullscreen: boolean;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onEdit: (id: string | null) => void;
  onToggleFullscreen: (id: string) => void;
  onUpdate: (doc: Doc) => void;
  onDelete: (id: string) => void;
}

function DocViewerPanel({
  openDocs, activeDocId, editingDocId, docTags, isFullscreen,
  onSelectTab, onCloseTab, onEdit, onToggleFullscreen, onUpdate, onDelete,
}: DocViewerPanelProps) {
  const activeDoc = openDocs.find(d => d.id === activeDocId);
  const isEditing = editingDocId === activeDocId;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      borderLeft: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.15)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0', background: 'rgba(0,0,0,0.3)',
        overflowX: 'auto', flexShrink: 0,
      }}>
        {openDocs.map((doc, idx) => {
          const isActive = doc.id === activeDocId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectTab(doc.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', cursor: 'pointer',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.12s',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: isActive ? '#c4b5fd' : '#9ca3af' }}>
                {doc.title || '（無題）'}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onCloseTab(doc.id); }}
                style={{
                  background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer',
                  fontSize: '0.85rem', padding: 0, lineHeight: 1,
                  opacity: 0.6, transition: 'opacity 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Content area */}
      {activeDoc && (
        isEditing ? (
          <DocEditor
            doc={activeDoc}
            docTags={docTags}
            isFullscreen={isFullscreen}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCancel={() => onEdit(null)}
            onToggleFullscreen={() => onToggleFullscreen(activeDoc.id)}
          />
        ) : (
          <DocViewer
            doc={activeDoc}
            docTags={docTags}
            isFullscreen={isFullscreen}
            onEdit={() => onEdit(activeDoc.id)}
            onDelete={onDelete}
            onToggleFullscreen={() => onToggleFullscreen(activeDoc.id)}
          />
        )
      )}
    </div>
  );
}

// ─── Doc Viewer (읽기 전용) ──────────────────────────

interface DocViewerProps {
  doc: Doc;
  docTags: DocTag[];
  isFullscreen: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleFullscreen: () => void;
}

function DocViewer({ doc, docTags, isFullscreen, onEdit, onDelete, onToggleFullscreen }: DocViewerProps) {
  const tagMap = useMemo(() => Object.fromEntries(docTags.map(t => [t.id, t])), [docTags]);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', color: '#d1d5db', fontWeight: 600, marginBottom: 2 }}>
            {doc.title || '（無題）'}
          </div>
          {doc.source && (
            <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
              出典: {doc.source}
            </div>
          )}
        </div>
        <button
          onClick={onToggleFullscreen}
          style={btnStyle('#9ca3af')}
          title={isFullscreen ? 'フルスクリーン終了' : 'フルスクリーン表示'}
        >
          {isFullscreen ? '◾' : '⛶'}
        </button>
        <button onClick={onEdit} style={btnStyle('#6366f1')}>編集</button>
        <button
          onClick={() => { if (confirm('この資料を削除しますか？')) onDelete(doc.id); }}
          style={btnStyle('#7f1d1d', '#fca5a5')}
        >削除</button>
      </div>

      {/* Meta tags */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {doc.tagIds.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {doc.tagIds.map(tid => {
              const tag = tagMap[tid];
              return tag ? (
                <span key={tid} style={{
                  fontSize: '0.58rem', padding: '2px 8px', borderRadius: 10,
                  background: `${tag.color}22`, color: tag.color,
                  border: `1px solid ${tag.color}44`,
                }}>
                  {tag.name}
                </span>
              ) : null;
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.65rem', color: '#374151' }}>タグなし</div>
        )}
      </div>

      {/* Body (Markdown render) */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 14px',
        fontSize: '0.75rem', lineHeight: 1.6, color: '#d1d5db',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontFamily: 'monospace',
      }}>
        {/* Simple Markdown-like rendering */}
        {doc.body.split('\n').map((line, i) => {
          // Heading detection
          if (line.startsWith('# ')) {
            return <div key={i} style={{ fontSize: '1.4rem', fontWeight: 700, margin: '12px 0 6px', color: '#c4b5fd' }}>{line.slice(2)}</div>;
          }
          if (line.startsWith('## ')) {
            return <div key={i} style={{ fontSize: '1.1rem', fontWeight: 600, margin: '10px 0 4px', color: '#a78bfa' }}>{line.slice(3)}</div>;
          }
          if (line.startsWith('### ')) {
            return <div key={i} style={{ fontSize: '0.95rem', fontWeight: 600, margin: '8px 0 2px', color: '#d1d5db' }}>{line.slice(4)}</div>;
          }
          // Bold & italic (simple)
          let rendered = line
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code style="background:#222;padding:2px 4px;color:#fbbf24;border-radius:2px">$1</code>');

          if (line === '') {
            return <div key={i} style={{ height: '6px' }} />;
          }
          return (
            <div key={i} dangerouslySetInnerHTML={{ __html: rendered }} />
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: '0.58rem', color: '#374151', flexShrink: 0,
      }}>
        作成: {new Date(doc.createdAt).toLocaleString('ja-JP')} / 更新: {new Date(doc.updatedAt).toLocaleString('ja-JP')}
      </div>
    </div>
  );
}

// ─── Doc Editor ────────────────────────────────────

interface DocEditorProps {
  doc: Doc;
  docTags: DocTag[];
  isFullscreen: boolean;
  onUpdate: (doc: Doc) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onToggleFullscreen: () => void;
}

function DocEditor({ doc, docTags, isFullscreen, onUpdate, onDelete, onCancel, onToggleFullscreen }: DocEditorProps) {
  const [title, setTitle]   = useState(doc.title);
  const [body, setBody]     = useState(doc.body);
  const [source, setSource] = useState(doc.source ?? '');
  const [dirty, setDirty]   = useState(false);

  // doc が切り替わったらローカル状態をリセット
  const [prevId, setPrevId] = useState(doc.id);
  if (doc.id !== prevId) {
    setTitle(doc.title);
    setBody(doc.body);
    setSource(doc.source ?? '');
    setDirty(false);
    setPrevId(doc.id);
  }

  function mark() { setDirty(true); }

  function handleSave() {
    onUpdate({ ...doc, title, body, source: source || undefined, updatedAt: now() });
    setDirty(false);
  }

  function toggleTag(tagId: string) {
    const tagIds = doc.tagIds.includes(tagId)
      ? doc.tagIds.filter(id => id !== tagId)
      : [...doc.tagIds, tagId];
    onUpdate({ ...doc, tagIds, updatedAt: now() });
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: 'rgba(99,102,241,0.05)',
      }}>
        <span style={{ flex: 1, fontSize: '0.72rem', color: '#a78bfa' }}>編集モード</span>
        {dirty && (
          <button onClick={handleSave} style={btnStyle('#6366f1')}>保存</button>
        )}
        <button
          onClick={onToggleFullscreen}
          style={btnStyle('#9ca3af')}
          title={isFullscreen ? 'フルスクリーン終了' : 'フルスクリーン表示'}
        >
          {isFullscreen ? '◾' : '⛶'}
        </button>
        <button onClick={onCancel} style={btnStyle('#4b5563')}>キャンセル</button>
        <button
          onClick={() => { if (confirm('この資料を削除しますか？')) onDelete(doc.id); }}
          style={btnStyle('#7f1d1d', '#fca5a5')}
        >削除</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>タイトル</label>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); mark(); }}
            onBlur={handleSave}
            style={inputStyle}
          />
        </div>

        {/* Tags (relation) */}
        <div>
          <label style={labelStyle}>タグ</label>
          {docTags.length === 0 ? (
            <div style={{ fontSize: '0.65rem', color: '#374151' }}>タグなし</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
              {docTags.map(tag => {
                const linked = doc.tagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      padding: '3px 9px', borderRadius: 10, cursor: 'pointer', fontSize: '0.68rem',
                      background: linked ? `${tag.color}28` : 'rgba(255,255,255,0.04)',
                      color: linked ? tag.color : '#4b5563',
                      border: `1px solid ${linked ? `${tag.color}66` : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.12s',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{linked ? '●' : '○'}</span>
                    {tag.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Source */}
        <div>
          <label style={labelStyle}>出典 / 参照</label>
          <input
            value={source}
            onChange={e => { setSource(e.target.value); mark(); }}
            onBlur={handleSave}
            placeholder="URL や書籍名など"
            style={inputStyle}
          />
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>本文（Markdown）</label>
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); mark(); }}
            onBlur={handleSave}
            style={{
              ...inputStyle,
              flex: 1, resize: 'none',
              fontFamily: 'monospace', lineHeight: 1.6,
            }}
          />
        </div>

        {/* Meta */}
        <div style={{ fontSize: '0.6rem', color: '#2d3748' }}>
          作成: {new Date(doc.createdAt).toLocaleString('ja-JP')}
          {' / '}
          更新: {new Date(doc.updatedAt).toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ───────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.6rem', color: '#4b5563',
  letterSpacing: '0.08em', marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
  color: '#d1d5db', fontSize: '0.75rem', fontFamily: 'monospace',
  padding: '6px 10px', outline: 'none', boxSizing: 'border-box',
};

function btnStyle(bg: string, color = '#e0e7ff'): React.CSSProperties {
  return {
    background: `${bg}33`, border: `1px solid ${bg}88`,
    borderRadius: 5, color, fontSize: '0.65rem',
    cursor: 'pointer', padding: '3px 10px', fontFamily: 'monospace',
    flexShrink: 0,
  };
}
