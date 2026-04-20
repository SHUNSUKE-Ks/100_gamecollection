// ============================================================
// NovelLibraryView — ノベルライブラリ
// Import済みスキーマをリスト/ギャラリーで管理（v1.x〜v5.1対応）
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  Upload, X, LayoutList, LayoutGrid, BookOpen,
  Calendar, Trash2, ChevronRight, Check
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Types — legacy (v1.x〜v3.x)
// ─────────────────────────────────────────────────────────

export interface NovelLine {
  id?: string;
  speaker: string;
  text: string;
  character?: string | null;
  characterEmotion?: string | null;
  changeBackground?: string | null;
  effects?: { flags?: Record<string, boolean>; axes?: Record<string, number> } | null;
  choice?: {
    options: Array<{
      text: string;
      nextSceneId: string;
      result?: string;
      effects?: { flags?: Record<string, boolean>; axes?: Record<string, number> };
    }>;
  };
}

export interface NovelScene {
  id: string;
  background?: string | null;
  condition?: { flag: string; value: boolean } | null;
  returnTo?: string | null;
  lines: NovelLine[];
}

export interface NovelEpisode {
  id: string;
  title: string;
  scenes: NovelScene[];
}

export interface NovelSchema {
  version: string;
  gameTitle: string;
  parameters?: {
    flags: Record<string, boolean>;
    axes: Record<string, { initial: number; min: number; max: number; label: string }>;
  };
  episodes: NovelEpisode[];
}

// ─────────────────────────────────────────────────────────
// Types — v5.1
// ─────────────────────────────────────────────────────────

export interface V51EventItem {
  event_id: string;
  type: 'CHAT' | 'CHOICE';
  ref_id: string;
  next?: string;
}

export interface V51ChatLine { speaker: string; text: string; tags?: string[]; }
export interface V51Chat    { chat_id: string; lines: V51ChatLine[]; }

export interface V51ChoiceOption {
  label: string;
  next: string;
  effects?: { flags?: Record<string, boolean>; params?: Record<string, number> };
  result?: { speaker: string; text: string };
}
export interface V51Choice {
  choice_id: string;
  question: { speaker: string; text: string };
  options: V51ChoiceOption[];
}

export interface NovelSchemaV51 {
  schemaVersion: '5.1';
  events:  { version: string; start_event_id: string; events: V51EventItem[] };
  chats:   { version: string; chats: V51Chat[] };
  choices: { version: string; choices: V51Choice[] };
  state:   { version: string; flags: Record<string, boolean>; params: Record<string, number> };
  assetOrder?: unknown;
}

export type AnyNovelSchema = NovelSchema | NovelSchemaV51;

// ─────────────────────────────────────────────────────────
// NovelEntry
// ─────────────────────────────────────────────────────────

export interface NovelEntry {
  id: string;
  titleId?: string;
  title: string;
  dict: string;
  genre: string;
  createdAt: string;
  schema: AnyNovelSchema;
}

// ─────────────────────────────────────────────────────────
// Schema helpers
// ─────────────────────────────────────────────────────────

function isV51(schema: AnyNovelSchema): schema is NovelSchemaV51 {
  return 'schemaVersion' in schema;
}

function getSchemaVersion(schema: AnyNovelSchema): string {
  return isV51(schema) ? schema.schemaVersion : (schema.version ?? '?');
}

function getFirstLine(schema: AnyNovelSchema): string {
  if (isV51(schema)) return schema.chats.chats[0]?.lines[0]?.text ?? '';
  return schema.episodes[0]?.scenes[0]?.lines[0]?.text ?? '';
}

function getSchemaStats(schema: AnyNovelSchema): { chapterLabel: string; lineCount: number } {
  if (isV51(schema)) {
    const lineCount = schema.chats.chats.flatMap(c => c.lines).length;
    return { chapterLabel: `${schema.events.events.length}EV`, lineCount };
  }
  const lineCount = schema.episodes.flatMap(ep => ep.scenes).flatMap(s => s.lines).length;
  return { chapterLabel: `${schema.episodes.length}章`, lineCount };
}

// ─────────────────────────────────────────────────────────
// DONE 定義
// ─────────────────────────────────────────────────────────

export interface DoneRule {
  id: string;
  label: string;
  check: (schema: NovelSchema) => boolean;
}

