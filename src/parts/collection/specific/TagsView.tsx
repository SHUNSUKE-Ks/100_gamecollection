// ============================================
// TagsView - タグDB (Notion List スタイル + インライン編集)
// ============================================

import { useState, useRef, useCallback } from 'react';
import tagsData from '@/data/collection/tags.json';
import './TagsView.css';

type TagCategory = 'all' | 'theme' | 'beat' | 'trope' | 'emotion' | 'relation';
type EditableField = 'description' | 'tag_key' | 'category';

interface TagItem {
    description: string;
    tag_key: string;
    category: string;
}

interface EditingCell {
    rowKey: string;       // tag_key で特定
    field: EditableField;
}

// ── カテゴリ設定 ──────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    theme:    { label: 'テーマ',    color: '#a78bfa', bg: 'rgba(124,58,237,0.15)'  },
    beat:     { label: 'ビート',    color: '#34d399', bg: 'rgba(16,185,129,0.15)'  },
    trope:    { label: 'トロープ',  color: '#fbbf24', bg: 'rgba(245,158,11,0.15)'  },
    emotion:  { label: '感情',      color: '#f87171', bg: 'rgba(239,68,68,0.15)'   },
    relation: { label: '関係',      color: '#60a5fa', bg: 'rgba(59,130,246,0.15)'  },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);

const TABS: { id: TagCategory; label: string }[] = [
    { id: 'all',      label: 'ALL'     },
    { id: 'theme',    label: 'テーマ'   },
    { id: 'beat',     label: 'ビート'   },
    { id: 'trope',    label: 'トロープ' },
    { id: 'emotion',  label: '感情'     },
    { id: 'relation', label: '関係'     },
];

// ── localStorage 永続化 ───────────────────────────────

const STORAGE_KEY = 'nanonovel_tags_v1';

function loadTags(): TagItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as TagItem[];
    } catch { /* ignore */ }
    return tagsData.tags as TagItem[];
}

function saveTags(tags: TagItem[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tags)); } catch { /* ignore */ }
}

// ── Component ────────────────────────────────────────

