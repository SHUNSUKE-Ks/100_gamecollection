// ============================================================
// GamePackageScreen — DevStudio GamePackage 管理 v2
// NovelLibrary 非依存・直接 JSON 登録 + DONE01 プレイヤー
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDevStudioStore } from '@/devstudio/core/state/useDevStudioStore';
import type { NovelSchemaV51, V51ChoiceOption, V51Choice } from '@/parts/collection/story/NovelLibraryView';

// ─── Types ───────────────────────────────────────────────────

type GpStatus = 'ordered' | 'delivered' | 'schema_checked' | 'implemented';

interface GpNovelEntry {
  id:            string;
  title:         string;
  schemaVersion: string;
  schema:        unknown | null;   // 直接登録した JSON
  status:        GpStatus;
  checkResult?:  'ok' | 'error';
  checkError?:   string;
  createdAt:     string;
}

const STATUS_LABELS: Record<GpStatus, { label: string; color: string }> = {
  ordered:        { label: '発注済み',             color: '#f59e0b' },
  delivered:      { label: '納品済み',             color: '#3b82f6' },
  schema_checked: { label: 'スキーマーチェック済み', color: '#8b5cf6' },
  implemented:    { label: '実装済み',             color: '#10b981' },
};

// 選択可能なスキーマーバージョン（今後追加予定）
const SCHEMA_VERSIONS = ['5.1'] as const;
type SchemaVersion = typeof SCHEMA_VERSIONS[number];

// ─── localStorage hook ────────────────────────────────────────

const GP_NOVEL_KEY = 'game_package_novel_v1';

function useGpNovel() {
  const [entries, setEntries] = useState<GpNovelEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(GP_NOVEL_KEY) ?? '[]'); }
    catch { return []; }
  });

  const persist = useCallback((next: GpNovelEntry[]) => {
    setEntries(next);
    localStorage.setItem(GP_NOVEL_KEY, JSON.stringify(next));
  }, []);

  const add    = useCallback((e: GpNovelEntry) => persist([...entries, e]),                [entries, persist]);
  const remove = useCallback((id: string)       => persist(entries.filter(e => e.id !== id)), [entries, persist]);
  const update = useCallback((e: GpNovelEntry)  => persist(entries.map(x => x.id === e.id ? e : x)), [entries, persist]);

  return { entries, add, remove, update };
}

function genId()           { return `gp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`; }
function fmtDate(iso: string) { return iso.slice(0, 10); }

// ─── Schema validator (v5.1) ──────────────────────────────────

