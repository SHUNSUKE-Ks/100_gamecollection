// ============================================
// Hono MiniForge API Test Screen + Puzzle Game
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '@/core/stores/gameStore';

// ── エンドポイント定義 ─────────────────────────────────

type HttpMethod = 'GET' | 'POST';

interface EndpointDef {
  id: string;
  method: HttpMethod;
  path: string;
  label: string;
  defaultBody?: string;
  dynamicPath?: (sess: string) => string;
  category: 'puzzle' | 'battle' | 'server';
}

const ENDPOINTS: EndpointDef[] = [
  { id: 'health',     method: 'GET',  path: '/',                       label: '① 死活確認',       category: 'server' },
  { id: 'pzl_start',  method: 'POST', path: '/api/pzl/start',          label: '② パズル初期化',   category: 'puzzle',
    defaultBody: JSON.stringify({ puzzle_id: 'PZL-002', skin_id: 'skin_detective_dark' }, null, 2) },
  { id: 'pzl_action', method: 'POST', path: '/api/pzl/action',         label: '③ 操作送信',       category: 'puzzle',
    defaultBody: JSON.stringify({ sess: '', move_index: 5 }, null, 2) },
  { id: 'pzl_check',  method: 'POST', path: '/api/pzl/check',          label: '④ 解答判定',       category: 'puzzle',
    defaultBody: JSON.stringify({ sess: '' }, null, 2) },
  { id: 'pzl_hint',   method: 'GET',  path: '/api/pzl/hint/PZL-002/1', label: '⑤ ヒント取得',    category: 'puzzle' },
  { id: 'pzl_skin',   method: 'GET',  path: '/api/pzl/skin/skin_detective_dark', label: '⑥ スキン取得', category: 'puzzle' },
  { id: 'pzl_list',   method: 'GET',  path: '/api/pzl/list',           label: '⑦ パズル一覧',    category: 'puzzle' },
  { id: 'pzl_state',  method: 'GET',  path: '/api/pzl/state/',         label: '⑧ セッション復元', category: 'puzzle',
    dynamicPath: (sess) => `/api/pzl/state/${sess}` },
  { id: 'bs_start',   method: 'GET',  path: '/api/bs01/start',         label: '⑨ バトル初期化',  category: 'battle' },
  { id: 'bs_action',  method: 'POST', path: '/api/bs01/action',        label: '⑩ コマンド実行',  category: 'battle',
    defaultBody: JSON.stringify({ command: '攻撃', enemy_hp: 70, enemy_maxHp: 70, player_hp: 100, player_maxHp: 100 }, null, 2) },
];

const CATEGORY_LABEL: Record<string, string> = { server: 'Server', puzzle: 'Puzzle', battle: 'Battle' };
const CATEGORY_COLOR: Record<string, string> = { server: '#10b981', puzzle: '#6366f1', battle: '#ef4444' };

// ── ゲーム用型 ────────────────────────────────────────

interface ApiLog {
  id: number;
  dir: 'req' | 'res' | 'err' | 'mock';
  label: string;
  body: string;
  ts: string;
}

interface GameData {
  sess: string;
  puzzleId: string;
  title: string;
  questionText: string;
  state: number[];
  hintCount: number;
  moveCount: number;
  cleared: boolean;
  clearText: string | null;
  hint: string | null;
  hintStep: number;
  log: ApiLog[];
  actionLocked: boolean;
  mockMode: boolean;
}

// ── パズルユーティリティ ──────────────────────────────

function isAdjacent(a: number, b: number): boolean {
  const ar = Math.floor(a / 3), ac = a % 3;
  const br = Math.floor(b / 3), bc = b % 3;
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
}

function nowTs(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour12: false });
}

// ランダムなsessを生成
function mockSess(): string {
  return 'mock-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 6);
}

// ゴール状態から N 手ランダムに動かしてシャッフル（解ける状態保証）
function shuffleBoard(moves: number = 30): number[] {
  let state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  for (let i = 0; i < moves; i++) {
    const emptyIdx = state.indexOf(0);
    const candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(j => isAdjacent(j, emptyIdx));
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const next = [...state];
    [next[emptyIdx], next[pick]] = [next[pick], next[emptyIdx]];
    state = next;
  }
  return state;
}

// ── モック API レスポンス ────────────────────────────

