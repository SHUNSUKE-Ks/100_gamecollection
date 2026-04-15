// ============================================================
// AndroidNovelPlayer — 縦型ノベルプレイヤー (テスト版)
// テキストのみ / レミ・ウナント → 立ち絵表示（黒背景）
// タップ or Space/Enter/→ で進行
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import testNovelRaw from '@/data/collection/test_novel.json';

// ─── Types ─────────────────────────────────────────────────

export interface PlayerTitleEntry {
  id: string;
  name: string;
  subtitle?: string;
}

interface RawLine {
  speaker: string;
  text: string;
}

interface RawScene {
  id: string;
  title: string;
  lines: RawLine[];
}

interface RawEpisode {
  id: string;
  title: string;
  scenes: RawScene[];
}

interface RawNovel {
  id: string;
  titleId: string;
  gameTitle: string;
  gameSubtitle?: string;
  episodes: RawEpisode[];
}

type FlatEntry =
  | { kind: 'episode'; label: string }
  | { kind: 'scene';   label: string }
  | { kind: 'line';    speaker: string; text: string };

type Phase = 'title' | 'reading' | 'end';

// ─── Constants ─────────────────────────────────────────────

const REMI_NAME     = 'レミ・ウナント';
const REMI_STANDING = '/src/assets/chara/remi_unant/standing_01.png';
const TYPING_MS     = 36; // ms per character

// ─── Helper: flatten episodes → FlatEntry[] ────────────────

function flattenNovel(novel: RawNovel): FlatEntry[] {
  const result: FlatEntry[] = [];
  for (const ep of novel.episodes) {
    result.push({ kind: 'episode', label: ep.title });
    for (const sc of ep.scenes) {
      result.push({ kind: 'scene', label: sc.title });
      for (const ln of sc.lines) {
        result.push({ kind: 'line', speaker: ln.speaker, text: ln.text });
      }
    }
  }
  return result;
}

/** 現在 cursor 地点でのエピソード・シーン名を返す */
function getContext(entries: FlatEntry[], cursor: number) {
  let episode = '';
  let scene   = '';
  for (let i = 0; i <= Math.min(cursor, entries.length - 1); i++) {
    const e = entries[i];
    if (e.kind === 'episode') episode = e.label;
    if (e.kind === 'scene')   scene   = e.label;
  }
  return { episode, scene };
}

// ─── Component ─────────────────────────────────────────────

interface Props {
  title: PlayerTitleEntry;
  onClose: () => void;
}