function validateV51(schema: unknown): { ok: boolean; error?: string } {
  try {
    const s = schema as Record<string, unknown>;
    if (!s || typeof s !== 'object') return { ok: false, error: 'オブジェクトではありません' };

    const ev = s.events as Record<string, unknown> | undefined;
    const ch = s.chats  as Record<string, unknown> | undefined;
    const co = s.choices as Record<string, unknown> | undefined;

    if (!Array.isArray(ev?.events))  return { ok: false, error: 'events.events が見つかりません' };
    if (!Array.isArray(ch?.chats))   return { ok: false, error: 'chats.chats が見つかりません' };
    if (!Array.isArray(co?.choices)) return { ok: false, error: 'choices.choices が見つかりません' };

    const chatIds   = new Set((ch.chats   as { chat_id: string }[]).map(c => c.chat_id));
    const choiceIds = new Set((co.choices as { choice_id: string }[]).map(c => c.choice_id));

    for (const event of ev.events as { type: string; ref_id: string; event_id: string }[]) {
      if (event.type === 'CHAT'   && !chatIds.has(event.ref_id))
        return { ok: false, error: `CHAT ref_id "${event.ref_id}" が chats に存在しません` };
      if (event.type === 'CHOICE' && !choiceIds.has(event.ref_id))
        return { ok: false, error: `CHOICE ref_id "${event.ref_id}" が choices に存在しません` };
    }
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Asset helpers ────────────────────────────────────────────

function parseAssetTag(tag: string): { type: string; key: string } | null {
  const m = tag.match(/^(\w+):(\w+)$/);
  return m ? { type: m[1], key: m[2] } : null;
}

function getAssetFilename(schema: NovelSchemaV51, key: string): string | null {
  try {
    const ao    = schema.assetOrder as Record<string, unknown> | undefined;
    const novel = (ao?.ASSET_ORDER as Record<string, unknown>)?.NOVEL as Record<string, string> | undefined;
    return novel?.[key] ?? null;
  } catch { return null; }
}

function parseScale(filename: string): string {
  const m = filename.match(/(\d+)[x_×](\d+)/);
  return m ? `${m[1]}×${m[2]}` : '';
}

// ─── GamePackageScreen ────────────────────────────────────────

type PkgTab = 'novel' | 'char' | 'bg' | 'item';

const TABS: { id: PkgTab; label: string; stub?: boolean }[] = [
  { id: 'novel', label: '📖 Novel JSON' },
  { id: 'char',  label: '👤 Character',  stub: true },
  { id: 'bg',    label: '🖼 Background',  stub: true },
  { id: 'item',  label: '💎 Item',        stub: true },
];

export function GamePackageScreen() {
  const [tab, setTab] = useState<PkgTab>('novel');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.2)', flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem' }}>📦</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.05em' }}>
          GAME PACKAGE
        </span>
        <span style={{ fontSize: '0.6rem', color: '#4b5563', marginLeft: 4 }}>
          JSON 直接登録 / スキーマーチェック / DONE01 プレイテスト
        </span>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.1)', flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => !t.stub && setTab(t.id)} style={{
            padding: '8px 16px', border: 'none', cursor: t.stub ? 'default' : 'pointer',
            background: tab === t.id ? 'rgba(139,92,246,0.15)' : 'none',
            borderBottom: tab === t.id ? '2px solid #8b5cf6' : '2px solid transparent',
            color: tab === t.id ? '#c4b5fd' : t.stub ? '#374151' : '#6b7280',
            fontSize: '0.72rem', fontWeight: tab === t.id ? 700 : 400,
            transition: 'all 0.15s',
          }}>
            {t.label}
            {t.stub && <span style={{ fontSize: '0.55rem', color: '#374151', marginLeft: 4 }}>予定</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'novel' ? <NovelJsonDB /> : <StubTab label={TABS.find(t => t.id === tab)!.label} />}
      </div>
    </div>
  );
}

function StubTab({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, gap: 8, color: '#374151',
    }}>
      <span style={{ fontSize: '2rem', opacity: 0.3 }}>{label.split(' ')[0]}</span>
      <span style={{ fontSize: '0.75rem' }}>{label} DB — 実装予定</span>
      <span style={{ fontSize: '0.62rem', color: '#2d2d3f' }}>スキーマーが確定したら実装します</span>
    </div>
  );
}

// ─── NovelJsonDB ──────────────────────────────────────────────

