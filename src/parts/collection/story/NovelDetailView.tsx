// ============================================================
// NovelDetailView — ノベル詳細ページ（2ページ目）
// サイドバーステッパー（開閉・ドラッグ並替） + 会話ログ
// ============================================================

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft, ChevronDown, ChevronRight, GripVertical,
  GitBranch, CornerDownRight, MessageSquare, User, Image
} from 'lucide-react';
import type { NovelEntry, NovelEpisode, NovelScene, NovelLine } from './NovelLibraryView';
import { calcProgress } from './NovelLibraryView';
import characterData from '@/data/collection/characters.json';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function VersionBadge({ version }: { version: string }) {
  const color =
    version.startsWith('3') ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
    version.startsWith('2') ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' :
    version === '1.2'       ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                              'bg-slate-600/40 text-slate-400 border-slate-600/40';
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color}`}>v{version}</span>;
}

function ProgressBar({ percent }: { percent: number }) {
  const color = percent === 100 ? 'bg-green-400' : percent >= 50 ? 'bg-yellow-400' : 'bg-slate-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden min-w-16">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-xs font-bold shrink-0 ${percent === 100 ? 'text-green-400' : percent >= 50 ? 'text-yellow-400' : 'text-slate-500'}`}>
        {percent}%
      </span>
    </div>
  );
}

const charMap: Record<string, string> = Object.fromEntries(
  (characterData as any).characters.map((c: any) => [c.id, c.name])
);

// ─────────────────────────────────────────────────────────
// Sidebar Stepper (Episode > Scene, 開閉 + ドラッグ並替)
// ─────────────────────────────────────────────────────────

interface StepperProps {
  episodes: NovelEpisode[];
  selectedSceneId: string | null;
  onSelectScene: (epId: string, sceneId: string) => void;
  onReorder: (episodes: NovelEpisode[]) => void;
}

