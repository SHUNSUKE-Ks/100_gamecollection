// ============================================
// NanoNovel - Title Screen (with Save/Load)
// ============================================

import { useState, useEffect } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { SaveManager } from '@/core/managers/SaveManager';
import { SaveLoadModal } from '@/parts/novel/components/SaveLoadModal';
import './TitleScreen.css';

// DevStudio: 本日タスク（localStorage から読み込み）
interface TodayTask { id: string; title: string; status: 'pending' | 'in_progress' | 'done'; }
const DS_TASKS_KEY = 'devstudio_tasks_v1';
function loadTodayTasks(): TodayTask[] {
  try {
    const raw = localStorage.getItem(DS_TASKS_KEY);
    const all: TodayTask[] = raw ? JSON.parse(raw) : [];
    const today = new Date().toISOString().slice(0, 10);
    // status != done のものを優先、最大3件
    const active = all.filter((t: any) => t.status !== 'done' && (t.date ?? '').startsWith(today));
    if (active.length > 0) return active.slice(0, 3);
    // フォールバック: サンプル表示
    return [
      { id: 'demo1', title: 'DevStudio Dashboard スケルトン確認', status: 'in_progress' },
      { id: 'demo2', title: '開発ログ初期データ整理', status: 'pending' },
      { id: 'demo3', title: 'Orchestra タスク型定義レビュー', status: 'pending' },
    ];
  } catch { return []; }
}

