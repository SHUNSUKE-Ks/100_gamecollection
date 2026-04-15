// ============================================================
// AndroidLayout — Android縦型レイアウト Phase 1.5
// 1ファイル完結 / PC側コード変更なし
// ============================================================

import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Menu, X, Plus, BookOpen, PenSquare, Database,
  FileText, ClipboardList, Code2, Play, Home, ChevronLeft,
  Check, MapPin, Users, User, Swords, Package, Clapperboard,
  Image, Music, Tag, Inbox,
} from 'lucide-react';
import { useGameStore } from '@/core/stores/gameStore';
import { NovelLibraryView }   from '@/parts/collection/story/NovelLibraryView';
import type { NovelEntry }    from '@/parts/collection/story/NovelLibraryView';
import { NovelDetailView }    from '@/parts/collection/story/NovelDetailView';
import { PlotNotebook }       from '@/parts/collection/story/PlotNotebook';
import { SchemaShortView }    from '@/parts/collection/story/SchemaShortView';
import { ReportView }         from '@/parts/collection/report/ReportView';
import { DocumentInboxView }  from '@/parts/collection/document/DocumentInboxView';
import { CharacterDetailView } from '@/parts/collection/specific/CharacterDetailView';
import { NPCDetailView }      from '@/parts/collection/specific/NPCDetailView';
import { EnemyDetailView }    from '@/parts/collection/specific/EnemyDetailView';
import { BackgroundDetailView } from '@/parts/collection/specific/BackgroundDetailView';
import { BGMPlayerView }      from '@/parts/collection/specific/BGMPlayerView';
import { TagsView }           from '@/parts/collection/specific/TagsView';
import { ImageInboxView }    from '@/parts/collection/specific/ImageInboxView';
import { RecordCardModal, type DbKey } from '@/parts/collection/specific/RecordCardModal';
import { AndroidNovelPlayer } from '@/screens/android/AndroidNovelPlayer';
import titlesData     from '@/data/collection/titles.json';
import characterData  from '@/data/collection/characters.json';
import npcData        from '@/data/collection/npcs.json';
import enemyData      from '@/data/collection/enemies.json';
import backgroundData from '@/data/collection/backgrounds.json';

// ─── Types ────────────────────────────────────────────────

type AndroidTab =
  | 'gallery' | 'library' | 'plot' | 'report' | 'document' | 'schema'
  | 'db_titles' | 'db_place' | 'db_character' | 'db_npc' | 'db_enemy'
  | 'db_item'   | 'db_event' | 'db_cg'        | 'db_sound' | 'db_tag'
  | 'db_inbox';

type DrawerTab = 'nav' | 'lib';
type QNStep   = 'title' | 'content';