const DONE_RULES: DoneRule[] = [
  {
    id: 'DONE01',
    label: 'テキストのみ',
    check: (schema) =>
      schema.episodes
        .flatMap(ep => ep.scenes)
        .flatMap(sc => sc.lines)
        .every(l => l.text.trim().length > 0),
  },
];

export function calcProgress(schema: AnyNovelSchema): { percent: number; results: { id: string; label: string; done: boolean }[] } {
  if (isV51(schema)) {
    const allLines = schema.chats.chats.flatMap(c => c.lines);
    const done = allLines.length > 0 && allLines.every(l => l.text.trim().length > 0);
    return { percent: done ? 100 : 0, results: [{ id: 'DONE01', label: 'テキストのみ', done }] };
  }
  const results = DONE_RULES.map(rule => ({
    id: rule.id, label: rule.label, done: rule.check(schema),
  }));
  const percent = results.length === 0 ? 0 : Math.round(results.filter(r => r.done).length / results.length * 100);
  return { percent, results };
}

// ─────────────────────────────────────────────────────────
// Seed data — 魔術士達の夜（v5.1サンプル）
// ─────────────────────────────────────────────────────────

const SEED_MAHOU: NovelEntry = {
  id: 'seed_v51_mahou_no_yoru',
  title: '魔術士達の夜',
  dict: '魔術士同士の殺し合いが禁じられた世界で、呪いで父を失った青年・東雲ユウの物語。',
  genre: 'ファンタジー',
  createdAt: '2026-04-20T00:00:00.000Z',
  schema: {
    schemaVersion: '5.1',
    events: {
      "version": "5.1",
      "start_event_id": "EV_001",
      "events": [
        { "event_id": "EV_001", "type": "CHAT", "ref_id": "CHAT_001", "next": "EV_002" },
        { "event_id": "EV_002", "type": "CHAT", "ref_id": "CHAT_002", "next": "EV_003" },
        { "event_id": "EV_003", "type": "CHAT", "ref_id": "CHAT_003", "next": "EV_004" },
        { "event_id": "EV_004", "type": "CHAT", "ref_id": "CHAT_004", "next": "EV_005" },
        { "event_id": "EV_005", "type": "CHAT", "ref_id": "CHAT_005", "next": "EV_006" },
        { "event_id": "EV_006", "type": "CHAT", "ref_id": "CHAT_006", "next": "EV_007" },
        { "event_id": "EV_007", "type": "CHOICE", "ref_id": "CHOICE_001" },
        { "event_id": "EV_010", "type": "CHAT", "ref_id": "CHAT_010", "next": "EV_020" },
        { "event_id": "EV_011", "type": "CHAT", "ref_id": "CHAT_011", "next": "EV_020" },
        { "event_id": "EV_020", "type": "CHAT", "ref_id": "CHAT_020" }
      ]
    },
    chats: {
      "version": "5.1",
      "chats": [
        {
          "chat_id": "CHAT_001",
          "lines": [
            { "speaker": "", "text": "魔術士達は、かつて殺し合った。", "tags": ["bg:BG_DARK", "bgm:BGM_MAIN"] },
            { "speaker": "", "text": "力を奪い、数を減らした。" },
            { "speaker": "", "text": "やがて、人間に狩られる側となった。" }
          ]
        },
        {
          "chat_id": "CHAT_002",
          "lines": [
            { "speaker": "", "text": "魔力は枯渇した。" },
            { "speaker": "", "text": "魔術士は、魔法を使えなくなった。" },
            { "speaker": "", "text": "——一部を除いて。" }
          ]
        },
        {
          "chat_id": "CHAT_003",
          "lines": [
            { "speaker": "大魔術師", "text": "我が魔力を分け与えよう。" },
            { "speaker": "大魔術師", "text": "その代わり、盟約を結べ。" },
            { "speaker": "", "text": "魔術士同士の殺し合いを禁ずる。" }
          ]
        },
        {
          "chat_id": "CHAT_004",
          "lines": [
            { "speaker": "", "text": "それが、現代の魔術のルール。" },
            { "speaker": "", "text": "だが——" },
            { "speaker": "", "text": "呪いは、その外にある。" }
          ]
        },
        {
          "chat_id": "CHAT_005",
          "lines": [
            { "speaker": "", "text": "夜。サイレンが響く。", "tags": ["bg:BG_CITY_NIGHT", "se:SE_SIREN"] },
            { "speaker": "", "text": "ブルーシートの向こうに、人だかり。" }
          ]
        },
        {
          "chat_id": "CHAT_006",
          "lines": [
            { "speaker": "東雲ユウ", "text": "……なんでだよ。" },
            { "speaker": "", "text": "父の死は、“事故”とされた。" },
            { "speaker": "東雲ユウ", "text": "……そんなわけないだろ。" }
          ]
        },
        {
          "chat_id": "CHAT_010",
          "lines": [
            { "speaker": "", "text": "路地裏。空気が歪む。", "tags": ["bg:BG_ALLEY", "se:SE_MAGIC"] },
            { "speaker": "東雲ユウ", "text": "……なんだ、これ。" }
          ]
        },
        {
          "chat_id": "CHAT_011",
          "lines": [
            { "speaker": "", "text": "ユウは目を逸らした。" },
            { "speaker": "", "text": "理解できないものから、逃げるように。" }
          ]
        },
        {
          "chat_id": "CHAT_020",
          "lines": [
            { "speaker": "イリス", "text": "見えているのね。", "tags": ["char:CHAR_IRIS"] },
            { "speaker": "東雲ユウ", "text": "……誰だ、お前。" },
            { "speaker": "イリス", "text": "魔女よ。" },
            { "speaker": "イリス", "text": "あなたの父親——呪いで殺されている。" }
          ]
        }
      ]
    },
    choices: {
      "version": "5.1",
      "choices": [
        {
          "choice_id": "CHOICE_001",
          "question": { "speaker": "東雲ユウ", "text": "……あれを見るか？" },
          "options": [
            {
              "label": "近づく",
              "next": "EV_010",
              "effects": {
                "flags": { "saw_magic": true },
                "params": { "courage": 1 }
              },
              "result": { "speaker": "", "text": "ユウは足を踏み出した。" }
            },
            {
              "label": "目を逸らす",
              "next": "EV_011",
              "effects": {
                "flags": { "avoided_truth": true }
              },
              "result": { "speaker": "", "text": "ユウは目を逸らした。" }
            }
          ]
        }
      ]
    },
    state: {
      "version": "5.1",
      "flags": {
        "saw_magic": false,
        "avoided_truth": false
      },
      "params": {
        "courage": 0
      }
    },
    assetOrder: {
      "ASSET_ORDER": {
        "NOVEL": {
          "BG_DARK": "bg_dark_1280x720",
          "BG_CITY_NIGHT": "bg_city_night_1280x720",
          "BG_ALLEY": "bg_alley_1280x720",
          "CHAR_IRIS": "char_iris_512x1024",
          "CHAR_YU": "char_yu_512x1024",
          "SE_SIREN": "se_siren.mp3",
          "SE_MAGIC": "se_magic.mp3",
          "BGM_MAIN": "bgm_main.mp3"
        }
      }
    }
  },
};