function NovelJsonDB() {
  const { entries, add, remove, update } = useGpNovel();
  const { addTask, addLog } = useDevStudioStore();
  const [showCreate, setShowCreate] = useState(false);
  const [playTarget, setPlayTarget] = useState<{ gp: GpNovelEntry; schema: NovelSchemaV51 } | null>(null);

  const handlePlay = (gp: GpNovelEntry) => {
    if (!gp.schema) {
      alert('JSON が登録されていません。エントリを編集して JSON を登録してください。');
      return;
    }
    setPlayTarget({ gp, schema: gp.schema as NovelSchemaV51 });
  };

  const handleCheck = (gp: GpNovelEntry) => {
    if (!gp.schema) {
      update({ ...gp, checkResult: 'error', checkError: 'JSON が登録されていません' });
      return;
    }
    const result = validateV51(gp.schema);
    update({
      ...gp,
      checkResult: result.ok ? 'ok' : 'error',
      checkError:  result.error,
      status: result.ok && gp.status === 'delivered' ? 'schema_checked' : gp.status,
    });
    addLog({
      id: `log_${Date.now()}`, type: 'AI_PROCESS',
      message: `スキーマーチェック: ${gp.title} — ${result.ok ? 'OK' : 'ERROR: ' + result.error}`,
      meta: { tags: ['schema'] }, timestamp: Date.now(),
    });
  };

  const handleRegisterTasks = (missingLines: string[], titleName: string) => {
    for (const line of missingLines) {
      addTask({
        id: `T-GP-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title: `[素材依頼] ${line}`,
        description: `"${titleName}" 用アセット。命名規則・スケールに従い制作してください。`,
        status: 'pending', priority: 'P1', type: 'review',
        tags: ['assets', 'game'],
        date: new Date().toISOString().slice(0, 10),
      });
    }
    addLog({
      id: `log_${Date.now()}`, type: 'TASK',
      message: `素材依頼タスクを ${missingLines.length} 件登録: ${titleName}`,
      meta: { tags: ['assets'] }, timestamp: Date.now(),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.1)', flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>
          NOVEL JSON DB
        </span>
        <span style={{ fontSize: '0.6rem', color: '#374151' }}>{entries.length} 件</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowCreate(true)} style={{
          padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
          background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
          color: '#c4b5fd', fontSize: '0.68rem', fontWeight: 700,
        }}>+ 新規作成</button>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <EmptyState onAdd={() => setShowCreate(true)} />
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(10,10,20,0.97)', zIndex: 5 }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Title', 'schemaVersion', '素チェック', 'ステータス', '作成日', 'DONE01', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: '#4b5563', fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(gp => (
                <GpRow
                  key={gp.id}
                  gp={gp}
                  onCheck={handleCheck}
                  onUpdate={update}
                  onRemove={remove}
                  onPlay={handlePlay}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateDialog
          onClose={() => setShowCreate(false)}
          onAdd={(e) => { add(e); setShowCreate(false); }}
        />
      )}

      {playTarget && (
        <NovelV51Player
          schema={playTarget.schema}
          gpTitle={playTarget.gp.title}
          onClose={() => setPlayTarget(null)}
          onRegisterTasks={(lines) => {
            handleRegisterTasks(lines, playTarget.gp.title);
            setPlayTarget(null);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, gap: 10, color: '#374151',
    }}>
      <span style={{ fontSize: '2.5rem', opacity: 0.25 }}>📦</span>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>エントリがありません</p>
      <button onClick={onAdd} style={{
        background: 'none', border: '1px dashed rgba(139,92,246,0.3)',
        borderRadius: 6, color: '#8b5cf6', fontSize: '0.65rem',
        padding: '7px 18px', cursor: 'pointer',
      }}>+ 最初のパッケージを作成</button>
    </div>
  );
}

// ─── GpRow ───────────────────────────────────────────────────

function GpRow({ gp, onCheck, onUpdate, onRemove, onPlay }: {
  gp:       GpNovelEntry;
  onCheck:  (gp: GpNovelEntry) => void;
  onUpdate: (gp: GpNovelEntry) => void;
  onRemove: (id: string) => void;
  onPlay:   (gp: GpNovelEntry) => void;
}) {
  const [hover, setHover] = useState(false);
  const sl = STATUS_LABELS[gp.status];
  const hasSchema = !!gp.schema;

  return (
    <tr
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: hover ? 'rgba(255,255,255,0.02)' : 'none', transition: 'background 0.1s' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Title */}
      <td style={{ padding: '10px 12px' }}>
        <span style={{ color: '#d1d5db', fontWeight: 600 }}>{gp.title}</span>
        {!hasSchema && (
          <span style={{ fontSize: '0.55rem', color: '#6b4b1a', marginLeft: 6 }}>JSON未登録</span>
        )}
      </td>

      {/* schemaVersion */}
      <td style={{ padding: '10px 12px' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#67e8f9',
        }}>v{gp.schemaVersion}</span>
      </td>

      {/* 素チェック */}
      <td style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onCheck(gp)}
            disabled={!hasSchema}
            style={{
              padding: '3px 8px', borderRadius: 4, cursor: hasSchema ? 'pointer' : 'not-allowed',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: hasSchema ? '#9ca3af' : '#374151', fontSize: '0.62rem',
            }}
          >チェック</button>
          {gp.checkResult && (
            <span
              title={gp.checkError}
              style={{
                fontSize: '0.58rem', padding: '2px 6px', borderRadius: 3,
                cursor: gp.checkError ? 'help' : 'default',
                background: gp.checkResult === 'ok' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                color:      gp.checkResult === 'ok' ? '#34d399' : '#f87171',
                border:    `1px solid ${gp.checkResult === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
              }}
            >{gp.checkResult === 'ok' ? '✓ OK' : '✕ ERR'}</span>
          )}
        </div>
      </td>

      {/* ステータス */}
      <td style={{ padding: '10px 12px' }}>
        <select
          value={gp.status}
          onChange={e => onUpdate({ ...gp, status: e.target.value as GpStatus })}
          style={{
            background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, color: sl.color,
            fontSize: '0.62rem', padding: '3px 6px', cursor: 'pointer', outline: 'none',
          }}
        >
          {(Object.keys(STATUS_LABELS) as GpStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
          ))}
        </select>
      </td>

      {/* 作成日 */}
      <td style={{ padding: '10px 12px', color: '#4b5563' }}>{fmtDate(gp.createdAt)}</td>

      {/* DONE01 */}
      <td style={{ padding: '10px 12px' }}>
        <button
          onClick={() => onPlay(gp)}
          disabled={!hasSchema}
          style={{
            padding: '4px 12px', borderRadius: 5, cursor: hasSchema ? 'pointer' : 'not-allowed',
            background: hasSchema ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hasSchema ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: hasSchema ? '#fbbf24' : '#374151', fontSize: '0.65rem', fontWeight: 700,
          }}
        >▶ Play</button>
      </td>

      {/* Delete */}
      <td style={{ padding: '10px 8px' }}>
        <button onClick={() => onRemove(gp.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#374151', fontSize: '0.85rem', padding: '2px 5px',
          transition: 'color 0.1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
          title="削除"
        >×</button>
      </td>
    </tr>
  );
}

// ─── CreateDialog — Title + schemaVersion + JSON paste ────────

type CreateStep = 'form' | 'paste';

function CreateDialog({ onClose, onAdd }: {
  onClose: () => void;
  onAdd:   (e: GpNovelEntry) => void;
}) {
  const [step,          setStep]         = useState<CreateStep>('form');
  const [title,         setTitle]        = useState('');
  const [schemaVersion, setSchemaVersion] = useState<SchemaVersion>('5.1');
  const [jsonText,      setJsonText]      = useState('');
  const [parseResult,   setParseResult]   = useState<{ ok: boolean; schema: unknown | null; error?: string } | null>(null);

  const handleParse = () => {
    try {
      const obj = JSON.parse(jsonText);
      const valid = validateV51(obj);
      setParseResult({ ok: valid.ok, schema: obj, error: valid.error });
    } catch (e: unknown) {
      setParseResult({ ok: false, schema: null, error: `JSON 構文エラー: ${(e as Error).message}` });
    }
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      id:            genId(),
      title:         title.trim(),
      schemaVersion,
      schema:        parseResult?.ok ? parseResult.schema : null,
      status:        'ordered',
      createdAt:     new Date().toISOString(),
    });
  };

  const canAdd = title.trim().length > 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0f0f1e', border: '1px solid rgba(139,92,246,0.35)',
        borderRadius: 14, width: 560, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#c4b5fd', fontWeight: 700 }}>
              📦 新規パッケージ作成
            </h3>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
              {(['form', 'paste'] as CreateStep[]).map((s, i) => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: '0.6rem',
                    color: step === s ? '#c4b5fd' : '#374151',
                    fontWeight: step === s ? 700 : 400,
                  }}>
                    {i + 1}. {s === 'form' ? '基本情報' : 'JSON 貼付け'}
                  </span>
                  {i === 0 && <span style={{ color: '#374151', fontSize: '0.55rem' }}>›</span>}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '1.1rem', padding: '4px 8px',
          }}>✕</button>
        </div>

        {/* Step 1: Basic info */}
        {step === 'form' && (
          <>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  タイトル <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例：魔術士達の夜"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 7, color: '#e5e7eb', fontSize: '0.85rem',
                    padding: '9px 12px', outline: 'none',
                  }}
                  onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              {/* Schema version */}
              <div>
                <label style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  スキーマーバージョン
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SCHEMA_VERSIONS.map(v => (
                    <button key={v} onClick={() => setSchemaVersion(v)} style={{
                      padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                      background: schemaVersion === v ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)',
                      border:    `1px solid ${schemaVersion === v ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color:      schemaVersion === v ? '#67e8f9' : '#4b5563',
                    }}>v{v}</button>
                  ))}
                  <span style={{ fontSize: '0.6rem', color: '#374151', alignSelf: 'center', marginLeft: 4 }}>
                    ※ 現在 v5.1 のみ対応
                  </span>
                </div>
              </div>

              {/* Info */}
              <div style={{
                padding: '10px 14px', borderRadius: 7,
                background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)',
                fontSize: '0.65rem', color: '#9ca3af', lineHeight: 1.7,
              }}>
                次のステップで JSON を貼付けます。<br />
                JSON は後から「チェック」ボタンで型チェック可能です。<br />
                JSON を省略してタイトルだけ登録することもできます（発注管理用）。
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
            }}>
              <button onClick={onClose} style={{
                padding: '7px 16px', borderRadius: 7, cursor: 'pointer', fontSize: '0.7rem',
                background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280',
              }}>キャンセル</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleAdd}
                  disabled={!canAdd}
                  style={{
                    padding: '7px 16px', borderRadius: 7, fontSize: '0.7rem',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: canAdd ? '#9ca3af' : '#374151',
                  }}
                >JSON なしで登録</button>
                <button
                  onClick={() => canAdd && setStep('paste')}
                  disabled={!canAdd}
                  style={{
                    padding: '7px 18px', borderRadius: 7, fontSize: '0.7rem', fontWeight: 700,
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    background: canAdd ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)',
                    border:    `1px solid ${canAdd ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    color:      canAdd ? '#c4b5fd' : '#374151',
                  }}
                >JSON を貼付ける →</button>
              </div>
            </div>
          </>
        )}

        {/* Step 2: JSON paste */}
        {step === 'paste' && (
          <>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 20px', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  「<strong style={{ color: '#c4b5fd' }}>{title}</strong>」の v{schemaVersion} combined JSON
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '0.62rem', color: '#4b5563', lineHeight: 1.6 }}>
                {'{ "events": {...}, "chats": {...}, "choices": {...}, "state": {...}, "assetOrder": {...} }'} の形式で貼付けてください。
              </p>

              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setParseResult(null); }}
                placeholder={'{\n  "events": { "version": "5.1", "start_event_id": "EV_001", "events": [...] },\n  "chats":   { "version": "5.1", "chats": [...] },\n  "choices": { "version": "5.1", "choices": [...] },\n  "state":   { "version": "5.1", "flags": {}, "params": {} }\n}'}
                spellCheck={false}
                autoFocus
                style={{
                  flex: 1, resize: 'none', boxSizing: 'border-box',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.7rem',
                  padding: '12px', outline: 'none', lineHeight: 1.6,
                  minHeight: 240,
                }}
                onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)')}
                onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />

              {/* Parse result */}
              {parseResult && (
                <div style={{
                  padding: '8px 12px', borderRadius: 6,
                  background: parseResult.ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                  border:    `1px solid ${parseResult.ok ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  fontSize: '0.65rem',
                  color:     parseResult.ok ? '#34d399' : '#f87171',
                }}>
                  {parseResult.ok
                    ? '✓ JSON 解析・型チェック OK'
                    : `✕ ${parseResult.error}`
                  }
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
            }}>
              <button onClick={() => setStep('form')} style={{
                padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontSize: '0.7rem',
                background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280',
              }}>← 戻る</button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleParse}
                  disabled={!jsonText.trim()}
                  style={{
                    padding: '7px 14px', borderRadius: 7, fontSize: '0.7rem', fontWeight: 700,
                    cursor: jsonText.trim() ? 'pointer' : 'not-allowed',
                    background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)',
                    color: jsonText.trim() ? '#34d399' : '#374151',
                  }}
                >型チェック</button>
                <button
                  onClick={handleAdd}
                  style={{
                    padding: '7px 18px', borderRadius: 7, fontSize: '0.7rem', fontWeight: 700,
                    cursor: 'pointer',
                    background: parseResult?.ok
                      ? 'rgba(139,92,246,0.3)'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${parseResult?.ok ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: parseResult?.ok ? '#c4b5fd' : '#9ca3af',
                  }}
                >
                  {parseResult?.ok ? '✓ 登録' : 'JSON なしで登録'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── NovelV51Player — DONE01 ──────────────────────────────────

interface MissingAsset {
  key:       string;
  filename:  string;
  assetType: string;
  scale:     string;
}

interface PlayerState {
  eventId:      string | null;
  lineIndex:    number;
  flags:        Record<string, boolean>;
  params:       Record<string, number>;
  bgKey:        string | null;
  charKeys:     string[];
  seMsg:        string | null;
  choiceResult: string | null;
  done:         boolean;
}

function NovelV51Player({ schema, gpTitle, onClose, onRegisterTasks }: {
  schema:          NovelSchemaV51;
  gpTitle:         string;
  onClose:         () => void;
  onRegisterTasks: (lines: string[]) => void;
}) {
  const [ps, setPs] = useState<PlayerState>({
    eventId:      schema.events.start_event_id,
    lineIndex:    0,
    flags:        { ...schema.state.flags },
    params:       { ...schema.state.params },
    bgKey:        null, charKeys: [], seMsg: null, choiceResult: null, done: false,
  });
  const [missing,  setMissing]  = useState<MissingAsset[]>([]);
  const [showLog,  setShowLog]  = useState(false);
  const seTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ps.seMsg) return;
    seTimer.current && clearTimeout(seTimer.current);
    seTimer.current = setTimeout(() => setPs(p => ({ ...p, seMsg: null })), 2500);
    return () => { seTimer.current && clearTimeout(seTimer.current); };
  }, [ps.seMsg]);

  const getEvent  = (id: string) => schema.events.events.find(e => e.event_id === id)     ?? null;
  const getChat   = (r: string)  => schema.chats.chats.find(c => c.chat_id === r)          ?? null;
  const getChoice = (r: string)  => schema.choices.choices.find(c => c.choice_id === r)    ?? null;

  const addMissing = useCallback((asset: MissingAsset) => {
    setMissing(m => m.find(x => x.key === asset.key) ? m : [...m, asset]);
  }, []);

  const processTags = useCallback((tags: string[] | undefined, prevState: PlayerState): Partial<PlayerState> => {
    if (!tags?.length) return {};
    const upd: Partial<PlayerState> = {};
    for (const tag of tags) {
      const parsed = parseAssetTag(tag);
      if (!parsed) continue;
      const { type, key } = parsed;
      const filename = getAssetFilename(schema, key) ?? key.toLowerCase();
      const scale    = parseScale(filename);
      if (type === 'se' || type === 'bgm') {
        const msg = `${type.toUpperCase()}_1-1: ${filename} [${key}]`;
        console.log(`[ASSET] ${msg}`);
        upd.seMsg = msg;
      } else if (type === 'bg') {
        console.log(`[MISSING ASSET] ${key}: ${filename}${scale ? ` (${scale})` : ''}`);
        upd.bgKey = key;
        addMissing({ key, filename, assetType: 'BG', scale });
      } else if (type === 'char') {
        console.log(`[MISSING ASSET] ${key}: ${filename}${scale ? ` (${scale})` : ''}`);
        upd.charKeys = prevState.charKeys.includes(key) ? prevState.charKeys : [...prevState.charKeys, key];
        addMissing({ key, filename, assetType: 'CHAR', scale });
      }
    }
    return upd;
  }, [schema, addMissing]);

  const currentEvent  = ps.eventId ? getEvent(ps.eventId)                    : null;
  const currentChat   = currentEvent?.type === 'CHAT'   ? getChat(currentEvent.ref_id)    : null;
  const currentChoice = currentEvent?.type === 'CHOICE' ? getChoice(currentEvent.ref_id)  : null;
  const currentLine   = currentChat?.lines[ps.lineIndex] ?? null;

  useEffect(() => {
    if (currentLine?.tags) {
      const upd = processTags(currentLine.tags, ps);
      if (Object.keys(upd).length) setPs(p => ({ ...p, ...upd }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = () => {
    if (ps.done || !currentEvent) return;
    if (ps.choiceResult) { setPs(p => ({ ...p, choiceResult: null })); return; }
    if (currentEvent.type === 'CHAT' && currentChat) {
      if (ps.lineIndex < currentChat.lines.length - 1) {
        const next = ps.lineIndex + 1;
        const upd  = processTags(currentChat.lines[next].tags, ps);
        setPs(p => ({ ...p, lineIndex: next, ...upd }));
      } else {
        const nextId = currentEvent.next ?? null;
        if (!nextId) { setPs(p => ({ ...p, done: true })); return; }
        const nextEvent = getEvent(nextId);
        if (nextEvent?.type === 'CHAT') {
          const nextChat = getChat(nextEvent.ref_id);
          const upd = processTags(nextChat?.lines[0]?.tags, ps);
          setPs(p => ({ ...p, eventId: nextId, lineIndex: 0, ...upd }));
        } else {
          setPs(p => ({ ...p, eventId: nextId, lineIndex: 0 }));
        }
      }
    }
  };

  const selectOption = (opt: V51ChoiceOption) => {
    const nextFlags  = { ...ps.flags, ...opt.effects?.flags };
    const nextParams = { ...ps.params };
    if (opt.effects?.params) {
      for (const [k, v] of Object.entries(opt.effects.params)) nextParams[k] = (nextParams[k] ?? 0) + v;
    }
    const result = opt.result ? `${opt.result.speaker ? opt.result.speaker + '：' : ''}${opt.result.text}` : null;
    setPs(p => ({ ...p, flags: nextFlags, params: nextParams, eventId: opt.next, lineIndex: 0, choiceResult: result }));
  };

  const missingLines = missing.map(m => `${m.key}: ${m.filename}${m.scale ? ` (${m.scale})` : ''}`);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(180deg,#06060f,#0d0618)', transition: 'background 0.5s' }}>
        {ps.bgKey && <BgPlaceholder bgKey={ps.bgKey} filename={getAssetFilename(schema, ps.bgKey) ?? ps.bgKey} />}
      </div>

      {/* Chars */}
      {ps.charKeys.length > 0 && (
        <div style={{ position: 'absolute', bottom: 168, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', gap: 24 }}>
          {ps.charKeys.map(ck => <CharPlaceholder key={ck} charKey={ck} filename={getAssetFilename(schema, ck) ?? ck} />)}
        </div>
      )}

      {/* SE toast */}
      {ps.seMsg && (
        <div style={{
          position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          padding: '6px 18px', borderRadius: 20,
          background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)',
          color: '#fcd34d', fontSize: '0.68rem', fontFamily: 'monospace', whiteSpace: 'nowrap',
        }}>♪ {ps.seMsg}</div>
      )}

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', background: 'rgba(0,0,0,0.65)',
      }}>
        <span style={{ fontSize: '0.62rem', color: '#6b7280' }}>▶ DONE01</span>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{gpTitle}</span>
        {ps.bgKey && <span style={{ fontSize: '0.58rem', color: '#374151', marginLeft: 6 }}>BG: {ps.bgKey}</span>}
        {Object.entries(ps.params).map(([k, v]) => (
          <span key={k} style={{ fontSize: '0.58rem', color: '#4b5563' }}>{k}: {v}</span>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowLog(l => !l)} style={{
          padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.6rem',
          background: missing.length > 0 ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.05)',
          border:    `1px solid ${missing.length > 0 ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color:      missing.length > 0 ? '#f87171' : '#6b7280',
        }}>素材ログ{missing.length > 0 ? ` (${missing.length})` : ''}</button>
        <button onClick={onClose} style={{
          padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.6rem',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af',
        }}>✕ 閉じる</button>
      </div>

      {/* Asset log */}
      {showLog && (
        <div style={{
          position: 'absolute', top: 36, right: 0, bottom: 168, zIndex: 15, width: 300,
          background: 'rgba(10,10,20,0.97)', borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.68rem', color: '#f87171', fontWeight: 700 }}>
            🔴 Missing Assets ({missing.length})
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
            {missing.length === 0
              ? <p style={{ fontSize: '0.65rem', color: '#374151' }}>まだ収集されていません</p>
              : missing.map(m => (
                <div key={m.key} style={{ padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.6rem', color: m.assetType === 'BG' ? '#67e8f9' : '#c4b5fd' }}>[{m.assetType}]</span>
                  <span style={{ fontSize: '0.62rem', color: '#9ca3af', marginLeft: 6 }}>{m.key}</span>
                  <div style={{ fontSize: '0.58rem', color: '#4b5563', marginTop: 2 }}>{m.filename}{m.scale && ` (${m.scale})`}</div>
                </div>
              ))
            }
          </div>
          {missing.length > 0 && (
            <button onClick={() => onRegisterTasks(missingLines)} style={{
              margin: '8px 12px 12px', padding: '7px', borderRadius: 5, cursor: 'pointer',
              background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
              color: '#c4b5fd', fontSize: '0.65rem', fontWeight: 700,
            }}>📋 タスクに登録 ({missing.length} 件)</button>
          )}
        </div>
      )}

      {/* Text box */}
      <div
        onClick={!currentChoice && !ps.done ? advance : undefined}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'rgba(5,5,15,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)',
          minHeight: 160, padding: '16px 24px',
          cursor: !currentChoice && !ps.done ? 'pointer' : 'default', userSelect: 'none',
        }}
      >
        {ps.done ? (
          <DonePanel missingCount={missing.length} missingLines={missingLines} onRegister={onRegisterTasks} onClose={onClose} />
        ) : ps.choiceResult ? (
          <ResultPanel text={ps.choiceResult} />
        ) : currentChoice ? (
          <ChoicePanel choice={currentChoice} onSelect={selectOption} />
        ) : currentLine ? (
          <ChatLinePanel speaker={currentLine.speaker} text={currentLine.text} />
        ) : null}
      </div>
    </div>
  );
}

// ─── Player sub-panels ────────────────────────────────────────

function ChatLinePanel({ speaker, text }: { speaker: string; text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {speaker && (
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24',
          padding: '2px 12px', background: 'rgba(251,191,36,0.1)',
          borderLeft: '3px solid #fbbf24', width: 'fit-content', borderRadius: '0 4px 4px 0',
        }}>{speaker}</div>
      )}
      <p style={{ margin: 0, fontSize: '0.88rem', color: '#e5e7eb', lineHeight: 1.85, letterSpacing: '0.02em' }}>{text}</p>
      <span style={{ fontSize: '0.58rem', color: '#374151', textAlign: 'right', marginTop: 4 }}>クリックで次へ ▼</span>
    </div>
  );
}

function ResultPanel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.8, fontStyle: 'italic' }}>{text}</p>
      <span style={{ fontSize: '0.58rem', color: '#4b5563', textAlign: 'right' }}>クリックで続ける ▼</span>
    </div>
  );
}

