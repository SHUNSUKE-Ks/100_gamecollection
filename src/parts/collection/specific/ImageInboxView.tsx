// ============================================================
// ImageInboxView — 画像 InBox（JSON Card 中央管理）
// ・全画像を一元管理。各図鑑はここから参照する
// ・グリッド表示 / ライトボックス / スワイプ / スキーマチェック
// 1ファイル完結 / 子Component新規作成なし
// ============================================================

import { useState, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, Info,
  CheckCircle, AlertTriangle, XCircle, Inbox,
} from 'lucide-react';
import inboxData from '@/data/collection/image_inbox.json';

// ─── Types ────────────────────────────────────────────────

type ImageCategory =
  | 'standing' | 'expression' | 'background_h' | 'background_v'
  | 'cg' | 'item_icon' | 'album_thumb' | 'title_thumb'
  | 'npc_stand' | 'enemy' | 'other';

interface ImageTags {
  titleIds:   string[];
  characters: string[];
  locations:  string[];
  enemies:    string[];
  albums:     string[];
  keywords:   string[];
  category:   ImageCategory;
}

interface ImageMeta {
  width:           number | null;
  height:          number | null;
  format:          string;
  hasTransparency: boolean;
  aspectRatio:     string;
  fileSizeKb:      number | null;
}

interface SchemaAssignment {
  dbType:     string;
  entityId:   string;
  fieldType:  string;
  assignedAt: string;
}

export interface ImageCard {
  id:                string;
  filename:          string;
  localPath:         string;
  storageUrl:        string;
  createdAt:         string;
  tags:              ImageTags;
  meta:              ImageMeta;
  schemaAssignments: SchemaAssignment[];
}

// ─── スキーマ規格定義 ──────────────────────────────────────

interface SchemaRule {
  label:      string;
  size:       string;
  recW:       number | null;
  recH:       number | null;
  format:     string;
  ar:         string;
  transparent:boolean;
}

const SCHEMA_RULES: Record<ImageCategory, SchemaRule> = {
  standing:     { label: '立ち絵',         size: '800×1200',   recW: 800,  recH: 1200, format: 'PNG',     ar: '2:3',   transparent: true  },
  expression:   { label: '表情差分',        size: '256×256',    recW: 256,  recH: 256,  format: 'PNG',     ar: '1:1',   transparent: true  },
  background_h: { label: '横背景',          size: '1920×1080',  recW: 1920, recH: 1080, format: 'JPG/PNG', ar: '16:9',  transparent: false },
  background_v: { label: '縦背景',          size: '1080×1920',  recW: 1080, recH: 1920, format: 'JPG/PNG', ar: '9:16',  transparent: false },
  cg:           { label: 'CGシーン',        size: '1280×720',   recW: 1280, recH: 720,  format: 'JPG/PNG', ar: '16:9',  transparent: false },
  item_icon:    { label: 'アイテムアイコン', size: '128×128',    recW: 128,  recH: 128,  format: 'PNG',     ar: '1:1',   transparent: true  },
  album_thumb:  { label: 'アルバムサムネ',   size: '400×400',    recW: 400,  recH: 400,  format: 'JPG/PNG', ar: '1:1',   transparent: false },
  title_thumb:  { label: 'タイトルサムネ',   size: '480×270',    recW: 480,  recH: 270,  format: 'JPG/PNG', ar: '16:9',  transparent: false },
  npc_stand:    { label: 'NPC立ち絵',       size: '512×768',    recW: 512,  recH: 768,  format: 'PNG',     ar: '2:3',   transparent: true  },
  enemy:        { label: 'エネミー',         size: '512×512',    recW: 512,  recH: 512,  format: 'PNG',     ar: '1:1',   transparent: true  },
  other:        { label: 'その他',          size: '—',          recW: null, recH: null, format: '—',       ar: '—',     transparent: false },
};

// スキーマ適合チェック
type SchemaStatus = 'ok' | 'warn' | 'error' | 'unknown';