// ─────────────────────────────────────────────────────────
// localStorage hook
// ─────────────────────────────────────────────────────────

const LS_KEY = 'novel_library_v1';

function useNovelLibrary() {
  const [entries, setEntries] = useState<NovelEntry[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw !== null) return JSON.parse(raw);
      // First load — seed sample
      const seed = [SEED_MAHOU];
      localStorage.setItem(LS_KEY, JSON.stringify(seed));
      return seed;
    } catch { return []; }
  });

  const persist = useCallback((next: NovelEntry[]) => {
    setEntries(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }, []);

  const add    = useCallback((e: NovelEntry) => persist([...entries, e]), [entries, persist]);
  const remove = useCallback((id: string)     => persist(entries.filter(e => e.id !== id)), [entries, persist]);
  const update = useCallback((e: NovelEntry)  => persist(entries.map(x => x.id === e.id ? e : x)), [entries, persist]);

  return { entries, add, remove, update };
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const GENRES = ['ファンタジー', 'SF', '恋愛', 'ミステリ', 'ホラー', 'コメディ', 'アクション', 'その他'];

function genId() { return `nv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }
function fmtDate(iso: string) { return iso.slice(0, 10); }

function ProgressBar({ percent }: { percent: number }) {
  const color = percent === 100 ? 'bg-green-400' : percent >= 50 ? 'bg-yellow-400' : 'bg-slate-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-xs font-bold shrink-0 ${percent === 100 ? 'text-green-400' : percent >= 50 ? 'text-yellow-400' : 'text-slate-500'}`}>
        {percent}%
      </span>
    </div>
  );
}

