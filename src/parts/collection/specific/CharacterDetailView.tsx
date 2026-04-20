import { useState, useRef, useEffect } from 'react';
import './CharacterDetailView.css';

interface Character {
    id: string;
    name: string;
    description: string;
    tags: string[];
    image?: string;
    standing?: string[];
    cgs?: string[];
    dict?: string;
    [key: string]: any;
}

interface CharacterDetailViewProps {
    data: Character[];
}

// ── TitleDB (localStorage) ────────────────────────────────────

interface TitleEntry {
    id: string;
    title: string;
    subtitle: string;
    status: 'planning' | 'writing' | 'done';
}

const STATUS_COLOR: Record<string, string> = {
    planning: '#a78bfa',
    writing:  '#fbbf24',
    done:     '#34d399',
};
const STATUS_LABEL: Record<string, string> = {
    planning: '企画中',
    writing:  '執筆中',
    done:     '完成',
};

function loadTitleDB(): TitleEntry[] {
    try {
        const r = localStorage.getItem('tagsdb_titles_v1');
        return r ? JSON.parse(r) : [];
    } catch { return []; }
}

const CHAR_TITLE_KEY = 'char_title_map_v1';

function loadCharTitleMap(): Record<string, string> {
    try {
        const r = localStorage.getItem(CHAR_TITLE_KEY);
        return r ? JSON.parse(r) : {};
    } catch { return {}; }
}

function saveCharTitleMap(m: Record<string, string>) {
    try { localStorage.setItem(CHAR_TITLE_KEY, JSON.stringify(m)); } catch {}
}

// ── TitleSelector コンポーネント ──────────────────────────────

