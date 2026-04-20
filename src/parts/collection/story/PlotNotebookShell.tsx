// ============================================================
// PlotNotebookShell — プロット手帳 UI シェル
//
// 【このファイルについて】
// データ接続なし・ローカルステートのみで動作する UI スケルトン。
// Firestore / Gemini との接続は TODO コメントを残し、
// 外注先がこのファイルをベースに実装する。
//
// 仕様書: 00_Report/documents/発注書_プロットノート.md
// スキーマ: 00_Report/schemas/schema_plot.json
// ============================================================

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';

// ── 型定義 ────────────────────────────────────────────────────

export type PlotStatus = 'idea' | 'draft' | 'fixed';

export interface PlotLine {
  id: string;
  speaker: string;
  text: string;
  isComment?: boolean;
}

export interface PlotCard {
  id: string;
  title: string;
  status: PlotStatus;
  episodeId: string;
  chapterId: string;
  sceneTag: string;
  castSlots: [string | null, string | null, string | null, string | null];
  lines: PlotLine[];
  updatedAt?: number;
}

export interface Character {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  title: string;
}

export interface Episode {
  id: string;
  title: string;
  chapters: Chapter[];
}

// ── Props 定義 ────────────────────────────────────────────────

export interface PlotNotebookProps {
  // データ
  cards: PlotCard[];
  characters: Character[];
  episodes: Episode[];

  // 状態
  isLoading: boolean;
  error: string | null;

  // コールバック（データ接続時にここを実装する）
  onAddCard:      () => void;
  onDeleteCard:   (id: string) => void;
  onUpdateCard:   (id: string, patch: Partial<PlotCard>) => void;
  onAddLine:      (cardId: string, afterIdx: number) => void;
  onDeleteLine:   (cardId: string, lineId: string) => void;
  onUpdateLine:   (cardId: string, lineId: string, patch: Partial<PlotLine>) => void;
  onReorderLines: (cardId: string, newLines: PlotLine[]) => void;

  // オプション
  isAIEnabled?:   boolean;
  onAIGenerate?:  (prompt: string) => Promise<PlotCard[]>;
  initialCardId?: string | null;
}

// ── モックデータ（シェル単体動作用）────────────────────────────

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const MOCK_CARDS: PlotCard[] = [
  {
    id: 'mock-card-01',
    title: 'レミとの出会い',
    status: 'draft',
    episodeId: 'ep_01',
    chapterId: 'ch_01_01',
    sceneTag: 'イベントトリガー',
    castSlots: ['レミ・ウナント', '主人公', null, null],
    lines: [
      { id: 'l-001', speaker: '',              text: '薄暗い屋根裏部屋。埃の匂いが立ち込めている。' },
      { id: 'l-002', speaker: 'レミ・ウナント', text: '……こんなところに誰かいるの？' },
      { id: 'l-003', speaker: '主人公',         text: 'あ、ごめん。迷い込んでしまって。' },
      { id: 'l-004', speaker: '',              text: '少女はランタンをこちらに向けた。' },
      { id: 'l-005', speaker: '',              text: 'ここに選択肢フラグを入れる予定', isComment: true },
    ],
  },
  {
    id: 'mock-card-02',
    title: '村の入口・門番との会話',
    status: 'idea',
    episodeId: 'ep_01',
    chapterId: '',
    sceneTag: '',
    castSlots: ['主人公', '門番', null, null],
    lines: [
      { id: 'l-006', speaker: '門番', text: '通行証を見せろ。' },
      { id: 'l-007', speaker: '主人公', text: '持っていません。旅人です。' },
    ],
  },
];

const MOCK_CHARACTERS: Character[] = [
  { id: 'remi_unant',      name: 'レミ・ウナント' },
  { id: 'hero',            name: '主人公' },
  { id: 'npc_guard_001',   name: '門番' },
  { id: 'npc_merchant_001',name: '行商人' },
];