const SidebarStepper: React.FC<StepperProps> = ({ episodes, selectedSceneId, onSelectScene, onReorder }) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const dragScene = useRef<{ epId: string; sceneId: string } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const toggleEp = (id: string) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ── ドラッグ ──────────────────────────────────────────
  const onDragStart = (epId: string, sceneId: string) => {
    dragScene.current = { epId, sceneId };
  };

  const onDragOver = (e: React.DragEvent, sceneId: string) => {
    e.preventDefault();
    setDragOverId(sceneId);
  };

  const onDrop = (targetEpId: string, targetSceneId: string) => {
    const src = dragScene.current;
    if (!src || src.sceneId === targetSceneId) { setDragOverId(null); return; }

    const next = episodes.map(ep => {
      if (ep.id !== src.epId && ep.id !== targetEpId) return ep;
      // 同じエピソード内の並替
      if (src.epId === targetEpId && ep.id === src.epId) {
        const scenes = [...ep.scenes];
        const srcIdx = scenes.findIndex(s => s.id === src.sceneId);
        const tgtIdx = scenes.findIndex(s => s.id === targetSceneId);
        const [moved] = scenes.splice(srcIdx, 1);
        scenes.splice(tgtIdx, 0, moved);
        return { ...ep, scenes };
      }
      return ep;
    });
    onReorder(next);
    dragScene.current = null;
    setDragOverId(null);
  };

  const onDragEnd = () => { dragScene.current = null; setDragOverId(null); };

  return (
    <div className="h-full overflow-y-auto py-2 select-none">
      {episodes.map((ep) => (
        <div key={ep.id} className="mb-1">
          {/* エピソードヘッダー */}
          <button
            onClick={() => toggleEp(ep.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-300
              hover:bg-slate-700/40 transition-colors text-left"
          >
            {collapsed.has(ep.id)
              ? <ChevronRight size={12} className="text-slate-500 shrink-0" />
              : <ChevronDown  size={12} className="text-slate-500 shrink-0" />}
            <span className="truncate">{ep.title}</span>
            <span className="ml-auto text-slate-600 text-[10px] shrink-0">{ep.scenes.length}シーン</span>
          </button>

          {/* シーン一覧 */}
          {!collapsed.has(ep.id) && (
            <div className="ml-4 border-l border-slate-700/50 pl-2 space-y-0.5 mt-0.5">
              {ep.scenes.map((scene) => {
                const isSelected = selectedSceneId === scene.id;
                const isDragOver  = dragOverId === scene.id;
                const hasChoice   = scene.lines.some(l => l.choice);
                const hasReturn   = !!scene.returnTo;

                return (
                  <div
                    key={scene.id}
                    draggable
                    onDragStart={() => onDragStart(ep.id, scene.id)}
                    onDragOver={e => onDragOver(e, scene.id)}
                    onDrop={() => onDrop(ep.id, scene.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => onSelectScene(ep.id, scene.id)}
                    className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors
                      ${isSelected ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'}
                      ${isDragOver ? 'border-t-2 border-yellow-400' : ''}`}
                  >
                    <GripVertical
                      size={12}
                      className="text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
                    />
                    <span className="truncate flex-1">{scene.id}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {hasChoice && <GitBranch size={9} className="text-indigo-400" aria-label="CHOICE含む" />}
                      {hasReturn && <CornerDownRight size={9} className="text-teal-400" aria-label={`→ ${scene.returnTo}`} />}
                    </div>
                    <span className="text-slate-600 text-[10px] shrink-0">{scene.lines.length}行</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ConversationLog — 会話ログ表示（PlotNotebook風）
// ─────────────────────────────────────────────────────────

const ConversationLog: React.FC<{ scene: NovelScene; schemaVersion: string }> = ({ scene, schemaVersion }) => {
  const isV2plus = schemaVersion.startsWith('2') || schemaVersion.startsWith('3');

  return (
    <div className="flex flex-col gap-3 py-4 px-6 max-w-3xl">
      {/* シーンメタ */}
      <div className="flex items-center gap-3 mb-2 pb-3 border-b border-slate-700/40">
        <span className="text-xs font-mono text-yellow-400 font-bold">{scene.id}</span>
        {scene.background && (
          <span className="flex items-center gap-1 text-xs text-pink-400">
            <Image size={10} />{scene.background}
          </span>
        )}
        {scene.condition && (
          <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
            IF {scene.condition.flag} = {String(scene.condition.value)}
          </span>
        )}
        {scene.returnTo && (
          <span className="flex items-center gap-1 text-xs text-teal-400 ml-auto">
            <CornerDownRight size={10} />returnTo: {scene.returnTo}
          </span>
        )}
      </div>

      {scene.lines.map((line, idx) => (
        <LineCard key={line.id ?? idx} line={line} isV2plus={isV2plus} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// LineCard — 1行の会話カード
// ─────────────────────────────────────────────────────────

const LineCard: React.FC<{ line: NovelLine; isV2plus: boolean }> = ({ line, isV2plus }) => {
  const isNarration = !line.speaker || line.speaker === '';
  const charName = (line.character && charMap[line.character]) ?? line.character ?? null;

  return (
    <div className="group">
      {/* 地の文 */}
      {isNarration ? (
        <div className="flex gap-3 items-start">
          <div className="w-1 self-stretch bg-slate-600/40 rounded-full shrink-0 mt-1" />
          <div className="flex-1 bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 italic leading-relaxed">{line.text || <span className="text-slate-600">(空白)</span>}</p>
            {line.effects && <EffectsBadge effects={line.effects} />}
          </div>
        </div>
      ) : (
        /* セリフ行 */
        <div className="flex gap-3 items-start">
          {/* キャラアイコン */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border
              ${isV2plus && line.character ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
              {(line.speaker[0] ?? '?').toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* 話者名 + キャラID */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-200">{line.speaker}</span>
              {charName && charName !== line.speaker && (
                <span className="text-[10px] text-indigo-400 flex items-center gap-0.5">
                  <User size={9} />{charName}
                </span>
              )}
              {line.characterEmotion && (
                <span className="text-[10px] bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded">{line.characterEmotion}</span>
              )}
              {line.changeBackground && (
                <span className="text-[10px] text-pink-400 flex items-center gap-0.5 ml-auto">
                  <Image size={9} />→ {line.changeBackground}
                </span>
              )}
            </div>

            {/* テキストバブル */}
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-slate-200 leading-relaxed">{line.text || <span className="text-slate-600">(空白)</span>}</p>
            </div>

            {/* Effects */}
            {line.effects && <EffectsBadge effects={line.effects} />}

            {/* CHOICE */}
            {line.choice && <ChoiceCard choice={line.choice} />}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ChoiceCard — 選択肢カード
// ─────────────────────────────────────────────────────────

const ChoiceCard: React.FC<{ choice: NonNullable<NovelLine['choice']> }> = ({ choice }) => (
  <div className="mt-2 border border-indigo-500/30 bg-indigo-500/5 rounded-xl px-4 py-3">
    <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-indigo-400">
      <GitBranch size={12} />CHOICE
    </div>
    <div className="space-y-2">
      {choice.options.map((opt, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-400">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-200 font-medium">{opt.text}</span>
              <span className="text-[10px] text-indigo-300 shrink-0">→ {opt.nextSceneId}</span>
            </div>
            {opt.result && (
              <p className="text-[10px] text-slate-500 mt-0.5 italic">{opt.result}</p>
            )}
            {opt.effects && <EffectsBadge effects={opt.effects} compact />}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// EffectsBadge — フラグ・軸エフェクト表示
// ─────────────────────────────────────────────────────────

const EffectsBadge: React.FC<{
  effects: { flags?: Record<string, boolean>; axes?: Record<string, number> };
  compact?: boolean;
}> = ({ effects, compact }) => {
  const flags = Object.entries(effects.flags ?? {});
  const axes  = Object.entries(effects.axes  ?? {});
  if (flags.length === 0 && axes.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? 'mt-1' : 'mt-2'}`}>
      {flags.map(([k, v]) => (
        <span key={k} className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono">
          {k} = {String(v)}
        </span>
      ))}
      {axes.map(([k, v]) => (
        <span key={k} className="text-[10px] bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 px-1.5 py-0.5 rounded font-mono">
          {k} {v >= 0 ? '+' : ''}{v}
        </span>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// NovelDetailView — メインコンポーネント
// ─────────────────────────────────────────────────────────

interface DetailProps {
  entry: NovelEntry;
  onBack: () => void;
}

export const NovelDetailView: React.FC<DetailProps> = ({ entry, onBack }) => {
  const isV51 = 'schemaVersion' in entry.schema;
  const initialEpisodes = isV51 ? [] : (entry.schema as any).episodes;
  const schemaVersion = isV51 ? (entry.schema as any).schemaVersion : (entry.schema as any).version;

  const [episodes, setEpisodes] = useState<NovelEpisode[]>(initialEpisodes);
  const [, setSelectedEpId]    = useState<string | null>(episodes[0]?.id ?? null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(episodes[0]?.scenes[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { percent } = calcProgress(isV51 ? entry.schema : { ...entry.schema, episodes } as any);

  const handleSelectScene = useCallback((epId: string, sceneId: string) => {
    setSelectedEpId(epId);
    setSelectedSceneId(sceneId);
  }, []);

  const handleReorder = useCallback((next: NovelEpisode[]) => {
    setEpisodes(next);
  }, []);

  const selectedScene = useMemo(() => {
    if (!selectedSceneId) return null;
    for (const ep of episodes) {
      const sc = ep.scenes.find(s => s.id === selectedSceneId);
      if (sc) return sc;
    }
    return null;
  }, [episodes, selectedSceneId]);

  const totalLines = episodes.flatMap(ep => ep.scenes).flatMap(s => s.lines).length;

  return (
    <div className="flex flex-col h-full">
      {/* ── ヘッダー ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} />ライブラリ
        </button>

        <div className="w-px h-5 bg-slate-700" />

        <VersionBadge version={schemaVersion} />
        <h2 className="text-sm font-bold text-slate-200 truncate">{entry.title}</h2>

        {entry.genre && (
          <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full shrink-0">{entry.genre}</span>
        )}

        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs text-slate-500">
            {episodes.length}章 / {totalLines}行
          </div>
          <div className="w-40">
            <ProgressBar percent={percent} />
          </div>
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors text-xs"
            title="サイドバー開閉"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* ── ボディ ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー */}
        {sidebarOpen && (
          <div className="w-60 shrink-0 border-r border-slate-700/50 bg-slate-900/50 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700/40 shrink-0">
              <p className="text-xs text-slate-500 font-medium">構成ツリー</p>
              <p className="text-[10px] text-slate-600 mt-0.5">シーンをドラッグして並替できます</p>
            </div>
            <SidebarStepper
              episodes={episodes}
              selectedSceneId={selectedSceneId}
              onSelectScene={handleSelectScene}
              onReorder={handleReorder}
            />
          </div>
        )}

        {/* メインエリア: 会話ログ */}
        <div className="flex-1 overflow-y-auto bg-slate-950/30">
          {selectedScene ? (
            <ConversationLog scene={selectedScene} schemaVersion={schemaVersion} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
              <MessageSquare size={32} className="opacity-30" />
              <p className="text-sm">← シーンを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