function ChoicePanel({ choice, onSelect }: { choice: V51Choice; onSelect: (opt: V51ChoiceOption) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {choice.question.speaker && (
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24',
          padding: '2px 12px', background: 'rgba(251,191,36,0.1)',
          borderLeft: '3px solid #fbbf24', width: 'fit-content', borderRadius: '0 4px 4px 0',
        }}>{choice.question.speaker}</div>
      )}
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e5e7eb', lineHeight: 1.8 }}>{choice.question.text}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        {choice.options.map((opt, i) => <ChoiceBtn key={i} label={opt.label} onClick={() => onSelect(opt)} />)}
      </div>
    </div>
  );
}

function ChoiceBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '10px 16px', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
        background: hover ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.1)',
        border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd',
        fontSize: '0.8rem', transition: 'background 0.12s',
      }}
    >{label}</button>
  );
}

function DonePanel({ missingCount, missingLines, onRegister, onClose }: {
  missingCount: number; missingLines: string[];
  onRegister: (lines: string[]) => void; onClose: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 700 }}>✓ シナリオ終了</span>
      <div style={{ display: 'flex', gap: 10 }}>
        {missingCount > 0 && (
          <button onClick={() => onRegister(missingLines)} style={{
            padding: '7px 18px', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
            background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171',
          }}>📋 素材タスクを登録 ({missingCount} 件)</button>
        )}
        <button onClick={onClose} style={{
          padding: '7px 18px', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
          background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', color: '#34d399',
        }}>閉じる</button>
      </div>
    </div>
  );
}