const MOCK_EPISODES: Episode[] = [
  {
    id: 'ep_01',
    title: 'EP01: 始まりの日',
    chapters: [
      { id: 'ch_01_01', title: 'CH01: 屋根裏部屋' },
      { id: 'ch_01_02', title: 'CH02: 村の出口' },
    ],
  },
  {
    id: 'ep_02',
    title: 'EP02: 旅の始まり',
    chapters: [
      { id: 'ch_02_01', title: 'CH01: 街道' },
    ],
  },
];

// ── 定数 ─────────────────────────────────────────────────────

const TEXT_MAX_CHARS = 60;

const STATUS_CONFIG: Record<PlotStatus, { label: string; color: string; bg: string }> = {
  idea:  { label: 'アイディア', color: '#a78bfa', bg: 'rgba(167,139,250,.15)' },
  draft: { label: '下書き',     color: '#fbbf24', bg: 'rgba(251,191,36,.15)'  },
  fixed: { label: '確定',       color: '#34d399', bg: 'rgba(52,211,153,.15)'  },
};

// ── 小コンポーネント ──────────────────────────────────────────

/** 自動リサイズ textarea */
function AutoTextarea({
  value, onChange, onFocus, onBlur, onKeyDown, placeholder, isComment,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  isComment?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // テキスト変更のたびに高さを再計算
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => {
        if (e.target.value.length <= TEXT_MAX_CHARS) onChange(e.target.value);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
      maxLength={TEXT_MAX_CHARS}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        resize: 'none',
        color: isComment ? '#6b7280' : '#e5e7eb',
        fontSize: '0.82rem',
        lineHeight: 1.7,
        fontFamily: 'inherit',
        fontStyle: isComment ? 'italic' : 'normal',
        overflow: 'hidden',
        minHeight: '1.7rem',
        maxHeight: '13.6rem', // 8行分
      }}
    />
  );
}