export function AndroidNovelPlayer({ title, onClose }: Props) {
  const novel   = testNovelRaw as RawNovel;
  const entries = flattenNovel(novel);

  const [phase,         setPhase]         = useState<Phase>('title');
  const [cursor,        setCursor]        = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping,      setIsTyping]      = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = entries[cursor] ?? null;
  const ctx     = getContext(entries, cursor);

  // ── Typewriter effect ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'reading' || !current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (current.kind !== 'line') {
      setDisplayedText(current.label);
      setIsTyping(false);
      return;
    }

    const fullText = current.text;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;

    timerRef.current = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsTyping(false);
      }
    }, TYPING_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cursor, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Advance ─────────────────────────────────────────────
  const advance = useCallback(() => {
    if (phase === 'title') {
      setPhase('reading');
      setCursor(0);
      return;
    }
    if (phase === 'end') {
      onClose();
      return;
    }

    // reading: タイプ中ならテキストを即完成
    if (isTyping) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setIsTyping(false);
      if (current?.kind === 'line') setDisplayedText(current.text);
      return;
    }

    // 次へ
    const next = cursor + 1;
    if (next >= entries.length) {
      setPhase('end');
    } else {
      setCursor(next);
    }
  }, [phase, isTyping, cursor, current, entries.length, onClose]);

  // ── Keyboard shortcut (PCテスト用) ──────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        advance();
      }
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, onClose]);

  // ── Shared close button ─────────────────────────────────
  const CloseBtn = (
    <button
      onClick={e => { e.stopPropagation(); onClose(); }}
      style={{
        position: 'absolute', top: 14, right: 14, zIndex: 10,
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 8, padding: '5px 10px',
        color: '#6b7280', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem',
      }}
    >
      <X size={12} /> 閉じる
    </button>
  );

  // ── Title Screen ────────────────────────────────────────
  if (phase === 'title') {
    return (
      <div
        onClick={advance}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: '#000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', userSelect: 'none',
          fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif',
        }}
      >
        {CloseBtn}
        <div style={{ textAlign: 'center', padding: '0 2.5rem' }}>
          <div style={{
            fontSize: '0.7rem', letterSpacing: '0.25em',
            color: '#374151', marginBottom: '1.25rem',
            textTransform: 'uppercase',
          }}>
            {title.name}
          </div>
          <h1 style={{
            fontSize: '1.8rem', fontWeight: 700,
            color: '#e5e7eb', margin: '0 0 0.6rem',
            lineHeight: 1.4,
          }}>
            {novel.gameTitle}
          </h1>
          {novel.gameSubtitle && (
            <div style={{
              fontSize: '0.95rem', color: '#c9a227',
              marginBottom: '3.5rem', letterSpacing: '0.08em',
            }}>
              ── {novel.gameSubtitle} ──
            </div>
          )}
          <div style={{
            width: 1, height: 48,
            background: 'linear-gradient(to bottom, #374151, transparent)',
            margin: '0 auto 2rem',
          }} />
          <div style={{
            fontSize: '0.7rem', color: '#1f2937',
            letterSpacing: '0.18em', animation: 'npPulse 2s ease-in-out infinite',
          }}>
            タップして開始
          </div>
        </div>
        <style>{`
          @keyframes npPulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
          @keyframes npBlink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes npBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
        `}</style>
      </div>
    );
  }

  // ── End Screen ──────────────────────────────────────────
  if (phase === 'end') {
    return (
      <div
        onClick={advance}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: '#000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', userSelect: 'none',
          fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif',
        }}
      >
        {CloseBtn}
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ width: 40, height: 1, background: '#374151', margin: '0 auto 1.5rem' }} />
          <div style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>了</div>
          <div style={{ width: 40, height: 1, background: '#374151', margin: '1.5rem auto 0' }} />
          <div style={{
            fontSize: '0.68rem', marginTop: '3rem', color: '#1f2937', letterSpacing: '0.15em',
          }}>
            タップして終了
          </div>
        </div>
      </div>
    );
  }

  // ── Reading Screen ──────────────────────────────────────
  const isRemi    = current?.kind === 'line' && current.speaker === REMI_NAME;
  const isHeader  = current?.kind === 'episode' || current?.kind === 'scene';
  const isNarration = current?.kind === 'line' && !current.speaker;

  return (
    <div
      onClick={advance}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer', userSelect: 'none', overflow: 'hidden',
        fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif',
      }}
    >
      <style>{`
        @keyframes npPulse  { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes npBlink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes npBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
      `}</style>

      {/* Close */}
      {CloseBtn}

      {/* ── Context label (top-left) ─────────────────────── */}
      {!isHeader && ctx.episode && (
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 5,
          fontSize: '0.62rem', color: '#1f2937', letterSpacing: '0.08em',
          maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {ctx.episode}
          {ctx.scene && <> ／ <span style={{ color: '#111827' }}>{ctx.scene}</span></>}
        </div>
      )}

      {/* ── Episode Header ───────────────────────────────── */}
      {current?.kind === 'episode' && (
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '4rem 2.5rem',
        }}>
          <div style={{ width: 32, height: 1, background: '#c9a227', marginBottom: '1.5rem' }} />
          <div style={{
            fontSize: '1.2rem', color: '#e5e7eb', fontWeight: 700,
            textAlign: 'center', lineHeight: 1.7, letterSpacing: '0.05em',
          }}>
            {displayedText}
          </div>
          <div style={{ width: 32, height: 1, background: '#c9a227', marginTop: '1.5rem' }} />
          <div style={{
            position: 'absolute', bottom: 44,
            fontSize: '0.65rem', color: '#1f2937',
            letterSpacing: '0.1em', animation: 'npPulse 2s ease-in-out infinite',
          }}>
            タップして続ける
          </div>
        </div>
      )}

      {/* ── Scene Header ─────────────────────────────────── */}
      {current?.kind === 'scene' && (
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '3rem 2rem',
        }}>
          <div style={{
            fontSize: '0.95rem', color: '#9ca3af',
            letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.8,
            padding: '0.6rem 1.5rem',
            borderTop: '1px solid #111827',
            borderBottom: '1px solid #111827',
          }}>
            {displayedText}
          </div>
          <div style={{
            position: 'absolute', bottom: 44,
            fontSize: '0.65rem', color: '#1f2937',
            letterSpacing: '0.1em', animation: 'npPulse 2s ease-in-out infinite',
          }}>
            タップして続ける
          </div>
        </div>
      )}

      {/* ── Dialog / Narration ───────────────────────────── */}
      {current?.kind === 'line' && (
        <>
          {/* Standing image (Remi) */}
          {isRemi && (
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={REMI_STANDING}
                alt={REMI_NAME}
                style={{
                  maxHeight: '62vh', maxWidth: '88%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 24px rgba(201,162,39,0.18))',
                  display: 'block',
                }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Spacer for non-Remi */}
          {!isRemi && <div style={{ flex: 1 }} />}

          {/* Text box */}
          <div style={{
            flexShrink: 0,
            padding: '0 0.75rem',
            paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom, 0.875rem))',
          }}>
            <div style={{
              background: isNarration
                ? 'rgba(6,6,10,0.72)'
                : 'rgba(8,8,14,0.93)',
              border: `1px solid ${isNarration ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, overflow: 'hidden',
            }}>

              {/* Speaker name */}
              {current.speaker && (
                <div style={{
                  padding: '0.5rem 1rem 0',
                  fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: isRemi ? '#c9a227' : '#60a5fa',
                }}>
                  {current.speaker}
                </div>
              )}

              {/* Text */}
              <div style={{
                padding: current.speaker
                  ? '0.3rem 1rem 0.85rem'
                  : '0.85rem 1rem',
                fontSize: isNarration ? '0.85rem' : '0.93rem',
                color: isNarration ? '#9ca3af' : '#e5e7eb',
                lineHeight: 1.9, minHeight: '4.2rem',
                letterSpacing: '0.025em',
                fontStyle: isNarration ? 'italic' : 'normal',
              }}>
                {displayedText}
                {isTyping && (
                  <span style={{
                    display: 'inline-block', width: 2, height: '0.9em',
                    background: '#c9a227',
                    marginLeft: 2, verticalAlign: 'text-bottom',
                    animation: 'npBlink 0.65s step-end infinite',
                  }} />
                )}
              </div>

              {/* Advance indicator */}
              {!isTyping && (
                <div style={{ textAlign: 'right', padding: '0 0.85rem 0.5rem' }}>
                  <span style={{
                    fontSize: '0.72rem', color: '#374151',
                    display: 'inline-block',
                    animation: 'npBounce 1.4s ease-in-out infinite',
                  }}>
                    ▼
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
