// ============================================
// PlotNotebook - プロット手帳 v3 (Firestore + AI生成)
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import episodesData from '@/data/collection/episodes.json';
import characterData from '@/data/collection/characters.json';
import type { PlotCard, PlotLine, PlotStatus } from '@/core/services/PlotService';
import { loadPlots, savePlot, deletePlot } from '@/core/services/PlotService';
import { GeminiService } from '@/core/services/GeminiService';

// ── 型は PlotService から import ──────────────────────────────────────

type ScreenState = 'default' | 'typing';

interface SlotPopup {
    slotIdx: number;
    mode: 'menu' | 'text' | 'list';
    textInput: string;
}

// ── Constants ────────────────────────────────

const TEXT_MAX_CHARS = 60;

// ── Status Config ────────────────────────────

const STATUS_CONFIG: Record<PlotStatus, { label: string; bg: string; text: string; border: string }> = {
    idea:  { label: 'アイディア', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
    draft: { label: '下書き',     bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    fixed: { label: '確定',       bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/40' },
};

// ── Helpers ──────────────────────────────────

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── Component ────────────────────────────────

export function PlotNotebook() {
    const [cards, setCards] = useState<PlotCard[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [screenState, setScreenState] = useState<ScreenState>('default');
    const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

    const [slotPopup, setSlotPopup] = useState<SlotPopup | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

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

    // ── キャストスロット: Alt+1〜4 ──────────────────────────

    const handleAltShortcut = useCallback((slotIdx: number) => {
        if (!selectedCard || !focusedLineId) return;
        const name = selectedCard.castSlots[slotIdx];
        if (!name) return;
        setCards(prev => prev.map(c => {
            if (c.id !== selectedCard.id) return c;
            return { ...c, lines: c.lines.map(l => l.id === focusedLineId ? { ...l, speaker: name } : l) };
        }));
    }, [selectedCard, focusedLineId]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (screenState !== 'typing') return;
            if (!e.altKey) return;
            const idx = ['1','2','3','4'].indexOf(e.key);
            if (idx === -1) return;
            e.preventDefault();
            handleAltShortcut(idx);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [screenState, handleAltShortcut]);

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
        setTimeout(() => setFocusedLineId(newLine.id), 30);
    };

    const updateLine = (cardId: string, lineId: string, field: keyof PlotLine, value: string) => {
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

    const moveLine = (cardId: string, lineId: string, direction: 'up' | 'down') => {
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const lines = [...c.lines];
            const idx = lines.findIndex(l => l.id === lineId);
            const target = direction === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= lines.length) return c;
            [lines[idx], lines[target]] = [lines[target], lines[idx]];
            const updated = { ...c, lines };
            scheduleSave(updated);
            return updated;
        }));
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

    const confirmTextInput = () => {
        if (!slotPopup || !selectedCard) return;
        const name = slotPopup.textInput.trim();
        if (name) setCastSlot(selectedCard.id, slotPopup.slotIdx, name);
        setSlotPopup(null);
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
            // Firestoreに保存
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

    return (
        <div className="plot-notebook">

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
            <aside className="plot-sidebar">
                <div className="plot-sidebar-header">
                    <span className="plot-sidebar-title">プロット手帳</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                            className="plot-add-btn"
                            style={{ background: '#1d4ed8', borderColor: '#3b82f6', fontSize: '0.75rem' }}
                            onClick={() => setShowAIPanel(true)}
                            title="AIでプロットを2枚生成"
                        >✨ AI</button>
                        <button className="plot-add-btn" onClick={addCard}>＋ 新規</button>
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

            {/* ── 右: カードエディター ── */}
            <main className="plot-editor">
                {!selectedCard ? (
                    <div className="plot-no-selection">
                        <p>← カードを選択するか、「＋ 新規」または「✨ AI」で追加してください</p>
                    </div>
                ) : (
                    <>
                        <div className={`plot-screen-state ${screenState}`}>
                            {screenState === 'typing' ? (
                                <span>✏ 入力中 — Alt+1〜4 でキャスト名を挿入</span>
                            ) : (
                                <span>◎ 待機中 — 変更は自動保存されます</span>
                            )}
                        </div>

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
                                <span className="plot-cast-hint">Alt+1〜4 で話者に挿入</span>
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
                                                        <p className="plot-slot-popup-title">名前を入力</p>
                                                        <input
                                                            className="plot-slot-text-input"
                                                            autoFocus
                                                            value={slotPopup.textInput}
                                                            onChange={e => setSlotPopup({ ...slotPopup, textInput: e.target.value })}
                                                            onKeyDown={e => { if (e.key === 'Enter') confirmTextInput(); }}
                                                            placeholder="キャラクター名..."
                                                        />
                                                        <div className="plot-slot-popup-actions">
                                                            <button className="plot-slot-confirm-btn" onClick={confirmTextInput}>決定</button>
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
                        <div className="plot-lines-container">
                            {selectedCard.lines.map((line, idx) => {
                                const charLeft = TEXT_MAX_CHARS - line.text.length;
                                const isFocused = focusedLineId === line.id;
                                return (
                                    <div key={line.id} className={`plot-line ${isFocused ? 'focused' : ''}`}>
                                        <input
                                            className="plot-line-speaker"
                                            value={line.speaker}
                                            onChange={e => updateLine(selectedCard.id, line.id, 'speaker', e.target.value)}
                                            onFocus={() => { setScreenState('typing'); setFocusedLineId(line.id); }}
                                            onBlur={() => { setScreenState('default'); setFocusedLineId(null); }}
                                            placeholder="キャラ名"
                                        />
                                        <div className="plot-line-text-wrap">
                                            <textarea
                                                className="plot-line-text"
                                                value={line.text}
                                                onChange={e => {
                                                    if (e.target.value.length <= TEXT_MAX_CHARS) {
                                                        updateLine(selectedCard.id, line.id, 'text', e.target.value);
                                                    }
                                                }}
                                                onFocus={() => { setScreenState('typing'); setFocusedLineId(line.id); }}
                                                onBlur={() => { setScreenState('default'); setFocusedLineId(null); }}
                                                placeholder="台詞・ト書き... (60文字以内)"
                                                rows={3}
                                                maxLength={TEXT_MAX_CHARS}
                                                onKeyDown={e => {
                                                    if (e.ctrlKey && e.key === 'Enter') {
                                                        e.preventDefault();
                                                        insertLineAfter(selectedCard.id, idx);
                                                    }
                                                }}
                                            />
                                            <span className={`plot-line-charcount ${charLeft <= 10 ? 'warn' : ''}`}>
                                                {charLeft}
                                            </span>
                                        </div>
                                        <div className="plot-line-actions">
                                            <button className="plot-line-btn" onClick={() => moveLine(selectedCard.id, line.id, 'up')} disabled={idx === 0} title="上へ">▲</button>
                                            <button className="plot-line-btn" onClick={() => moveLine(selectedCard.id, line.id, 'down')} disabled={idx === selectedCard.lines.length - 1} title="下へ">▼</button>
                                            <button className="plot-line-btn insert" onClick={() => insertLineAfter(selectedCard.id, idx)} title="この行の下に追加">＋</button>
                                            <button className="plot-line-btn delete" onClick={() => deleteLine(selectedCard.id, line.id)} title="この行を削除">×</button>
                                        </div>
                                    </div>
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