/** キャストスロット 1個 */
function CastSlot({
  slotIdx, name, characters,
  onSet, onClear,
}: {
  slotIdx: number;
  name: string | null;
  characters: Character[];
  onSet: (name: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // 外クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const confirm = () => {
    if (inputVal.trim()) { onSet(inputVal.trim()); setInputVal(''); }
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: '0 0 auto' }}>
      {name ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(201,162,39,.12)',
          border: '1px solid rgba(201,162,39,.35)',
          borderRadius: 5, padding: '2px 6px',
        }}>
          <span style={{ fontSize: '.65rem', color: '#c9a227', fontWeight: 700 }}>{slotIdx + 1}</span>
          <span style={{ fontSize: '.75rem', color: '#e5e7eb' }}>{name}</span>
          <button
            onClick={onClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.7rem', padding: '0 2px' }}
          >×</button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,.04)',
            border: '1px dashed #374151',
            borderRadius: 5, padding: '2px 10px',
            cursor: 'pointer', color: '#4b5563', fontSize: '.75rem',
          }}
        >
          <span style={{ color: '#374151', fontWeight: 700 }}>{slotIdx + 1}</span>
          <span>＋</span>
        </button>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 50,
          background: '#1f2937', border: '1px solid #374151', borderRadius: 8,
          padding: '0.5rem', width: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,.5)',
        }}>
          {/* 直接入力 */}
          <input
            autoFocus
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); confirm(); }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder="名前を入力..."
            style={{
              width: '100%', background: '#111827', border: '1px solid #374151',
              borderRadius: 5, color: '#e5e7eb', padding: '4px 8px',
              fontSize: '.78rem', marginBottom: 6, boxSizing: 'border-box',
            }}
          />
          {/* キャラ一覧 */}
          <div style={{ maxHeight: 140, overflowY: 'auto' }}>
            {characters.map(ch => (
              <button
                key={ch.id}
                onClick={() => { onSet(ch.name); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#d1d5db', fontSize: '.78rem', padding: '4px 6px',
                  borderRadius: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >{ch.name}</button>
            ))}
          </div>
          {inputVal.trim() && (
            <button
              onClick={confirm}
              style={{
                marginTop: 4, width: '100%', background: '#ca8a04', border: 'none',
                color: '#111827', fontWeight: 700, borderRadius: 5,
                padding: '4px 0', fontSize: '.75rem', cursor: 'pointer',
              }}
            >「{inputVal.trim()}」を登録</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── PlotNotebookShell ─────────────────────────────────────────

/**
 * PlotNotebookShell — データ接続なし版
 *
 * シェル単体動作: Props を渡さず <PlotNotebookShell /> で呼ぶとモックデータで動作。
 * データ接続時: onAddCard / onUpdateCard 等を実装して渡す。
 */
export function PlotNotebookShell(props?: Partial<PlotNotebookProps>) {
  // TODO: Props からデータを受け取る場合はここを外す
  const [localCards, setLocalCards] = useState<PlotCard[]>(props?.cards ?? MOCK_CARDS);
  const characters = props?.characters ?? MOCK_CHARACTERS;
  const episodes   = props?.episodes   ?? MOCK_EPISODES;
  const isLoading  = props?.isLoading  ?? false;
  const error      = props?.error      ?? null;
  const isAIEnabled = props?.isAIEnabled ?? false;

  // カードリスト（ローカル or Props）
  const cards = props?.cards ?? localCards;

  const [selectedId, setSelectedId] = useState<string | null>(
    props?.initialCardId ?? (props?.cards ?? MOCK_CARDS)[0]?.id ?? null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PlotStatus | 'all'>('all');
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

  // AI panel state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt]       = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError]         = useState('');

  // D&D state
  const [dragId,      setDragId]      = useState<string | null>(null);
  const [dropIdx,     setDropIdx]     = useState<number | null>(null);
  const [dropPos,     setDropPos]     = useState<'before' | 'after'>('after');

  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    const el = textareaRefs.current[pendingFocus.current];
    if (el) { el.focus(); pendingFocus.current = null; }
  });

  const selectedCard = cards.find(c => c.id === selectedId) ?? null;
  const filteredCards = statusFilter === 'all'
    ? cards
    : cards.filter(c => c.status === statusFilter);

  // ── ローカル CRUD（TODO: Props のコールバックに差し替える） ──

  const localUpdateCard = useCallback((id: string, patch: Partial<PlotCard>) => {
    // TODO: props.onUpdateCard?.(id, patch);
    setLocalCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }, []);

  const localAddCard = useCallback(() => {
    // TODO: props.onAddCard?.();
    const card: PlotCard = {
      id: genId(), title: '新しいプロット', status: 'idea',
      episodeId: '', chapterId: '', sceneTag: '',
      castSlots: [null, null, null, null],
      lines: [{ id: genId(), speaker: '', text: '' }],
    };
    setLocalCards(prev => [card, ...prev]);
    setSelectedId(card.id);
  }, []);

  const localDeleteCard = useCallback((id: string) => {
    // TODO: props.onDeleteCard?.(id);
    setLocalCards(prev => {
      const next = prev.filter(c => c.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }, [selectedId]);

  const addLine = useCallback((cardId: string, afterIdx: number) => {
    // TODO: props.onAddLine?.(cardId, afterIdx);
    const nl: PlotLine = { id: genId(), speaker: '', text: '' };
    setLocalCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const ls = [...c.lines];
      ls.splice(afterIdx + 1, 0, nl);
      return { ...c, lines: ls };
    }));
    pendingFocus.current = nl.id;
    setFocusedLineId(nl.id);
  }, []);

  const deleteLine = useCallback((cardId: string, lineId: string) => {
    // TODO: props.onDeleteLine?.(cardId, lineId);
    setLocalCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const ls = c.lines.filter(l => l.id !== lineId);
      return { ...c, lines: ls.length > 0 ? ls : [{ id: genId(), speaker: '', text: '' }] };
    }));
  }, []);

  const updateLine = useCallback((cardId: string, lineId: string, patch: Partial<PlotLine>) => {
    // TODO: props.onUpdateLine?.(cardId, lineId, patch);
    setLocalCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      return { ...c, lines: c.lines.map(l => l.id === lineId ? { ...l, ...patch } : l) };
    }));
  }, []);

  // ── キーボードショートカット ──────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt+A: サイドバートグル
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setSidebarOpen(v => !v);
        return;
      }
      // 以下は行フォーカス中のみ
      if (!focusedLineId || !selectedCard) return;

      if (e.altKey) {
        // Alt+0: ナレーション（speaker 空白）
        if (e.key === '0') {
          e.preventDefault();
          updateLine(selectedCard.id, focusedLineId, { speaker: '' });
        }
        // Alt+1〜4: キャストスロット
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx !== -1) {
          e.preventDefault();
          const name = selectedCard.castSlots[idx];
          if (name) updateLine(selectedCard.id, focusedLineId, { speaker: name });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusedLineId, selectedCard, updateLine]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
        setFocusedLineId(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── D&D ────────────────────────────────────────────────────

  const onDragStart = (e: React.DragEvent, lineId: string) => {
    setDragId(lineId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropIdx(idx);
    setDropPos(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after');
  };

  const onDrop = (e: React.DragEvent, dropIdx_: number) => {
    e.preventDefault();
    if (!dragId || !selectedCard) { setDragId(null); setDropIdx(null); return; }
    const ls = [...selectedCard.lines];
    const from = ls.findIndex(l => l.id === dragId);
    if (from === -1) { setDragId(null); setDropIdx(null); return; }
    let to = dropPos === 'before' ? dropIdx_ : dropIdx_ + 1;
    const [item] = ls.splice(from, 1);
    if (from < to) to--;
    ls.splice(Math.max(0, to), 0, item);
    // TODO: props.onReorderLines?.(selectedCard.id, ls);
    setLocalCards(prev => prev.map(c => c.id === selectedCard.id ? { ...c, lines: ls } : c));
    setDragId(null); setDropIdx(null);
  };

  const chaptersForEpisode = episodes.find(e => e.id === selectedCard?.episodeId)?.chapters ?? [];

  // ── AI 生成 ─────────────────────────────────────────────────

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !props?.onAIGenerate) return;
    setIsGenerating(true); setAiError('');
    try {
      // TODO: props.onAIGenerate(aiPrompt) → 生成されたカードを追加
      const generated = await props.onAIGenerate(aiPrompt.trim());
      setLocalCards(prev => [...generated, ...prev]);
      if (generated.length > 0) setSelectedId(generated[0].id);
      setShowAIPanel(false); setAiPrompt('');
    } catch (err: any) {
      setAiError(err?.message ?? 'AI生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── ローディング ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', gap: 1 }}>
        {/* Sidebar skeleton */}
        <div style={{ width: 240, background: '#0f172a', borderRight: '1px solid #1f2937', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[80, 60, 70, 55].map((w, i) => (
            <div key={i} style={{ height: 48, background: '#1f2937', borderRadius: 6, opacity: 0.5, width: `${w}%` }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '.9rem' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  // ── エラー ────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#f87171' }}>
        <div style={{ fontSize: '2rem' }}>⚠</div>
        <div style={{ fontSize: '.9rem' }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{ background: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '.8rem' }}
        >
          リトライ
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* モバイル backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            display: 'none', // TODO: モバイル時のみ display:'block'
            // @media (max-width: 768px) { display: block }
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40,
          }}
        />
      )}

      {/* ── AI 生成パネル ── */}
      {showAIPanel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#1f2937', border: '1px solid #374151', borderRadius: 12,
            padding: '1.5rem', width: 'min(480px, 90vw)', display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <h3 style={{ color: '#fbbf24', margin: 0, fontSize: '1rem' }}>✨ AI プロット生成</h3>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="シチュエーションを入力してください..."
              rows={4}
              style={{
                background: '#111827', border: '1px solid #374151', borderRadius: 8,
                color: '#e5e7eb', padding: '0.75rem', fontSize: '0.88rem', resize: 'vertical',
              }}
            />
            {aiError && <p style={{ color: '#f87171', fontSize: '.8rem', margin: 0 }}>{aiError}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowAIPanel(false); setAiError(''); }}
                style={{ background: 'transparent', border: '1px solid #374151', color: '#6b7280', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer' }}
              >キャンセル</button>
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                style={{
                  background: isGenerating ? '#92400e' : '#ca8a04', border: 'none',
                  color: '#111827', fontWeight: 700, padding: '0.5rem 1.25rem',
                  borderRadius: 6, cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: !aiPrompt.trim() ? 0.5 : 1,
                }}
              >{isGenerating ? '生成中...' : '✨ 生成'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 左: サイドバー ── */}
      {/* TODO: モバイル (width<768) では position:fixed + transform で overlay にする */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: '#0f172a',
        borderRight: '1px solid #1f2937',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        // TODO: モバイルのみ →
        // position: 'fixed', left: sidebarOpen ? 0 : -240, transition: 'left 0.2s', zIndex: 41,
        // height: '100%'
      }}>

        {/* Sidebar Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.65rem 0.875rem',
          borderBottom: '1px solid #1f2937',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 800, fontSize: '.82rem', color: '#e5e7eb', letterSpacing: '.04em' }}>
            プロット手帳
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {isAIEnabled && (
              <button
                onClick={() => setShowAIPanel(true)}
                style={{
                  background: '#1d4ed8', border: '1px solid #3b82f6', color: '#bfdbfe',
                  borderRadius: 5, padding: '2px 8px', fontSize: '.68rem', cursor: 'pointer', fontWeight: 600,
                }}
              >✨ AI</button>
            )}
            <button
              onClick={localAddCard}
              style={{
                background: 'rgba(201,162,39,.15)', border: '1px solid rgba(201,162,39,.4)',
                color: '#c9a227', borderRadius: 5, padding: '2px 8px',
                fontSize: '.68rem', cursor: 'pointer', fontWeight: 700,
              }}
            >＋ 新規</button>
          </div>
        </div>

        {/* Status filter */}
        <div style={{
          display: 'flex', gap: 3, padding: '0.5rem 0.875rem',
          borderBottom: '1px solid #1f2937', flexShrink: 0, flexWrap: 'wrap',
        }}>
          {(['all', 'idea', 'draft', 'fixed'] as const).map(s => {
            const cfg = s === 'all' ? { label: '全て', color: '#9ca3af', bg: 'rgba(156,163,175,.12)' } : STATUS_CONFIG[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: active ? cfg.bg : 'transparent',
                  border: `1px solid ${active ? cfg.color + '60' : 'transparent'}`,
                  color: active ? cfg.color : '#6b7280',
                  borderRadius: 4, padding: '1px 7px',
                  fontSize: '.62rem', cursor: 'pointer', fontWeight: active ? 700 : 400,
                }}
              >{cfg.label}</button>
            );
          })}
        </div>

        {/* Card list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 0' }}>
          {filteredCards.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#4b5563', fontSize: '.8rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>📝</div>
              <div>カードがありません</div>
              <button
                onClick={localAddCard}
                style={{
                  marginTop: '0.75rem', background: 'rgba(201,162,39,.1)',
                  border: '1px solid rgba(201,162,39,.3)', color: '#c9a227',
                  borderRadius: 6, padding: '0.4rem 0.75rem',
                  fontSize: '.75rem', cursor: 'pointer',
                }}
              >＋ 最初のカードを作成</button>
            </div>
          ) : filteredCards.map(card => {
            const s = STATUS_CONFIG[card.status];
            const active = card.id === selectedId;
            const epLabel = episodes.find(e => e.id === card.episodeId)?.title.split(':')[0] ?? '';
            return (
              <button
                key={card.id}
                onClick={() => setSelectedId(card.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.5rem 0.875rem',
                  background: active ? 'rgba(201,162,39,.1)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${active ? '#c9a227' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  fontSize: '.78rem', fontWeight: active ? 700 : 400,
                  color: active ? '#e5e7eb' : '#9ca3af',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 3,
                }}>{card.title}</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{
                    fontSize: '.6rem', fontWeight: 600,
                    color: s.color, background: s.bg,
                    borderRadius: 3, padding: '0 5px',
                    border: `1px solid ${s.color}40`,
                  }}>{s.label}</span>
                  {epLabel && (
                    <span style={{ fontSize: '.6rem', color: '#4b5563' }}>{epLabel}</span>
                  )}
                </div>
                {card.sceneTag && (
                  <div style={{ fontSize: '.6rem', color: '#4b5563', marginTop: 2 }}>🏷 {card.sceneTag}</div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* サイドバートグルボタン（モバイル用） */}
      {/* TODO: モバイル時のみ表示 */}
      <button
        onClick={() => setSidebarOpen(v => !v)}
        title={`サイドバーを${sidebarOpen ? '閉じる' : '開く'} (Alt+A)`}
        style={{
          display: 'none', // TODO: モバイルのみ display:'block'
          position: 'absolute', left: sidebarOpen ? 240 : 0, top: '50%',
          transform: 'translateY(-50%)',
          background: '#1f2937', border: '1px solid #374151', borderRadius: '0 4px 4px 0',
          color: '#9ca3af', padding: '0.5rem 4px', cursor: 'pointer', zIndex: 42, fontSize: '.75rem',
        }}
      >{sidebarOpen ? '◀' : '▶'}</button>

      {/* ── 右: エディター ── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!selectedCard ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '0.75rem', color: '#4b5563',
          }}>
            <div style={{ fontSize: '3rem' }}>📖</div>
            <div style={{ fontSize: '.9rem' }}>カードを選択するか新規作成してください</div>
            <button
              onClick={localAddCard}
              style={{
                background: 'rgba(201,162,39,.12)', border: '1px solid rgba(201,162,39,.35)',
                color: '#c9a227', borderRadius: 8, padding: '0.5rem 1.25rem',
                fontSize: '.82rem', cursor: 'pointer', fontWeight: 700,
              }}
            >＋ 新しいプロットを作成</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* エディターヘッダー */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              borderBottom: '1px solid #1f2937',
              background: '#0f172a', flexShrink: 0,
            }}>
              <input
                value={selectedCard.title}
                onChange={e => localUpdateCard(selectedCard.id, { title: e.target.value })}
                placeholder="プロットタイトル..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#e5e7eb', fontSize: '.92rem', fontWeight: 700, fontFamily: 'inherit',
                }}
              />
              <select
                value={selectedCard.status}
                onChange={e => localUpdateCard(selectedCard.id, { status: e.target.value as PlotStatus })}
                style={{
                  background: STATUS_CONFIG[selectedCard.status].bg,
                  border: `1px solid ${STATUS_CONFIG[selectedCard.status].color}50`,
                  color: STATUS_CONFIG[selectedCard.status].color,
                  borderRadius: 5, padding: '2px 6px', fontSize: '.7rem',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                {(Object.entries(STATUS_CONFIG) as [PlotStatus, typeof STATUS_CONFIG['idea']][]).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: '#1f2937', color: '#e5e7eb' }}>{v.label}</option>
                ))}
              </select>
              <button
                onClick={() => localDeleteCard(selectedCard.id)}
                title="カードを削除"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.9rem', padding: 4 }}
              >🗑</button>
            </div>

            {/* メタ情報バー */}
            <div style={{
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
              padding: '0.4rem 0.875rem',
              borderBottom: '1px solid #1f2937',
              background: '#0a0f1a', flexShrink: 0,
            }}>
              <select
                value={selectedCard.episodeId}
                onChange={e => localUpdateCard(selectedCard.id, { episodeId: e.target.value, chapterId: '' })}
                style={{ background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: 4, padding: '2px 6px', fontSize: '.7rem' }}
              >
                <option value="">-- Episode --</option>
                {episodes.map(ep => <option key={ep.id} value={ep.id}>{ep.title}</option>)}
              </select>
              <select
                value={selectedCard.chapterId}
                onChange={e => localUpdateCard(selectedCard.id, { chapterId: e.target.value })}
                disabled={!selectedCard.episodeId}
                style={{ background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: 4, padding: '2px 6px', fontSize: '.7rem' }}
              >
                <option value="">-- Chapter --</option>
                {chaptersForEpisode.map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
              </select>
              <input
                value={selectedCard.sceneTag}
                onChange={e => localUpdateCard(selectedCard.id, { sceneTag: e.target.value })}
                placeholder="シーンタグ（任意）"
                style={{
                  background: '#1f2937', border: '1px solid #374151', color: '#9ca3af',
                  borderRadius: 4, padding: '2px 8px', fontSize: '.7rem', minWidth: 120,
                }}
              />
            </div>

            {/* キャストスロット */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
              padding: '0.4rem 0.875rem',
              borderBottom: '1px solid #1f2937',
              background: '#0a0f1a', flexShrink: 0,
            }}>
              <span style={{ fontSize: '.62rem', color: '#4b5563', fontWeight: 700, letterSpacing: '.06em' }}>
                CAST
              </span>
              <span style={{ fontSize: '.58rem', color: '#374151', marginRight: 4 }}>
                Alt+1〜4 で話者挿入
              </span>
              {selectedCard.castSlots.map((name, idx) => (
                <CastSlot
                  key={idx}
                  slotIdx={idx}
                  name={name}
                  characters={characters}
                  onSet={n => {
                    const slots = [...selectedCard.castSlots] as PlotCard['castSlots'];
                    slots[idx] = n;
                    localUpdateCard(selectedCard.id, { castSlots: slots });
                  }}
                  onClear={() => {
                    const slots = [...selectedCard.castSlots] as PlotCard['castSlots'];
                    slots[idx] = null;
                    localUpdateCard(selectedCard.id, { castSlots: slots });
                  }}
                />
              ))}
            </div>

            {/* 会話ラインリスト */}
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.875rem' }}
              onDragLeave={e => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIdx(null);
              }}
            >
              {selectedCard.lines.map((line, idx) => {
                const isFocused = focusedLineId === line.id;
                const isDragging = dragId === line.id;
                const charLeft = TEXT_MAX_CHARS - line.text.length;

                return (
                  <Fragment key={line.id}>
                    {/* ドロップインジケーター（前） */}
                    {dropIdx === idx && dropPos === 'before' && !isDragging && (
                      <div style={{ height: 2, background: '#c9a227', borderRadius: 1, margin: '2px 0' }} />
                    )}

                    <div
                      onDragOver={e => onDragOver(e, idx)}
                      onDrop={e => onDrop(e, idx)}
                      style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        padding: '0.3rem 0.4rem',
                        marginBottom: 2,
                        background: isFocused
                          ? 'rgba(201,162,39,.06)'
                          : line.isComment
                          ? 'rgba(107,114,128,.05)'
                          : 'transparent',
                        border: `1px solid ${isFocused ? 'rgba(201,162,39,.2)' : 'transparent'}`,
                        borderRadius: 5,
                        opacity: isDragging ? 0.3 : 1,
                        borderLeft: line.isComment
                          ? '3px solid #374151'
                          : line.speaker === ''
                          ? '3px solid #1d4ed8'
                          : '3px solid transparent',
                      }}
                    >
                      {/* ドラッグハンドル */}
                      <div
                        draggable
                        onDragStart={e => onDragStart(e, line.id)}
                        onDragEnd={() => { setDragId(null); setDropIdx(null); }}
                        style={{
                          cursor: 'grab', color: '#374151', fontSize: '1rem',
                          userSelect: 'none', flexShrink: 0, paddingTop: 2,
                        }}
                        title="ドラッグして並び替え"
                      >⠿</div>

                      {/* 話者 or コメントラベル */}
                      {line.isComment ? (
                        <span style={{
                          fontSize: '.68rem', color: '#4b5563', fontFamily: 'monospace',
                          flexShrink: 0, paddingTop: '0.25rem', minWidth: 70,
                        }}>// NOTE</span>
                      ) : (
                        <input
                          value={line.speaker}
                          onChange={e => updateLine(selectedCard.id, line.id, { speaker: e.target.value })}
                          onFocus={() => setFocusedLineId(line.id)}
                          onBlur={() => setFocusedLineId(null)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              textareaRefs.current[line.id]?.focus();
                            }
                          }}
                          placeholder="キャラ名"
                          style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#c9a227', fontSize: '.75rem', fontWeight: 600,
                            width: 78, flexShrink: 0, fontFamily: 'inherit',
                            borderBottom: '1px solid #1f2937',
                          }}
                        />
                      )}

                      {/* テキスト */}
                      <div style={{ flex: 1, position: 'relative' }}>
                        <AutoTextarea
                          value={line.text}
                          onChange={v => updateLine(selectedCard.id, line.id, { text: v })}
                          onFocus={() => setFocusedLineId(line.id)}
                          onBlur={() => setFocusedLineId(null)}
                          onKeyDown={e => {
                            if (e.ctrlKey && e.key === 'Enter') {
                              e.preventDefault();
                              addLine(selectedCard.id, idx);
                            }
                            // Backspace on empty line → delete
                            if (e.key === 'Backspace' && line.text === '' && selectedCard.lines.length > 1) {
                              e.preventDefault();
                              deleteLine(selectedCard.id, line.id);
                              const prevLine = selectedCard.lines[idx - 1];
                              if (prevLine) {
                                pendingFocus.current = prevLine.id;
                                setFocusedLineId(prevLine.id);
                              }
                            }
                          }}
                          placeholder={line.isComment ? '// コメント（ノベルJSONには出力されません）' : '台詞・ト書き...'}
                          isComment={line.isComment}
                        />
                        {!line.isComment && isFocused && (
                          <span style={{
                            position: 'absolute', right: 2, bottom: 2,
                            fontSize: '.6rem', color: charLeft <= 10 ? '#f87171' : '#374151',
                          }}>{charLeft}</span>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button
                          onClick={() => addLine(selectedCard.id, idx)}
                          title="下に行を追加 (Ctrl+Enter)"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '.85rem', padding: '2px 4px', lineHeight: 1 }}
                        >＋</button>
                        <button
                          onClick={() => deleteLine(selectedCard.id, line.id)}
                          title="この行を削除"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '.85rem', padding: '2px 4px', lineHeight: 1 }}
                        >×</button>
                      </div>
                    </div>

                    {/* ドロップインジケーター（後） */}
                    {dropIdx === idx && dropPos === 'after' && !isDragging && (
                      <div style={{ height: 2, background: '#c9a227', borderRadius: 1, margin: '2px 0' }} />
                    )}
                  </Fragment>
                );
              })}

              {/* 行追加バー */}
              <div style={{
                display: 'flex', gap: '0.5rem', marginTop: '0.5rem',
                paddingTop: '0.5rem', borderTop: '1px solid #0f172a',
              }}>
                <button
                  onClick={() => addLine(selectedCard.id, selectedCard.lines.length - 1)}
                  style={{
                    background: 'transparent', border: '1px dashed #1f2937',
                    color: '#4b5563', borderRadius: 6, padding: '0.35rem 0.875rem',
                    fontSize: '.75rem', cursor: 'pointer', flex: 1,
                  }}
                >＋ 台詞を追加 <span style={{ fontSize: '.6rem', color: '#374151' }}>Ctrl+Enter</span></button>
                <button
                  onClick={() => {
                    const nl: PlotLine = { id: genId(), speaker: '', text: '', isComment: true };
                    setLocalCards(prev => prev.map(c => {
                      if (c.id !== selectedCard.id) return c;
                      return { ...c, lines: [...c.lines, nl] };
                    }));
                    pendingFocus.current = nl.id;
                    setFocusedLineId(nl.id);
                  }}
                  style={{
                    background: 'transparent', border: '1px dashed #1f2937',
                    color: '#4b5563', borderRadius: 6, padding: '0.35rem 0.75rem',
                    fontSize: '.72rem', cursor: 'pointer',
                  }}
                >// NOTE</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