function VersionBadge({ version }: { version?: string }) {
  if (!version) return null;
  const color =
    version.startsWith('5') ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
    version.startsWith('3') ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
    version.startsWith('2') ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' :
    version === '1.2'       ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                              'bg-slate-600/40 text-slate-400 border-slate-600/40';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color}`}>v{version}</span>
  );
}

export interface TitleDBItem { id: string; name: string; }
function getTitleDB(): TitleDBItem[] {
  try { return JSON.parse(localStorage.getItem('tagsdb_titles_v1') ?? '[]'); }
  catch { return []; }
}

// ─────────────────────────────────────────────────────────
// NovelLibraryView
// ─────────────────────────────────────────────────────────

interface Props {
  onOpenDetail: (entry: NovelEntry) => void;
}

export const NovelLibraryView: React.FC<Props> = ({ onOpenDetail }) => {
  const { entries, add, remove } = useNovelLibrary();
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full text-sm">
      {/* ツールバー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 transition-colors"
        >
          <Upload size={13} /> JSONをインポート
        </button>

        <div className="ml-auto flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700/50">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="リスト"
          ><LayoutList size={14} /></button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`p-2 rounded transition-colors ${viewMode === 'gallery' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="ギャラリー"
          ><LayoutGrid size={14} /></button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
            <BookOpen size={40} className="opacity-30" />
            <p className="text-sm">まだノベルがありません</p>
            <button
              onClick={() => setShowImport(true)}
              className="text-xs text-yellow-400 hover:underline"
            >JSONをインポートして追加する</button>
          </div>
        ) : viewMode === 'list' ? (
          <ListView entries={entries} onOpen={onOpenDetail} onDelete={setDeleteTarget} />
        ) : (
          <GalleryView entries={entries} onOpen={onOpenDetail} onDelete={setDeleteTarget} />
        )}
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={(entry) => { add(entry); setShowImport(false); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          title={entries.find(e => e.id === deleteTarget)?.title ?? ''}
          onConfirm={() => { remove(deleteTarget); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ListView
// ─────────────────────────────────────────────────────────

const ListView: React.FC<{
  entries: NovelEntry[];
  onOpen: (e: NovelEntry) => void;
  onDelete: (id: string) => void;
}> = ({ entries, onOpen, onDelete }) => {
  const titles = getTitleDB();
  return (
    <table className="w-full border-collapse text-xs">
      <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
        <tr>
          <th className="text-left px-4 py-2.5 text-slate-500 font-medium border-b border-slate-700/50">Title</th>
          <th className="text-left px-4 py-2.5 text-slate-500 font-medium border-b border-slate-700/50 w-16">schemaVersion</th>
          <th className="text-left px-4 py-2.5 text-slate-500 font-medium border-b border-slate-700/50 w-48">Dict</th>
          <th className="text-left px-4 py-2.5 text-slate-500 font-medium border-b border-slate-700/50 w-24">Genre</th>
          <th className="text-left px-4 py-2.5 text-slate-500 font-medium border-b border-slate-700/50 w-28">作成日</th>
          <th className="text-left px-4 py-2.5 text-slate-500 font-medium border-b border-slate-700/50 w-40">進行状態</th>
          <th className="w-10 border-b border-slate-700/50" />
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => {
          const { percent } = calcProgress(entry.schema);
          const { chapterLabel, lineCount } = getSchemaStats(entry.schema);
          const ver = getSchemaVersion(entry.schema);
          const parentTitle = titles.find(t => t.id === entry.titleId)?.name;
          return (
            <tr
              key={entry.id}
              onClick={() => onOpen(entry)}
              className="border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 group-hover:text-yellow-300 transition-colors">
                    {entry.title}
                  </span>
                  {parentTitle && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                      {parentTitle}
                    </span>
                  )}
                </div>
                <div className="text-slate-600 mt-0.5 text-[10px]">
                  {chapterLabel} / {lineCount}行
                </div>
              </td>
              <td className="px-4 py-3">
                <VersionBadge version={ver} />
              </td>
              <td className="px-4 py-3 text-slate-400 max-w-0">
                <p className="truncate">{entry.dict || '-'}</p>
              </td>
              <td className="px-4 py-3">
                {entry.genre && (
                  <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full">{entry.genre}</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(entry.createdAt)}</span>
              </td>
              <td className="px-4 py-3"><ProgressBar percent={percent} /></td>
              <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1.5 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                ><Trash2 size={13} /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// ─────────────────────────────────────────────────────────
// GalleryView
// ─────────────────────────────────────────────────────────

const GalleryView: React.FC<{
  entries: NovelEntry[];
  onOpen: (e: NovelEntry) => void;
  onDelete: (id: string) => void;
}> = ({ entries, onOpen, onDelete }) => {
  const titles = getTitleDB();
  return (
    <div className="p-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {entries.map(entry => {
        const { percent } = calcProgress(entry.schema);
        const firstLine = getFirstLine(entry.schema);
        const ver = getSchemaVersion(entry.schema);
        const parentTitle = titles.find(t => t.id === entry.titleId)?.name;
        return (
          <div
            key={entry.id}
            onClick={() => onOpen(entry)}
            className="group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden cursor-pointer hover:border-yellow-500/40 hover:bg-slate-800 transition-all"
          >
            <div className="h-28 bg-gradient-to-br from-slate-700/50 to-slate-800/80 flex items-center justify-center relative p-3">
              <p className="text-xs text-slate-400 text-center line-clamp-3 leading-relaxed italic">
                {firstLine || '(テキストなし)'}
              </p>
              <div className="absolute top-2 left-2"><VersionBadge version={ver} /></div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                className="absolute top-1.5 right-1.5 p-1 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              ><Trash2 size={12} /></button>
            </div>

            <div className="p-3 space-y-2">
              <p className="font-medium text-slate-200 text-sm group-hover:text-yellow-300 transition-colors leading-snug line-clamp-2">
                {entry.title}
              </p>
              {parentTitle && (
                <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  {parentTitle}
                </span>
              )}
              {entry.dict && (
                <p className="text-xs text-slate-500 line-clamp-2">{entry.dict}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {entry.genre && (
                  <span className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">{entry.genre}</span>
                )}
                <span className="text-[10px] text-slate-600 ml-auto flex items-center gap-0.5">
                  <Calendar size={9} />{fmtDate(entry.createdAt)}
                </span>
              </div>
              <ProgressBar percent={percent} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ImportModal — v1.x〜v3.x + v5.1 combined JSON 対応
// ─────────────────────────────────────────────────────────

const ImportModal: React.FC<{
  onClose: () => void;
  onImport: (entry: NovelEntry) => void;
}> = ({ onClose, onImport }) => {
  const [step, setStep] = useState<'paste' | 'meta'>('paste');
  const [jsonText, setJsonText] = useState('');
  const [parsed, setParsed]       = useState<NovelSchema | null>(null);
  const [parsedV51, setParsedV51] = useState<NovelSchemaV51 | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [title, setTitle]   = useState('');
  const [titleId, setTitleId] = useState('');
  const [dict, setDict]     = useState('');
  const [genre, setGenre]   = useState('');

  const titlesItem = getTitleDB();

  const handleParse = () => {
    try {
      const obj = JSON.parse(jsonText);

      // v5.1 combined format detection
      if (obj.events?.events && obj.chats?.chats) {
        if (!obj.choices?.choices) throw new Error('v5.1: choices が見つかりません');
        const v51: NovelSchemaV51 = {
          schemaVersion: '5.1',
          events:  obj.events,
          chats:   obj.chats,
          choices: obj.choices,
          state:   obj.state ?? { version: '5.1', flags: {}, params: {} },
          assetOrder: obj.assetOrder ?? obj.ASSET_ORDER ?? obj.assets,
        };
        setParsedV51(v51);
        setParsed(null);
        setTitle(obj.gameTitle ?? '');
        setParseError(null);
        setStep('meta');
        return;
      }

      // legacy format
      if (!obj.episodes || !Array.isArray(obj.episodes)) throw new Error('episodes配列 または v5.1の events/chats が見つかりません');
      setParsed(obj as NovelSchema);
      setParsedV51(null);
      setTitle(obj.gameTitle ?? '');
      setParseError(null);
      setStep('meta');
    } catch (e: any) {
      setParseError(`JSON構文エラー: ${e.message}`);
    }
  };

  const anyParsed = parsed ?? parsedV51;

  const handleImport = () => {
    if (!anyParsed) return;
    const ver = getSchemaVersion(anyParsed);
    onImport({
      id: genId(),
      titleId: titleId || undefined,
      title: title.trim() || ('gameTitle' in anyParsed ? anyParsed.gameTitle : '') || '無題',
      dict: dict.trim(),
      genre: genre.trim(),
      createdAt: new Date().toISOString(),
      schema: anyParsed,
    });
    void ver;
  };

  const successLabel = parsedV51
    ? `JSON解析成功 — v5.1 / ${parsedV51.events.events.length}EV / ${parsedV51.chats.chats.flatMap(c => c.lines).length}行`
    : parsed
    ? `JSON解析成功 — Ver ${parsed.version} / ${parsed.episodes.length}章 / ${parsed.episodes.flatMap(e => e.scenes).flatMap(s => s.lines).length}行`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Upload size={16} className="text-yellow-400" />
              ノベルをインポート
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              {(['paste', 'meta'] as const).map((s, i) => (
                <React.Fragment key={s}>
                  <span className={`text-xs ${step === s ? 'text-yellow-400 font-bold' : 'text-slate-600'}`}>
                    {i + 1}. {s === 'paste' ? 'JSON貼付け' : 'メタ情報入力'}
                  </span>
                  {i === 0 && <ChevronRight size={10} className="text-slate-700" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400"><X size={18} /></button>
        </div>

        {/* Step 1: JSON貼付け */}
        {step === 'paste' && (
          <>
            <div className="flex-1 overflow-hidden p-4">
              <p className="text-xs text-slate-500 mb-1">
                v1.x〜v3.x（<code className="text-slate-400">episodes</code> 形式）または v5.1 combined JSON を貼り付けてください。
              </p>
              <p className="text-xs text-slate-600 mb-2">
                v5.1 は複数ファイルを <code className="text-slate-500">{'{ "events": {...}, "chats": {...}, "choices": {...}, "state": {...} }'}</code> にまとめて貼付け。
              </p>
              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setParseError(null); }}
                placeholder={'// v5.1 combined:\n{\n  "events": { "version": "5.1", "start_event_id": "EV_001", "events": [...] },\n  "chats": { "version": "5.1", "chats": [...] },\n  "choices": { ... },\n  "state": { ... }\n}'}
                className="w-full h-64 bg-slate-800/80 border border-slate-700 rounded-xl p-4
                  text-xs text-green-300 font-mono placeholder-slate-600 outline-none resize-none
                  focus:border-yellow-500/50"
                spellCheck={false}
                autoFocus
              />
              {parseError && (
                <p className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{parseError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-700 shrink-0">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:bg-slate-800">キャンセル</button>
              <button
                onClick={handleParse}
                disabled={!jsonText.trim()}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors
                  ${jsonText.trim() ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >次へ →</button>
            </div>
          </>
        )}

        {/* Step 2: メタ情報 */}
        {step === 'meta' && anyParsed && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <Check size={14} className="text-green-400" />
                <span className="text-xs text-green-300">{successLabel}</span>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">タイトル <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <select
                    value={titleId}
                    onChange={e => setTitleId(e.target.value)}
                    className="w-1/3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-500/50"
                  >
                    <option value="">(TitleDB未選択)</option>
                    {titlesItem.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-500/50"
                    placeholder="タイトルを入力"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Dict（あらすじ・説明）</label>
                <textarea
                  value={dict}
                  onChange={e => setDict(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-500/50 resize-none"
                  placeholder="ストーリーの概要を入力してください"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Genre</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => setGenre(g === genre ? '' : g)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors
                        ${genre === g ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'}`}
                    >{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-2 px-6 py-4 border-t border-slate-700 shrink-0">
              <button onClick={() => setStep('paste')} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:bg-slate-800">← 戻る</button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:bg-slate-800">キャンセル</button>
                <button
                  onClick={handleImport}
                  disabled={!title.trim()}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors
                    ${title.trim() ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >ライブラリに追加</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// DeleteConfirm
// ─────────────────────────────────────────────────────────

const DeleteConfirm: React.FC<{ title: string; onConfirm: () => void; onCancel: () => void }> = ({ title, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <h3 className="text-base font-bold text-slate-100 mb-2">削除の確認</h3>
      <p className="text-sm text-slate-400 mb-6">
        「<span className="text-slate-200 font-medium">{title}</span>」をライブラリから削除しますか？この操作は元に戻せません。
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:bg-slate-800">キャンセル</button>
        <button onClick={onConfirm} className="px-5 py-2 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-400 text-white">削除する</button>
      </div>
    </div>
  </div>
);