interface TitleEntry {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  genre?: string[];
  status: 'dev' | 'release' | 'archived';
  hasPlayableNovel: boolean;
  tags?: string[];
  createdAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────

const LS_KEY = 'novel_library_v1';
const GENRES  = ['ファンタジー', 'SF', '現代', 'ホラー', 'ミステリー', 'ロマンス', 'アクション', 'その他'];

/** デフォルトタイトル: Idea_MMDD_HH:mm */
function defaultNoteTitle(): string {
  const d   = new Date();
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const dd  = String(d.getDate()).padStart(2, '0');
  const hh  = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `Idea_${mm}${dd}_${hh}:${min}`;
}

// ─── Nav メニュー定義 ──────────────────────────────────────

const NAV_ITEMS: { id: AndroidTab; label: string; icon: ReactNode }[] = [
  { id: 'gallery',  label: 'タイトル一覧',    icon: <Home size={16} /> },
  { id: 'library',  label: 'ノベルライブラリ', icon: <BookOpen size={16} /> },
  { id: 'plot',     label: 'プロット手帳',    icon: <PenSquare size={16} /> },
  { id: 'report',   label: 'レポート',        icon: <FileText size={16} /> },
  { id: 'document', label: '発注書',          icon: <ClipboardList size={16} /> },
  { id: 'schema',   label: 'スキーマー確認',  icon: <Code2 size={16} /> },
];

const LIB_ITEMS: { id: AndroidTab; label: string; icon: ReactNode }[] = [
  { id: 'db_inbox',     label: '📥 Image InBox',   icon: <Inbox size={16} /> },
  { id: 'db_titles',    label: 'TitleDB',           icon: <Database size={16} /> },
  { id: 'db_place',     label: '地名辞典',           icon: <MapPin size={16} /> },
  { id: 'db_character', label: 'キャラクター図鑑',   icon: <Users size={16} /> },
  { id: 'db_npc',       label: 'NPC図鑑',            icon: <User size={16} /> },
  { id: 'db_enemy',     label: 'エネミー図鑑',       icon: <Swords size={16} /> },
  { id: 'db_item',      label: 'アイテム図鑑',       icon: <Package size={16} /> },
  { id: 'db_event',     label: 'イベントDB',         icon: <Clapperboard size={16} /> },
  { id: 'db_cg',        label: 'CG・ギャラリー',     icon: <Image size={16} /> },
  { id: 'db_sound',     label: 'サウンド図鑑',       icon: <Music size={16} /> },
  { id: 'db_tag',       label: 'タグDB',             icon: <Tag size={16} /> },
];

const ALL_LABELS: Partial<Record<AndroidTab, string>> = {
  ...Object.fromEntries(NAV_ITEMS.map(i => [i.id, i.label])),
  ...Object.fromEntries(LIB_ITEMS.map(i => [i.id, i.label])),
};

const STATUS_META: Record<TitleEntry['status'], { label: string; color: string }> = {
  dev:      { label: '開発中',     color: '#f59e0b' },
  release:  { label: 'リリース',   color: '#10b981' },
  archived: { label: 'アーカイブ', color: '#6b7280' },
};

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export function AndroidLayout() {
  const setScreen = useGameStore((s) => s.setScreen);

  // ナビ
  const [currentTab,  setCurrentTab]  = useState<AndroidTab>('gallery');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [drawerTab,   setDrawerTab]   = useState<DrawerTab>('nav');
  const [selectedNovel, setSelectedNovel] = useState<NovelEntry | null>(null);

  // NovelPlayer
  const [playerTitle, setPlayerTitle] = useState<TitleEntry | null>(null);

  // RecordCard（DB追加）
  const [recordDbKey, setRecordDbKey] = useState<DbKey | null>(null);

  // クイックノート
  const [showQN,   setShowQN]   = useState(false);
  const [qnStep,   setQnStep]   = useState<QNStep>('title');
  const [qnTitle,  setQnTitle]  = useState('');
  const [qnBody,   setQnBody]   = useState('');
  const [qnGenre,  setQnGenre]  = useState('ファンタジー');
  const [qnSaved,  setQnSaved]  = useState(false);
  const qnTitleRef   = useRef<HTMLInputElement>(null);
  const qnContentRef = useRef<HTMLTextAreaElement>(null);

  const titles = (titlesData.titles ?? []) as TitleEntry[];

  // ── タブ切り替え ─────────────────────────────────────────
  const switchTab = (tab: AndroidTab) => {
    setCurrentTab(tab);
    setSelectedNovel(null);
    setDrawerOpen(false);
  };

  // ── タブ → DbKey マッピング ──────────────────────────────
  const DB_TAB_KEY: Partial<Record<AndroidTab, DbKey>> = {
    'db_titles':    'titles',
    'db_character': 'characters',
    'db_npc':       'npcs',
    'db_enemy':     'enemies',
    'db_place':     'locations',
    'db_item':      'items',
    'db_event':     'events',
    'db_sound':     'sounds',
    'db_tag':       'tags',
  };

  // ── [+] ボタン: コンテキストに応じて振り分け ──────────────
  const handlePlusButton = () => {
    const dbKey = DB_TAB_KEY[currentTab];
    if (dbKey) {
      setRecordDbKey(dbKey);  // DB追加カードを開く
    } else {
      openQN();               // それ以外はクイックノート
    }
  };

  // ── クイックノート: 開く ────────────────────────────────
  const openQN = () => {
    setQnTitle(defaultNoteTitle());
    setQnBody('');
    setQnGenre('ファンタジー');
    setQnStep('title');
    setQnSaved(false);
    setShowQN(true);
    setTimeout(() => {
      const el = qnTitleRef.current;
      if (el) { el.focus(); el.select(); }
    }, 80);
  };

  // Step1 Enter → Step2
  const qnTitleEnter = () => {
    if (!qnTitle.trim()) return;
    setQnStep('content');
    setTimeout(() => qnContentRef.current?.focus(), 60);
  };

  // 保存
  const saveQN = () => {
    const title = qnTitle.trim() || defaultNoteTitle();
    const newEntry: NovelEntry = {
      id: `novel_${Date.now()}`,
      title,
      dict: qnBody.trim(),
      genre: qnGenre,
      createdAt: new Date().toISOString(),
      schema: { episodes: [] } as any,
    };
    try {
      const raw      = localStorage.getItem(LS_KEY);
      const existing = raw ? (JSON.parse(raw) as NovelEntry[]) : [];
      localStorage.setItem(LS_KEY, JSON.stringify([...existing, newEntry]));
    } catch { /* ignore */ }
    setQnSaved(true);
    setTimeout(() => { setShowQN(false); switchTab('library'); }, 1100);
  };

  // ── ヘッダー ─────────────────────────────────────────────
  const Header = (
    <header style={{
      display: 'flex', alignItems: 'center',
      padding: '0 0.75rem', height: 52, flexShrink: 0, gap: '0.5rem',
      background: 'var(--color-bg-dark)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <button onClick={() => setDrawerOpen(true)} aria-label="メニュー" style={btnReset}>
        <Menu size={22} color="var(--color-text-primary)" />
      </button>

      {selectedNovel ? (
        <button
          onClick={() => setSelectedNovel(null)}
          style={{ ...btnReset, flex: 1, display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--color-primary)', fontSize: '0.85rem' }}
        >
          <ChevronLeft size={16} /> ライブラリに戻る
        </button>
      ) : (
        <span style={{
          flex: 1, fontSize: '0.9rem', fontWeight: 600,
          color: 'var(--color-primary)', letterSpacing: '0.05em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {ALL_LABELS[currentTab] ?? 'novelCollection'}
        </span>
      )}

      {/* [+] コンテキスト対応ボタン */}
      <button
        onClick={handlePlusButton}
        aria-label={DB_TAB_KEY[currentTab] ? '新規エントリ追加' : '新規ノート'}
        style={{
          ...btnReset,
          border: '1px solid var(--color-border)', borderRadius: 6,
          padding: '5px 9px', gap: 3,
          color: 'var(--color-primary)',
          background: 'rgba(201,162,39,0.08)',
        }}
      >
        {DB_TAB_KEY[currentTab] ? (
          <Plus size={15} />
        ) : (
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Blue memo */}
            <rect x="1" y="1.5" width="8.5" height="11" rx="1.5" fill="#3b82f6"/>
            <rect x="2.5" y="4" width="5" height="0.9" rx="0.45" fill="white" opacity="0.8"/>
            <rect x="2.5" y="6" width="5" height="0.9" rx="0.45" fill="white" opacity="0.8"/>
            <rect x="2.5" y="8" width="3.5" height="0.9" rx="0.45" fill="white" opacity="0.8"/>
            {/* Yellow pen — body */}
            <path d="M14,2.5 L12.5,1 L5.5,8 L7,9.5 Z" fill="#eab308"/>
            {/* Pen tip */}
            <path d="M5.5,8 L7,9.5 L4.5,13 Z" fill="#ca8a04"/>
            {/* Eraser cap */}
            <path d="M12.5,1 L14,2.5 L13.2,3.3 L11.7,1.8 Z" fill="#78350f"/>
          </svg>
        )}
      </button>

      {/* 開発用 PC 切り替え */}
      <button
        onClick={() => setScreen('COLLECTION')} title="PCレイアウト"
        style={{ ...btnReset, fontSize: '0.6rem', color: '#4b5563', padding: '4px 5px' }}
      >
        PC
      </button>
    </header>
  );

  // ── ドロワー ─────────────────────────────────────────────
  const Drawer = drawerOpen && (
    <>
      <div onClick={() => setDrawerOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200,
      }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 264,
        background: 'var(--color-bg-medium)',
        borderRight: '1px solid var(--color-border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
      }}>
        {/* ドロワーヘッダー */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)',
        }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
            novelCollection
          </span>
          <button onClick={() => setDrawerOpen(false)} style={btnReset}>
            <X size={18} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* ドロワー タブ切り替え */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          {(['nav', 'lib'] as DrawerTab[]).map(dt => {
            const label = dt === 'nav' ? 'ナビ' : 'ライブラリ';
            const active = drawerTab === dt;
            return (
              <button key={dt} onClick={() => setDrawerTab(dt)} style={{
                flex: 1, padding: '0.55rem 0',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                color: active ? 'var(--color-primary)' : '#6b7280',
                fontSize: '0.78rem', fontWeight: active ? 700 : 400,
                cursor: 'pointer', letterSpacing: '0.03em',
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* メニュー一覧 */}
        <nav style={{ flex: 1, padding: '0.3rem 0', overflowY: 'auto' }}>
          {(drawerTab === 'nav' ? NAV_ITEMS : LIB_ITEMS).map(item => {
            const active = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => switchTab(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                width: '100%', padding: '0.65rem 1.25rem',
                background: active ? 'rgba(201,162,39,0.1)' : 'none',
                border: 'none',
                borderLeft: `3px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                cursor: 'pointer', fontSize: '0.84rem', textAlign: 'left',
              }}>
                {item.icon}{item.label}
              </button>
            );
          })}
        </nav>

        {/* フッター */}
        <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--color-border)' }}>
          <button onClick={() => { setDrawerOpen(false); setScreen('TITLE'); }} style={{
            width: '100%', padding: '0.5rem',
            background: 'none', border: '1px solid var(--color-border)',
            color: '#6b7280', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem',
          }}>
            タイトルに戻る
          </button>
        </div>
      </div>
    </>
  );

  // ── Gallery（タイトルカード）────────────────────────────
  const GalleryView = (
    <div style={{ padding: '0.875rem' }}>
      {titles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#4b5563', fontSize: '0.875rem' }}>
          タイトルがありません<br />
          <span style={{ fontSize: '0.72rem' }}>titles.json にエントリを追加してください</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {titles.map(title => {
            const meta = STATUS_META[title.status] ?? STATUS_META.dev;
            return (
              <div key={title.id} style={{
                background: 'var(--color-bg-medium)', border: '1px solid var(--color-border)',
                borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  height: 118, background: 'var(--color-bg-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative',
                }}>
                  {title.thumbnail ? (
                    <img src={`/${title.thumbnail}`} alt={title.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        if (el.parentElement) {
                          el.parentElement.textContent = '📖';
                          el.parentElement.style.fontSize = '2.5rem';
                        }
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📖</span>
                  )}
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    padding: '2px 6px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700,
                    background: 'rgba(0,0,0,0.75)', color: meta.color, border: `1px solid ${meta.color}55`,
                  }}>{meta.label}</span>
                </div>
                <div style={{ padding: '0.55rem 0.7rem', flex: 1 }}>
                  <div style={{
                    fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{title.name}</div>
                  {title.subtitle && (
                    <div style={{
                      fontSize: '0.68rem', color: '#6b7280', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{title.subtitle}</div>
                  )}
                </div>
                {title.hasPlayableNovel && (
                  <div style={{ padding: '0 0.7rem 0.7rem' }}>
                    <button onClick={() => setPlayerTitle(title)} style={{
                      width: '100%', padding: '0.42rem',
                      background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.35)',
                      color: 'var(--color-primary)', borderRadius: 6, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 4, fontSize: '0.76rem', fontWeight: 600,
                    }}>
                      <Play size={12} /> TestPlay
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Library プレースホルダー ──────────────────────────────
  const Placeholder = (label: string) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: '0.5rem',
      color: '#4b5563', fontSize: '0.875rem',
    }}>
      <span style={{ fontSize: '2rem' }}>🚧</span>
      {label}（実装予定）
    </div>
  );

  // ── コンテンツ切り替え ────────────────────────────────────
  const Content = (() => {
    switch (currentTab) {
      // ナビ系
      case 'gallery':  return GalleryView;
      case 'library':  return selectedNovel
        ? <NovelDetailView entry={selectedNovel} onBack={() => setSelectedNovel(null)} />
        : <NovelLibraryView onOpenDetail={setSelectedNovel} />;
      case 'plot':     return <PlotNotebook />;
      case 'report':   return <ReportView />;
      case 'document': return <DocumentInboxView />;
      case 'schema':   return <SchemaShortView />;
      // ライブラリ系
      case 'db_titles':    return GalleryView;
      case 'db_character': return <CharacterDetailView data={(characterData as any).characters ?? []} />;
      case 'db_npc':       return <NPCDetailView       data={(npcData as any).npcs ?? []} />;
      case 'db_enemy':     return <EnemyDetailView     data={(enemyData as any).enemies ?? []} />;
      case 'db_place':     return <BackgroundDetailView data={(backgroundData as any).categories ?? []} />;
      case 'db_sound':     return <BGMPlayerView />;
      case 'db_tag':       return <TagsView />;
      case 'db_inbox':     return <ImageInboxView />;
      case 'db_item':      return Placeholder('アイテム図鑑');
      case 'db_event':     return Placeholder('イベントDB');
      case 'db_cg':        return Placeholder('CG・ギャラリー');
    }
  })();

  // ── NovelPlayer（TestPlay） ──────────────────────────────
  // フルスクリーンプレイヤーは直接レンダリング（モーダルではなく上書き）

  // ── クイックノート モーダル ────────────────────────────
  const QuickNoteModal = showQN && (
    <div
      onClick={() => { if (!qnSaved) setShowQN(false); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        zIndex: 150,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh', paddingLeft: '1rem', paddingRight: '1rem',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--color-bg-medium)', border: '1px solid var(--color-border)',
        borderRadius: 14, padding: '1.25rem',
        width: '100%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
      }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem',
          }}>
            <Plus size={16} />
            新規ノート
            {qnStep === 'content' && (
              <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 400 }}>
                — 1行目を入力
              </span>
            )}
          </div>
          <button onClick={() => setShowQN(false)} style={btnReset}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        {qnSaved ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.5rem', padding: '1.25rem 0', color: '#34d399',
          }}>
            <Check size={32} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>保存しました</span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ライブラリに移動します…</span>
          </div>
        ) : qnStep === 'title' ? (
          /* ── Step 1: タイトル ── */
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: '#9ca3af' }}>タイトル（Enter で次へ）</label>
              <input
                ref={qnTitleRef}
                value={qnTitle}
                onChange={e => setQnTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') qnTitleEnter(); }}
                style={{
                  background: 'var(--color-bg-dark)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 8, padding: '0.65rem 0.75rem',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem', outline: 'none', width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* ジャンル */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: '#9ca3af' }}>ジャンル</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {GENRES.map(g => (
                  <button key={g} onClick={() => setQnGenre(g)} style={{
                    padding: '0.28rem 0.6rem', borderRadius: 20, cursor: 'pointer',
                    border: `1px solid ${qnGenre === g ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: qnGenre === g ? 'rgba(201,162,39,0.18)' : 'none',
                    color: qnGenre === g ? 'var(--color-primary)' : '#9ca3af',
                    fontSize: '0.73rem',
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <button onClick={qnTitleEnter} disabled={!qnTitle.trim()} style={{
              padding: '0.6rem',
              background: qnTitle.trim() ? 'var(--color-primary)' : '#374151',
              border: 'none',
              color: qnTitle.trim() ? '#0d0d12' : '#6b7280',
              borderRadius: 8, cursor: qnTitle.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 700, fontSize: '0.875rem',
            }}>
              次へ →
            </button>
          </>
        ) : (
          /* ── Step 2: 1行目（メモ本文）── */
          <>
            <div style={{
              fontSize: '0.78rem', color: '#6b7280',
              padding: '0.4rem 0.6rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)', borderRadius: 6,
            }}>
              📝 {qnTitle}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: '#9ca3af' }}>メモ（省略可）</label>
              <textarea
                ref={qnContentRef}
                value={qnBody}
                onChange={e => setQnBody(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveQN(); }
                }}
                placeholder="思いついたことを書いてください… (Enter で保存)"
                rows={4}
                style={{
                  background: 'var(--color-bg-dark)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8, padding: '0.6rem 0.75rem',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem', outline: 'none', resize: 'none',
                  fontFamily: 'sans-serif', lineHeight: 1.6,
                  width: '100%', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setQnStep('title')} style={{
                flex: 1, padding: '0.55rem',
                background: 'none', border: '1px solid var(--color-border)',
                color: '#6b7280', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem',
              }}>
                ← 戻る
              </button>
              <button onClick={saveQN} style={{
                flex: 2, padding: '0.55rem',
                background: 'var(--color-primary)', border: 'none',
                color: '#0d0d12', borderRadius: 8, cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem',
              }}>
                作成 ✓
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── レンダリング ──────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100vw',
      background: 'var(--color-bg-dark)',
      color: 'var(--color-text-primary)',
      fontFamily: 'sans-serif', overflow: 'hidden',
    }}>
      {Header}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {Content}
      </main>
      {Drawer}
      {QuickNoteModal}
      {recordDbKey && (
        <RecordCardModal
          dbKey={recordDbKey}
          onClose={() => setRecordDbKey(null)}
          onSaved={() => setRecordDbKey(null)}
        />
      )}
      {playerTitle && (
        <AndroidNovelPlayer
          title={playerTitle}
          onClose={() => setPlayerTitle(null)}
        />
      )}
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────

const btnReset: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 6, borderRadius: 6, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
