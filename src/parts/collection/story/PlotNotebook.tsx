// ============================================
// ScenarioMemo (PlotNotebook) v6
// cardType: 会話ログ / CHAT / CHOICE / STATE
// ============================================

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import episodesData from '@/data/collection/episodes.json';
import characterData from '@/data/collection/characters.json';
import type {
    PlotCard, PlotLine, PlotStatus,
    CardType, ChoiceData, ChoiceOption, StateData,
    FlagEntry, ParamEntry, OptionEffects,
} from '@/core/services/PlotService';
import { loadPlots, savePlot, deletePlot } from '@/core/services/PlotService';
import { GeminiService } from '@/core/services/GeminiService';
import { useGameStore } from '@/core/stores/gameStore';

// ── 定数 ──────────────────────────────────────

interface ScenarioMemoProps { onBack?: () => void; }
interface SlotPopup { slotIdx: number; searchText: string; }
type DropPosition = 'before' | 'after';

// ── 新規キャラ (localStorage) ──────────────────

interface NewChar { id: string; name: string; createdAt: number; seenAt: number | null; }
const NEW_CHARS_KEY    = 'plot_new_chars_v1';
const CHAR_TITLE_KEY   = 'char_title_map_v1';
const TITLE_DB_KEY     = 'tagsdb_titles_v1';
const loadNewChars   = (): NewChar[] => { try { const r = localStorage.getItem(NEW_CHARS_KEY);  return r ? JSON.parse(r) : []; } catch { return []; } };
const saveNewChars   = (v: NewChar[]) => { try { localStorage.setItem(NEW_CHARS_KEY, JSON.stringify(v)); } catch {} };
const loadCharTitleMap = (): Record<string, string> => { try { const r = localStorage.getItem(CHAR_TITLE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const loadTitleDB    = (): Array<{ id: string; title: string; status: string }> => { try { const r = localStorage.getItem(TITLE_DB_KEY); return r ? JSON.parse(r) : []; } catch { return []; } };

const TEXT_MAX_CHARS = 60;

const STATUS_CONFIG: Record<PlotStatus, { label: string; bg: string; text: string; border: string }> = {
    idea:  { label: 'アイディア', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
    draft: { label: '下書き',     bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    fixed: { label: '確定',       bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/40' },
};

const CARDTYPE_CONFIG: Record<CardType, { label: string; color: string }> = {
    log:    { label: 'Log',      color: '#6b7280' },
    chat:   { label: 'CHAT',    color: '#3b82f6' },
    choice: { label: 'CHOICE',  color: '#f59e0b' },
    state:  { label: 'STATE',   color: '#10b981' },
};

const FACE_LABELS: Record<string, string> = {
    standing_01: '通常', standing_02: '通常2',
    face_normal: '通常', face_smile: '笑顔', face_angry: '怒り',
    face_sad: '悲しみ', face_surprised: '驚き', face_thinking: '考え中',
    face_cry: '泣き顔', face_embarrassed: '照れ', face_shy: '恥ずかしい',
};

const getFaceLabel = (path: string) => {
    const key = path.split('/').pop()?.replace(/\.(png|jpg|webp)$/, '') ?? '';
    return FACE_LABELS[key] ?? key;
};

const imgSrc = (path: string) => `/src/assets/${path}`;
const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── デフォルトデータ ──────────────────────────

const defaultChoice = (): ChoiceData => ({
    question: { speaker: '', text: '' },
    options: [],
});

const defaultState = (): StateData => ({ flags: [], params: [] });

const defaultOption = (): ChoiceOption => ({
    id: genId(),
    label: '',
    next: '',
    effects: { flags: [], params: [] },
    result: { speaker: '', text: '' },
});

// ── CharacterData 型 ───────────────────────────

interface CharData {
    id: string;
    name: string;
    standing?: string[];
    image?: string;
}

// ============================================================
// メインコンポーネント
// ============================================================

export function PlotNotebook({ onBack }: ScenarioMemoProps = {}) {
    const setScreen = useGameStore(state => state.setScreen);
    const [cards, setCards] = useState<PlotCard[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
    const [slotPopup, setSlotPopup] = useState<SlotPopup | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [iconPickerLineId, setIconPickerLineId] = useState<string | null>(null);
    const [castTitleFilter, setCastTitleFilter] = useState<string | null>(null);
    const [localTitles]   = useState(() => loadTitleDB());
    const [charTitleMap]  = useState(() => loadCharTitleMap());
    const [newChars, setNewChars] = useState<NewChar[]>(() => loadNewChars());

    // ドラッグ状態
    const [dragLineId, setDragLineId] = useState<string | null>(null);
    const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>('after');

    const popupRef   = useRef<HTMLDivElement>(null);
    const iconPopRef = useRef<HTMLDivElement>(null);
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
    const pendingFocusRef = useRef<string | null>(null);

    // AI生成UI
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');

    const episodes = episodesData.episodes;
    const staticChars: CharData[] = (characterData as any).characters ?? [];
    const allCharacters: CharData[] = [
        ...staticChars,
        ...newChars.map(nc => ({ id: nc.id, name: nc.name })),
    ];
    const selectedCard = cards.find(c => c.id === selectedId) ?? null;
    const effectiveCardType: CardType = selectedCard?.cardType ?? 'log';

    // ── フォーカス追跡 ──────────────────────────
    useEffect(() => {
        if (!pendingFocusRef.current) return;
        const el = textareaRefs.current[pendingFocusRef.current];
        if (el) { el.focus(); pendingFocusRef.current = null; }
    });

    // ── Firestore 初回読み込み ──────────────────
    useEffect(() => {
        loadPlots()
            .then(loaded => {
                setCards(loaded);
                if (loaded.length > 0) setSelectedId(loaded[0].id);
            })
            .catch(err => console.error('Firestore load error:', err))
            .finally(() => setIsLoading(false));
    }, []);

    // ── debounce 保存 ───────────────────────────
    const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const scheduleSave = useCallback((card: PlotCard) => {
        clearTimeout(saveTimers.current[card.id]);
        saveTimers.current[card.id] = setTimeout(() => {
            savePlot(card).catch(err => console.error('Firestore save error:', err));
        }, 800);
    }, []);

    // ── popup 外クリックで閉じる ─────────────────
    useEffect(() => {
        if (!slotPopup) return;
        const h = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) setSlotPopup(null);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [slotPopup]);

    useEffect(() => {
        if (!iconPickerLineId) return;
        const h = (e: MouseEvent) => {
            if (iconPopRef.current && !iconPopRef.current.contains(e.target as Node)) setIconPickerLineId(null);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [iconPickerLineId]);

    // ── face サイクル ──────────────────────────
    const cycleFace = useCallback((lineId: string, direction: number) => {
        if (!selectedCard) return;
        const line = selectedCard.lines.find(l => l.id === lineId);
        if (!line) return;
        const char = allCharacters.find(c => c.name === line.speaker);
        const standings = char?.standing ?? [];
        if (standings.length === 0) return;
        const cur = line.face ? standings.indexOf(line.face) : 0;
        const next = ((cur + direction) + standings.length) % standings.length;
        setCards(prev => prev.map(c => {
            if (c.id !== selectedCard.id) return c;
            const updated = { ...c, lines: c.lines.map(l => l.id === lineId ? { ...l, face: standings[next] } : l) };
            scheduleSave(updated);
            return updated;
        }));
    }, [selectedCard, allCharacters, scheduleSave]);

    // ── キャストスロットショートカット ──────────
    const handleAltShortcut = useCallback((slotIdx: number | 'narration') => {
        if (!selectedCard || !focusedLineId) return;
        const name = slotIdx === 'narration' ? '' : selectedCard.castSlots[slotIdx];
        if (slotIdx !== 'narration' && !name) return;
        setCards(prev => prev.map(c => {
            if (c.id !== selectedCard.id) return c;
            return { ...c, lines: c.lines.map(l => l.id === focusedLineId ? { ...l, speaker: name ?? '' } : l) };
        }));
    }, [selectedCard, focusedLineId]);

    // ── キーボードハンドラー ────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && !focusedLineId) {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }
            if (!e.altKey) return;

            // CHAT モード: Alt+A=次(右) / Alt+D=前(左)
            if (effectiveCardType === 'chat' && focusedLineId) {
                if (e.key === 'a' || e.key === 'A') { e.preventDefault(); cycleFace(focusedLineId, 1);  return; }
                if (e.key === 'd' || e.key === 'D') { e.preventDefault(); cycleFace(focusedLineId, -1); return; }
            }

            // Alt+A: サイドバー開閉
            if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }

            if (!focusedLineId) return;
            if (e.key === '0') { e.preventDefault(); handleAltShortcut('narration'); return; }
            const idx = ['1', '2', '3', '4'].indexOf(e.key);
            if (idx !== -1) { e.preventDefault(); handleAltShortcut(idx); return; }
            if (e.key === '^') {
                e.preventDefault();
                if (selectedCard && focusedLineId) {
                    const li = selectedCard.lines.findIndex(l => l.id === focusedLineId);
                    insertCommentAfter(selectedCard.id, li >= 0 ? li : selectedCard.lines.length - 1);
                }
                return;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [focusedLineId, handleAltShortcut, selectedCard, effectiveCardType, cycleFace]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { (document.activeElement as HTMLElement)?.blur(); setFocusedLineId(null); }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);

    // ── カード操作 ─────────────────────────────
    const addCard = () => {
        const newCard: PlotCard = {
            id: genId(), title: '新しいシーン', status: 'idea',
            cardType: 'log',
            episodeId: '', chapterId: '', sceneTag: '',
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

    // ── キャストスロット ───────────────────────
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

    // ── ライン操作 ─────────────────────────────
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
        pendingFocusRef.current = newLine.id;
        setFocusedLineId(newLine.id);
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
    };

    const updateLine = (cardId: string, lineId: string, patch: Partial<PlotLine>) => {
        setCards(prev => prev.map(c => {
            if (c.id !== cardId) return c;
            const updated = { ...c, lines: c.lines.map(l => l.id === lineId ? { ...l, ...patch } : l) };
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

    // ── CHOICE 操作 ────────────────────────────
    const getChoiceData = () => selectedCard?.choiceData ?? defaultChoice();

    const updateChoiceData = (patch: Partial<ChoiceData>) => {
        if (!selectedCard) return;
        const next = { ...getChoiceData(), ...patch };
        updateCard(selectedCard.id, 'choiceData', next);
    };

    const addOption = () => {
        const cd = getChoiceData();
        updateChoiceData({ options: [...cd.options, defaultOption()] });
    };

    const removeOption = (idx: number) => {
        const cd = getChoiceData();
        updateChoiceData({ options: cd.options.filter((_, i) => i !== idx) });
    };

    const updateOption = (idx: number, patch: Partial<ChoiceOption>) => {
        const cd = getChoiceData();
        const opts = cd.options.map((o, i) => i === idx ? { ...o, ...patch } : o);
        updateChoiceData({ options: opts });
    };

    const updateOptionEffects = (optIdx: number, patch: Partial<OptionEffects>) => {
        const cd = getChoiceData();
        const opts = cd.options.map((o, i) => i === optIdx ? { ...o, effects: { ...o.effects, ...patch } } : o);
        updateChoiceData({ options: opts });
    };

    // ── STATE 操作 ─────────────────────────────
    const getStateData = () => selectedCard?.stateData ?? defaultState();

    const updateStateData = (patch: Partial<StateData>) => {
        if (!selectedCard) return;
        const next = { ...getStateData(), ...patch };
        updateCard(selectedCard.id, 'stateData', next);
    };

    const addFlag  = () => updateStateData({ flags:  [...getStateData().flags,  { id: genId(), key: '', value: false }] });
    const addParam = () => updateStateData({ params: [...getStateData().params, { id: genId(), key: '', value: 0 }] });

    const updateFlag  = (id: string, patch: Partial<FlagEntry>)  => updateStateData({ flags:  getStateData().flags.map(f => f.id === id ? { ...f, ...patch } : f) });
    const updateParam = (id: string, patch: Partial<ParamEntry>) => updateStateData({ params: getStateData().params.map(p => p.id === id ? { ...p, ...patch } : p) });
    const removeFlag  = (id: string) => updateStateData({ flags:  getStateData().flags.filter(f => f.id !== id) });
    const removeParam = (id: string) => updateStateData({ params: getStateData().params.filter(p => p.id !== id) });

    // CHOICE option の flags/params 操作
    const addOptFlag   = (optIdx: number) => updateOptionEffects(optIdx, { flags:  [...(getChoiceData().options[optIdx]?.effects.flags  ?? []), { id: genId(), key: '', value: false }] });
    const addOptParam  = (optIdx: number) => updateOptionEffects(optIdx, { params: [...(getChoiceData().options[optIdx]?.effects.params ?? []), { id: genId(), key: '', value: 0 }] });
    const updateOptFlag   = (optIdx: number, id: string, patch: Partial<FlagEntry>)  => updateOptionEffects(optIdx, { flags:  getChoiceData().options[optIdx].effects.flags.map(f  => f.id === id ? { ...f, ...patch } : f) });
    const updateOptParam  = (optIdx: number, id: string, patch: Partial<ParamEntry>) => updateOptionEffects(optIdx, { params: getChoiceData().options[optIdx].effects.params.map(p => p.id === id ? { ...p, ...patch } : p) });
    const removeOptFlag   = (optIdx: number, id: string) => updateOptionEffects(optIdx, { flags:  getChoiceData().options[optIdx].effects.flags.filter(f  => f.id !== id) });
    const removeOptParam  = (optIdx: number, id: string) => updateOptionEffects(optIdx, { params: getChoiceData().options[optIdx].effects.params.filter(p => p.id !== id) });

    // ── ドラッグ＆ドロップ ─────────────────────
    const handleDragStart = (e: React.DragEvent, lineId: string) => { setDragLineId(lineId); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver  = (e: React.DragEvent, idx: number) => {
        e.preventDefault(); e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDropTargetIdx(idx);
        setDropPosition(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after');
    };
    const handleDrop = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (!dragLineId || !selectedCard) { setDragLineId(null); setDropTargetIdx(null); return; }
        const lines = [...selectedCard.lines];
        const dragIdx = lines.findIndex(l => l.id === dragLineId);
        if (dragIdx === -1) { setDragLineId(null); setDropTargetIdx(null); return; }
        let insertAt = dropPosition === 'before' ? dropIdx : dropIdx + 1;
        const [dragged] = lines.splice(dragIdx, 1);
        if (dragIdx < insertAt) insertAt--;
        lines.splice(Math.max(0, insertAt), 0, dragged);
        updateCard(selectedCard.id, 'lines', lines);
        setDragLineId(null); setDropTargetIdx(null);
    };
    const handleDragEnd = () => { setDragLineId(null); setDropTargetIdx(null); };

    // ── Episode / Chapter ────────────────────────
    const handleEpisodeChange = (episodeId: string) => {
        if (!selectedCard) return;
        updateCard(selectedCard.id, 'episodeId', episodeId);
        updateCard(selectedCard.id, 'chapterId', '');
    };
    const chaptersForEpisode = episodes.find(e => e.id === selectedCard?.episodeId)?.chapters ?? [];

    // ── スロット Popup ───────────────────────────
    const openSlotMenu = (slotIdx: number) => setSlotPopup({ slotIdx, searchText: '' });

    // タイトルフィルター適用後の検索
    const filteredCharsForSlot = (searchText: string): CharData[] => {
        let chars = allCharacters;
        if (castTitleFilter) chars = chars.filter(c => charTitleMap[c.id] === castTitleFilter);
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            chars = chars.filter(c => c.name.toLowerCase().includes(q));
        }
        return chars;
    };

    const selectCharForSlot = (name: string, slotIdx: number) => {
        if (!selectedCard) return;
        setCastSlot(selectedCard.id, slotIdx, name);
        setSlotPopup(null);
    };

    const createAndSelectChar = (name: string, slotIdx: number) => {
        if (!selectedCard || !name.trim()) return;
        const trimmed = name.trim();
        const alreadyInStatic = staticChars.some(c => c.name === trimmed);
        const alreadyInNew    = newChars.some(c => c.name === trimmed);
        if (!alreadyInStatic && !alreadyInNew) {
            const entry: NewChar = { id: `new_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, name: trimmed, createdAt: Date.now(), seenAt: null };
            const updated = [...newChars, entry];
            saveNewChars(updated);
            setNewChars(updated);
        }
        setCastSlot(selectedCard.id, slotIdx, trimmed);
        setSlotPopup(null);
    };

    // ── AI 生成 ───────────────────────────────────
    const handleAIGenerate = async () => {
        if (!aiInput.trim()) return;
        setIsGenerating(true); setAiError('');
        try {
            const generated = await GeminiService.generatePlotCards(aiInput.trim());
            setCards(prev => [...generated, ...prev]);
            if (generated.length > 0) setSelectedId(generated[0].id);
            await Promise.all(generated.map(c => savePlot(c)));
            setShowAIPanel(false); setAiInput('');
        } catch (err: any) {
            setAiError(err?.message ?? 'AI生成に失敗しました');
        } finally {
            setIsGenerating(false);
        }
    };

    // ── ローディング ──────────────────────────────
    if (isLoading) {
        return (
            <div className="plot-notebook" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#9ca3af' }}>Firestoreから読み込み中...</p>
            </div>
        );
    }

    const comments  = selectedCard?.lines.filter(l => l.isComment) ?? [];
    const isEditing = !!focusedLineId;

    // ============================================================
    // ラインエディター（会話ログ / CHAT 共通）
    // ============================================================
    const renderLinesEditor = () => {
        if (!selectedCard) return null;
        const isChat = effectiveCardType === 'chat';

        return (
            <>
                <div
                    className="plot-lines-container"
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTargetIdx(null); }}
                >
                    {selectedCard.lines.map((line, idx) => {
                        const charLeft  = TEXT_MAX_CHARS - line.text.length;
                        const isFocused = focusedLineId === line.id;
                        const isDragging = dragLineId === line.id;
                        const char = isChat ? allCharacters.find(c => c.name === line.speaker) : undefined;
                        const standings = char?.standing ?? [];
                        const currentFaceLabel = line.face ? getFaceLabel(line.face) : (standings[0] ? getFaceLabel(standings[0]) : '');

                        return (
                            <Fragment key={line.id}>
                                {dropTargetIdx === idx && dropPosition === 'before' && !isDragging && (
                                    <div className="plot-drop-indicator" />
                                )}

                                <div
                                    className={`plot-line ${isFocused ? 'focused' : ''} ${line.isComment ? 'is-comment' : ''} ${isDragging ? 'dragging' : ''}`}
                                    onDragOver={e => handleDragOver(e, idx)}
                                    onDrop={e => handleDrop(e, idx)}
                                >
                                    {/* Log: 横並び（drag + speaker + textarea + actions） */}
                                    {!isChat ? (
                                        <div className="plot-line-body" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                            <div className="plot-line-drag-handle" draggable onDragStart={e => handleDragStart(e, line.id)} onDragEnd={handleDragEnd} title="ドラッグして並び替え" style={{ marginTop: 6 }}>⠿</div>
                                            {line.isComment ? (
                                                <div className="plot-line-comment-label" style={{ flex: '0 0 100px', marginTop: 6 }}>// NOTE</div>
                                            ) : (
                                                <input
                                                    className="plot-line-speaker"
                                                    style={{ flex: '0 0 110px' }}
                                                    value={line.speaker}
                                                    onChange={e => updateLine(selectedCard.id, line.id, { speaker: e.target.value })}
                                                    onFocus={() => setFocusedLineId(line.id)}
                                                    onBlur={() => setFocusedLineId(null)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); textareaRefs.current[line.id]?.focus(); } }}
                                                    placeholder="キャラ名"
                                                />
                                            )}
                                            <div className="plot-line-text-wrap" style={{ flex: 1 }}>
                                                <textarea
                                                    ref={el => { textareaRefs.current[line.id] = el; }}
                                                    className={`plot-line-text ${line.isComment ? 'comment-text' : ''}`}
                                                    value={line.text}
                                                    onChange={e => { if (e.target.value.length <= TEXT_MAX_CHARS) updateLine(selectedCard.id, line.id, { text: e.target.value }); }}
                                                    onFocus={() => setFocusedLineId(line.id)}
                                                    onBlur={() => setFocusedLineId(null)}
                                                    placeholder={line.isComment ? '// コメントを入力' : '台詞・ト書き...'}
                                                    rows={3}
                                                    maxLength={TEXT_MAX_CHARS}
                                                    style={{ resize: 'none', overflowY: 'hidden' }}
                                                    onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); insertLineAfter(selectedCard.id, idx); } }}
                                                />
                                                {!line.isComment && <span className={`plot-line-charcount ${TEXT_MAX_CHARS - line.text.length <= 10 ? 'warn' : ''}`}>{TEXT_MAX_CHARS - line.text.length}</span>}
                                            </div>
                                            <div className="plot-line-actions" style={{ marginTop: 4 }}>
                                                <button className="plot-line-btn insert" onClick={() => insertLineAfter(selectedCard.id, idx)}>＋</button>
                                                <button className="plot-line-btn delete" onClick={() => deleteLine(selectedCard.id, line.id)}>×</button>
                                            </div>
                                        </div>
                                    ) : (
                                    <>
                                    {/* CHAT: 上段 + 下段（アイコンあり） */}
                                    <div className="plot-line-header">
                                        <div className="plot-line-drag-handle" draggable onDragStart={e => handleDragStart(e, line.id)} onDragEnd={handleDragEnd} title="ドラッグして並び替え">⠿</div>

                                        {line.isComment ? (
                                            <div className="plot-line-comment-label">// NOTE</div>
                                        ) : (
                                            <input
                                                className="plot-line-speaker"
                                                value={line.speaker}
                                                onChange={e => updateLine(selectedCard.id, line.id, { speaker: e.target.value })}
                                                onFocus={() => setFocusedLineId(line.id)}
                                                onBlur={() => setFocusedLineId(null)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); textareaRefs.current[line.id]?.focus(); } }}
                                                placeholder="キャラ名"
                                            />
                                        )}

                                        <div className="plot-line-actions">
                                            <button className="plot-line-btn insert" onClick={() => insertLineAfter(selectedCard.id, idx)}>＋</button>
                                            <button className="plot-line-btn delete" onClick={() => deleteLine(selectedCard.id, line.id)}>×</button>
                                        </div>
                                    </div>

                                    {/* 下段: アイコン（CHAT）+ テキスト */}
                                    <div className="plot-line-body" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>

                                        {/* CHAT: キャラアイコンウィンドウ */}
                                        {isChat && !line.isComment && (
                                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                                <button
                                                    title="アイコン変更 ({キーで切り替え)"
                                                    onClick={() => setIconPickerLineId(iconPickerLineId === line.id ? null : line.id)}
                                                    style={{
                                                        width: 48, height: 48,
                                                        border: '1px solid #374151', borderRadius: 6,
                                                        background: '#111827', cursor: 'pointer',
                                                        overflow: 'hidden', padding: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >
                                                    {line.icon || char?.image ? (
                                                        <img
                                                            src={imgSrc(line.icon || char?.image || '')}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <span style={{ color: '#4b5563', fontSize: 18 }}>
                                                            {line.speaker ? line.speaker[0] : '？'}
                                                        </span>
                                                    )}
                                                </button>

                                                {/* アイコンピッカー */}
                                                {iconPickerLineId === line.id && standings.length > 0 && (
                                                    <div
                                                        ref={iconPopRef}
                                                        style={{
                                                            position: 'absolute', top: 52, left: 0, zIndex: 100,
                                                            background: '#1f2937', border: '1px solid #374151',
                                                            borderRadius: 8, padding: '0.5rem',
                                                            display: 'flex', gap: 4, flexWrap: 'wrap',
                                                            width: 200,
                                                        }}
                                                    >
                                                        {standings.map((path, si) => (
                                                            <button
                                                                key={si}
                                                                title={getFaceLabel(path)}
                                                                onClick={() => {
                                                                    updateLine(selectedCard.id, line.id, { icon: path, face: path });
                                                                    setIconPickerLineId(null);
                                                                }}
                                                                style={{
                                                                    width: 44, height: 44, padding: 0,
                                                                    border: line.face === path ? '2px solid #3b82f6' : '1px solid #374151',
                                                                    borderRadius: 4, overflow: 'hidden',
                                                                    background: '#111827', cursor: 'pointer',
                                                                }}
                                                            >
                                                                <img src={imgSrc(path)} alt={getFaceLabel(path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* テキストエリア */}
                                        <div className="plot-line-text-wrap" style={{ flex: 1 }}>
                                            <textarea
                                                ref={el => { textareaRefs.current[line.id] = el; }}
                                                className={`plot-line-text ${line.isComment ? 'comment-text' : ''}`}
                                                value={line.text}
                                                onChange={e => {
                                                    if (e.target.value.length <= TEXT_MAX_CHARS)
                                                        updateLine(selectedCard.id, line.id, { text: e.target.value });
                                                }}
                                                onFocus={() => setFocusedLineId(line.id)}
                                                onBlur={() => setFocusedLineId(null)}
                                                placeholder={line.isComment ? '// コメントを入力' : '台詞・ト書き...'}
                                                rows={3}
                                                maxLength={TEXT_MAX_CHARS}
                                                style={{ resize: 'none', overflowY: 'hidden' }}
                                                onKeyDown={e => {
                                                    // { キー: CHAT アイコンピッカー
                                                    if (isChat && e.key === '{') {
                                                        e.preventDefault();
                                                        setIconPickerLineId(prev => prev === line.id ? null : line.id);
                                                        return;
                                                    }
                                                    if (e.ctrlKey && e.key === 'Enter') {
                                                        e.preventDefault();
                                                        insertLineAfter(selectedCard.id, idx);
                                                    }
                                                }}
                                            />
                                            {/* CHAT: 表情差分ラベル */}
                                            {isChat && !line.isComment && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                    <span style={{ color: '#4b5563', fontSize: '0.7rem' }}>表情</span>
                                                    <span style={{
                                                        fontSize: '0.72rem', color: '#60a5fa',
                                                        background: '#1e3a5f', padding: '1px 6px', borderRadius: 4,
                                                        minWidth: 40, textAlign: 'center',
                                                    }}>
                                                        {currentFaceLabel || '—'}
                                                    </span>
                                                    {standings.length > 1 && (
                                                        <span style={{ color: '#4b5563', fontSize: '0.65rem' }}>Alt+A:次 / Alt+D:前</span>
                                                    )}
                                                </div>
                                            )}
                                            {!line.isComment && (
                                                <span className={`plot-line-charcount ${charLeft <= 10 ? 'warn' : ''}`}>{charLeft}</span>
                                            )}
                                        </div>
                                    </div>
                                    </>
                                    )}
                                </div>

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
        );
    };

    // ============================================================
    // CHOICE エディター
    // ============================================================
    const renderChoiceEditor = () => {
        const cd = getChoiceData();
        const fieldStyle: React.CSSProperties = {
            background: '#111827', border: '1px solid #374151', borderRadius: 6,
            color: '#f0e6d3', padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%',
        };
        const labelStyle: React.CSSProperties = { color: '#6b7280', fontSize: '0.72rem', marginBottom: 2 };
        const sectionStyle: React.CSSProperties = {
            background: '#1a2233', border: '1px solid #2d3748', borderRadius: 8,
            padding: '0.75rem', marginBottom: '0.75rem',
        };

        return (
            <div style={{ padding: '0.75rem', overflowY: 'auto' }}>

                {/* 問い */}
                <div style={sectionStyle}>
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>📢 問い (Question)</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div style={{ flex: '0 0 120px' }}>
                            <div style={labelStyle}>Speaker</div>
                            <input style={fieldStyle} value={cd.question.speaker} onChange={e => updateChoiceData({ question: { ...cd.question, speaker: e.target.value } })} placeholder="キャラ名" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={labelStyle}>Text</div>
                            <input style={fieldStyle} value={cd.question.text} onChange={e => updateChoiceData({ question: { ...cd.question, text: e.target.value } })} placeholder="問いかけの台詞..." />
                        </div>
                    </div>
                </div>

                {/* 選択肢リスト */}
                {cd.options.map((opt, optIdx) => (
                    <div key={opt.id} style={{ ...sectionStyle, borderColor: '#3b4a6b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 700 }}>🔀 選択肢 {optIdx + 1}</div>
                            <button onClick={() => removeOption(optIdx)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>×</button>
                        </div>

                        {/* ラベル + 遷移先 */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={labelStyle}>ラベル</div>
                                <input style={fieldStyle} value={opt.label} onChange={e => updateOption(optIdx, { label: e.target.value })} placeholder="ボタンに表示するテキスト" />
                            </div>
                            <div style={{ flex: '0 0 120px' }}>
                                <div style={labelStyle}>遷移先 (next)</div>
                                <input style={fieldStyle} value={opt.next ?? ''} onChange={e => updateOption(optIdx, { next: e.target.value })} placeholder="EV_010" />
                            </div>
                        </div>

                        {/* Effects */}
                        <div style={{ background: '#0f1724', borderRadius: 6, padding: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.4rem' }}>⚡ Effects</div>

                            {/* flags */}
                            <div style={{ marginBottom: '0.4rem' }}>
                                <div style={{ ...labelStyle, color: '#a78bfa' }}>FLAGS</div>
                                {opt.effects.flags.map(f => (
                                    <div key={f.id} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 3 }}>
                                        <input type="checkbox" checked={f.value} onChange={e => updateOptFlag(optIdx, f.id, { value: e.target.checked })} />
                                        <input style={{ ...fieldStyle, flex: 1 }} value={f.key} onChange={e => updateOptFlag(optIdx, f.id, { key: e.target.value })} placeholder="フラグ名" />
                                        <button onClick={() => removeOptFlag(optIdx, f.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => addOptFlag(optIdx)} style={{ fontSize: '0.72rem', color: '#a78bfa', background: 'none', border: '1px dashed #4c3a7a', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>＋ フラグ</button>
                            </div>

                            {/* params */}
                            <div>
                                <div style={{ ...labelStyle, color: '#fbbf24' }}>PARAMS</div>
                                {opt.effects.params.map(p => (
                                    <div key={p.id} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 3 }}>
                                        <input style={{ ...fieldStyle, flex: 1 }} value={p.key} onChange={e => updateOptParam(optIdx, p.id, { key: e.target.value })} placeholder="パラメータ名" />
                                        <input type="number" style={{ ...fieldStyle, width: 70 }} value={p.value} onChange={e => updateOptParam(optIdx, p.id, { value: Number(e.target.value) })} />
                                        <button onClick={() => removeOptParam(optIdx, p.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => addOptParam(optIdx)} style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'none', border: '1px dashed #7a5c1a', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>＋ パラメータ</button>
                            </div>
                        </div>

                        {/* Result */}
                        <div>
                            <div style={{ ...labelStyle, color: '#94a3b8' }}>Result（任意）</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input style={{ ...fieldStyle, flex: '0 0 100px' }} value={opt.result.speaker} onChange={e => updateOption(optIdx, { result: { ...opt.result, speaker: e.target.value } })} placeholder="Speaker" />
                                <input style={{ ...fieldStyle, flex: 1 }} value={opt.result.text} onChange={e => updateOption(optIdx, { result: { ...opt.result, text: e.target.value } })} placeholder="結果テキスト..." />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addOption}
                    style={{
                        width: '100%', background: 'rgba(59,130,246,0.1)', border: '1px dashed #3b82f6',
                        color: '#93c5fd', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', fontSize: '0.85rem',
                    }}
                >
                    ＋ 選択肢を追加
                </button>
            </div>
        );
    };

    // ============================================================
    // STATE エディター
    // ============================================================
    const renderStateEditor = () => {
        const sd = getStateData();
        const fieldStyle: React.CSSProperties = {
            background: '#111827', border: '1px solid #374151', borderRadius: 6,
            color: '#f0e6d3', padding: '0.4rem 0.6rem', fontSize: '0.85rem',
        };
        const sectionStyle: React.CSSProperties = {
            background: '#1a2233', border: '1px solid #2d3748', borderRadius: 8,
            padding: '0.75rem', marginBottom: '0.75rem',
        };

        return (
            <div style={{ padding: '0.75rem', overflowY: 'auto' }}>

                {/* FLAGS */}
                <div style={sectionStyle}>
                    <div style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>☑ FLAGS</div>
                    {sd.flags.map(f => (
                        <div key={f.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                            <input
                                type="checkbox" checked={f.value}
                                onChange={e => updateFlag(f.id, { value: e.target.checked })}
                                style={{ accentColor: '#a78bfa', width: 16, height: 16, cursor: 'pointer' }}
                            />
                            <input
                                style={{ ...fieldStyle, flex: 1 }} value={f.key}
                                onChange={e => updateFlag(f.id, { key: e.target.value })}
                                placeholder="フラグ名 (例: brave)"
                            />
                            <span style={{ fontSize: '0.72rem', color: f.value ? '#a78bfa' : '#4b5563', minWidth: 36, textAlign: 'center' }}>
                                {f.value ? 'true' : 'false'}
                            </span>
                            <button onClick={() => removeFlag(f.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>×</button>
                        </div>
                    ))}
                    <button onClick={addFlag} style={{ marginTop: 4, fontSize: '0.75rem', color: '#a78bfa', background: 'none', border: '1px dashed #4c3a7a', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                        ＋ フラグを追加
                    </button>
                </div>

                {/* PARAMS */}
                <div style={sectionStyle}>
                    <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>🔢 PARAMS</div>
                    {sd.params.map(p => (
                        <div key={p.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                            <input
                                style={{ ...fieldStyle, flex: 1 }} value={p.key}
                                onChange={e => updateParam(p.id, { key: e.target.value })}
                                placeholder="パラメータ名 (例: courage)"
                            />
                            <input
                                type="number"
                                style={{ ...fieldStyle, width: 80 }} value={p.value}
                                onChange={e => updateParam(p.id, { value: Number(e.target.value) })}
                            />
                            <button onClick={() => removeParam(p.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>×</button>
                        </div>
                    ))}
                    <button onClick={addParam} style={{ marginTop: 4, fontSize: '0.75rem', color: '#fbbf24', background: 'none', border: '1px dashed #7a5c1a', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                        ＋ パラメータを追加
                    </button>
                </div>
            </div>
        );
    };

    // ============================================================
    // Render
    // ============================================================
    return (
        <div className="plot-notebook">

            {sidebarOpen && <div className="plot-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

            {/* AI生成パネル */}
            {showAIPanel && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, padding: '1.5rem', width: 'min(480px, 90vw)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ color: '#facc15', margin: 0, fontSize: '1rem' }}>✨ AI シーン生成</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>ストーリーの概要・シチュエーションを入力すると、シーンカードを2枚生成します。</p>
                        <textarea value={aiInput} onChange={e => setAiInput(e.target.value)}
                            placeholder="例：主人公とヒロインが森の遺跡で古代の扉を発見する。扉を開けるか迷うシーン。"
                            rows={5} style={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f0e6d3', padding: '0.75rem', fontSize: '0.9rem', resize: 'vertical' }}
                        />
                        {aiError && <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>{aiError}</p>}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setShowAIPanel(false); setAiError(''); }} style={{ background: 'transparent', border: '1px solid #374151', color: '#6b7280', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer' }}>キャンセル</button>
                            <button onClick={handleAIGenerate} disabled={isGenerating || !aiInput.trim()} style={{ background: isGenerating ? '#92400e' : '#ca8a04', border: 'none', color: '#111827', fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: 6, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: !aiInput.trim() ? 0.5 : 1 }}>
                                {isGenerating ? '生成中...' : '✨ 2枚生成'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 左: カードリスト */}
            <aside className={`plot-sidebar ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="plot-sidebar-header">
                    <span className="plot-sidebar-title">シナリオメモ</span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className="plot-add-btn" style={{ background: '#1d4ed8', borderColor: '#3b82f6', fontSize: '0.75rem' }} onClick={() => setShowAIPanel(true)}>✨ AI</button>
                        <button className="plot-add-btn" onClick={addCard}>＋ 新規</button>
                        <button className="plot-sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
                    </div>
                </div>

                <div className="plot-card-list">
                    {cards.length === 0 && <p className="plot-empty">カードがありません</p>}
                    {cards.map(card => {
                        const s = STATUS_CONFIG[card.status];
                        const ct = CARDTYPE_CONFIG[card.cardType ?? 'log'];
                        const isActive = card.id === selectedId;
                        const epLabel = episodes.find(e => e.id === card.episodeId)?.title.split(':')[0] ?? '未割当';
                        return (
                            <div key={card.id} className={`plot-card-item ${isActive ? 'active' : ''}`} onClick={() => setSelectedId(card.id)}>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 2 }}>
                                    <span style={{ fontSize: '0.65rem', color: ct.color, background: `${ct.color}20`, border: `1px solid ${ct.color}40`, borderRadius: 3, padding: '1px 5px' }}>{ct.label}</span>
                                    <div className="plot-card-item-title" style={{ flex: 1 }}>{card.title}</div>
                                </div>
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
            <button className="plot-sidebar-toggle-btn" onClick={() => setSidebarOpen(prev => !prev)} title={`サイドバーを${sidebarOpen ? '閉じる' : '開く'} (TAB / Alt+A)`}>
                {sidebarOpen ? '◀' : '▶'}
            </button>

            {/* 右: カードエディター */}
            <main className="plot-editor">
                {!selectedCard ? (
                    <div className="plot-no-selection">
                        <button className="plot-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                        <p>← カードを選択するか、「＋ 新規」または「✨ AI」で追加してください</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {onBack && <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #374151', color: '#9ca3af', padding: '0.45rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>← 前の画面に戻る</button>}
                            <button onClick={() => setScreen('TITLE')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #374151', color: '#9ca3af', padding: '0.45rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Titleへ戻る</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ステート表示バー */}
                        <div className={`plot-screen-state ${isEditing ? 'typing' : 'default'}`}>
                            <button className="plot-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                            {effectiveCardType === 'chat' && isEditing ? (
                                <span>{'✏ CHAT入力中 — Alt+A:次の表情 | Alt+D:前の表情 | {:アイコン切替 | ESC:抜ける'}</span>
                            ) : isEditing ? (
                                <span>✏ 入力中 — Alt+1〜4: キャスト挿入 | Alt+0: ナレーション | Alt+^: コメント | ESC: 抜ける</span>
                            ) : (
                                <span>◎ 待機中 — TAB / Alt+A: サイドバー開閉 | 変更は自動保存</span>
                            )}
                        </div>

                        {/* コメント一覧バー（LOG/CHAT のみ） */}
                        {(effectiveCardType === 'log' || effectiveCardType === 'chat') && comments.length > 0 && (
                            <div className="plot-comments-bar">
                                <span className="plot-comments-bar-label">// コメント</span>
                                {comments.map(c => (
                                    <button key={c.id} className="plot-comment-jump-btn" title={c.text || '(空)'}
                                        onClick={() => { const el = textareaRefs.current[c.id]; if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); setFocusedLineId(c.id); } }}>
                                        {c.text ? c.text.slice(0, 18) : '(空)'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* エディターヘッダー */}
                        <div className="plot-editor-header">
                            <input className="plot-title-input" value={selectedCard.title} onChange={e => updateCard(selectedCard.id, 'title', e.target.value)} placeholder="シーンタイトルを入力..." />
                            <button className="plot-delete-card-btn" onClick={() => deleteCard(selectedCard.id)} title="このカードを削除">🗑</button>
                        </div>

                        {/* メタ情報バー */}
                        <div className="plot-meta-bar">

                            {/* cardType セレクター */}
                            <div className="plot-meta-item">
                                <label className="plot-meta-label">種別</label>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {(Object.entries(CARDTYPE_CONFIG) as [CardType, { label: string; color: string }][]).map(([type, cfg]) => (
                                        <button
                                            key={type}
                                            onClick={() => updateCard(selectedCard.id, 'cardType', type)}
                                            style={{
                                                fontSize: '0.72rem', padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                                                border: `1px solid ${effectiveCardType === type ? cfg.color : '#374151'}`,
                                                background: effectiveCardType === type ? `${cfg.color}25` : 'transparent',
                                                color: effectiveCardType === type ? cfg.color : '#6b7280',
                                                fontWeight: effectiveCardType === type ? 700 : 400,
                                            }}
                                        >
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="plot-meta-item">
                                <label className="plot-meta-label">ステータス</label>
                                <select className="plot-select" value={selectedCard.status} onChange={e => updateCard(selectedCard.id, 'status', e.target.value as PlotStatus)}>
                                    {(Object.entries(STATUS_CONFIG) as [PlotStatus, typeof STATUS_CONFIG['idea']][]).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="plot-meta-item">
                                <label className="plot-meta-label">Episode</label>
                                <select className="plot-select" value={selectedCard.episodeId} onChange={e => handleEpisodeChange(e.target.value)}>
                                    <option value="">-- 未割当 --</option>
                                    {episodes.map(ep => <option key={ep.id} value={ep.id}>{ep.title}</option>)}
                                </select>
                            </div>
                            <div className="plot-meta-item">
                                <label className="plot-meta-label">Chapter</label>
                                <select className="plot-select" value={selectedCard.chapterId} onChange={e => updateCard(selectedCard.id, 'chapterId', e.target.value)} disabled={!selectedCard.episodeId}>
                                    <option value="">-- 未割当 --</option>
                                    {chaptersForEpisode.map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
                                </select>
                            </div>
                            <div className="plot-meta-item plot-meta-scene">
                                <label className="plot-meta-label">シーンタグ</label>
                                <input className="plot-scene-input" value={selectedCard.sceneTag} onChange={e => updateCard(selectedCard.id, 'sceneTag', e.target.value)} placeholder="移動シーン、イベントトリガー等..." />
                            </div>
                        </div>

                        {/* キャストスロット（LOG / CHAT のみ） */}
                        {(effectiveCardType === 'log' || effectiveCardType === 'chat') && (
                            <div className="plot-cast-section">
                                <div className="plot-cast-label">
                                    CAST
                                    <span className="plot-cast-hint">Alt+1〜4: 話者に挿入 | Alt+0: ナレーション</span>
                                </div>

                                {/* Title フィルター */}
                                {localTitles.length > 0 && (
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => setCastTitleFilter(null)}
                                            style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', border: `1px solid ${castTitleFilter === null ? '#c9a227' : '#374151'}`, background: castTitleFilter === null ? 'rgba(201,162,39,0.15)' : 'transparent', color: castTitleFilter === null ? '#c9a227' : '#6b7280' }}
                                        >全て</button>
                                        {localTitles.map(t => (
                                            <button key={t.id} onClick={() => setCastTitleFilter(t.id)}
                                                style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', border: `1px solid ${castTitleFilter === t.id ? '#c9a227' : '#374151'}`, background: castTitleFilter === t.id ? 'rgba(201,162,39,0.15)' : 'transparent', color: castTitleFilter === t.id ? '#c9a227' : '#6b7280' }}
                                            >{t.title}</button>
                                        ))}
                                    </div>
                                )}

                                <div className="plot-cast-slots">
                                    {selectedCard.castSlots.map((name, slotIdx) => (
                                        <div key={slotIdx} className="plot-cast-slot-wrap" style={{ position: 'relative' }}>
                                            {name ? (
                                                <div className="plot-cast-slot filled">
                                                    <span className="plot-cast-slot-num">{slotIdx + 1}</span>
                                                    <span className="plot-cast-slot-name">{name}</span>
                                                    <button className="plot-cast-slot-clear" onClick={() => setCastSlot(selectedCard.id, slotIdx, null)}>×</button>
                                                </div>
                                            ) : (
                                                <button className="plot-cast-slot empty" onClick={() => openSlotMenu(slotIdx)}>
                                                    <span className="plot-cast-slot-num">{slotIdx + 1}</span>
                                                    <span className="plot-cast-slot-plus">＋</span>
                                                </button>
                                            )}

                                            {slotPopup?.slotIdx === slotIdx && (
                                                <div className="plot-slot-popup" ref={popupRef} style={{ minWidth: 220 }}>
                                                    <p className="plot-slot-popup-title" style={{ marginBottom: 6 }}>キャラクターを検索</p>
                                                    <input
                                                        className="plot-slot-text-input"
                                                        autoFocus
                                                        value={slotPopup.searchText}
                                                        onChange={e => setSlotPopup({ ...slotPopup, searchText: e.target.value })}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Escape') { setSlotPopup(null); return; }
                                                            if (e.key === 'Enter') {
                                                                const hits = filteredCharsForSlot(slotPopup.searchText);
                                                                if (hits.length === 1) selectCharForSlot(hits[0].name, slotIdx);
                                                                else if (hits.length === 0 && slotPopup.searchText.trim()) createAndSelectChar(slotPopup.searchText, slotIdx);
                                                            }
                                                        }}
                                                        placeholder="名前を入力して絞り込み..."
                                                    />
                                                    <div className="plot-slot-char-list">
                                                        {filteredCharsForSlot(slotPopup.searchText).map(ch => (
                                                            <button key={ch.id} className="plot-slot-char-item" onClick={() => selectCharForSlot(ch.name, slotIdx)}>{ch.name}</button>
                                                        ))}
                                                    </div>
                                                    {slotPopup.searchText.trim() && !filteredCharsForSlot(slotPopup.searchText).some(c => c.name === slotPopup.searchText.trim()) && (
                                                        <button
                                                            onClick={() => createAndSelectChar(slotPopup.searchText, slotIdx)}
                                                            style={{ width: '100%', textAlign: 'left', background: 'rgba(16,185,129,0.1)', border: '1px dashed #10b981', borderRadius: 4, color: '#34d399', padding: '0.4rem 0.5rem', fontSize: '0.78rem', cursor: 'pointer', marginTop: 4 }}
                                                        >＋ "{slotPopup.searchText.trim()}" を新規登録して使用</button>
                                                    )}
                                                    <button className="plot-slot-cancel-btn" style={{ marginTop: 4 }} onClick={() => setSlotPopup(null)}>キャンセル</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── タイプ別エディター ────────────────────── */}
                        {(effectiveCardType === 'log' || effectiveCardType === 'chat') && renderLinesEditor()}
                        {effectiveCardType === 'choice' && renderChoiceEditor()}
                        {effectiveCardType === 'state'  && renderStateEditor()}
                    </>
                )}
            </main>
        </div>
    );
}