function TitleSelector({ charId }: { charId: string }) {
    const [titles]    = useState<TitleEntry[]>(loadTitleDB);
    const [map, setMap] = useState<Record<string, string>>(loadCharTitleMap);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentId    = map[charId] ?? null;
    const currentTitle = titles.find(t => t.id === currentId) ?? null;

    // 外クリックで閉じる
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const select = (id: string | null) => {
        const next = { ...map };
        if (id === null) {
            delete next[charId];
        } else {
            next[charId] = id;
        }
        setMap(next);
        saveCharTitleMap(next);
        setOpen(false);
    };

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    background: currentTitle ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${currentTitle ? 'rgba(201,162,39,0.4)' : '#374151'}`,
                    borderRadius: 6,
                    color: currentTitle ? '#c9a227' : '#6b7280',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                }}
            >
                🎬
                {currentTitle ? (
                    <>
                        <span style={{ fontWeight: 600 }}>{currentTitle.title}</span>
                        <span style={{
                            fontSize: '0.62rem',
                            color: STATUS_COLOR[currentTitle.status],
                            background: `${STATUS_COLOR[currentTitle.status]}20`,
                            padding: '0 0.3rem',
                            borderRadius: 3,
                        }}>
                            {STATUS_LABEL[currentTitle.status]}
                        </span>
                    </>
                ) : (
                    <span>タイトル未設定</span>
                )}
                <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                    zIndex: 100,
                    background: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    minWidth: 220,
                    overflow: 'hidden',
                }}>
                    {titles.length === 0 ? (
                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                            TitleDBにタイトルがありません
                        </div>
                    ) : (
                        <>
                            {currentTitle && (
                                <button
                                    onClick={() => select(null)}
                                    style={{
                                        width: '100%', textAlign: 'left',
                                        padding: '0.4rem 0.75rem',
                                        background: 'transparent', border: 'none',
                                        borderBottom: '1px solid #1f2937',
                                        color: '#6b7280', fontSize: '0.72rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕ タイトルを解除
                                </button>
                            )}
                            {titles.map(t => {
                                const isCurrent = t.id === currentId;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => select(t.id)}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            background: isCurrent ? 'rgba(201,162,39,0.1)' : 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #0f172a',
                                            color: isCurrent ? '#c9a227' : '#d1d5db',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {isCurrent && <span style={{ fontSize: '0.65rem' }}>✓</span>}
                                        <span style={{ flex: 1, fontWeight: isCurrent ? 700 : 400 }}>{t.title}</span>
                                        <span style={{
                                            fontSize: '0.62rem',
                                            color: STATUS_COLOR[t.status],
                                        }}>
                                            {STATUS_LABEL[t.status]}
                                        </span>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper to resolve asset paths
const resolveAssetUrl = (path: string) => {
    if (!path) return '';
    // In Vite dev, /src/assets/... works if it's in the root
    // We assume 'path' is relative to src/assets, e.g. "chara/remi_unant/standing_01.png"
    return `/src/assets/${path}`;
};

// ── 新規キャラ (localStorage 参照) ───────────────────────────

const NEW_CHARS_KEY_CDV = 'plot_new_chars_v1';
interface NewCharEntry { id: string; name: string; createdAt: number; seenAt: number | null; }
const loadNewCharsCDV   = (): NewCharEntry[] => { try { const r = localStorage.getItem(NEW_CHARS_KEY_CDV); return r ? JSON.parse(r) : []; } catch { return []; } };
const saveNewCharsCDV   = (v: NewCharEntry[]) => { try { localStorage.setItem(NEW_CHARS_KEY_CDV, JSON.stringify(v)); } catch {} };

export function CharacterDetailView({ data }: CharacterDetailViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>(data[0]?.id || null);
    const [newChars, setNewChars] = useState<NewCharEntry[]>(() => loadNewCharsCDV());

    // 静的データ + 新規キャラを合成
    const newAsChar: Character[] = newChars.map(nc => ({
        id: nc.id, name: nc.name, description: '', tags: [],
        _isNew: true, _seenAt: nc.seenAt,
    } as Character));
    const allChars: Character[] = [...data, ...newAsChar];

    const selectedChar = allChars.find(c => c.id === selectedId);
    const isNewChar = !!(selectedChar as any)?._isNew;

    const handleSelectChar = (id: string) => {
        setSelectedId(id);
        // 新規キャラを初めて開いたら seenAt を記録
        const nc = newChars.find(c => c.id === id);
        if (nc && nc.seenAt === null) {
            const updated = newChars.map(c => c.id === id ? { ...c, seenAt: Date.now() } : c);
            saveNewCharsCDV(updated);
            setNewChars(updated);
        }
    };

    // Filter logic for images
    const standingImages = selectedChar?.standing?.filter(p => !p.includes('face') && !p.includes('icon')) || [];
    const iconImages = selectedChar?.standing?.filter(p => p.includes('face') || p.includes('icon')) || [];
    const subtitle = selectedChar?.tags?.join(' / ') || '';

    return (
        <div className="cdv-container">
            {/* Left Sidebar - Character List */}
            <aside className="cdv-sidebar">
                <h2 className="cdv-sidebar-header">
                    キャラクター一覧
                </h2>
                <ul className="cdv-sidebar-list">
                    {allChars.map(char => {
                        const nc = newChars.find(c => c.id === char.id);
                        const showNew = nc && nc.seenAt === null;
                        return (
                            <li
                                key={char.id}
                                className={`cdv-sidebar-item ${selectedId === char.id ? 'active' : ''}`}
                                onClick={() => handleSelectChar(char.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                                <span style={{ flex: 1 }}>{char.name}</span>
                                {showNew && (
                                    <span style={{ fontSize: '0.6rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 3, padding: '1px 4px', flexShrink: 0 }}>New</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="cdv-main">
                {selectedChar ? (
                    <>
                        {/* Character Card Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h1 className="cdv-section-title" style={{ margin: 0 }}>
                                {isNewChar ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        キャラクターカード
                                        <span style={{ fontSize: '0.65rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 4, padding: '2px 6px' }}>New — 名前のみ登録</span>
                                    </span>
                                ) : 'キャラクターカード'}
                            </h1>
                            <TitleSelector charId={selectedChar.id} />
                        </div>

                        {/* 新規キャラ: 名前のみカード */}
                        {isNewChar ? (
                            <div className="cdv-card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
                                <div style={{ fontSize: '1.1rem', color: '#d1d5db', fontWeight: 700, marginBottom: '0.25rem' }}>{selectedChar.name}</div>
                                <div style={{ fontSize: '0.8rem' }}>プロットメモから追加された名前のみのキャラクターです。</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#4b5563' }}>詳細情報はCharactersデータに正式登録後に表示されます。</div>
                            </div>
                        ) : (<>
                        <div className="cdv-card">
                            <div className="cdv-card-inner">
                                {/* Profile Image */}
                                <div className="cdv-profile-image-container">
                                    <div className="cdv-profile-image-frame">
                                        {selectedChar.image ? (
                                            <img
                                                src={resolveAssetUrl(selectedChar.image)}
                                                alt={selectedChar.name}
                                                className="cdv-image-cover"
                                            />
                                        ) : (
                                            <div className="cdv-no-img-text">NO IMG</div>
                                        )}
                                    </div>
                                </div>

                                {/* Character Info */}
                                <div className="cdv-info">
                                    <h2 className="cdv-name">
                                        {selectedChar.name}
                                    </h2>
                                    <p className="cdv-subtitle">
                                        {subtitle}
                                    </p>
                                    <p className="cdv-description">
                                        {selectedChar.description}
                                        {selectedChar.dict && <span className="cdv-dict-text">{selectedChar.dict}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2-Column Layout */}
                        <div className="cdv-grid">
                            {/* Left Column - Expression Icons */}
                            <div>
                                <h3 className="cdv-sub-title">
                                    表情アイコン (60x60)
                                </h3>
                                <div className="cdv-icons-wrapper">
                                    {iconImages.length > 0 ? iconImages.map((url, idx) => (
                                        <div key={idx} className="cdv-icon-item">
                                            <div className="cdv-icon-frame">
                                                <img
                                                    src={resolveAssetUrl(url)}
                                                    alt={`Face ${idx}`}
                                                    className="cdv-image-cover"
                                                />
                                            </div>
                                            <p className="cdv-icon-label">Face {idx + 1}</p>
                                        </div>
                                    )) : (
                                        <p className="cdv-no-content-text">No Icons</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Standing Gallery */}
                            <div>
                                <h3 className="cdv-sub-title">
                                    立ち絵ギャラリー
                                </h3>
                                <div className="cdv-standing-frame">
                                    {standingImages.length > 0 ? (
                                        <img
                                            src={resolveAssetUrl(standingImages[0])}
                                            alt="Standing"
                                            className="cdv-image-cover"
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div className="cdv-no-content-text">No Standing Art</div>
                                    )}
                                </div>
                                {/* If multiple standing images exist, showing them as thumbnails below could be an option, strictly following snippet logic for now which implies singular usage or gallery focus */}
                            </div>
                        </div>

                        {/* CG Gallery */}
                        <div style={{ marginTop: '2rem' }}>
                            <h3 className="cdv-sub-title">
                                CGギャラリー (1920x1080)
                            </h3>
                            <div className="cdv-cg-grid">
                                {selectedChar.cgs && selectedChar.cgs.length > 0 ? selectedChar.cgs.map((url, idx) => (
                                    <div key={idx} className="cdv-cg-frame">
                                        <img
                                            src={resolveAssetUrl(url)}
                                            alt="CG"
                                            className="cdv-image-cover"
                                        />
                                    </div>
                                )) : (
                                    <div className="cdv-cg-frame" style={{ backgroundColor: '#1f2937' }}>
                                        <p className="cdv-no-content-text">No CGs</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        </>)} {/* end isNewChar ternary */}
                    </>
                ) : (
                    <div className="cdv-empty-state">
                        <p>キャラクターを選択してください</p>
                    </div>
                )}
            </main>
        </div>
    );
}
