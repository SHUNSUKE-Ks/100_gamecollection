// ============================================================
// DocumentInboxView — シナリオライター向け 発注書インボックス
// Notion風リスト表示 + ドロワー詳細 + スキーマビュア
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, AlertCircle, CheckCircle, Clock, Send,
  RefreshCw, ChevronRight, X, Calendar,
  Shield, Layers, Filter, Search, SortAsc
} from 'lucide-react';
import type {
  OrderDocument, DocumentStatus, DocumentCategory,
  DocumentType, Priority, SchemaField, WritingRule,
  DocumentFilter, DocumentRole
} from '@/core/types/document';
import documentData from '@/data/collection/documents.json';

// ── ラベル・カラー定義 ────────────────────────────────────

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:        { label: '草稿中',   color: 'text-slate-400',  bg: 'bg-slate-500/20',  icon: <FileText size={12} /> },
  issued:       { label: '発注済み', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: <Send size={12} /> },
  in_progress:  { label: '作業中',   color: 'text-blue-400',   bg: 'bg-blue-500/20',   icon: <RefreshCw size={12} /> },
  delivered:    { label: '納品済み', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: <Clock size={12} /> },
  approved:     { label: '承認済み', color: 'text-green-400',  bg: 'bg-green-500/20',  icon: <CheckCircle size={12} /> },
  revision:     { label: '修正依頼', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: <AlertCircle size={12} /> },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'text-slate-500' },
  medium: { label: 'Medium', color: 'text-blue-400' },
  high:   { label: 'High',   color: 'text-orange-400' },
  urgent: { label: 'URGENT', color: 'text-red-400' },
};

const TYPE_CONFIG: Record<DocumentType, { label: string; color: string; bg: string }> = {
  order:     { label: '発注書',   color: 'text-yellow-300', bg: 'bg-yellow-500/20' },
  rule:      { label: 'ルール',   color: 'text-red-300',    bg: 'bg-red-500/20' },
  schema:    { label: 'スキーマ', color: 'text-cyan-300',   bg: 'bg-cyan-500/20' },
  template:  { label: 'テンプレ', color: 'text-purple-300', bg: 'bg-purple-500/20' },
  reference: { label: '参考資料', color: 'text-teal-300',   bg: 'bg-teal-500/20' },
};

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string }> = {
  scenario:  { label: 'シナリオ' },
  character: { label: 'キャラクター' },
  dialogue:  { label: 'セリフ' },
  event:     { label: 'イベント' },
  world:     { label: '世界観' },
  battle:    { label: 'バトル' },
  general:   { label: '共通' },
};

// ロールは3グループ × 細分化。グループ色 + サブラベルで表示
type RoleGroup = 'scenario' | 'designer' | 'sound' | 'general';
const ROLE_GROUP: Record<DocumentRole, RoleGroup> = {
  scenario:        'scenario', scenario_main:   'scenario',
  scenario_sub:    'scenario', scenario_battle: 'scenario',
  designer:        'designer', designer_char:   'designer',
  designer_bg:     'designer', designer_ui:     'designer',
  sound:           'sound',    sound_bgm:       'sound',
  sound_se:        'sound',    sound_voice:     'sound',
  general:         'general',
};
const ROLE_GROUP_CONFIG: Record<RoleGroup, { label: string; color: string; bg: string; border: string }> = {
  scenario: { label: 'Scenario', color: 'text-indigo-300', bg: 'bg-indigo-500/20', border: 'border-indigo-500/40' },
  designer: { label: 'Designer', color: 'text-pink-300',   bg: 'bg-pink-500/20',   border: 'border-pink-500/40' },
  sound:    { label: 'Sound',    color: 'text-green-300',  bg: 'bg-green-500/20',  border: 'border-green-500/40' },
  general:  { label: 'General',  color: 'text-slate-400',  bg: 'bg-slate-600/20',  border: 'border-slate-600/40' },
};
const ROLE_SUB_LABEL: Record<DocumentRole, string> = {
  scenario:        'Scenario',    scenario_main:   'Main',
  scenario_sub:    'Sub',         scenario_battle: 'Battle',
  designer:        'Designer',    designer_char:   'Character',
  designer_bg:     'Background',  designer_ui:     'UI',
  sound:           'Sound',       sound_bgm:       'BGM',
  sound_se:        'SE',          sound_voice:     'Voice',
  general:         'General',
};

