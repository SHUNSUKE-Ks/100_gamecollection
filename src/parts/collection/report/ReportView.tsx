// ============================================
// ReportView - Notion-DB Style Dev Diary
// Enhanced with editable selects, note drawer, and view modes
// ============================================

import React, { useState } from 'react';
import reportData from '@/data/collection/reports.json';
import { Calendar, Filter, LayoutGrid, Columns, X, GripVertical } from 'lucide-react';
import { DocumentInboxView } from '@/parts/collection/document/DocumentInboxView';

// Types
interface DiaryEntry {
    id: string;
    title: string;
    status: string;
    genre: string;
    date: string;
    content?: string;
}

type ReportTab = 'devDiary' | 'manuals' | 'tutorials' | 'tips' | 'document';
type ViewMode = 'table' | 'group' | 'kanban';
type GroupType = '本日実装予定' | '実装済み' | '未実装' | 'アイディア';

// Status colors
const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    '未実装': { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    '確認済み': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    '実装済み': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    '変更依頼': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    '本日実装予定': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    'アイディア': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
};

// Genre colors
const genreColors: Record<string, string> = {
    'UI': 'bg-purple-500/30 text-purple-300',
    'システム': 'bg-cyan-500/30 text-cyan-300',
    'バトル': 'bg-red-500/30 text-red-300',
    'ツール': 'bg-yellow-500/30 text-yellow-300',
    'オーディオ': 'bg-pink-500/30 text-pink-300',
    'シナリオ': 'bg-indigo-500/30 text-indigo-300',
    'データ': 'bg-teal-500/30 text-teal-300',
    'その他': 'bg-gray-500/30 text-gray-300',
};

// Group mappings
const groupCategories: GroupType[] = ['本日実装予定', '実装済み', '未実装', 'アイディア'];

// Styles
const styles = {
    container: "h-full flex flex-col",
    tabContainer: "flex items-center gap-2 p-4 border-b border-slate-700/50 bg-slate-800/30",
    tab: "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
    tabActive: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    tabInactive: "text-slate-400 hover:bg-slate-700/50",
    content: "flex-1 overflow-auto p-4",
    // Notion-style table
    table: "w-full border-collapse",
    thead: "sticky top-0 bg-slate-800/90 backdrop-blur-sm",
    th: "text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700",
    tr: "hover:bg-slate-800/50 transition-colors border-b border-slate-700/50 cursor-pointer",
    td: "p-3",
    // Status/Genre select
    select: "bg-transparent border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded px-1",
    // Note drawer
    drawer: "fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform",
    drawerOpen: "translate-x-0",
    drawerClosed: "translate-x-full",
    // Kanban
    kanbanContainer: "flex gap-4 overflow-x-auto pb-4",
    kanbanColumn: "flex-shrink-0 w-72 bg-slate-800/50 rounded-xl border border-slate-700/50",
    kanbanHeader: "p-3 border-b border-slate-700/50 font-medium",
    kanbanCards: "p-2 space-y-2 min-h-50",
    kanbanCard: "bg-slate-700/50 rounded-lg p-3 border border-slate-600/30 hover:border-slate-500/50 cursor-grab",
    // View mode buttons
    viewModeContainer: "flex items-center gap-1 ml-auto",
    viewModeBtn: "p-2 rounded transition-colors",
    viewModeBtnActive: "bg-yellow-500/20 text-yellow-400",
    viewModeBtnInactive: "text-slate-500 hover:text-slate-300",
    // Badge/tag helpers
    statusBadge: "text-xs font-medium px-2 py-0.5 rounded border",
    genreTag: "text-xs px-2 py-0.5 rounded",
    empty: "flex items-center justify-center h-32 text-slate-500 text-sm",
};

const tabs: { id: ReportTab; label: string }[] = [
    { id: 'devDiary', label: '開発日記' },
    { id: 'manuals', label: 'マニュアル' },
    { id: 'tutorials', label: 'チュートリアル' },
    { id: 'tips', label: 'Tips' },
    { id: 'document', label: '発注書インボックス' },
];