export function TagsView() {
    const [tags, setTags] = useState<TagItem[]>(loadTags);
    const [activeTab, setActiveTab] = useState<TagCategory>('all');
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<EditingCell | null>(null);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

    // ── タブ件数 ──────────────────────────────────────

    const countFor = (cat: TagCategory) =>
        cat === 'all' ? tags.length : tags.filter(t => t.category === cat).length;

    // ── フィルタリング ────────────────────────────────

    const filtered = tags.filter(tag => {
        const matchTab    = activeTab === 'all' || tag.category === activeTab;
        const matchSearch = !search
            || tag.description.includes(search)
            || tag.tag_key.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    // ── 編集開始 ──────────────────────────────────────

    const startEdit = useCallback((rowKey: string, field: EditableField, currentValue: string) => {
        setEditing({ rowKey, field });
        setEditValue(currentValue);
        // フォーカスは useEffect ではなく次フレームで
        setTimeout(() => (inputRef.current as HTMLElement | null)?.focus(), 0);
    }, []);

    // ── 編集確定 ──────────────────────────────────────

    const commitEdit = useCallback(() => {
        if (!editing) return;
        const next = tags.map(t =>
            t.tag_key === editing.rowKey ? { ...t, [editing.field]: editValue } : t
        );
        setTags(next);
        saveTags(next);
        setEditing(null);
    }, [editing, editValue, tags]);

    // ── 編集キャンセル ────────────────────────────────

    const cancelEdit = useCallback(() => {
        setEditing(null);
    }, []);

    // ── カテゴリ即時変更（select は blur を待たない） ──

    const commitCategory = useCallback((rowKey: string, value: string) => {
        const next = tags.map(t =>
            t.tag_key === rowKey ? { ...t, category: value } : t
        );
        setTags(next);
        saveTags(next);
        setEditing(null);
    }, [tags]);

    // ── 行追加 ───────────────────────────────────────

    const addRow = () => {
        const newTag: TagItem = {
            description: '新しいタグ',
            tag_key: `new_tag_${Date.now()}`,
            category: activeTab === 'all' ? 'theme' : activeTab,
        };
        const next = [...tags, newTag];
        setTags(next);
        saveTags(next);
        // 追加直後に description を編集
        setTimeout(() => startEdit(newTag.tag_key, 'description', newTag.description), 30);
    };

    // ── 行削除 ───────────────────────────────────────

    const deleteRow = (rowKey: string) => {
        const next = tags.filter(t => t.tag_key !== rowKey);
        setTags(next);
        saveTags(next);
    };

    // ── セルのレンダリング ────────────────────────────

    const renderCell = (tag: TagItem, field: EditableField) => {
        const isEditing = editing?.rowKey === tag.tag_key && editing?.field === field;

        if (isEditing && field === 'category') {
            return (
                <select
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                    className="tags-cell-select"
                    value={editValue}
                    autoFocus
                    onChange={e => {
                        setEditValue(e.target.value);
                        commitCategory(tag.tag_key, e.target.value);
                    }}
                    onBlur={cancelEdit}
                    onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); }}
                >
                    {CATEGORY_KEYS.map(key => (
                        <option key={key} value={key}>{CATEGORY_CONFIG[key].label}</option>
                    ))}
                </select>
            );
        }

        if (isEditing) {
            return (
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    className="tags-cell-input"
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                        if (e.key === 'Escape') cancelEdit();
                        if (e.key === 'Tab') { e.preventDefault(); commitEdit(); }
                    }}
                />
            );
        }

        // 表示モード
        if (field === 'category') {
            const cfg = CATEGORY_CONFIG[tag.category] ?? { label: tag.category, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
            return (
                <span
                    className="tags-category-badge"
                    style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}55` }}
                    onClick={() => startEdit(tag.tag_key, field, tag.category)}
                >
                    {cfg.label}
                </span>
            );
        }

        return (
            <span
                className={`tags-cell-text ${field === 'tag_key' ? 'monospace' : ''}`}
                onClick={() => startEdit(tag.tag_key, field, tag[field])}
            >
                {tag[field] || <span className="tags-cell-empty">空</span>}
            </span>
        );
    };

    // ── Render ───────────────────────────────────────

    return (
        <div className="tags-view">

            {/* ── ツールバー ── */}
            <div className="tags-toolbar">
                <div className="tags-tabs">
                    {TABS.map(tab => {
                        const cfg = CATEGORY_CONFIG[tab.id];
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`tags-tab ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={isActive && cfg ? { color: cfg.color, borderBottomColor: cfg.color } : {}}
                            >
                                {tab.label}
                                <span className="tags-tab-count">{countFor(tab.id)}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="tags-toolbar-right">
                    <input
                        className="tags-search"
                        type="text"
                        placeholder="検索..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Notion スタイル テーブル ── */}
            <div className="tags-table-wrap">
                <table className="tags-table">
                    <thead>
                        <tr className="tags-thead-row">
                            <th className="tags-th tags-th-index">#</th>
                            <th className="tags-th tags-th-description">説明</th>
                            <th className="tags-th tags-th-key">タグキー</th>
                            <th className="tags-th tags-th-category">カテゴリ</th>
                            <th className="tags-th tags-th-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="tags-empty-cell">該当するタグがありません</td>
                            </tr>
                        ) : (
                            filtered.map((tag, idx) => (
                                <tr
                                    key={tag.tag_key}
                                    className={`tags-row ${editing?.rowKey === tag.tag_key ? 'editing' : ''}`}
                                >
                                    <td className="tags-td tags-td-index">{idx + 1}</td>
                                    <td className="tags-td tags-td-description">
                                        {renderCell(tag, 'description')}
                                    </td>
                                    <td className="tags-td tags-td-key">
                                        {renderCell(tag, 'tag_key')}
                                    </td>
                                    <td className="tags-td tags-td-category">
                                        {renderCell(tag, 'category')}
                                    </td>
                                    <td className="tags-td tags-td-action">
                                        <button
                                            className="tags-delete-btn"
                                            onClick={() => deleteRow(tag.tag_key)}
                                            title="削除"
                                        >×</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* 行追加 */}
                <button className="tags-add-row-btn" onClick={addRow}>
                    ＋ 行を追加
                </button>
            </div>
        </div>
    );
}
