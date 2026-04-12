// ============================================
// NanoNovel - API Battle Screen  v2
// BS01 API連携バトル — v2レスポンス対応
// ============================================
// デバッグログ凡例（ブラウザ DevTools Console で確認）
//   [1B-1xx] v2レスポンス型受信確認
//   [1B-2xx] プレイヤーHP/MP 状態確認
//   [1B-3xx] 敵アクション受信確認
//   [1B-5xx] ゲームオーバー確認
//   [1B-6xx] 逃走失敗(flee_failed)確認
//   [1B-7xx] シーン・モンスター指定確認
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import './ApiBattleScreen.css';

// BS01 API base URL
const API_BASE = 'http://localhost:3000/api/bs01';

// ── デバッグログ ─────────────────────────────────────────────
// BS01_実装チェック.md Phase 1-B 番号に対応
// [1B-xxx] = Phase 1-B クライアント確認項目
function dbg(code: string, ...args: unknown[]): void {
    console.log(`  [${code}]`, ...args);
}

// ── v2 型定義 ────────────────────────────────────────────────

interface ApiMonster {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    at: number;
    df: number;
    speed: number;
    image: string;
}

interface ApiScene {
    name: string;
    bg: string;
}

// [1B-1] v2: ActionID フィールドを追加（旧: id）
interface ApiCommand {
    ActionID: string;   // v2
    id?: string;        // v1 互換
    name: string;
    type: string;
    effect: Record<string, unknown>;
}

// [1B-1] v2: playerStatus フィールドを追加
interface ApiStartResponse {
    status: string;
    monster: ApiMonster;
    scene: ApiScene;
    commands: ApiCommand[];
    playerStatus: {        // v2 新規
        hp: number;
        hpMax: number;
        mp: number;
        mpMax: number;
    };
}

// [1B-1] v2: result / playerStatus / enemyStatus / enemyAction / turn を追加
interface ApiPlayerAction {
    actionId: string;
    hit: boolean;
    damage: number;
    mpUsed: number;
}

interface ApiEnemyAction {   // v2 新規
    actionId: string;
    hit: boolean;
    damage: number;
    message: string;
}

interface ApiStatusV2 {      // v2 新規
    hp: number;
    hpMax: number;
    mp: number;
    mpMax: number;
    buffs: { AT: number; DF: number; Speed: number };
}

interface ApiEnemyStatusV2 { // v2 新規
    hp: number;
    hpMax: number;
    buffs: { AT: number; DF: number; Speed: number };
}

interface ApiActionResponse {
    // v2 フィールド
    turn?: number;
    result?: 'ongoing' | 'win' | 'gameover' | 'fled' | 'flee_failed';
    message: string;
    playerAction?: ApiPlayerAction;
    enemyAction?: ApiEnemyAction | null;
    playerStatus?: ApiStatusV2;
    enemyStatus?: ApiEnemyStatusV2;
    reward?: { gold: number; exp: number; item: string; dropped: boolean } | null;
    // v1 互換フィールド（フォールバック用）
    damage?: number;
    remainingHp?: number;
    isDefeated?: boolean;
    fled?: boolean;
    error?: string;
}

interface BattleLog {
    message: string;
    type: 'damage' | 'heal' | 'info' | 'system' | 'enemy';
}

type ConnectionStatus = 'connecting' | 'connected' | 'error';
type BattlePhase = 'loading' | 'player' | 'processing' | 'victory' | 'gameover' | 'fled' | 'error';