const MOCK_HINTS = [
  'まず角のピースから動かしてみよう',
  '空白マスの隣のタイルしか動かせません',
  '上の行を完成させてから下を揃えよう',
];

const MOCK_PUZZLE_LIST = [
  { id: 'PZL-001', title: 'NumberBridge',    category: 'number', difficulty: 1 },
  { id: 'PZL-002', title: 'スライドパズル',   category: 'slide',  difficulty: 2 },
  { id: 'PZL-003', title: 'Matchstick',      category: 'logic',  difficulty: 2 },
  { id: 'PZL-004', title: 'Balance',         category: 'logic',  difficulty: 3 },
  { id: 'PZL-005', title: 'CaesarCipher',    category: 'cipher', difficulty: 3 },
  { id: 'PZL-006', title: 'SilhouetteMatch', category: 'visual', difficulty: 2 },
  { id: 'PZL-007', title: 'ColorSort',       category: 'sort',   difficulty: 2 },
  { id: 'PZL-008', title: 'MemoryMatch',     category: 'memory', difficulty: 2 },
  { id: 'PZL-009', title: 'Maze',            category: 'maze',   difficulty: 3 },
  { id: 'PZL-010', title: 'LightSwitch',     category: 'logic',  difficulty: 4 },
];

// ── スライドパズル ゲームコンポーネント ───────────────

interface SlidePuzzleGameProps {
  baseUrl: string;
  onClose: () => void;
  onSessUpdate: (s: string) => void;
}