// ── サブタブ型 ────────────────────────────────────────────
type InboxTab = 'inbox' | 'rules' | 'schema';

// ── ユーティリティ ────────────────────────────────────────
function formatDate(iso: string): string {
  if (!iso) return '-';
  return iso.slice(0, 10);
}

function getDaysLeft(dueDate?: string): { label: string; color: string } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { label: `${Math.abs(diff)}日超過`, color: 'text-red-400' };
  if (diff === 0) return { label: '本日締切',              color: 'text-red-400' };
  if (diff <= 3)  return { label: `残${diff}日`,           color: 'text-orange-400' };
  return { label: `残${diff}日`,                           color: 'text-slate-400' };
}

// ─────────────────────────────────────────────────────────
// DocumentInboxView
// ─────────────────────────────────────────────────────────
export const DocumentInboxView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InboxTab>('inbox');
  const [selected, setSelected] = useState<OrderDocument | null>(null);
  const [drawerTab, setDrawerTab] = useState<'brief' | 'schema' | 'rules'>('brief');
  const [filter, setFilter] = useState<DocumentFilter>({
    status: 'all',
    category: 'all',
    role: 'all',
    sortKey: 'createdAt',
    searchQuery: '',
  });

  const documents = documentData.documents as OrderDocument[];
  const writingRules = documentData.writingRules as WritingRule[];

  // フィルタ・ソート
  const filtered = useMemo(() => {
    let list = [...documents];
    if (filter.status !== 'all')   list = list.filter(d => d.status === filter.status);
    if (filter.category !== 'all') list = list.filter(d => d.category === filter.category);
    if (filter.role !== 'all') {
      // グループ指定（'scenario'/'designer'/'sound'/'general'）なら配下のサブロールも含める
      const groupRoles = (documentData.roleGroups as Record<string, string[]>)[filter.role];
      if (groupRoles) list = list.filter(d => groupRoles.includes(d.role));
      else            list = list.filter(d => d.role === filter.role);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (filter.sortKey === 'dueDate') {
        return (a.dueDate ?? '9999') < (b.dueDate ?? '9999') ? -1 : 1;
      }
      if (filter.sortKey === 'priority') {
        const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (filter.sortKey === 'role') {
        const groupOrder: Record<RoleGroup, number> = { scenario: 0, designer: 1, sound: 2, general: 3 };
        return groupOrder[ROLE_GROUP[a.role]] - groupOrder[ROLE_GROUP[b.role]];
      }
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return list;
  }, [documents, filter]);

  return (
    <div className="h-full flex flex-col text-sm">
      {/* ── サブタブ ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
        {([
          { id: 'inbox', label: 'インボックス', icon: <FileText size={14} /> },
          { id: 'rules', label: '執筆ルール',   icon: <Shield size={14} /> },
          { id: 'schema', label: 'スキーマ一覧', icon: <Layers size={14} /> },
        ] as { id: InboxTab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === t.id
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>{filtered.length} / {documents.length} 件</span>
        </div>
      </div>

      {/* ── インボックス タブ ── */}
      {activeTab === 'inbox' && (
        <div className="flex flex-1 overflow-hidden">
          {/* 左: リスト */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* フィルタバー */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/30 shrink-0 flex-wrap">
              <div className="flex items-center gap-1 text-slate-500"><Filter size={14} /></div>

              {/* 検索 */}
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-1">
                <Search size={12} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="検索..."
                  value={filter.searchQuery}
                  onChange={e => setFilter(f => ({ ...f, searchQuery: e.target.value }))}
                  className="bg-transparent outline-none text-slate-300 text-xs w-28 placeholder-slate-600"
                />
              </div>

              {/* ステータスフィルタ */}
              <select
                value={filter.status}
                onChange={e => setFilter(f => ({ ...f, status: e.target.value as any }))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
              >
                <option value="all">全ステータス</option>
                {documentData.statusOptions.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s as DocumentStatus]?.label ?? s}</option>
                ))}
              </select>

              {/* カテゴリフィルタ */}
              <select
                value={filter.category}
                onChange={e => setFilter(f => ({ ...f, category: e.target.value as any }))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
              >
                <option value="all">全カテゴリ</option>
                {documentData.categoryOptions.map(c => (
                  <option key={c} value={c}>{CATEGORY_CONFIG[c as DocumentCategory]?.label ?? c}</option>
                ))}
              </select>

              {/* ロールフィルタ（グループ + サブロール） */}
              <select
                value={filter.role}
                onChange={e => setFilter(f => ({ ...f, role: e.target.value as any }))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
              >
                <option value="all">全ロール</option>
                <optgroup label="── Scenario">
                  <option value="scenario">Scenario（全）</option>
                  <option value="scenario_main">└ Main</option>
                  <option value="scenario_sub">└ Sub</option>
                  <option value="scenario_battle">└ Battle</option>
                </optgroup>
                <optgroup label="── Designer">
                  <option value="designer">Designer（全）</option>
                  <option value="designer_char">└ Character</option>
                  <option value="designer_bg">└ Background</option>
                  <option value="designer_ui">└ UI</option>
                </optgroup>
                <optgroup label="── Sound">
                  <option value="sound">Sound（全）</option>
                  <option value="sound_bgm">└ BGM</option>
                  <option value="sound_se">└ SE</option>
                  <option value="sound_voice">└ Voice</option>
                </optgroup>
                <option value="general">General</option>
              </select>

              {/* ソート */}
              <div className="flex items-center gap-1 text-slate-500 ml-auto">
                <SortAsc size={14} />
                <select
                  value={filter.sortKey}
                  onChange={e => setFilter(f => ({ ...f, sortKey: e.target.value as any }))}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
                >
                  <option value="createdAt">作成日</option>
                  <option value="dueDate">締切日</option>
                  <option value="priority">優先度</option>
                  <option value="role">ロール</option>
                </select>
              </div>
            </div>

            {/* ドキュメントテーブル */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 w-8"></th>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50">タイトル</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 w-36">ロール</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 w-24">種別</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 w-28">ステータス</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 w-20">優先度</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 w-28">締切</th>
                    <th className="w-8 border-b border-slate-700/50"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => {
                    const statusCfg = STATUS_CONFIG[doc.status];
                    const typeCfg = TYPE_CONFIG[doc.type];
                    const priCfg = PRIORITY_CONFIG[doc.priority];
                    const roleGroup = ROLE_GROUP[doc.role] ?? 'general';
                    const roleGroupCfg = ROLE_GROUP_CONFIG[roleGroup];
                    const roleSubLabel = ROLE_SUB_LABEL[doc.role] ?? doc.role;
                    const daysLeft = getDaysLeft(doc.dueDate);
                    const isSelected = selected?.id === doc.id;

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => { setSelected(doc); setDrawerTab('brief'); }}
                        className={`border-b border-slate-700/30 cursor-pointer transition-colors
                          ${isSelected ? 'bg-yellow-500/10' : 'hover:bg-slate-800/50'}`}
                      >
                        <td className="px-4 py-3 text-slate-600 text-xs font-mono">{doc.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-200 leading-snug">{doc.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{CATEGORY_CONFIG[doc.category]?.label}</span>
                            {doc.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* ロールカラム: グループバッジ + サブラベル */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded border font-medium
                              ${roleGroupCfg.bg} ${roleGroupCfg.color} ${roleGroupCfg.border}`}>
                              {roleGroupCfg.label}
                            </span>
                            <span className="text-xs text-slate-500 pl-1">{roleSubLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.icon}{statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${priCfg.color}`}>{priCfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {daysLeft ? (
                            <span className={`text-xs ${daysLeft.color}`}>{daysLeft.label}</span>
                          ) : (
                            <span className="text-xs text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-slate-600">
                          <ChevronRight size={14} />
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                        条件に一致するドキュメントがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 右: ドロワー */}
          {selected && (
            <DocumentDrawer
              doc={selected}
              drawerTab={drawerTab}
              setDrawerTab={setDrawerTab}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}

      {/* ── 執筆ルール タブ ── */}
      {activeTab === 'rules' && (
        <WritingRulesView rules={writingRules} />
      )}

      {/* ── スキーマ一覧 タブ ── */}
      {activeTab === 'schema' && (
        <SchemaListView documents={documents} />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// DocumentDrawer — 発注書詳細ドロワー
// ─────────────────────────────────────────────────────────
const DocumentDrawer: React.FC<{
  doc: OrderDocument;
  drawerTab: 'brief' | 'schema' | 'rules';
  setDrawerTab: (t: 'brief' | 'schema' | 'rules') => void;
  onClose: () => void;
}> = ({ doc, drawerTab, setDrawerTab, onClose }) => {
  const statusCfg = STATUS_CONFIG[doc.status];
  const typeCfg = TYPE_CONFIG[doc.type];
  const priCfg = PRIORITY_CONFIG[doc.priority];
  const roleGroup = ROLE_GROUP[doc.role] ?? 'general';
  const roleGroupCfg = ROLE_GROUP_CONFIG[roleGroup];
  const roleSubLabel = ROLE_SUB_LABEL[doc.role] ?? doc.role;

  return (
    <div className="w-120 shrink-0 border-l border-slate-700 bg-slate-900 flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-slate-700/50 shrink-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* ロールバッジ（グループ + サブ） */}
            <span className={`inline-flex items-center text-xs px-2 py-1 rounded border font-bold
              ${roleGroupCfg.bg} ${roleGroupCfg.color} ${roleGroupCfg.border}`}>
              {roleGroupCfg.label}
              <span className="ml-1 opacity-70 font-normal">/ {roleSubLabel}</span>
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${typeCfg.bg} ${typeCfg.color}`}>
              {typeCfg.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.icon}{statusCfg.label}
            </span>
            <span className={`text-xs font-bold ${priCfg.color}`}>{priCfg.label}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400 shrink-0">
            <X size={16} />
          </button>
        </div>
        <h3 className="text-base font-bold text-slate-100 leading-snug">{doc.title}</h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span className="font-mono">{doc.id}</span>
          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(doc.createdAt)}</span>
          {doc.dueDate && (
            <span className="flex items-center gap-1 text-orange-400">
              <Clock size={11} />締切: {formatDate(doc.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* ドロワー内タブ */}
      <div className="flex border-b border-slate-700/50 shrink-0">
        {([
          { id: 'brief', label: '発注内容' },
          { id: 'schema', label: '納品スキーマ' },
          { id: 'rules', label: 'バリデーション' },
        ] as { id: typeof drawerTab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setDrawerTab(t.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors
              ${drawerTab === t.id
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ドロワー内コンテンツ */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* 発注内容タブ */}
        {drawerTab === 'brief' && (
          <>
            <Section title="概要">
              <p className="text-slate-300 leading-relaxed">{doc.brief.overview}</p>
            </Section>
            <Section title="背景・文脈">
              <p className="text-slate-400 text-xs leading-relaxed">{doc.brief.background}</p>
            </Section>
            <Section title="要件">
              <ul className="space-y-1">
                {doc.brief.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300">
                    <span className="text-yellow-500 shrink-0">✓</span>{r}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="制約条件">
              <ul className="space-y-1">
                {doc.brief.constraints.map((c, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300">
                    <span className="text-red-500 shrink-0">✗</span>{c}
                  </li>
                ))}
              </ul>
            </Section>
            {doc.brief.references.length > 0 && (
              <Section title="参照ファイル">
                <ul className="space-y-1">
                  {doc.brief.references.map((r, i) => (
                    <li key={i} className="text-xs text-cyan-400 font-mono">{r}</li>
                  ))}
                </ul>
              </Section>
            )}
            {doc.brief.toneKeywords.length > 0 && (
              <Section title="トーン・雰囲気">
                <div className="flex flex-wrap gap-2">
                  {doc.brief.toneKeywords.map(k => (
                    <span key={k} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">
                      {k}
                    </span>
                  ))}
                </div>
              </Section>
            )}
            {doc.brief.notes && (
              <Section title="補足事項">
                <p className="text-slate-400 text-xs leading-relaxed">{doc.brief.notes}</p>
              </Section>
            )}
            {doc.linkedIds && (
              <Section title="関連ID">
                <div className="space-y-1 text-xs font-mono text-slate-400">
                  {doc.linkedIds.episodeId && <div>Episode: <span className="text-teal-400">{doc.linkedIds.episodeId}</span></div>}
                  {doc.linkedIds.chapterId && <div>Chapter: <span className="text-teal-400">{doc.linkedIds.chapterId}</span></div>}
                  {doc.linkedIds.characterIds?.map(id => (
                    <div key={id}>Character: <span className="text-purple-400">{id}</span></div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* 納品スキーマタブ */}
        {drawerTab === 'schema' && (
          <>
            <Section title="フォーマット">
              <div className="flex gap-3 text-xs">
                <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">{doc.deliverySchema.format.toUpperCase()}</span>
                <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded">{doc.deliverySchema.outputType}</span>
              </div>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">{doc.deliverySchema.description}</p>
            </Section>

            {doc.deliverySchema.requiredFields.length > 0 && (
              <Section title="必須フィールド">
                <div className="space-y-3">
                  {doc.deliverySchema.requiredFields.map(field => (
                    <FieldCard key={field.key} field={field} required />
                  ))}
                </div>
              </Section>
            )}

            {doc.deliverySchema.optionalFields.length > 0 && (
              <Section title="任意フィールド">
                <div className="space-y-3">
                  {doc.deliverySchema.optionalFields.map(field => (
                    <FieldCard key={field.key} field={field} required={false} />
                  ))}
                </div>
              </Section>
            )}

            {doc.deliverySchema.exampleOutput && (
              <Section title="サンプル出力">
                <pre className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                  {doc.deliverySchema.exampleOutput}
                </pre>
              </Section>
            )}
          </>
        )}

        {/* バリデーションタブ */}
        {drawerTab === 'rules' && (
          <Section title="バリデーションルール">
            {doc.deliverySchema.validationRules.length === 0 ? (
              <p className="text-slate-500 text-xs">このドキュメントにバリデーションルールはありません</p>
            ) : (
              <div className="space-y-3">
                {doc.deliverySchema.validationRules.map(rule => (
                  <div key={rule.id} className={`p-3 rounded-lg border ${
                    rule.severity === 'error'   ? 'border-red-500/30 bg-red-500/10' :
                    rule.severity === 'warning' ? 'border-orange-500/30 bg-orange-500/10' :
                                                  'border-blue-500/30 bg-blue-500/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase ${
                        rule.severity === 'error' ? 'text-red-400' :
                        rule.severity === 'warning' ? 'text-orange-400' : 'text-blue-400'
                      }`}>{rule.severity}</span>
                      <span className="text-xs text-slate-300 font-medium">{rule.name}</span>
                      <span className="text-xs text-slate-500 font-mono ml-auto">{rule.id}</span>
                    </div>
                    <p className="text-xs text-slate-400">{rule.description}</p>
                    <p className={`text-xs mt-1 ${
                      rule.severity === 'error' ? 'text-red-300' :
                      rule.severity === 'warning' ? 'text-orange-300' : 'text-blue-300'
                    }`}>
                      ⚠ {rule.errorMessage}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// WritingRulesView — 共通執筆ルール
// ─────────────────────────────────────────────────────────
const WritingRulesView: React.FC<{ rules: WritingRule[] }> = ({ rules }) => {
  const categories: WritingRule['category'][] = ['tone', 'format', 'content', 'technical'];
  const catLabels: Record<WritingRule['category'], string> = {
    tone: '文体・トーン', format: 'フォーマット', content: '内容・設定', technical: '技術仕様',
  };
  const catColors: Record<WritingRule['category'], string> = {
    tone: 'text-purple-400', format: 'text-cyan-400', content: 'text-yellow-400', technical: 'text-green-400',
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-yellow-400" />
          <h2 className="text-base font-bold text-slate-100">共通執筆ルール</h2>
          <span className="text-xs text-slate-500 ml-2">— 全シナリオライター 必読・適用必須</span>
        </div>
        {categories.map(cat => {
          const catRules = rules.filter(r => r.category === cat);
          if (catRules.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className={`text-sm font-bold mb-3 ${catColors[cat]}`}>{catLabels[cat]}</h3>
              <div className="space-y-3">
                {catRules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border ${
                      rule.isRequired
                        ? 'border-slate-600/50 bg-slate-800/50'
                        : 'border-slate-700/30 bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {rule.isRequired
                        ? <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold">必須</span>
                        : <span className="text-xs bg-slate-600/30 text-slate-500 border border-slate-600/30 px-2 py-0.5 rounded">推奨</span>
                      }
                      <span className="text-sm font-medium text-slate-200">{rule.title}</span>
                      <span className="text-xs text-slate-600 font-mono ml-auto">{rule.id}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{rule.body}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// SchemaListView — スキーマ一覧（クイックリファレンス）
// ─────────────────────────────────────────────────────────
const SchemaListView: React.FC<{ documents: OrderDocument[] }> = ({ documents }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const schemaDocs = documents.filter(d => d.deliverySchema.requiredFields.length > 0);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">納品スキーマ一覧</h2>
          <span className="text-xs text-slate-500 ml-2">— 各発注書の納品フォーマット定義</span>
        </div>
        <div className="space-y-4">
          {schemaDocs.map(doc => (
            <div key={doc.id} className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/30">
              <button
                onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-700/30 transition-colors"
              >
                <span className="font-mono text-xs text-slate-500">{doc.id}</span>
                <span className="text-sm font-medium text-slate-200 flex-1 truncate">{doc.title}</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">{doc.deliverySchema.outputType}</span>
                <ChevronRight
                  size={16}
                  className={`text-slate-500 transition-transform ${expanded === doc.id ? 'rotate-90' : ''}`}
                />
              </button>
              {expanded === doc.id && (
                <div className="border-t border-slate-700/50 px-5 py-4 space-y-4 bg-slate-900/50">
                  <p className="text-xs text-slate-400">{doc.deliverySchema.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {doc.deliverySchema.requiredFields.map(f => (
                      <FieldCard key={f.key} field={f} required compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// FieldCard — スキーマフィールド1件表示
// ─────────────────────────────────────────────────────────
const FieldCard: React.FC<{ field: SchemaField; required: boolean; compact?: boolean }> = ({ field, required, compact }) => (
  <div className={`p-3 rounded-lg border ${required ? 'border-slate-600/50 bg-slate-800/80' : 'border-slate-700/30 bg-slate-800/30'}`}>
    <div className="flex items-center gap-2 mb-1">
      <code className="text-xs font-bold text-yellow-300">{field.key}</code>
      <span className="text-xs text-slate-500">{field.type}</span>
      {required && <span className="text-xs text-red-400 ml-auto">必須</span>}
    </div>
    <p className="text-xs text-slate-300 font-medium">{field.label}</p>
    {!compact && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{field.description}</p>}
    {!compact && field.constraints && (
      <div className="mt-1.5 flex flex-wrap gap-1">
        {field.constraints.maxLength && (
          <span className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">最大 {field.constraints.maxLength}文字</span>
        )}
        {field.constraints.minItems !== undefined && (
          <span className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">最小 {field.constraints.minItems}件</span>
        )}
        {field.constraints.pattern && (
          <span className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded font-mono">{field.constraints.pattern}</span>
        )}
      </div>
    )}
    {!compact && field.example !== undefined && (
      <div className="mt-2">
        <span className="text-xs text-slate-600">例: </span>
        <code className="text-xs text-green-400">
          {typeof field.example === 'string' ? `"${field.example}"` : JSON.stringify(field.example)}
        </code>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────
// Section — セクションラッパー
// ─────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
      <span className="w-1 h-3 bg-yellow-500 rounded-full"></span>
      {title}
    </h4>
    {children}
  </div>
);