function checkSchema(card: ImageCard): { status: SchemaStatus; messages: string[] } {
  const rule  = SCHEMA_RULES[card.tags.category];
  const meta  = card.meta;
  const msgs: string[] = [];
  if (!rule || rule.recW === null) return { status: 'unknown', messages: ['スキーマ規格なし'] };

  const TOLERANCE = 0.15;
  let worst: SchemaStatus = 'ok';
  const raise = (s: SchemaStatus) => {
    if (s === 'error' || (s === 'warn' && worst === 'ok')) worst = s;
  };

  if (meta.width && meta.height) {
    const wRatio = Math.abs(meta.width  - rule.recW!) / rule.recW!;
    const hRatio = Math.abs(meta.height - rule.recH!) / rule.recH!;
    if (wRatio > TOLERANCE || hRatio > TOLERANCE) {
      msgs.push(`サイズ不一致: ${meta.width}×${meta.height} (推奨: ${rule.size})`);
      raise(wRatio > 0.5 || hRatio > 0.5 ? 'error' : 'warn');
    } else {
      msgs.push(`サイズ OK: ${meta.width}×${meta.height}`);
    }
  } else {
    msgs.push('サイズ未計測');
    raise('warn');
  }

  if (rule.transparent && !meta.hasTransparency) {
    msgs.push('透過推奨 (PNG) ですが非透過です');
    raise('warn');
  }
  if (rule.transparent && meta.hasTransparency) {
    msgs.push('透過 OK');
  }

  if (rule.format !== '—' && rule.format !== 'JPG/PNG') {
    const reqFmt = rule.format.toLowerCase();
    if (!meta.format.toLowerCase().includes(reqFmt)) {
      msgs.push(`フォーマット不一致: ${meta.format} (必須: ${rule.format})`);
      raise('error');
    } else {
      msgs.push(`フォーマット OK: ${meta.format}`);
    }
  }

  return { status: worst, messages: msgs };
}

// ─── カテゴリカラー ────────────────────────────────────────

const CATEGORY_COLOR: Record<ImageCategory, string> = {
  standing:     '#8b5cf6',
  expression:   '#ec4899',
  background_h: '#3b82f6',
  background_v: '#06b6d4',
  cg:           '#f59e0b',
  item_icon:    '#10b981',
  album_thumb:  '#84cc16',
  title_thumb:  '#c9a227',
  npc_stand:    '#6366f1',
  enemy:        '#ef4444',
  other:        '#6b7280',
};

const CATEGORY_FILTER_ITEMS: { id: ImageCategory | 'all'; label: string }[] = [
  { id: 'all',         label: 'すべて'   },
  { id: 'standing',    label: '立ち絵'   },
  { id: 'expression',  label: '表情差分' },
  { id: 'background_h',label: '横背景'   },
  { id: 'background_v',label: '縦背景'   },
  { id: 'cg',          label: 'CG'       },
  { id: 'enemy',       label: 'エネミー' },
  { id: 'item_icon',   label: 'アイコン' },
  { id: 'other',       label: 'その他'   },
];

// ─── URL ヘルパー ──────────────────────────────────────────