function SlidePuzzleGame({ baseUrl, onClose, onSessUpdate }: SlidePuzzleGameProps) {
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState<GameData | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [puzzleId, setPuzzleId] = useState('PZL-002');
  const [useMock, setUseMock] = useState(true); // デフォルトON

  const nextId = () => logIdRef.current++;

  const addLog = useCallback((g: GameData, dir: ApiLog['dir'], label: string, body: string): GameData => ({
    ...g, log: [...g.log, { id: nextId(), dir, label, body, ts: nowTs() }],
  }), []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [game?.log.length]);

  // ── パズル開始 ──────────────────────────────────────
  const startGame = async () => {
    setStarting(true);
    setStartError(null);

    if (useMock) {
      // ── モックモード ──
      await new Promise(r => setTimeout(r, 400)); // 疑似遅延
      const sess = mockSess();
      const state = shuffleBoard(25);
      const pInfo = MOCK_PUZZLE_LIST.find(p => p.id === puzzleId) ?? MOCK_PUZZLE_LIST[1];
      const mockRes = {
        status: 'ok',
        data: {
          sess, puzzle_id: puzzleId, title: pInfo.title,
          category: pInfo.category, difficulty: pInfo.difficulty,
          question_text: 'バラバラになった絵を並べ直せ',
          state, extra: null, hint_count: 3,
          skin_url: '/assets/skins/skin_detective_dark.json',
        },
      };
      onSessUpdate(sess);
      let g: GameData = {
        sess, puzzleId, title: pInfo.title,
        questionText: mockRes.data.question_text, state,
        hintCount: 3, moveCount: 0, cleared: false, clearText: null,
        hint: null, hintStep: 0, log: [], actionLocked: false, mockMode: true,
      };
      g = addLog(g, 'mock', '📦 MOCK MODE — サーバー不使用', '');
      g = addLog(g, 'req',  `POST /api/pzl/start`, JSON.stringify({ puzzle_id: puzzleId, skin_id: 'skin_detective_dark' }));
      g = addLog(g, 'res',  `200 OK — sess: ${sess.slice(0, 14)}…`, JSON.stringify(mockRes, null, 2));
      setGame(g);
      setStarting(false);
      return;
    }

    // ── 実サーバー ──
    const url = `${baseUrl.replace(/\/$/, '')}/api/pzl/start`;
    const reqBody = JSON.stringify({ puzzle_id: puzzleId, skin_id: 'skin_detective_dark' });
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody });
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.error ?? 'start failed');
      const d = json.data;
      onSessUpdate(d.sess);
      let g: GameData = {
        sess: d.sess, puzzleId: d.puzzle_id, title: d.title,
        questionText: d.question_text, state: d.state,
        hintCount: d.hint_count, moveCount: 0, cleared: false, clearText: null,
        hint: null, hintStep: 1, log: [], actionLocked: false, mockMode: false,
      };
      g = addLog(g, 'req', 'POST /api/pzl/start', reqBody);
      g = addLog(g, 'res', `200 OK — sess: ${d.sess.slice(0, 8)}…`, JSON.stringify(json, null, 2));
      setGame(g);
    } catch (e: unknown) {
      setStartError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
    }
  };

  // ── タイル操作 ──────────────────────────────────────
  const handleTile = useCallback(async (clickedIdx: number) => {
    if (!game || game.cleared || game.actionLocked) return;
    const emptyIdx = game.state.indexOf(0);
    if (!isAdjacent(clickedIdx, emptyIdx)) return;

    setGame(g => g ? { ...g, actionLocked: true } : g);
    const reqBody = JSON.stringify({ sess: game.sess, move_index: clickedIdx });

    if (game.mockMode) {
      // ── モック：ローカルで状態更新 ──
      await new Promise(r => setTimeout(r, 80));
      const next = [...game.state];
      [next[emptyIdx], next[clickedIdx]] = [next[clickedIdx], next[emptyIdx]];
      const cleared = next.join(',') === '1,2,3,4,5,6,7,8,0';
      const mockRes = { status: 'ok', data: { state: next, cleared } };

      setGame(g => {
        if (!g) return g;
        let ng = { ...g, state: next, moveCount: g.moveCount + 1, actionLocked: false };
        ng = addLog(ng, 'req', `POST /api/pzl/action  tile[${clickedIdx}]→空白[${emptyIdx}]`, reqBody);
        ng = addLog(ng, 'res', `200 OK  cleared:${cleared}`, JSON.stringify(mockRes, null, 2));
        if (cleared) ng = { ...ng, cleared: true, clearText: '見事！パズルを解いた！' };
        return ng;
      });
      return;
    }

    // ── 実サーバー ──
    const url = `${baseUrl.replace(/\/$/, '')}/api/pzl/action`;
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody });
      const json = await res.json();
      if (json.status !== 'ok') {
        setGame(g => g ? { ...addLog(g, 'err', 'action error', json.error ?? 'unknown'), actionLocked: false } : g);
        return;
      }
      const d = json.data;
      setGame(g => {
        if (!g) return g;
        let ng = { ...g, state: d.state, moveCount: g.moveCount + 1, actionLocked: false };
        ng = addLog(ng, 'req', `POST /api/pzl/action  move:${clickedIdx}`, reqBody);
        ng = addLog(ng, 'res', `200 OK  cleared:${d.cleared}`, JSON.stringify(json, null, 2));
        if (d.cleared) ng = { ...ng, cleared: true, clearText: '見事！パズルを解いた！' };
        return ng;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setGame(g => g ? { ...addLog(g, 'err', 'network error', msg), actionLocked: false } : g);
    }
  }, [game, baseUrl, addLog]);

  // ── ヒント ──────────────────────────────────────────
  const handleHint = useCallback(async () => {
    if (!game || game.cleared) return;
    const step = game.hintStep;

    if (game.mockMode) {
      await new Promise(r => setTimeout(r, 200));
      const text = MOCK_HINTS[step % MOCK_HINTS.length];
      const mockRes = { status: 'ok', data: { puzzle_id: game.puzzleId, step: step + 1, text, cost: 10 } };
      setGame(g => {
        if (!g) return g;
        let ng: GameData = { ...g, hint: text, hintStep: step + 1 };
        ng = addLog(ng, 'req', `GET /api/pzl/hint/${game.puzzleId}/${step + 1}`, '');
        ng = addLog(ng, 'res', `200 OK`, JSON.stringify(mockRes, null, 2));
        return ng;
      });
      return;
    }

    const url = `${baseUrl.replace(/\/$/, '')}/api/pzl/hint/${game.puzzleId}/${step + 1}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const text = json.data?.text ?? 'ヒントなし';
      setGame(g => {
        if (!g) return g;
        let ng = { ...g, hint: text, hintStep: step + 1 };
        ng = addLog(ng, 'req', `GET /api/pzl/hint/${game.puzzleId}/${step + 1}`, '');
        ng = addLog(ng, 'res', `200 OK`, JSON.stringify(json, null, 2));
        return ng;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setGame(g => g ? addLog(g, 'err', 'hint error', msg) : g);
    }
  }, [game, baseUrl, addLog]);

  const handleRestart = () => { setGame(null); setStartError(null); };

  const TILE_SIZE = 84;

  // ── ログエントリのスタイル
  const logStyle = (dir: ApiLog['dir']) => ({
    bg:    dir === 'req' ? '#1a2a4a' : dir === 'res' ? '#0a2a1a' : dir === 'mock' ? '#1a1a00' : '#2a0a0a',
    color: dir === 'req' ? '#60a5fa' : dir === 'res' ? '#34d399' : dir === 'mock' ? '#fbbf24' : '#f87171',
    label: dir === 'req' ? '→ REQ' : dir === 'res' ? '← RES' : dir === 'mock' ? '📦 MOCK' : '✕ ERR',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0f1117', border: '1px solid #1e293b', borderRadius: 16,
        width: 'min(940px, 96vw)', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
      }}>

        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderBottom: '1px solid #1e293b',
          background: '#0d1117', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 18 }}>🧩</span>
          <span style={{ fontWeight: 700, color: '#6366f1', fontSize: 15 }}>
            {game ? `${game.title} — ${game.puzzleId}` : 'スライドパズル'}
          </span>
          {game && !game.cleared && (
            <span style={{ color: '#6b7280', fontSize: 12 }}>
              手数: <b style={{ color: '#e2e8f0' }}>{game.moveCount}</b>
            </span>
          )}
          {game?.mockMode && (
            <span style={{
              background: '#1a1a00', border: '1px solid #ca8a04', borderRadius: 4,
              color: '#fbbf24', fontSize: 10, padding: '2px 8px', fontWeight: 700,
            }}>📦 MOCK MODE</span>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {game && !game.cleared && (
              <button onClick={handleHint} style={{
                background: '#1e293b', border: '1px solid #ca8a04', color: '#fbbf24',
                padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              }}>💡 ヒント</button>
            )}
            {game && (
              <button onClick={handleRestart} style={{
                background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
                padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              }}>🔄 リスタート</button>
            )}
            <button onClick={onClose} style={{
              background: 'transparent', border: '1px solid #374151', color: '#6b7280',
              padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
            }}>✕ 閉じる</button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* ── 左：ゲームボード ── */}
          <div style={{
            width: 340, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 20, borderRight: '1px solid #1e293b', gap: 16, flexShrink: 0,
          }}>

            {!game ? (
              /* ── 開始前 ── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>

                {/* モード切替 */}
                <div style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
                  padding: '10px 16px', width: '100%', boxSizing: 'border-box',
                }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>接続モード</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setUseMock(true)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        background: useMock ? '#1a2a4a' : 'transparent',
                        border: useMock ? '2px solid #6366f1' : '2px solid #334155',
                        color: useMock ? '#a5b4fc' : '#6b7280',
                        fontWeight: useMock ? 700 : 400,
                      }}
                    >
                      📦 モックモード<br />
                      <span style={{ fontSize: 10, opacity: 0.7 }}>サーバー不要</span>
                    </button>
                    <button
                      onClick={() => setUseMock(false)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        background: !useMock ? '#0a2a1a' : 'transparent',
                        border: !useMock ? '2px solid #10b981' : '2px solid #334155',
                        color: !useMock ? '#34d399' : '#6b7280',
                        fontWeight: !useMock ? 700 : 400,
                      }}
                    >
                      🌐 実サーバー<br />
                      <span style={{ fontSize: 10, opacity: 0.7 }}>Vercel/localhost</span>
                    </button>
                  </div>
                </div>

                {/* パズル選択 */}
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>パズル選択</div>
                  <select
                    value={puzzleId}
                    onChange={e => setPuzzleId(e.target.value)}
                    style={{
                      width: '100%', background: '#1e293b', border: '1px solid #334155',
                      color: '#e2e8f0', padding: '8px 12px', borderRadius: 8,
                      fontSize: 13, cursor: 'pointer', boxSizing: 'border-box',
                    }}
                  >
                    {MOCK_PUZZLE_LIST.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* エラー */}
                {startError && (
                  <div style={{
                    background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8,
                    padding: '8px 14px', color: '#f87171', fontSize: 12, textAlign: 'center', width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    ❌ {startError}<br />
                    <span style={{ fontSize: 10, opacity: 0.7 }}>📦 モックモードをお試しください</span>
                  </div>
                )}

                {/* スタートボタン */}
                <button
                  onClick={startGame}
                  disabled={starting}
                  style={{
                    background: starting ? '#374151'
                      : useMock ? 'linear-gradient(135deg, #3730a3, #6366f1)'
                                : 'linear-gradient(135deg, #065f46, #10b981)',
                    border: 'none', color: '#fff', padding: '12px 32px',
                    borderRadius: 10, cursor: starting ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: 15, width: '100%',
                  }}
                >
                  {starting ? '⏳ 接続中...' : `▶ ゲームスタート${useMock ? ' (Mock)' : ''}`}
                </button>

                <div style={{ fontSize: 10, color: '#4b5563', textAlign: 'center', lineHeight: 1.6 }}>
                  モックモード：ローカルでゲームロジックを実行します<br />
                  APIログはサーバー通信と同じ形式で記録されます
                </div>
              </div>

            ) : game.cleared ? (
              /* ── クリア画面 ── */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
                <div style={{ color: '#34d399', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>パズルクリア！</div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{game.clearText}</div>
                <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 20 }}>手数: {game.moveCount}</div>
                {/* クリア後ボード */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 4, margin: '0 auto 20px', width: TILE_SIZE * 3 + 8,
                }}>
                  {game.state.map((v, i) => (
                    <div key={i} style={{
                      width: TILE_SIZE, height: TILE_SIZE,
                      background: v === 0 ? '#0d1117' : '#1d4ed8',
                      border: '2px solid #2563eb', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 700, color: '#e2e8f0',
                    }}>
                      {v !== 0 ? v : ''}
                    </div>
                  ))}
                </div>
                <button onClick={handleRestart} style={{
                  background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                  border: 'none', color: '#fff', padding: '10px 28px',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                }}>
                  🔄 もう一度プレイ
                </button>
              </div>

            ) : (
              /* ── ゲーム中 ── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>{game.questionText}</div>

                {/* 3×3ボード */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6, background: '#1e293b', padding: 8, borderRadius: 12,
                  border: '2px solid #334155',
                }}>
                  {game.state.map((v, i) => {
                    const emptyIdx = game.state.indexOf(0);
                    const canMove = v !== 0 && isAdjacent(i, emptyIdx) && !game.actionLocked;
                    return (
                      <button
                        key={i}
                        onClick={() => handleTile(i)}
                        disabled={v === 0 || game.actionLocked}
                        style={{
                          width: TILE_SIZE, height: TILE_SIZE,
                          background: v === 0
                            ? '#0d1117'
                            : canMove
                              ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                              : 'linear-gradient(135deg, #1e3a5f, #1a3060)',
                          border: v === 0
                            ? '2px dashed #1e293b'
                            : canMove ? '2px solid #60a5fa' : '2px solid #334155',
                          borderRadius: 8,
                          cursor: canMove ? 'pointer' : v === 0 ? 'default' : 'not-allowed',
                          fontSize: 26, fontWeight: 700,
                          color: canMove ? '#fff' : '#4a6fa5',
                          transition: 'all 0.1s',
                          transform: canMove ? 'scale(1.04)' : 'scale(1)',
                          boxShadow: canMove ? '0 4px 14px rgba(59,130,246,0.5)' : 'none',
                        }}
                      >
                        {v !== 0 ? v : ''}
                      </button>
                    );
                  })}
                </div>

                {/* ヒント */}
                {game.hint && (
                  <div style={{
                    background: '#1a1a00', border: '1px solid #ca8a04', borderRadius: 8,
                    padding: '8px 14px', color: '#fbbf24', fontSize: 13,
                    textAlign: 'center', maxWidth: 280,
                  }}>
                    💡 {game.hint}
                  </div>
                )}

                {/* 目標状態 */}
                <div style={{ fontSize: 11, color: '#374151', textAlign: 'center' }}>
                  目標: 1 2 3 / 4 5 6 / 7 8 □　　光るタイルをクリック
                </div>
              </div>
            )}
          </div>

          {/* ── 右：API ログ ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0e17' }}>
            <div style={{
              padding: '8px 14px', borderBottom: '1px solid #1e293b',
              fontSize: 11, color: '#4b5563', fontWeight: 700, letterSpacing: 1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              API LOG
              {game?.mockMode && (
                <span style={{ fontSize: 10, color: '#ca8a04' }}>
                  ※ モックモード — 実際の HTTP 通信は行われていません
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {(!game || game.log.length === 0) ? (
                <div style={{ color: '#374151', fontSize: 12, padding: '20px 14px' }}>
                  ゲームスタート後に API ログがここに表示されます
                </div>
              ) : (
                game.log.map(entry => {
                  const s = logStyle(entry.dir);
                  return (
                    <div key={entry.id} style={{ padding: '5px 14px', borderBottom: '1px solid #0d1117' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                          background: s.bg, color: s.color,
                          minWidth: 36, textAlign: 'center',
                        }}>
                          {s.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{entry.label}</span>
                        <span style={{ fontSize: 10, color: '#374151' }}>{entry.ts}</span>
                      </div>
                      {entry.body && (
                        <pre style={{
                          margin: '2px 0 0 42px', fontSize: 10, color: '#4b6a8a',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.4,
                          maxHeight: 110, overflow: 'auto',
                        }}>
                          {entry.body}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────────

export function HonoApiTestScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [selected, setSelected] = useState<EndpointDef>(ENDPOINTS[0]);
  const [bodies, setBodies] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    ENDPOINTS.forEach(ep => { if (ep.defaultBody) init[ep.id] = ep.defaultBody; });
    return init;
  });
  const [responses, setResponses] = useState<Record<string, { status: number; body: string; time: number } | { error: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [sess, setSess] = useState('');
  const [showGame, setShowGame] = useState(false);

  const getBody = (ep: EndpointDef): string => {
    const raw = bodies[ep.id] ?? ep.defaultBody ?? '';
    if (!sess || !raw) return raw;
    try {
      const obj = JSON.parse(raw);
      if ('sess' in obj && !obj.sess) return JSON.stringify({ ...obj, sess }, null, 2);
    } catch { /* ignore */ }
    return raw;
  };

  const send = useCallback(async (ep: EndpointDef) => {
    const path = ep.dynamicPath ? ep.dynamicPath(sess) : ep.path;
    const url = `${baseUrl.replace(/\/$/, '')}${path}`;
    setLoading(ep.id);
    const start = Date.now();
    try {
      const opts: RequestInit = { method: ep.method };
      if (ep.method === 'POST') {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = getBody(ep) || '{}';
      }
      const res = await fetch(url, opts);
      const time = Date.now() - start;
      let body: string;
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const json = await res.json();
        body = JSON.stringify(json, null, 2);
        if (json?.data?.sess) setSess(json.data.sess);
      } else {
        body = await res.text();
      }
      setResponses(prev => ({ ...prev, [ep.id]: { status: res.status, body, time } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setResponses(prev => ({ ...prev, [ep.id]: { error: msg } }));
    } finally {
      setLoading(null);
    }
  }, [baseUrl, sess, bodies]);

  const resp = responses[selected.id];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#0f1117', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '13px',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '10px 16px', borderBottom: '1px solid #1e293b', background: '#0d1117',
      }}>
        <button onClick={() => setScreen('TITLE')}
          style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
          ← Back
        </button>
        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 15 }}>🔌 Hono MiniForge API Tester</span>

        {/* ゲームスタートボタン */}
        <button onClick={() => setShowGame(true)} style={{
          background: 'linear-gradient(135deg, #4338ca, #6366f1)',
          border: 'none', color: '#fff', padding: '5px 16px',
          borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
          boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
        }}>
          🧩 ゲームスタート
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flex: 1, maxWidth: 420 }}>
          <span style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>Base URL:</span>
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
            style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}
            placeholder="http://localhost:3000"
          />
        </div>
        {sess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#6b7280' }}>sess:</span>
            <span style={{ background: '#1e293b', border: '1px solid #10b981', color: '#34d399', padding: '2px 8px', borderRadius: 4, fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sess}>{sess}</span>
            <button onClick={() => setSess('')} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 11 }}>✕</button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: '1px solid #1e293b', overflowY: 'auto', padding: '8px 0', background: '#0d1117' }}>
          {(['server', 'puzzle', 'battle'] as const).map(cat => (
            <div key={cat}>
              <div style={{ padding: '6px 14px 4px', fontSize: 10, fontWeight: 700, color: CATEGORY_COLOR[cat], letterSpacing: 1, textTransform: 'uppercase' }}>
                {CATEGORY_LABEL[cat]}
              </div>
              {ENDPOINTS.filter(ep => ep.category === cat).map(ep => {
                const isActive = selected.id === ep.id;
                const r = responses[ep.id];
                const statusCode = r && 'status' in r ? r.status : null;
                return (
                  <button key={ep.id} onClick={() => setSelected(ep)} style={{
                    width: '100%', textAlign: 'left',
                    background: isActive ? '#1e293b' : 'transparent',
                    border: 'none', borderLeft: isActive ? `2px solid ${CATEGORY_COLOR[cat]}` : '2px solid transparent',
                    color: isActive ? '#f1f5f9' : '#94a3b8',
                    padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: ep.method === 'GET' ? '#065f46' : '#7c2d12', color: ep.method === 'GET' ? '#34d399' : '#fb923c', minWidth: 30, textAlign: 'center' }}>
                      {ep.method}
                    </span>
                    <span style={{ flex: 1, fontSize: 12 }}>{ep.label}</span>
                    {ep.id in responses && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: statusCode === 200 ? '#34d399' : '#f87171' }}>{statusCode ?? '!'}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid #1e293b', padding: '12px 16px', background: '#0f1117' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: selected.method === 'GET' ? '#065f46' : '#7c2d12', color: selected.method === 'GET' ? '#34d399' : '#fb923c' }}>
                {selected.method}
              </span>
              <span style={{ flex: 1, background: '#1e293b', padding: '5px 12px', borderRadius: 6, color: '#94a3b8', fontSize: 13 }}>
                {baseUrl.replace(/\/$/, '')}{selected.dynamicPath ? selected.dynamicPath(sess || ':sess') : selected.path}
              </span>
              <button onClick={() => send(selected)} disabled={loading === selected.id} style={{
                background: loading === selected.id ? '#374151' : '#1d4ed8',
                border: 'none', color: '#fff', padding: '6px 18px',
                borderRadius: 6, cursor: loading === selected.id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13,
              }}>
                {loading === selected.id ? '⏳ 送信中...' : '▶ Send'}
              </button>
            </div>
            {selected.method === 'POST' && (
              <div>
                <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 4 }}>Request Body (JSON)</div>
                <textarea value={getBody(selected)} onChange={e => setBodies(prev => ({ ...prev, [selected.id]: e.target.value }))} rows={6}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 12px', borderRadius: 6, fontFamily: 'monospace', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            )}
            {selected.dynamicPath && !sess && (
              <div style={{ background: '#422006', border: '1px solid #92400e', borderRadius: 6, padding: '6px 12px', color: '#fbbf24', fontSize: 12, marginTop: 6 }}>
                ⚠️ sess が未設定です。先に ② パズル初期化 を実行してください。
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {!resp && <div style={{ color: '#374151', textAlign: 'center', paddingTop: 40, fontSize: 14 }}>▶ Send を押してリクエストを送信してください</div>}
            {resp && 'error' in resp && (
              <div>
                <div style={{ color: '#f87171', fontWeight: 700, marginBottom: 8 }}>❌ Network Error</div>
                <pre style={{ background: '#1a0a0a', border: '1px solid #450a0a', borderRadius: 6, padding: 12, color: '#fca5a5', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{resp.error}</pre>
              </div>
            )}
            {resp && 'status' in resp && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: resp.status === 200 ? '#34d399' : '#f87171' }}>
                    {resp.status === 200 ? '✅' : '⚠️'} Status: {resp.status}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>{resp.time}ms</span>
                  {resp.status === 200 && (() => {
                    try { const o = JSON.parse(resp.body); if (o?.data?.sess) return <span style={{ color: '#10b981', fontSize: 12 }}>💾 sess 自動取得</span>; } catch { /* ignore */ }
                    return null;
                  })()}
                </div>
                <pre style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 6, padding: 14, color: '#a3e635', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12, lineHeight: 1.6 }}>
                  {resp.body}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Puzzle Game Modal */}
      {showGame && (
        <SlidePuzzleGame
          baseUrl={baseUrl}
          onClose={() => setShowGame(false)}
          onSessUpdate={s => setSess(s)}
        />
      )}
    </div>
  );
}