export const ReportView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('devDiary');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

    // Local state for entries (editable)
    const [entries, setEntries] = useState<DiaryEntry[]>(reportData.devDiary as DiaryEntry[]);

    const filteredEntries = statusFilter
        ? entries.filter(e => e.status === statusFilter)
        : entries;

    // Update entry field
    const updateEntry = (id: string, field: keyof DiaryEntry, value: string) => {
        setEntries(prev => prev.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    // Get entries by status for kanban
    const getEntriesByStatus = (status: string) =>
        entries.filter(e => e.status === status);

    // Get entries by group
    const getEntriesByGroup = (group: GroupType) => {
        switch (group) {
            case '本日実装予定': return entries.filter(e => e.status === '確認済み');
            case '実装済み': return entries.filter(e => e.status === '実装済み');
            case '未実装': return entries.filter(e => e.status === '未実装');
            case 'アイディア': return entries.filter(e => e.status === '変更依頼');
            default: return [];
        }
    };

    return (
        <div className={styles.container}>
            {/* Sub-tabs with view mode switcher */}
            <div className={styles.tabContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* View Mode Switcher (Right aligned) */}
                {activeTab === 'devDiary' && (
                    <div className={styles.viewModeContainer}>
                        <span className="text-xs text-slate-500 mr-2">表示:</span>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`${styles.viewModeBtn} ${viewMode === 'table' ? styles.viewModeBtnActive : styles.viewModeBtnInactive}`}
                            title="テーブル"
                        >
                            <Filter size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('group')}
                            className={`${styles.viewModeBtn} ${viewMode === 'group' ? styles.viewModeBtnActive : styles.viewModeBtnInactive}`}
                            title="グループ"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`${styles.viewModeBtn} ${viewMode === 'kanban' ? styles.viewModeBtnActive : styles.viewModeBtnInactive}`}
                            title="カンバン"
                        >
                            <Columns size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={styles.content}>
                {activeTab === 'devDiary' && (
                    <>
                        {/* Filter Bar */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Filter size={16} />
                                <span>ステータス:</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setStatusFilter(null)}
                                    className={`px-3 py-1 rounded text-xs ${!statusFilter ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}
                                >
                                    すべて
                                </button>
                                {reportData.statusOptions.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1 rounded text-xs ${statusFilter === status ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}></th>
                                        <th className={styles.th}>タイトル</th>
                                        <th className={styles.th}>進捗</th>
                                        <th className={styles.th}>Genre</th>
                                        <th className={styles.th}>日付</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.map(entry => {
                                        const statusStyle = statusColors[entry.status] || statusColors['未実装'];
                                        const genreStyle = genreColors[entry.genre] || genreColors['その他'];

                                        return (
                                            <tr
                                                key={entry.id}
                                                className={styles.tr}
                                                onClick={() => setSelectedEntry(entry)}
                                            >
                                                <td className="p-2 w-8 text-slate-600">
                                                    <GripVertical size={16} className="cursor-grab" />
                                                </td>
                                                <td className={styles.td}>
                                                    <span className="font-medium text-slate-200 hover:text-yellow-400 cursor-pointer">
                                                        {entry.title}
                                                    </span>
                                                    {entry.content && (
                                                        <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{entry.content}</p>
                                                    )}
                                                </td>
                                                <td className={styles.td} onClick={e => e.stopPropagation()}>
                                                    <select
                                                        value={entry.status}
                                                        onChange={(e) => updateEntry(entry.id, 'status', e.target.value)}
                                                        className={`${styles.select} ${styles.statusBadge} ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                                    >
                                                        {reportData.statusOptions.map(opt => (
                                                            <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className={styles.td} onClick={e => e.stopPropagation()}>
                                                    <select
                                                        value={entry.genre}
                                                        onChange={(e) => updateEntry(entry.id, 'genre', e.target.value)}
                                                        className={`${styles.select} ${styles.genreTag} ${genreStyle}`}
                                                    >
                                                        {reportData.genreOptions.map(opt => (
                                                            <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className="text-sm text-slate-400 flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {entry.date}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* Group View */}
                        {viewMode === 'group' && (
                            <div className="grid grid-cols-2 gap-4">
                                {groupCategories.map(group => {
                                    const groupEntries = getEntriesByGroup(group);
                                    const groupStyle = statusColors[group] || statusColors['未実装'];

                                    return (
                                        <div key={group} className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                                            <div className={`p-3 border-b border-slate-700/50 ${groupStyle.bg}`}>
                                                <span className={`font-medium ${groupStyle.text}`}>{group}</span>
                                                <span className="text-slate-500 text-sm ml-2">({groupEntries.length})</span>
                                            </div>
                                            <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                                                {groupEntries.map(entry => (
                                                    <div
                                                        key={entry.id}
                                                        className="p-2 bg-slate-700/30 rounded cursor-pointer hover:bg-slate-700/50"
                                                        onClick={() => setSelectedEntry(entry)}
                                                    >
                                                        <div className="text-sm text-slate-200">{entry.title}</div>
                                                        <div className="text-xs text-slate-500 mt-1">{entry.date}</div>
                                                    </div>
                                                ))}
                                                {groupEntries.length === 0 && (
                                                    <div className="text-xs text-slate-500 p-2 text-center">エントリーなし</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Kanban View */}
                        {viewMode === 'kanban' && (
                            <div className={styles.kanbanContainer}>
                                {reportData.statusOptions.map(status => {
                                    const statusStyle = statusColors[status] || statusColors['未実装'];
                                    const statusEntries = getEntriesByStatus(status);

                                    return (
                                        <div key={status} className={styles.kanbanColumn}>
                                            <div className={`${styles.kanbanHeader} ${statusStyle.bg} ${statusStyle.text}`}>
                                                {status} <span className="text-slate-500">({statusEntries.length})</span>
                                            </div>
                                            <div className={styles.kanbanCards}>
                                                {statusEntries.map(entry => (
                                                    <div
                                                        key={entry.id}
                                                        className={styles.kanbanCard}
                                                        onClick={() => setSelectedEntry(entry)}
                                                    >
                                                        <div className="text-sm font-medium text-slate-200 mb-2">{entry.title}</div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className={`${genreColors[entry.genre] || genreColors['その他']} px-2 py-0.5 rounded`}>
                                                                {entry.genre}
                                                            </span>
                                                            <span className="text-slate-500">{entry.date}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'manuals' && (
                    <div className={styles.empty}><p>マニュアル（準備中）</p></div>
                )}
                {activeTab === 'tutorials' && (
                    <div className={styles.empty}><p>チュートリアル（準備中）</p></div>
                )}
                {activeTab === 'tips' && (
                    <div className={styles.empty}><p>Tips（準備中）</p></div>
                )}

                {activeTab === 'document' && (
                    <DocumentInboxView />
                )}
            </div>

            {/* Note Drawer */}
            <div className={`${styles.drawer} ${selectedEntry ? styles.drawerOpen : styles.drawerClosed}`}>
                {selectedEntry && (
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-200">{selectedEntry.title}</h3>
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="p-1 hover:bg-slate-700 rounded"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-4">
                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">進捗</label>
                                    <select
                                        value={selectedEntry.status}
                                        onChange={(e) => updateEntry(selectedEntry.id, 'status', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                                    >
                                        {reportData.statusOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Genre</label>
                                    <select
                                        value={selectedEntry.genre}
                                        onChange={(e) => updateEntry(selectedEntry.id, 'genre', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                                    >
                                        {reportData.genreOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">日付</label>
                                <div className="text-sm text-slate-300">{selectedEntry.date}</div>
                            </div>

                            {/* Content/Notes */}
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">ノート</label>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 min-h-[200px]">
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                                        {selectedEntry.content || 'ノートはありません'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop */}
            {selectedEntry && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSelectedEntry(null)}
                />
            )}
        </div>
    );
};
