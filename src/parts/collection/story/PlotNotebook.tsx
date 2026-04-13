// ============================================
// PlotNotebook - プロット手帳 v4
// ============================================

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import episodesData from '@/data/collection/episodes.json';
import characterData from '@/data/collection/characters.json';
import type { PlotCard, PlotLine, PlotStatus } from '@/core/services/PlotService';
import { loadPlots, savePlot, deletePlot } from '@/core/services/PlotService';
import { GeminiService } from '@/core/services/GeminiService';

type ScreenState = 'default' | 'typing';

interface SlotPopup {
    slotIdx: number;
    mode: 'menu' | 'text' | 'list';
    textInput: string;
}

type DropPosition = 'before' | 'after';

const TEXT_MAX_CHARS = 60;

const STATUS_CONFIG: Record<PlotStatus, { label: string; bg: string; text: string; border: string }> = {
    idea:  { label: 'アイディア', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
    draft: { label: '下書き',     bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    fixed: { label: '確定',       bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/40' },
};

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function PlotNotebook() {
    const [cards, setCards] = useState<PlotCard[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [screenState, setScreenState] = useState<ScreenState>('default');
    const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

    const [slotPopup, setSlotPopup] = useState<SlotPopup | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // サイドバー開閉
    // デスクトップ(>768px): CSS で常時表示（hidden クラスは無効）
    // モバイル(≤768px): 初期非表示、タップで開くオーバーレイ
    const [sidebarOpen, setSidebarOpen] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth > 768 : true
    );

    // ドラッグ状態
    const [dragLineId, setDragLineId] = useState<string | null>(null);
    const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>('after');

    // DOM refs
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

    // Ctrl+Enter 後にフォーカスすべき行ID（レンダリング後に適用）
    const pendingFocusRef = useRef<string | null>(null);

    // レンダリング後に pendingFocusRef があればフォーカスを当てる
    useEffect(() => {
        if (!pendingFocusRef.current) return;
        const el = textareaRefs.current[pendingFocusRef.current];
        if (el) {
            el.focus();
            pendingFocusRef.current = null;
        }
    }); // 依存配列なし = 毎レンダー後に実行

    // AI生成UI
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');

    const episodes = episodesData.episodes;
    const allCharacters: { id: string; name: string }[] = (characterData as any).characters ?? [];
    const selectedCard = cards.find(c => c.id === selectedId) ?? null;

    // ── Firestore: 初回読み込み ──────────────────────────────

    useEffect(() => {
        loadPlots()
            .then(loaded => {
                setCards(loaded);
                if (loaded.length > 0) setSelectedId(loaded[0].id);
            })
            .catch(err => console.error('Firestore load error:', err))
            .finally(() => setIsLoading(false));
    }, []);

    // ── Firestore: カード変更時に保存（debounce 800ms） ──────

    const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const scheduleSave = useCallback((card: PlotCard) => {
        clearTimeout(saveTimers.current[card.id]);
        saveTimers.current[card.id] = setTimeout(() => {
            savePlot(card).catch(err => console.error('Firestore save error:', err));
        }, 800);
    }, []);

    // ── キーボードショートカット ─────────────────────────────

    // Alt+1〜4: キャスト名を話者に挿入 / Alt+0: ナレーション（空白）
    const handleAltShortcut = useCallback((slotIdx: number | 'narration') => {
        if (!selectedCard || !focusedLineId) return;
        const name = slotIdx === 'narration' ? '' : selectedCard.castSlots[slotIdx];
        if (slotIdx !== 'narration' && !name) return;
        setCards(prev => prev.map(c => {
            if (c.id !== selectedCard.id) return c;
            return { ...c, lines: c.lines.map(l => l.id === focusedLineId ? { ...l, speaker: name ?? '' } : l) };
        }));
    }, [selectedCard, focusedLineId]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!e.altKey) return;

            // Alt+A: 左サイドバー開閉
            if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }

            // 以下は入力中のみ有効
            if (screenState !== 'typing') return;

            if (e.key === '0') {
                e.preventDefault();
                handleAltShortcut('narration');
                return;
            }
            const idx = ['1', '2', '3', '4'].indexOf(e.key);
            if (idx !== -1) {
                e.preventDefault();
                handleAltShortcut(idx);
                return;
            }
            // Alt+^: コメント行を挿入
            if (e.key === '^') {
                e.preventDefault();
                if (selectedCard && focusedLineId) {
                    const lineIdx = selectedCard.lines.findIndex(l => l.id === focusedLineId);
                    insertCommentAfter(selectedCard.id, lineIdx >= 0 ? lineIdx : selectedCard.lines.length - 1);
                }
                return;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [screenState, handleAltShortcut, selectedCard, focusedLineId]);

    // ESC: 現在の input/textarea からフォーカスを外す
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                (document.activeElement as HTMLElement)?.blur();
                setScreenState('default');
                setFocusedLineId(null);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // スロットpopup外クリックで閉じる
    useEffect(() => {
        if (!slotPopup) return;
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setSlotPopup(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [slotPopup]);

    // ── カード操作 ─────────────────────────────────────────

    const addCard = () => {
        const newCard: PlotCard = {
            id: genId(),
            title: '新しいプロット',
            status: 'idea',
            episodeId: '',
            chapterId: '',
            sceneTag: '',
            castSlots: [null, null, null, null],
            lines: [{ id: genId(), speaker: '', text: '' }],
        };
        setCards(prev => [newCard, ...prev]);
        setSelectedId(newCard.id);
        savePlot(newCard).catch(console.error);
    };

    const deleteCard = (id: string) => {
        setCards(prev => {
            const next = prev.filter(c => c.id !== id);
            if (selectedId === id) setSelectedId(next[0]?.id ?? null);
            return next;
        });
        deletePlot(id).catch(console.error);
    };

    const updateCard = <K extends keyof PlotCard>(id: string, field: K, value: PlotCard[K]) => {
        setCards(prev => prev.map(c => {
            if (c.id !== id) return c;
            const updated = { ...c, [field]: value };
            scheduleSave(updated);
            return updated;
        }));
    };

    // ── キャストスロット ────────────────────────────────────

    const setCastSlot = (cardId: string, slotIdx: number, name: string | null) => {
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const next = [...c.castSlots] as PlotCard['castSlots'];
            next[slotIdx] = name;
            const updated = { ...c, castSlots: next };
            scheduleSave(updated);
            return updated;
        }));
    };

    // ── ライン操作 ─────────────────────────────────────────

    const insertLineAfter = (cardId: string, afterIdx: number) => {
        const newLine: PlotLine = { id: genId(), speaker: '', text: '' };
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const lines = [...c.lines];
            lines.splice(afterIdx + 1, 0, newLine);
            const updated = { ...c, lines };
            scheduleSave(updated);
            return updated;
        }));
        // レンダリング後に pendingFocusRef が適用される
        pendingFocusRef.current = newLine.id;
        setFocusedLineId(newLine.id);
        setScreenState('typing');
    };

    const insertCommentAfter = (cardId: string, afterIdx: number) => {
        const newLine: PlotLine = { id: genId(), speaker: '', text: '', isComment: true };
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const lines = [...c.lines];
            lines.splice(afterIdx + 1, 0, newLine);
            const updated = { ...c, lines };
            scheduleSave(updated);
            return updated;
        }));
        pendingFocusRef.current = newLine.id;
        setFocusedLineId(newLine.id);
        setScreenState('typing');
    };

    const updateLine = (cardId: string, lineId: string, field: keyof PlotLine, value: string | boolean) => {
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const updated = { ...c, lines: c.lines.map(l => l.id === lineId ? { ...l, [field]: value } : l) };
            scheduleSave(updated);
            return updated;
        }));
    };

    const deleteLine = (cardId: string, lineId: string) => {
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const next = c.lines.filter(l => l.id !== lineId);
            const updated = { ...c, lines: next.length > 0 ? next : [{ id: genId(), speaker: '', text: '' }] };
            scheduleSave(updated);
            return updated;
        }));
    };

    // ── ドラッグ＆ドロップ並び替え ─────────────────────────

    const handleDragStart = (e: React.DragEvent, lineId: string) => {
        setDragLineId(lineId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const pos: DropPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        setDropTargetIdx(idx);
        setDropPosition(pos);
    };

    const handleDrop = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (!dragLineId || !selectedCard) {
            setDragLineId(null);
            setDropTargetIdx(null);
            return;
        }
        const lines = [...selectedCard.lines];
        const dragIdx = lines.findIndex(l => l.id === dragLineId);
        if (dragIdx === -1) {
            setDragLineId(null);
            setDropTargetIdx(null);
            return;
        }
        let insertAt = dropPosition === 'before' ? dropIdx : dropIdx + 1;
        const [dragged] = lines.splice(dragIdx, 1);
        if (dragIdx < insertAt) insertAt--;
        lines.splice(Math.max(0, insertAt), 0, dragged);
        updateCard(selectedCard.id, 'lines', lines);
        setDragLineId(null);
        setDropTargetIdx(null);
    };

    const handleDragEnd = () => {
        setDragLineId(null);
        setDropTargetIdx(null);
    };

    const handleEpisodeChange = (episodeId: string) => {
        if (!selectedCard) return;
        updateCard(selectedCard.id, 'episodeId', episodeId);
        updateCard(selectedCard.id, 'chapterId', '');
    };

    const chaptersForEpisode = episodes.find(e => e.id === selectedCard?.episodeId)?.chapters ?? [];

    const openSlotMenu = (slotIdx: number) => {
        setSlotPopup({ slotIdx, mode: 'menu', textInput: '' });
    };

    // Enter: 確定して最初のtextareaへ / TAB: 確定して次の空スロットへ
    const confirmAndAdvance = (direction: 'enter' | 'tab') => {
        if (!slotPopup || !selectedCard) return;
        const name = slotPopup.textInput.trim();
        const currentSlotIdx = slotPopup.slotIdx;
        if (name) setCastSlot(selectedCard.id, currentSlotIdx, name);
        setSlotPopup(null);

        if (direction === 'tab') {
            // 次の空スロットを探す
            for (let i = currentSlotIdx + 1; i < 4; i++) {
                if (!selectedCard.castSlots[i]) {
                    setTimeout(() => setSlotPopup({ slotIdx: i, mode: 'text', textInput: '' }), 30);
                    return;
                }
            }
        }
        // Enter、または空スロットなし → 最初のtextareaへ
        setTimeout(() => {
            const firstLineId = selectedCard.lines[0]?.id;
            if (firstLineId) {
                textareaRefs.current[firstLineId]?.focus();
                setFocusedLineId(firstLineId);
                setScreenState('typing');
            }
        }, 30);
    };

    // ── AI生成 ─────────────────────────────────────────────

    const handleAIGenerate = async () => {
        if (!aiInput.trim()) return;
        setIsGenerating(true);
        setAiError('');
        try {
            const generated = await GeminiService.generatePlotCards(aiInput.trim());
            setCards(prev => [...generated, ...prev]);
            if (generated.length > 0) setSelectedId(generated[0].id);
            await Promise.all(generated.map(c => savePlot(c)));
            setShowAIPanel(false);
            setAiInput('');
        } catch (err: any) {
            setAiError(err?.message ?? 'AI生成に失敗しました');
        } finally {
            setIsGenerating(false);
        }
    };

    // ── ローディング ────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="plot-notebook" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#9ca3af' }}>Firestoreから読み込み中...</p>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────

    const comments = selectedCard?.lines.filter(l => l.isComment) ?? [];

    return (
        <div className="plot-notebook">

            {/* ── モバイル: 開いたサイドバーの外側をタップで閉じる ── */}
            {sidebarOpen && (
                <div className="plot-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── AI生成パネル ── */}
            {showAIPanel && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#1f2937', border: '1px solid #374151', borderRadius: 12,
                        padding: '1.5rem', width: 'min(480px, 90vw)', display: 'flex', flexDirection: 'column', gap: '1rem',
                    }}>
                        <h3 style={{ color: '#facc15', margin: 0, fontSize: '1rem' }}>✨ AI プロット生成</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
                            ストーリーの概要・シチュエーションを入力すると、プロットカードを2枚生成します。
                        </p>
                        <textarea
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            placeholder="例：主人公とヒロインが森の遺跡で古代の扉を発見する。扉を開けるか迷うシーン。"
                            rows={5}
                            style={{
                                background: '#111827', border: '1px solid #374151', borderRadius: 8,
                                color: '#f0e6d3', padding: '0.75rem', fontSize: '0.9rem', resize: 'vertical',
                            }}
                        />
                        {aiError && (
                            <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>{aiError}</p>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setShowAIPanel(false); setAiError(''); }}
                                style={{
                                    background: 'transparent', border: '1px solid #374151',
                                    color: '#6b7280', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer',
                                }}
                            >キャンセル</button>
                            <button
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiInput.trim()}
                                style={{
                                    background: isGenerating ? '#92400e' : '#ca8a04',
                                    border: 'none', color: '#111827', fontWeight: 700,
                                    padding: '0.5rem 1.25rem', borderRadius: 6,
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    opacity: !aiInput.trim() ? 0.5 : 1,
                                }}
                            >
                                {isGenerating ? '生成中...' : '✨ 2枚生成'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 左: カードリスト ── */}
            <aside className={`plot-sidebar ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="plot-sidebar-header">
                    <span className="plot-sidebar-title">プロット手帳</span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                            className="plot-add-btn"
                            style={{ background: '#1d4ed8', borderColor: '#3b82f6', fontSize: '0.75rem' }}
                            onClick={() => setShowAIPanel(true)}
                            title="AIでプロットを2枚生成"
                        >✨ AI</button>
                        <button className="plot-add-btn" onClick={addCard}>＋ 新規</button>
                        {/* モバイル専用閉じるボタン */}
                        <button
                            className="plot-sidebar-close-btn"
                            onClick={() => setSidebarOpen(false)}
                            title="閉じる"
                        >✕</button>
                    </div>
                </div>

                <div className="plot-card-list">
                    {cards.length === 0 && <p className="plot-empty">カードがありません</p>}
                    {cards.map(card => {
                        const s = STATUS_CONFIG[card.status];
                        const isActive = card.id === selectedId;
                        const epLabel = episodes.find(e => e.id === card.episodeId)?.title.split(':')[0] ?? '未割当';
                        return (
                            <div
                                key={card.id}
                                className={`plot-card-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSelectedId(card.id)}
                            >
                                <div className="plot-card-item-title">{card.title}</div>
                                <div className="plot-card-item-meta">
                                    <span className={`plot-status-badge ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>
                                    <span className="plot-ep-label">{epLabel}</span>
                                </div>
                                {card.sceneTag && <div className="plot-scene-tag">🏷 {card.sceneTag}</div>}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* サイドバー開閉ボタン */}
            <button
                className="plot-sidebar-toggle-btn"
                onClick={() => setSidebarOpen(prev => !prev)}
                title={`サイドバーを${sidebarOpen ? '閉じる' : '開く'} (Alt+A)`}
            >
                {sidebarOpen ? '◀' : '▶'}
            </button>

            {/* ── 右: カードエディター ── */}
            <main className="plot-editor">
                {!selectedCard ? (
                    <div className="plot-no-selection">
                        {/* モバイル: サイドバーを開くボタン */}
                        <button className="plot-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                        <p>← カードを選択するか、「＋ 新規」または「✨ AI」で追加してください</p>
                    </div>
                ) : (
                    <>
                        {/* ScreenState インジケーター（モバイルのメニューボタンを内包） */}
                        <div className={`plot-screen-state ${screenState}`}>
                            {/* モバイル専用メニューボタン */}
                            <button
                                className="plot-mobile-menu-btn"
                                onClick={() => setSidebarOpen(true)}
                                title="カードリストを開く"
                            >☰</button>
                            {screenState === 'typing' ? (
                                <span>✏ 入力中 — Alt+1〜4: キャスト挿入 | Alt+0: ナレーション | Alt+^: コメント | ESC: 抜ける</span>
                            ) : (
                                <span>◎ 待機中 — 変更は自動保存されます | Alt+A: サイドバー開閉</span>
                            )}
                        </div>

                        {/* コメント一覧バー */}
                        {comments.length > 0 && (
                            <div className="plot-comments-bar">
                                <span className="plot-comments-bar-label">// コメント</span>
                                {comments.map(c => (
                                    <button
                                        key={c.id}
                                        className="plot-comment-jump-btn"
                                        title={c.text || '(空)'}
                                        onClick={() => {
                                            const el = textareaRefs.current[c.id];
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                el.focus();
                                                setFocusedLineId(c.id);
                                                setScreenState('typing');
                                            }
                                        }}
                                    >
                                        {c.text ? c.text.slice(0, 18) : '(空)'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* エディターヘッダー */}
                        <div className="plot-editor-header">
                            <input
                                className="plot-title-input"
                                value={selectedCard.title}
                                onChange={e => updateCard(selectedCard.id, 'title', e.target.value)}
                                placeholder="プロットタイトルを入力..."
                            />
                            <button
                                className="plot-delete-card-btn"
                                onClick={() => deleteCard(selectedCard.id)}
                                title="このカードを削除"
                            >🗑</button>
                        </div>

                        {/* ── キャストスロット ── */}
                        <div className="plot-cast-section">
                            <div className="plot-cast-label">
                                CAST
                                <span className="plot-cast-hint">Alt+1〜4: 話者に挿入 | Alt+0: ナレーション</span>
                            </div>
                            <div className="plot-cast-slots">
                                {selectedCard.castSlots.map((name, slotIdx) => (
                                    <div key={slotIdx} className="plot-cast-slot-wrap" style={{ position: 'relative' }}>
                                        {name ? (
                                            <div className="plot-cast-slot filled">
                                                <span className="plot-cast-slot-num">{slotIdx + 1}</span>
                                                <span className="plot-cast-slot-name">{name}</span>
                                                <button
                                                    className="plot-cast-slot-clear"
                                                    onClick={() => setCastSlot(selectedCard.id, slotIdx, null)}
                                                    title="クリア"
                                                >×</button>
                                            </div>
                                        ) : (
                                            <button
                                                className="plot-cast-slot empty"
                                                onClick={() => openSlotMenu(slotIdx)}
                                                title="キャラを追加"
                                            >
                                                <span className="plot-cast-slot-num">{slotIdx + 1}</span>
                                                <span className="plot-cast-slot-plus">＋</span>
                                            </button>
                                        )}

                                        {slotPopup?.slotIdx === slotIdx && (
                                            <div className="plot-slot-popup" ref={popupRef}>
                                                {slotPopup.mode === 'menu' && (
                                                    <>
                                                        <p className="plot-slot-popup-title">登録方法を選択</p>
                                                        <button
                                                            className="plot-slot-popup-btn"
                                                            onClick={() => setSlotPopup({ ...slotPopup, mode: 'text' })}
                                                        >✏ 名前を直接入力</button>
                                                        <button
                                                            className="plot-slot-popup-btn"
                                                            onClick={() => setSlotPopup({ ...slotPopup, mode: 'list' })}
                                                        >📖 キャラクター図鑑から選択</button>
                                                    </>
                                                )}
                                                {slotPopup.mode === 'text' && (
                                                    <>
                                                        <p className="plot-slot-popup-title">
                                                            名前を入力
                                                            <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 6, fontFamily: 'monospace' }}>
                                                                Enter: 会話欄へ | Tab: 次のスロット
                                                            </span>
                                                        </p>
                                                        <input
                                                            className="plot-slot-text-input"
                                                            autoFocus
                                                            value={slotPopup.textInput}
                                                            onChange={e => setSlotPopup({ ...slotPopup, textInput: e.target.value })}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    confirmAndAdvance('enter');
                                                                } else if (e.key === 'Tab') {
                                                                    e.preventDefault();
                                                                    confirmAndAdvance('tab');
                                                                }
                                                            }}
                                                            placeholder="キャラクター名..."
                                                        />
                                                        <div className="plot-slot-popup-actions">
                                                            <button className="plot-slot-confirm-btn" onClick={() => confirmAndAdvance('enter')}>決定</button>
                                                            <button className="plot-slot-cancel-btn" onClick={() => setSlotPopup(null)}>キャンセル</button>
                                                        </div>
                                                    </>
                                                )}
                                                {slotPopup.mode === 'list' && (
                                                    <>
                                                        <p className="plot-slot-popup-title">キャラクターを選択</p>
                                                        <div className="plot-slot-char-list">
                                                            {allCharacters.map(ch => (
                                                                <button
                                                                    key={ch.id}
                                                                    className="plot-slot-char-item"
                                                                    onClick={() => {
                                                                        setCastSlot(selectedCard.id, slotPopup.slotIdx, ch.name);
                                                                        setSlotPopup(null);
                                                                    }}
                                                                >{ch.name}</button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* メタ情報バー */}
                        <div className="plot-meta-bar">
                            <div className="plot-meta-item">
                                <label className="plot-meta-label">ステータス</label>
                                <select
                                    className="plot-select"
                                    value={selectedCard.status}
                                    onChange={e => updateCard(selectedCard.id, 'status', e.target.value as PlotStatus)}
                                >
                                    {(Object.entries(STATUS_CONFIG) as [PlotStatus, typeof STATUS_CONFIG['idea']][]).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="plot-meta-item">
                                <label className="plot-meta-label">Episode</label>
                                <select
                                    className="plot-select"
                                    value={selectedCard.episodeId}
                                    onChange={e => handleEpisodeChange(e.target.value)}
                                >
                                    <option value="">-- 未割当 --</option>
                                    {episodes.map(ep => (
                                        <option key={ep.id} value={ep.id}>{ep.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="plot-meta-item">
                                <label className="plot-meta-label">Chapter</label>
                                <select
                                    className="plot-select"
                                    value={selectedCard.chapterId}
                                    onChange={e => updateCard(selectedCard.id, 'chapterId', e.target.value)}
                                    disabled={!selectedCard.episodeId}
                                >
                                    <option value="">-- 未割当 --</option>
                                    {chaptersForEpisode.map(ch => (
                                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="plot-meta-item plot-meta-scene">
                                <label className="plot-meta-label">シーンタグ</label>
                                <input
                                    className="plot-scene-input"
                                    value={selectedCard.sceneTag}
                                    onChange={e => updateCard(selectedCard.id, 'sceneTag', e.target.value)}
                                    placeholder="移動シーン、イベントトリガー等..."
                                />
                            </div>
                        </div>

                        {/* 会話ラインリスト */}
                        <div
                            className="plot-lines-container"
                            onDragLeave={e => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    setDropTargetIdx(null);
                                }
                            }}
                        >
                            {selectedCard.lines.map((line, idx) => {
                                const charLeft = TEXT_MAX_CHARS - line.text.length;
                                const isFocused = focusedLineId === line.id;
                                const isDragging = dragLineId === line.id;
                                return (
                                    <Fragment key={line.id}>
                                        {/* ドロップインジケーター（前） */}
                                        {dropTargetIdx === idx && dropPosition === 'before' && !isDragging && (
                                            <div className="plot-drop-indicator" />
                                        )}

                                        <div
                                            className={`plot-line ${isFocused ? 'focused' : ''} ${line.isComment ? 'is-comment' : ''} ${isDragging ? 'dragging' : ''}`}
                                            onDragOver={e => handleDragOver(e, idx)}
                                            onDrop={e => handleDrop(e, idx)}
                                        >
                                            {/* ── 上段: ヘッダー（話者 + ドラッグ + アクション） ── */}
                                            <div className="plot-line-header">
                                                <div
                                                    className="plot-line-drag-handle"
                                                    draggable
                                                    onDragStart={e => handleDragStart(e, line.id)}
                                                    onDragEnd={handleDragEnd}
                                                    title="ドラッグして並び替え"
                                                >
                                                    ⠿
                                                </div>

                                                {line.isComment ? (
                                                    <div className="plot-line-comment-label">// NOTE</div>
                                                ) : (
                                                    <input
                                                        className="plot-line-speaker"
                                                        value={line.speaker}
                                                        onChange={e => updateLine(selectedCard.id, line.id, 'speaker', e.target.value)}
                                                        onFocus={() => { setScreenState('typing'); setFocusedLineId(line.id); }}
                                                        onBlur={() => { setScreenState('default'); setFocusedLineId(null); }}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                textareaRefs.current[line.id]?.focus();
                                                            }
                                                        }}
                                                        placeholder="キャラ名"
                                                    />
                                                )}

                                                <div className="plot-line-actions">
                                                    <button className="plot-line-btn insert" onClick={() => insertLineAfter(selectedCard.id, idx)} title="この行の下に追加 (Ctrl+Enter)">＋</button>
                                                    <button className="plot-line-btn delete" onClick={() => deleteLine(selectedCard.id, line.id)} title="この行を削除">×</button>
                                                </div>
                                            </div>

                                            {/* ── 下段: ボディ（テキストエリア） ── */}
                                            <div className="plot-line-body">
                                                <div className="plot-line-text-wrap">
                                                    <textarea
                                                        ref={el => { textareaRefs.current[line.id] = el; }}
                                                        className={`plot-line-text ${line.isComment ? 'comment-text' : ''}`}
                                                        value={line.text}
                                                        onChange={e => {
                                                            if (e.target.value.length <= TEXT_MAX_CHARS) {
                                                                updateLine(selectedCard.id, line.id, 'text', e.target.value);
                                                            }
                                                        }}
                                                        onFocus={() => { setScreenState('typing'); setFocusedLineId(line.id); }}
                                                        onBlur={() => { setScreenState('default'); setFocusedLineId(null); }}
                                                        placeholder={line.isComment ? '// コメントを入力（会話ログには表示されません）' : '台詞・ト書き...'}
                                                        rows={line.isComment ? 2 : 3}
                                                        maxLength={TEXT_MAX_CHARS}
                                                        onKeyDown={e => {
                                                            if (e.ctrlKey && e.key === 'Enter') {
                                                                e.preventDefault();
                                                                insertLineAfter(selectedCard.id, idx);
                                                            }
                                                        }}
                                                    />
                                                    {!line.isComment && (
                                                        <span className={`plot-line-charcount ${charLeft <= 10 ? 'warn' : ''}`}>
                                                            {charLeft}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ドロップインジケーター（後） */}
                                        {dropTargetIdx === idx && dropPosition === 'after' && !isDragging && (
                                            <div className="plot-drop-indicator" />
                                        )}
                                    </Fragment>
                                );
                            })}
                        </div>

                        <div className="plot-add-line-bar">
                            <button
                                className="plot-add-line-btn"
                                onClick={() => insertLineAfter(selectedCard.id, selectedCard.lines.length - 1)}
                            >
                                ＋ 台詞を追加
                                <span className="plot-add-line-hint">Ctrl+Enter</span>
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