export function TitleScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const resetGame = useGameStore((state) => state.resetGame);
    const setStoryID = useGameStore((state) => state.setStoryID);
    const setCollectionDeepLink = useGameStore((state) => state.setCollectionDeepLink);

    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
    useEffect(() => { setTodayTasks(loadTodayTasks()); }, []);

    // Check if continue is available
    const hasSaveData = SaveManager.hasSaveData();

    const handleNewGame = () => {
        resetGame();
        setScreen('CHAPTER');
    };

    const handleContinue = () => {
        // If we have save data, open load modal
        if (hasSaveData) {
            setIsLoadModalOpen(true);
        } else {
            // No save data, just go to novel (shouldn't happen if button is disabled)
            setScreen('NOVEL');
        }
    };

    // API Battle Test handler
    const handleApiBattleTest = () => {
        resetGame();
        setStoryID('API_TEST_01');
        setScreen('NOVEL');
    };

    return (
        <div className="title-screen">
            <div className="title-decoration title-decoration-top" />

            {/* ── 左上 DevStudio アクセス ── */}
            <div style={{
                position: 'absolute', top: 16, left: 16,
                display: 'flex', flexDirection: 'column', gap: 8,
                zIndex: 10, width: 240,
            }}>
                {/* DevStudio ボタン */}
                <button
                    onClick={() => setScreen('DEVSTUDIO')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'linear-gradient(135deg, rgba(15,10,30,0.92), rgba(30,20,60,0.92))',
                        border: '1px solid rgba(167,139,250,0.5)',
                        borderRadius: 8, padding: '8px 14px',
                        color: '#c4b5fd', fontSize: '0.82rem', fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.05em',
                        boxShadow: '0 0 12px rgba(139,92,246,0.2)',
                        width: '100%',
                    }}
                >
                    <span style={{ fontSize: '1rem' }}>⬡</span>
                    DEV STUDIO
                    <span style={{
                        marginLeft: 'auto', fontSize: '0.58rem',
                        background: 'rgba(139,92,246,0.3)', padding: '1px 6px',
                        borderRadius: 10, color: '#a78bfa',
                    }}>β</span>
                </button>

                {/* Android DevStudio ボタン */}
                <button
                    onClick={() => setScreen('ANDROID_DEVSTUDIO')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'linear-gradient(135deg, rgba(5,20,15,0.92), rgba(10,35,25,0.92))',
                        border: '1px solid rgba(52,211,153,0.5)',
                        borderRadius: 8, padding: '8px 14px',
                        color: '#34d399', fontSize: '0.82rem', fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.05em',
                        boxShadow: '0 0 12px rgba(52,211,153,0.15)',
                        width: '100%',
                    }}
                >
                    <span style={{ fontSize: '1rem' }}>📱</span>
                    ANDROID DEV STUDIO
                    <span style={{
                        marginLeft: 'auto', fontSize: '0.58rem',
                        background: 'rgba(52,211,153,0.2)', padding: '1px 6px',
                        borderRadius: 10, color: '#6ee7b7',
                    }}>01</span>
                </button>

                {/* 本日のタスク（クエストカード風） */}
                {todayTasks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{
                            fontSize: '0.58rem', fontWeight: 700, color: '#6b7280',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            paddingLeft: 4,
                        }}>
                            TODAY'S TASKS
                        </div>
                        {todayTasks.map((task, i) => {
                            const STATUS_COLOR = {
                                in_progress: { bar: '#c9a227', bg: 'rgba(201,162,39,0.12)', text: '#fbbf24' },
                                pending:     { bar: '#4b5563', bg: 'rgba(255,255,255,0.04)', text: '#6b7280' },
                                done:        { bar: '#10b981', bg: 'rgba(16,185,129,0.08)',  text: '#34d399' },
                            }[task.status];
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => setScreen('DEVSTUDIO')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        background: STATUS_COLOR.bg,
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderLeft: `3px solid ${STATUS_COLOR.bar}`,
                                        borderRadius: '0 6px 6px 0',
                                        padding: '6px 10px',
                                        cursor: 'pointer', textAlign: 'left', width: '100%',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.58rem', fontWeight: 700,
                                        color: '#4b5563', minWidth: 14,
                                    }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem', color: '#d1d5db',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap', flex: 1,
                                    }}>
                                        {task.title}
                                    </span>
                                    <span style={{
                                        fontSize: '0.58rem', fontWeight: 700,
                                        color: STATUS_COLOR.text, flexShrink: 0,
                                    }}>
                                        {task.status === 'in_progress' ? '▶' : task.status === 'done' ? '✓' : '○'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 右上クイックアクセス */}
            <div className="title-quick-access">
                <button
                    className="title-quick-btn title-quick-btn--plot"
                    onClick={() => {
                        setCollectionDeepLink('story:plot');
                        setScreen('COLLECTION');
                    }}
                >
                    ✏ プロット手帳
                </button>
                <div className="title-quick-schema-row">
                    <button
                        className="title-quick-btn title-quick-btn--schema"
                        onClick={() => {
                            setCollectionDeepLink('story:schema:v12');
                            setScreen('COLLECTION');
                        }}
                    >
                        📄 スキーマ ver1
                    </button>
                    <button
                        className="title-quick-btn title-quick-btn--schema"
                        onClick={() => {
                            setCollectionDeepLink('story:schema:v21');
                            setScreen('COLLECTION');
                        }}
                    >
                        📄 スキーマ ver2
                    </button>
                </div>
                {/* レイアウト切り替え（開発用） */}
                <div className="title-quick-schema-row">
                    <button
                        className="title-quick-btn"
                        onClick={() => setScreen('COLLECTION')}
                        style={{ borderColor: '#60a5fa', color: '#60a5fa' }}
                    >
                        🖥 PC Collection
                    </button>
                    <button
                        className="title-quick-btn"
                        onClick={() => setScreen('ANDROID_COLLECTION')}
                        style={{ borderColor: '#34d399', color: '#34d399' }}
                    >
                        📱 Android View
                    </button>
                </div>
                <button
                    className="title-quick-btn"
                    onClick={() => setScreen('WORKSPACE')}
                    style={{ borderColor: '#6b7280', color: '#6b7280', width: '100%', opacity: 0.7 }}
                >
                    🗄 TestWS（旧）
                </button>
            </div>

            <div className="title-content">
                <div className="title-logo">
                    <img src="/src/assets/ui/logo.svg" alt="NanoNovel Logo" width="80" height="80" />
                </div>

                <h1 className="title-main">NanoNovel</h1>
                <p className="title-subtitle">AI駆動ノベルゲーム</p>

                <div className="title-menu">
                    <button
                        className="btn btn-primary btn-start"
                        onClick={handleNewGame}
                    >
                        New Game
                    </button>
                    <button
                        className={`btn ${!hasSaveData ? 'btn-disabled' : ''}`}
                        onClick={handleContinue}
                        disabled={!hasSaveData}
                    >
                        Continue
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('HOME')}
                    >
                        Home (Standby)
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('COLLECTION')}
                    >
                        Collection
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('MENU')}
                    >
                        Menu
                    </button>
                    <button className="btn">
                        Settings
                    </button>
                    <button
                        className="btn"
                        onClick={handleApiBattleTest}
                        style={{
                            background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                            border: '1px solid #ffd700',
                            color: '#ffd700',
                            marginTop: '0.5rem',
                        }}
                    >
                        🧪 API Battle Test
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('HONO_API_TEST')}
                        style={{
                            background: 'linear-gradient(135deg, #0f2027, #203a43)',
                            border: '1px solid #10b981',
                            color: '#10b981',
                            marginTop: '0.25rem',
                        }}
                    >
                        🔌 HONO_API テスト
                    </button>
                </div>
            </div>

            <div className="title-decoration title-decoration-bottom" />

            <footer className="title-footer">
                © 2026 NanoNovel Project
            </footer>

            {/* Load Modal */}
            <SaveLoadModal
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                initialMode="load"
            />
        </div>
    );
}