// ── コンポーネント ────────────────────────────────────────────
export function ApiBattleScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const addGold   = useGameStore((state) => state.addGold);

    // State
    const [phase, setPhase]                 = useState<BattlePhase>('loading');
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [monster, setMonster]             = useState<ApiMonster | null>(null);
    const [scene, setScene]                 = useState<ApiScene | null>(null);
    const [commands, setCommands]           = useState<ApiCommand[]>([]);
    const [logs, setLogs]                   = useState<BattleLog[]>([]);
    const [lastMessage, setLastMessage]     = useState('');
    const [reward, setReward]               = useState<{ gold: number; item: string } | null>(null);
    const [errorMessage, setErrorMessage]   = useState('');
    const [isHit, setIsHit]                 = useState(false);
    const [turn, setTurn]                   = useState(0);

    // [1B-2] プレイヤーHP/MP state（v2新規）
    const [playerHp, setPlayerHp]   = useState(50);
    const [playerHpMax, setPlayerHpMax] = useState(50);
    const [playerMp, setPlayerMp]   = useState(20);
    const [playerMpMax, setPlayerMpMax] = useState(20);

    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Add log entry
    const addLog = useCallback((message: string, type: BattleLog['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-14), { message, type }]);
    }, []);

    // Health check & start battle on mount
    useEffect(() => {
        let cancelled = false;

        const initBattle = async () => {
            try {
                // Step 1: Health check
                addLog('サーバーに接続中...', 'system');
                const healthRes = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
                if (!healthRes.ok) throw new Error('Health check failed');

                if (cancelled) return;
                setConnectionStatus('connected');
                addLog('✓ サーバー接続OK', 'system');

                // Step 2: Start battle
                addLog('バトルを開始します...', 'system');
                const startRes = await fetch(`${API_BASE}/start`, { cache: 'no-store' });
                if (!startRes.ok) throw new Error('Battle start failed');

                const data: ApiStartResponse = await startRes.json();
                if (cancelled) return;

                // [1B-7-1] /start に scene/monster クエリを付ける（未実装: クエスト連携後に有効化）
                dbg('1B-701', '/start 呼び出し完了 | monster:', data.monster?.name, 'scene:', data.scene?.name);

                setMonster(data.monster);
                setScene(data.scene);
                setCommands(data.commands);
                setTurn(1);

                // [1B-2-1] /start の playerStatus でHP/MP初期化
                if (data.playerStatus) {
                    setPlayerHp(data.playerStatus.hp);
                    setPlayerHpMax(data.playerStatus.hpMax);
                    setPlayerMp(data.playerStatus.mp);
                    setPlayerMpMax(data.playerStatus.mpMax);
                    dbg('1B-201', 'playerStatus初期化 | HP:', data.playerStatus.hp, '/', data.playerStatus.hpMax,
                        'MP:', data.playerStatus.mp, '/', data.playerStatus.mpMax);
                } else {
                    dbg('1B-201', '[WARN] playerStatus が /start レスポンスにない — v1フォールバック');
                }

                // [1B-1-1] v2 レスポンス型確認（commands のキー確認）
                const cmdKey = data.commands[0]?.ActionID ? 'ActionID(v2)' : 'id(v1)';
                dbg('1B-101', 'commands キー形式:', cmdKey, '| 件数:', data.commands.length);

                setPhase('player');
                addLog(`${data.monster.name}が現れた！`, 'info');
                addLog(`シーン: ${data.scene.name}`, 'system');
                setLastMessage(`${data.monster.name}が現れた！`);

            } catch (err) {
                if (cancelled) return;
                setConnectionStatus('error');
                setPhase('error');
                setErrorMessage(
                    `APIサーバーに接続できません。\nBS01 API Server (localhost:3000) が起動しているか確認してください。`
                );
                addLog('✗ サーバー接続失敗', 'system');
                dbg('1B-101', '[ERROR] 接続失敗:', err);
            }
        };

        initBattle();
        return () => { cancelled = true; };
    }, [addLog]);

    // コマンドID正規化（v1: id / v2: ActionID）
    const getCmdId = (cmd: ApiCommand) => cmd.ActionID || cmd.id || '';

    // Execute command
    const executeCommand = useCallback(async (commandId: string) => {
        if (phase !== 'player' || !monster) return;

        setPhase('processing');
        const cmd = commands.find(c => getCmdId(c) === commandId);
        addLog(`→ ${cmd?.name || commandId}を選択`, 'info');

        try {
            const res = await fetch(`${API_BASE}/action`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ commandId }),
            });

            // [1B-2-2] MP不足（400 error: mp_insufficient）
            if (res.status === 400) {
                const errData = await res.json().catch(() => ({}));
                if (errData.error === 'mp_insufficient') {
                    dbg('1B-202', 'MP不足 | 現在MP:', errData.playerStatus?.mp, '→ コマンド拒否・ターン消費なし');
                    addLog('MPが足りない！', 'system');
                    setPhase('player');
                    return;
                }
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            const data: ApiActionResponse = await res.json();

            // [1B-1-2] v2 result フィールド確認
            dbg('1B-102', 'result:', data.result, '| turn:', data.turn, '| message:', data.message);

            // [1B-1-3] v2 playerStatus 確認
            if (data.playerStatus) {
                dbg('1B-103', 'playerStatus | HP:', data.playerStatus.hp, '/', data.playerStatus.hpMax,
                    'MP:', data.playerStatus.mp, '/', data.playerStatus.mpMax,
                    'buffs:', JSON.stringify(data.playerStatus.buffs));
            } else {
                dbg('1B-103', '[WARN] playerStatus なし — v1レスポンス');
            }

            // [1B-3-1] v2 enemyAction 確認
            if (data.enemyAction) {
                dbg('1B-301', 'enemyAction | id:', data.enemyAction.actionId,
                    'hit:', data.enemyAction.hit, 'dmg:', data.enemyAction.damage,
                    'msg:', data.enemyAction.message);
            } else {
                dbg('1B-301', 'enemyAction: null（バトル終了 or 逃走成功）');
            }

            setLastMessage(data.message);
            if (data.turn) setTurn(data.turn);

            // ── v2 result 分岐 ────────────────────────────────
            const resultV2 = data.result;

            // [1C-12] 逃走成功
            if (resultV2 === 'fled' || data.fled) {
                dbg('1B-601', '逃走成功 → phase:fled');
                addLog(data.message, 'info');
                setPhase('fled');
                return;
            }

            // [1B-6] 逃走失敗 flee_failed → バトル継続
            if (resultV2 === 'flee_failed') {
                dbg('1B-601', '逃走失敗(flee_failed) → バトル継続');
                addLog(data.message, 'info');
                // 敵の反撃メッセージ
                if (data.enemyAction?.message) {
                    addLog(data.enemyAction.message, 'enemy');
                }
                // HP/MP更新
                if (data.playerStatus) {
                    setPlayerHp(data.playerStatus.hp);
                    setPlayerMp(data.playerStatus.mp);
                    dbg('1B-602', '逃走失敗後 playerHP:', data.playerStatus.hp, 'playerMP:', data.playerStatus.mp);
                }
                setPhase('player');
                return;
            }

            // [1B-5] ゲームオーバー
            if (resultV2 === 'gameover') {
                dbg('1B-501', 'GAMEOVER | playerHP:', data.playerStatus?.hp ?? 0, '→ phase:gameover');
                addLog('やられてしまった…', 'damage');
                if (data.enemyAction?.message) addLog(data.enemyAction.message, 'enemy');
                if (data.playerStatus) {
                    setPlayerHp(0);
                    setPlayerMp(data.playerStatus.mp);
                }
                setPhase('gameover');
                return;
            }

            // ── HP/MP 更新 ────────────────────────────────────
            if (data.playerStatus) {
                setPlayerHp(data.playerStatus.hp);
                setPlayerMp(data.playerStatus.mp);
                dbg('1B-203', `playerHP:${data.playerStatus.hp}/${data.playerStatus.hpMax} playerMP:${data.playerStatus.mp}/${data.playerStatus.mpMax}`);
            }

            // 敵HP更新（v2: enemyStatus / v1: remainingHp）
            const newEnemyHp = data.enemyStatus?.hp ?? data.remainingHp;
            if (newEnemyHp !== undefined) {
                setMonster(prev => prev ? { ...prev, hp: newEnemyHp } : null);
            }

            // プレイヤー攻撃ログ
            addLog(data.playerAction?.hit === false
                ? `${cmd?.name} は外れた！`
                : data.message.split(' / ')[0], 'damage');

            // [1B-3-2] 敵アクションログ
            if (data.enemyAction?.message) {
                addLog(data.enemyAction.message, 'enemy');
                if (!data.enemyAction.hit) {
                    dbg('1B-302', '敵攻撃ミス | actionId:', data.enemyAction.actionId);
                }
            }

            // 敵ヒットアニメーション
            if ((data.playerAction?.damage ?? 0) > 0) {
                setIsHit(true);
                setTimeout(() => setIsHit(false), 400);
            }

            // [1C-10] 勝利
            if (resultV2 === 'win' || data.isDefeated) {
                dbg('1B-102', 'WIN | reward:', JSON.stringify(data.reward));
                addLog(`${monster.name}を倒した！`, 'info');
                if (data.reward) {
                    setReward({ gold: data.reward.gold, item: data.reward.item });
                    addLog(`報酬: ${data.reward.gold}G / ${data.reward.item}${data.reward.dropped ? '' : '（ドロップなし）'}`, 'system');
                    addGold(data.reward.gold);
                }
                setPhase('victory');
                return;
            }

            setPhase('player');

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            addLog(`エラー: ${msg}`, 'system');
            setLastMessage(`通信エラー: ${msg}`);
            dbg('1B-101', '[ERROR] action失敗:', msg);
            setPhase('player');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, monster, commands, addLog, addGold]);

    const handleBattleEnd   = () => setScreen('NOVEL');
    const handleBackToTitle = () => setScreen('TITLE');
    const handleRetry = () => {
        setPhase('loading');
        setConnectionStatus('connecting');
        setLogs([]);
        setErrorMessage('');
        window.location.reload();
    };

    // [1B-2-4] MPバー幅
    const mpPct = playerMpMax > 0 ? (playerMp / playerMpMax) * 100 : 0;

    // [1B-2-3] HPバークラス（緑→黄→赤）
    const getPlayerHpClass = () => {
        const r = playerHp / playerHpMax;
        if (r <= 0.25) return 'critical';
        if (r <= 0.5)  return 'low';
        return '';
    };
    const getEnemyHpClass = () => {
        if (!monster) return '';
        const r = monster.hp / monster.maxHp;
        if (r <= 0.2) return 'critical';
        if (r <= 0.5) return 'low';
        return '';
    };

    // [1B-2-5] MP不足ボタン disabled
    const isCommandDisabled = (cmd: ApiCommand) => {
        if (phase !== 'player') return true;
        const mpCost = (cmd.effect?.mpCost as number) || 0;
        if (mpCost > playerMp) {
            return true; // [1B-2-5] MPが足りないコマンドは非活性
        }
        return false;
    };

    // ============================
    // Render
    // ============================

    if (phase === 'loading') {
        return (
            <div className="api-battle-screen">
                <div className="api-status-bar">
                    <div className={`api-status-dot ${connectionStatus}`} />
                    <span className="api-status-text">BS01 API Server</span>
                    <span className="api-status-label">API TEST</span>
                </div>
                <div className="api-battle-loading">
                    <div className="api-battle-spinner" />
                    <div className="api-battle-loading-text">APIサーバーに接続中...</div>
                </div>
            </div>
        );
    }

    if (phase === 'error') {
        return (
            <div className="api-battle-screen">
                <div className="api-status-bar">
                    <div className="api-status-dot error" />
                    <span className="api-status-text">接続失敗</span>
                    <span className="api-status-label">API TEST</span>
                </div>
                <div className="api-battle-error">
                    <h3>⚠ 接続エラー</h3>
                    <p>{errorMessage}</p>
                    <button onClick={handleRetry}>再接続</button>
                    <button onClick={handleBackToTitle}>タイトルへ戻る</button>
                </div>
            </div>
        );
    }

    return (
        <div className="api-battle-screen">
            {/* Connection Status Bar */}
            <div className="api-status-bar">
                <div className={`api-status-dot ${connectionStatus}`} />
                <span className="api-status-text">
                    {connectionStatus === 'connected' ? 'BS01 API 接続中' : 'BS01 API'}
                </span>
                <span className="api-status-label">API TEST</span>
            </div>

            {/* Header */}
            <header className="api-battle-header">
                <span className="api-battle-turn">Turn {turn}</span>
                <span className="api-battle-turn">
                    {phase === 'player' ? 'コマンド？' : phase === 'processing' ? '処理中...' : ''}
                </span>
            </header>

            {/* Scene Background */}
            {scene?.bg && (
                <div className="api-battle-scene">
                    <div className="api-battle-scene-bg" dangerouslySetInnerHTML={{ __html: scene.bg }} />
                </div>
            )}

            {/* Battle Log */}
            <div className="api-battle-log">
                {logs.map((log, i) => (
                    <div key={i} className={`api-battle-log-item api-battle-log-${log.type}`}>
                        {log.message}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>

            {/* Main Battle Area */}
            <main className="api-battle-main">
                {monster && (
                    <div className="api-battle-enemy-area">
                        <div
                            className={`api-battle-enemy-image ${isHit ? 'hit' : ''}`}
                            dangerouslySetInnerHTML={{ __html: monster.image }}
                        />
                        <h3 className="api-battle-enemy-name">{monster.name}</h3>
                        {/* 敵HPバー */}
                        <div className="api-battle-hp-bar">
                            <div
                                className={`api-battle-hp-fill ${getEnemyHpClass()}`}
                                style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                            />
                            <span className="api-battle-hp-text">{monster.hp} / {monster.maxHp}</span>
                        </div>
                    </div>
                )}
            </main>

            {/* [1B-2] プレイヤーHP/MPバー */}
            <div className="api-player-status">
                <div className="api-player-stat-row">
                    <span className="api-player-stat-label">HP</span>
                    <div className="api-player-bar-outer">
                        <div
                            className={`api-player-bar-hp ${getPlayerHpClass()}`}
                            style={{ width: `${(playerHp / playerHpMax) * 100}%` }}
                        />
                    </div>
                    <span className="api-player-stat-val">{playerHp} / {playerHpMax}</span>
                </div>
                <div className="api-player-stat-row">
                    <span className="api-player-stat-label">MP</span>
                    <div className="api-player-bar-outer">
                        <div className="api-player-bar-mp" style={{ width: `${mpPct}%` }} />
                    </div>
                    <span className="api-player-stat-val">{playerMp} / {playerMpMax}</span>
                </div>
            </div>

            {/* Last Action Message */}
            {lastMessage && <div className="api-battle-message">{lastMessage}</div>}

            {/* [1B-2-5] Command Buttons — MP不足で disabled */}
            <div className="api-battle-actions">
                {commands.map((cmd, idx) => {
                    const cid     = getCmdId(cmd);
                    const mpCost  = (cmd.effect?.mpCost as number) || 0;
                    const noMp    = mpCost > playerMp;
                    return (
                        <button
                            key={cid || idx}
                            className={`api-battle-cmd-btn${noMp ? ' mp-lacking' : ''}`}
                            onClick={() => executeCommand(cid)}
                            disabled={isCommandDisabled(cmd)}
                            title={mpCost > 0 ? `MP ${mpCost}` : undefined}
                        >
                            {cmd.name}
                            <span className="cmd-type">{cmd.type}</span>
                            {mpCost > 0 && <span className="cmd-mp">MP{mpCost}</span>}
                        </button>
                    );
                })}
            </div>

            {/* VICTORY Overlay */}
            {phase === 'victory' && (
                <div className="api-battle-result-overlay">
                    <div className="api-battle-result">
                        <h1 className="api-battle-result-title victory">VICTORY！</h1>
                        {reward && (
                            <div className="api-battle-result-rewards">
                                <p>💰 {reward.gold} ゴールド獲得</p>
                                <p>📦 {reward.item} を手に入れた！</p>
                            </div>
                        )}
                        <button className="api-battle-result-btn" onClick={handleBattleEnd}>続ける</button>
                    </div>
                </div>
            )}

            {/* [1B-5] GAMEOVER Overlay */}
            {phase === 'gameover' && (
                <div className="api-battle-result-overlay">
                    <div className="api-battle-result">
                        <h1 className="api-battle-result-title" style={{ color: '#f56565' }}>GAME OVER</h1>
                        <p style={{ color: '#a0aec0', marginBottom: '1.5rem' }}>
                            やられてしまった…
                        </p>
                        <button className="api-battle-result-btn" onClick={handleBackToTitle}>
                            タイトルへ戻る
                        </button>
                    </div>
                </div>
            )}

            {/* FLED Overlay */}
            {phase === 'fled' && (
                <div className="api-battle-result-overlay">
                    <div className="api-battle-result">
                        <h1 className="api-battle-result-title fled">ESCAPED</h1>
                        <p style={{ color: '#a0aec0', marginBottom: '1.5rem' }}>
                            うまく逃げ切れた！
                        </p>
                        <button className="api-battle-result-btn" onClick={handleBattleEnd}>続ける</button>
                    </div>
                </div>
            )}
        </div>
    );
}