// ─── SVG Placeholders ─────────────────────────────────────────

function BgPlaceholder({ bgKey, filename }: { bgKey: string; filename: string }) {
  const scale = parseScale(filename);
  return (
    <svg
      viewBox="0 0 1280 720"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#1a1a3e" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bgGrad)" />
      <rect x="32" y="32" width="1216" height="656" fill="none" stroke="#ffffff1a" strokeWidth="2" strokeDasharray="10,8" rx="6" />
      <text x="640" y="330" textAnchor="middle" fill="#ffffff33" fontSize="52" fontFamily="monospace" fontWeight="bold">{bgKey}</text>
      <text x="640" y="395" textAnchor="middle" fill="#ffffff1a" fontSize="24" fontFamily="monospace">{scale || filename}</text>
      <text x="640" y="445" textAnchor="middle" fill="#ffffff14" fontSize="18" fontFamily="monospace">PLACEHOLDER — 素材未納品</text>
    </svg>
  );
}

function CharPlaceholder({ charKey, filename }: { charKey: string; filename: string }) {
  const scale = parseScale(filename);
  const [sw, sh] = scale ? scale.split('×').map(Number) : [512, 1024];
  const dispW    = 90;
  const dispH    = Math.round(dispW * (sh / sw));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg viewBox={`0 0 ${sw} ${sh}`} style={{ width: dispW, height: dispH, opacity: 0.55 }} xmlns="http://www.w3.org/2000/svg">
        <rect width={sw} height={sh} fill="#1a1a2e" rx="8" />
        <ellipse cx={sw/2} cy={sh*0.17} rx={sw*0.14} ry={sw*0.14} fill="#2d2d4e" />
        <rect x={sw*0.28} y={sh*0.31} width={sw*0.44} height={sh*0.48} rx="10" fill="#2d2d4e" />
        <text x={sw/2} y={sh*0.87} textAnchor="middle" fill="#6b6b9e" fontSize={sw*0.085} fontFamily="monospace">{charKey}</text>
      </svg>
      <span style={{ fontSize: '0.52rem', color: '#2d2d4e', fontFamily: 'monospace' }}>{charKey}</span>
    </div>
  );
}