function imgUrl(card: ImageCard): string {
  return card.storageUrl || card.localPath || '';
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export function ImageInboxView() {
  const allImages = (inboxData.images ?? []) as ImageCard[];

  const [filterCat,  setFilterCat]  = useState<ImageCategory | 'all'>('all');
  const [filterWord, setFilterWord] = useState('');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showInfo,    setShowInfo]    = useState(false);

  // タッチスワイプ
  const touchStartX = useRef(0);

  // フィルター後の画像リスト
  const filtered = allImages.filter(img => {
    if (filterCat !== 'all' && img.tags.category !== filterCat) return false;
    if (filterWord) {
      const w = filterWord.toLowerCase();
      const hit =
        img.filename.toLowerCase().includes(w) ||
        img.tags.keywords.some(k => k.toLowerCase().includes(w)) ||
        img.tags.characters.some(c => c.toLowerCase().includes(w)) ||
        img.tags.locations.some(l => l.toLowerCase().includes(w)) ||
        img.tags.enemies.some(e => e.toLowerCase().includes(w));
      if (!hit) return false;
    }
    return true;
  });

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setShowInfo(false); };
  const closeLightbox = () => setLightboxIdx(null);

  const prev = useCallback(() => {
    setLightboxIdx(i => i === null ? null : (i - 1 + filtered.length) % filtered.length);
    setShowInfo(false);
  }, [filtered.length]);

  const next = useCallback(() => {
    setLightboxIdx(i => i === null ? null : (i + 1) % filtered.length);
    setShowInfo(false);
  }, [filtered.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx >  50) prev();
    if (dx < -50) next();
  };

  // ライトボックスの現在の画像
  const lbCard = lightboxIdx !== null ? filtered[lightboxIdx] : null;
  const schemaResult = lbCard ? checkSchema(lbCard) : null;

  const statusIcon = (s: SchemaStatus) => {
    if (s === 'ok')      return <CheckCircle  size={14} color="#10b981" />;
    if (s === 'warn')    return <AlertTriangle size={14} color="#f59e0b" />;
    if (s === 'error')   return <XCircle       size={14} color="#ef4444" />;
    return <Info size={14} color="#6b7280" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── ヘッダー情報 ── */}
      <div style={{
        padding: '0.75rem 1rem 0.5rem',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--color-primary)', fontSize: '0.8rem', marginBottom: '0.5rem',
        }}>
          <Inbox size={15} />
          <span style={{ fontWeight: 600 }}>Image InBox</span>
          <span style={{ color: '#6b7280' }}>— {allImages.length}件 / 表示: {filtered.length}件</span>
        </div>

        {/* 検索 */}
        <input
          value={filterWord}
          onChange={e => setFilterWord(e.target.value)}
          placeholder="キャラ名・キーワードで検索…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--color-bg-dark)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '0.45rem 0.75rem',
            color: 'var(--color-text-primary)',
            fontSize: '0.82rem', outline: 'none', marginBottom: '0.5rem',
          }}
        />

        {/* カテゴリフィルター（横スクロール） */}
        <div style={{
          display: 'flex', gap: '0.35rem',
          overflowX: 'auto', paddingBottom: '0.25rem',
          scrollbarWidth: 'none',
        }}>
          {CATEGORY_FILTER_ITEMS.map(cf => {
            const active = filterCat === cf.id;
            const color  = cf.id === 'all' ? '#c9a227' : CATEGORY_COLOR[cf.id as ImageCategory];
            return (
              <button key={cf.id} onClick={() => setFilterCat(cf.id as any)} style={{
                flexShrink: 0, padding: '0.25rem 0.6rem', borderRadius: 20,
                border: `1px solid ${active ? color : 'var(--color-border)'}`,
                background: active ? `${color}22` : 'none',
                color: active ? color : '#6b7280',
                fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {cf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── グリッド ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: '#4b5563', fontSize: '0.875rem',
          }}>
            <Inbox size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <br />画像が見つかりません
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
          }}>
            {filtered.map((card, idx) => {
              const color = CATEGORY_COLOR[card.tags.category] ?? '#6b7280';
              const rule  = SCHEMA_RULES[card.tags.category];
              return (
                <button
                  key={card.id}
                  onClick={() => openLightbox(idx)}
                  style={{
                    position: 'relative', padding: 0, border: 'none',
                    borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    background: 'var(--color-bg-light)',
                    aspectRatio: '1 / 1',
                  }}
                >
                  <img
                    src={imgUrl(card)}
                    alt={card.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* カテゴリバッジ */}
                  <span style={{
                    position: 'absolute', bottom: 3, left: 3,
                    padding: '1px 5px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.75)',
                    color, fontSize: '0.55rem', fontWeight: 700,
                    border: `1px solid ${color}55`,
                    maxWidth: '90%', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {rule.label}
                  </span>
                  {/* 拡大アイコン */}
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: 2,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <ZoomIn size={10} color="#fff" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ライトボックス ── */}
      {lbCard && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex', flexDirection: 'column',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* トップバー */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 0.75rem', flexShrink: 0,
            background: 'rgba(0,0,0,0.5)',
          }}>
            <button onClick={closeLightbox} style={lbBtn}>
              <X size={20} color="#fff" />
            </button>
            <span style={{
              flex: 1, color: '#e5e7eb', fontSize: '0.8rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {lbCard.filename}
              <span style={{ color: '#6b7280', marginLeft: 8 }}>
                ({lightboxIdx! + 1} / {filtered.length})
              </span>
            </span>
            <button onClick={() => setShowInfo(v => !v)} style={{
              ...lbBtn,
              background: showInfo ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.1)',
            }}>
              <Info size={18} color={showInfo ? '#c9a227' : '#fff'} />
            </button>
          </div>

          {/* 画像エリア */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* 前へ */}
            <button onClick={prev} style={{
              ...lbBtn, position: 'absolute', left: 8,
              background: 'rgba(0,0,0,0.5)', zIndex: 1,
            }}>
              <ChevronLeft size={28} color="#fff" />
            </button>

            <img
              src={imgUrl(lbCard)}
              alt={lbCard.filename}
              style={{
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain', userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />

            {/* 次へ */}
            <button onClick={next} style={{
              ...lbBtn, position: 'absolute', right: 8,
              background: 'rgba(0,0,0,0.5)', zIndex: 1,
            }}>
              <ChevronRight size={28} color="#fff" />
            </button>
          </div>

          {/* カテゴリバッジ（常時表示）*/}
          <div style={{ padding: '0.4rem 0.75rem', flexShrink: 0, display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {(() => {
              const color = CATEGORY_COLOR[lbCard.tags.category] ?? '#6b7280';
              const rule  = SCHEMA_RULES[lbCard.tags.category];
              return (
                <span style={{
                  padding: '2px 8px', borderRadius: 20,
                  border: `1px solid ${color}88`,
                  background: `${color}22`,
                  color, fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {rule.label}
                </span>
              );
            })()}
            {lbCard.tags.keywords.map(kw => (
              <span key={kw} style={{
                padding: '2px 8px', borderRadius: 20,
                border: '1px solid #374151',
                color: '#9ca3af', fontSize: '0.7rem',
              }}>
                {kw}
              </span>
            ))}
          </div>

          {/* INFO パネル（展開時）*/}
          {showInfo && (
            <div style={{
              background: 'rgba(13,13,18,0.97)',
              borderTop: '1px solid var(--color-border)',
              padding: '0.875rem 1rem',
              maxHeight: '45vh', overflowY: 'auto',
              flexShrink: 0,
            }}>
              {/* JSON Card メタ */}
              <p style={sectionTitle}>📋 JSON Card データ</p>
              <InfoRow label="ファイル名" value={lbCard.filename} />
              <InfoRow label="サイズ" value={lbCard.meta.width ? `${lbCard.meta.width}×${lbCard.meta.height}` : '未計測'} />
              <InfoRow label="形式" value={lbCard.meta.format.toUpperCase()} />
              <InfoRow label="透過" value={lbCard.meta.hasTransparency ? 'あり (PNG)' : 'なし'} />
              <InfoRow label="アスペクト比" value={lbCard.meta.aspectRatio} />
              <InfoRow label="登録日" value={new Date(lbCard.createdAt).toLocaleDateString('ja-JP')} />

              {/* タグ */}
              <p style={{ ...sectionTitle, marginTop: '0.75rem' }}>🏷 タグ</p>
              {lbCard.tags.characters.length > 0 && <InfoRow label="キャラ" value={lbCard.tags.characters.join(', ')} />}
              {lbCard.tags.locations.length > 0  && <InfoRow label="地名"   value={lbCard.tags.locations.join(', ')} />}
              {lbCard.tags.enemies.length > 0    && <InfoRow label="エネミー" value={lbCard.tags.enemies.join(', ')} />}
              {lbCard.tags.titleIds.length > 0   && <InfoRow label="タイトル" value={lbCard.tags.titleIds.join(', ')} />}

              {/* スキーマチェック */}
              <p style={{ ...sectionTitle, marginTop: '0.75rem' }}>
                ✅ スキーマチェック — {SCHEMA_RULES[lbCard.tags.category].label}
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '0.6rem 0.75rem',
                display: 'flex', flexDirection: 'column', gap: '0.3rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                  推奨: {SCHEMA_RULES[lbCard.tags.category].size} / {SCHEMA_RULES[lbCard.tags.category].format}
                  {SCHEMA_RULES[lbCard.tags.category].transparent && ' / 透過必須'}
                </div>
                {schemaResult!.messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#e5e7eb' }}>
                    {statusIcon(i === 0 ? schemaResult!.status : 'ok')}
                    {msg}
                  </div>
                ))}
              </div>

              {/* 割り当て済み */}
              {lbCard.schemaAssignments.length > 0 && (
                <>
                  <p style={{ ...sectionTitle, marginTop: '0.75rem' }}>🔗 割り当て済み</p>
                  {lbCard.schemaAssignments.map((a, i) => (
                    <InfoRow key={i}
                      label={`${a.dbType} / ${a.fieldType}`}
                      value={a.entityId}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
      gap: '0.5rem',
    }}>
      <span style={{ fontSize: '0.72rem', color: '#6b7280', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color: '#e5e7eb', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────

const lbBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none', borderRadius: 8, cursor: 'pointer',
  padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

const sectionTitle: React.CSSProperties = {
  fontSize: '0.72rem', color: '#9ca3af',
  margin: '0 0 0.35rem', fontWeight: 600, letterSpacing: '0.05em',
};
