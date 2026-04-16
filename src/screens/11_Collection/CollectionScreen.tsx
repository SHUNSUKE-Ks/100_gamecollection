import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { useViewMode } from '@/core/hooks/useViewMode';
import { fetchCollection } from '@/core/services/CollectionService';
import { seedAllCollections } from '@/core/services/SeedService';
import { ViewSwitcher } from '@/components/data-views/ViewSwitcher';
import { TableView, type TableColumn } from '@/components/data-views/TableView';
import { GalleryView } from '@/components/data-views/GalleryView';
import { KanbanView } from '@/components/data-views/KanbanView';
import { CharacterDetailView } from '@/parts/collection/specific/CharacterDetailView';
import { NPCDetailView } from '@/parts/collection/specific/NPCDetailView';
import { EnemyDetailView } from '@/parts/collection/specific/EnemyDetailView';
import { BackgroundDetailView } from '@/parts/collection/specific/BackgroundDetailView';
import { BGMPlayerView } from '@/parts/collection/specific/BGMPlayerView';
import { TagsView } from '@/parts/collection/specific/TagsView';
import { StoryView } from '@/parts/collection/story/StoryView'; // [NEW] Import Story
import { StudioScreen } from '@/screens/12_Studio/StudioScreen'; // [NEW] Import Studio
import characterData from '@/data/collection/characters.json';
import enemyData from '@/data/collection/enemies.json';
import npcData from '@/data/collection/npcs.json';
import backgroundData from '@/data/collection/backgrounds.json';
import bgmData from '@/data/collection/bgm.json';
import seData from '@/data/collection/se.json';
import itemData from '@/data/collection/items.json';
// Settings Views
import { SoundSettingsView } from '@/parts/collection/settings/SoundSettingsView';
import { ScreenSettingsView } from '@/parts/collection/settings/ScreenSettingsView';
import { KeyConfigView } from '@/parts/collection/settings/KeyConfigView';
// Report Views
import { ReportView } from '@/parts/collection/report/ReportView';
// Document Inbox
import { DocumentInboxView } from '@/parts/collection/document/DocumentInboxView';
// WorkSpace Panel
import { WorkspacePanel } from '@/parts/collection/workspace/WorkspacePanel';
// Record Card
import { RecordCardModal, type DbKey } from '@/parts/collection/specific/RecordCardModal';
import './CollectionScreen.css';

// Column Definitions - Styled Renderers
const tagStyle = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    marginRight: '4px',
    marginBottom: '2px',
};

const SOUND_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    {
        key: 'type',
        label: 'Type',
        render: (type: string) => (
            <span style={{
                ...tagStyle,
                backgroundColor: type === 'BGM' ? '#3b82f633' : '#f59e0b33',
                color: type === 'BGM' ? '#60a5fa' : '#fbbf24',
                border: `1px solid ${type === 'BGM' ? '#3b82f655' : '#f59e0b55'}`
            }}>
                {type || 'SE'}
            </span>
        )
    },
    { key: 'title', label: 'タイトル' },
    { key: 'artist', label: 'アーティスト' },
    { key: 'filename', label: 'ファイル名' },
    {
        key: 'tags',
        label: 'タグ',
        render: (tags: string[]) => (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(tags || []).map((tag) => (
                    <span
                        key={tag}
                        style={{
                            ...tagStyle,
                            backgroundColor: '#ffffff11',
                            color: '#94a3b8',
                            border: '1px solid #ffffff22'
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        )
    },
    { key: 'description', label: '説明' }
];

const CHARACTER_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'description', label: '説明' },
    {
        key: 'defaultTags',
        label: 'タグ',
        render: (tags: string[]) => (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(tags || []).map((tag, i) => (
                    <span
                        key={tag}
                        style={{
                            ...tagStyle,
                            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5] + '33',
                            color: ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'][i % 5],
                            border: `1px solid ${['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]}55`
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        )
    }
];

const ENEMY_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'description', label: '説明' },
    {
        key: 'stats',
        label: 'ステータス',
        render: (stats: any, _item: any) => {
            if (!stats) return <span style={{ fontSize: '11px', color: '#64748b' }}>-</span>;
            return (
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    <span style={{ color: '#ef4444' }}>HP:{stats?.hp ?? 0}</span>
                    <span style={{ color: '#3b82f6' }}>MP:{stats?.mp ?? 0}</span>
                </div>
            );
        }
    }
];

const NPC_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    {
        key: 'role',
        label: '役割',
        render: (role: string) => (
            <span style={{
                ...tagStyle,
                backgroundColor: '#8b5cf633',
                color: '#a78bfa',
                border: '1px solid #8b5cf655'
            }}>
                {role || '-'}
            </span>
        )
    },
    {
        key: 'location',
        label: '場所',
        render: (location: string) => (
            <span style={{
                ...tagStyle,
                backgroundColor: '#10b98133',
                color: '#34d399',
                border: '1px solid #10b98155'
            }}>
                📍 {location || '-'}
            </span>
        )
    },
    { key: 'dict', label: '説明' }
];

const PLACE_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '地名' },
    {
        key: 'region',
        label: '地域',
        render: (region: string) => (
            <span style={{
                ...tagStyle,
                backgroundColor: '#f59e0b33',
                color: '#fbbf24',
                border: '1px solid #f59e0b55'
            }}>
                {region || '-'}
            </span>
        )
    },
    { key: 'description', label: '説明' }
];

const ITEM_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    {
        key: 'category',
        label: 'カテゴリ',
        render: (category: string) => {
            const colors: Record<string, { bg: string; text: string }> = {
                '回復': { bg: '#10b98133', text: '#34d399' },
                '素材': { bg: '#f59e0b33', text: '#fbbf24' },
                '装備': { bg: '#3b82f633', text: '#60a5fa' },
                '重要': { bg: '#ef444433', text: '#f87171' },
            };
            const c = colors[category] || { bg: '#64748b33', text: '#94a3b8' };
            return (
                <span style={{
                    ...tagStyle,
                    backgroundColor: c.bg,
                    color: c.text,
                    border: `1px solid ${c.text}55`
                }}>
                    {category || '-'}
                </span>
            );
        }
    },
    {
        key: 'price',
        label: '価格',
        render: (price: number) => (
            <span style={{ color: '#fbbf24', fontWeight: 500 }}>
                💰 {price?.toLocaleString() || 0}
            </span>
        )
    },
    { key: 'description', label: '説明' }
];

// Tab Types
type PrimaryTab = 'item' | 'equipment' | 'skill' | 'ability' | 'story' | 'library' | 'sound' | 'keymap' | 'studio' | 'settings' | 'report' | 'document';
type SecondaryTab = 'place' | 'character' | 'npc' | 'enemy' | 'item_dict' | 'event' | 'cg' | 'sound_db' | 'tag_db';
type SettingsTab = 'sound_settings' | 'screen_settings' | 'key_settings';

export function CollectionScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const collectionDeepLink = useGameStore((state) => state.collectionDeepLink);
    const setCollectionDeepLink = useGameStore((state) => state.setCollectionDeepLink);
    const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('library');
    const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>('character');
    const [settingsTab, setSettingsTab] = useState<SettingsTab>('sound_settings');
    const [storyDeepLink, setStoryDeepLink] = useState<string | null>(null);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const { viewMode, setViewMode } = useViewMode('list');

    // Firestore から読み込んだライブラリデータ
    const [firestoreData, setFirestoreData] = useState<Record<string, any[]>>({});
    const [, setIsDbLoading] = useState(false);

    // シードUI
    const [recordCardDbKey, setRecordCardDbKey] = useState<DbKey | null>(null);
    const [isSeedRunning, setIsSeedRunning] = useState(false);
    const [seedLog, setSeedLog] = useState<string[]>([]);
    const [showSeedPanel, setShowSeedPanel] = useState(false);

    // Deep link navigation (e.g. タイトル画面の「プロット手帳」ボタンから)
    useEffect(() => {
        if (!collectionDeepLink) return;
        if (collectionDeepLink.startsWith('story:')) {
            setPrimaryTab('story');
            setStoryDeepLink(collectionDeepLink);
        }
        setCollectionDeepLink(null);
    }, []);

    // Auto-switch to 'custom' view for Character tab
    useEffect(() => {
        if (secondaryTab === 'character') {
            setViewMode('custom');
        } else if (secondaryTab === 'sound_db') {
            // Optional: Default to list for Sound DB, or custom if preferred.
            // Leaving as current user preference or default 'list'.
        } else {
            if (viewMode === 'custom') setViewMode('list');
        }
    }, [secondaryTab]);

    // Firestore からライブラリデータを読み込む
    const loadFromFirestore = useCallback(async (collectionName: string, jsonFallback: any[]) => {
        setIsDbLoading(true);
        try {
            const result = await fetchCollection<any>(collectionName);
            if (result && result.length > 0) {
                setFirestoreData(prev => ({ ...prev, [collectionName]: result }));
            } else {
                setFirestoreData(prev => ({ ...prev, [collectionName]: jsonFallback }));
            }
        } catch {
            setFirestoreData(prev => ({ ...prev, [collectionName]: jsonFallback }));
        } finally {
            setIsDbLoading(false);
        }
    }, []);

    // secondaryTab が変わったらそのコレクションを読み込む
    useEffect(() => {
        if (primaryTab !== 'library') return;
        const map: Record<string, [string, any[]]> = {
            character: ['characters', characterData.characters || []],
            enemy:     ['enemies',    enemyData.enemies || []],
            npc:       ['npcs',       npcData.npcs || []],
            item_dict: ['items',      itemData.items || []],
        };
        const entry = map[secondaryTab];
        if (entry) loadFromFirestore(entry[0], entry[1]);
    }, [secondaryTab, primaryTab, loadFromFirestore]);

    // シード実行
    const handleSeed = async () => {
        setIsSeedRunning(true);
        setSeedLog([]);
        try {
            await seedAllCollections(msg => setSeedLog(prev => [...prev, msg]));
            setSeedLog(prev => [...prev, '✅ 完了！ページをリロードしてください。']);
        } catch (e: any) {
            setSeedLog(prev => [...prev, `❌ エラー: ${e.message}`]);
        } finally {
            setIsSeedRunning(false);
        }
    };

    // Data selector（Firestore優先、なければJSON）
    const getData = () => {
        if (primaryTab === 'library') {
            switch (secondaryTab) {
                case 'character': return firestoreData['characters'] ?? characterData.characters ?? [];
                case 'enemy':     return firestoreData['enemies']    ?? enemyData.enemies ?? [];
                case 'npc':       return firestoreData['npcs']        ?? npcData.npcs ?? [];
                case 'place':     return backgroundData.categories ?? [];
                case 'item_dict': return firestoreData['items']       ?? itemData.items ?? [];
                case 'sound_db': {
                    const bgmList = (bgmData.bgm || []).map((item: any) => ({ ...item, type: 'BGM' }));
                    const seList = (seData.se || []).map((item: any) => ({ ...item, type: 'SE' }));
                    return [...bgmList, ...seList];
                }
                default: return [];
            }
        }
        return [];
    };

    const getColumns = () => {
        switch (secondaryTab) {
            case 'character': return CHARACTER_COLUMNS;
            case 'enemy': return ENEMY_COLUMNS;
            case 'npc': return NPC_COLUMNS;
            case 'place': return PLACE_COLUMNS;
            case 'item_dict': return ITEM_COLUMNS;
            case 'sound_db': return SOUND_COLUMNS;
            default: return [];
        }
    };

    // secondaryTab → RecordCard の DbKey マッピング
    const SECONDARY_TO_DBKEY: Partial<Record<SecondaryTab, DbKey>> = {
        character: 'characters',
        npc:       'npcs',
        enemy:     'enemies',
        place:     'locations',
        item_dict: 'items',
        event:     'events',
        sound_db:  'sounds',
        tag_db:    'tags',
    };

    const currentData = getData();
    const currentColumns = getColumns();

    const primaryTabs: { id: PrimaryTab; label: string }[] = [
        { id: 'item', label: 'アイテム' },
        { id: 'equipment', label: '装備' },
        { id: 'skill', label: 'スキル' },
        { id: 'ability', label: '能力' },
        { id: 'story', label: 'ストーリー' },
        { id: 'library', label: 'ライブラリー' },
        { id: 'sound', label: '音' },
        { id: 'keymap', label: 'キーマップ' },
        { id: 'studio', label: '工房' },
        { id: 'settings', label: '設定' },
        { id: 'report', label: 'レポート' },
        { id: 'document', label: '発注書' },
    ];

    const settingsTabs: { id: SettingsTab; label: string }[] = [
        { id: 'sound_settings', label: 'サウンド' },
        { id: 'screen_settings', label: '画面' },
        { id: 'key_settings', label: 'キー設定' },
    ];

    const secondaryTabs: { id: SecondaryTab; label: string }[] = [
        { id: 'place', label: '地名辞典' },
        { id: 'character', label: 'キャラクター図鑑' },
        { id: 'npc', label: 'NPC図鑑' },
        { id: 'enemy', label: 'エネミー図鑑' },
        { id: 'item_dict', label: 'アイテム図鑑' },
        { id: 'event', label: 'イベントDB' },
        { id: 'cg', label: 'CG・ギャラリー' },
        { id: 'sound_db', label: 'サウンド図鑑' },
        { id: 'tag_db', label: 'タグDB' },
    ];

    return (
        <div className="collection-screen">
            {/* シードパネル（開発者用） */}
            {showSeedPanel && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#1f2937', border: '1px solid #374151', borderRadius: 12,
                        padding: '1.5rem', width: 'min(500px, 90vw)', display: 'flex', flexDirection: 'column', gap: '1rem',
                    }}>
                        <h3 style={{ color: '#facc15', margin: 0 }}>🌱 Firestore データ初期化</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
                            既存データがあるコレクションはスキップします（安全）。
                        </p>
                        <div style={{
                            background: '#111827', borderRadius: 8, padding: '0.75rem',
                            height: 200, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem',
                            color: '#86efac',
                        }}>
                            {seedLog.length === 0
                                ? <span style={{ color: '#6b7280' }}>実行ログがここに表示されます</span>
                                : seedLog.map((l, i) => <div key={i}>{l}</div>)
                            }
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowSeedPanel(false)}
                                style={{
                                    background: 'transparent', border: '1px solid #374151',
                                    color: '#6b7280', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer',
                                }}
                            >閉じる</button>
                            <button
                                onClick={handleSeed}
                                disabled={isSeedRunning}
                                style={{
                                    background: isSeedRunning ? '#166534' : '#16a34a',
                                    border: 'none', color: '#fff', fontWeight: 700,
                                    padding: '0.5rem 1.25rem', borderRadius: 6,
                                    cursor: isSeedRunning ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSeedRunning ? '実行中...' : '🌱 初期データを投入'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Header */}
            <nav>
                {/* Primary Navigation */}
                <div className="collection-nav-primary">
                    {primaryTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setPrimaryTab(tab.id)}
                            className={`nav-item-primary ${primaryTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="back-button-container" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setShowSeedPanel(true)}
                            className="back-button"
                            title="Firestoreにデータを初期投入（開発者用）"
                            style={{ borderColor: '#166534', color: '#86efac' }}
                        >
                            🌱 DB初期化
                        </button>
                        <button
                            onClick={() => setIsWorkspaceOpen(v => !v)}
                            className="back-button"
                            title="WorkSpace パネルを開く"
                            style={{
                                borderColor: isWorkspaceOpen ? '#c9a227' : undefined,
                                color:       isWorkspaceOpen ? '#c9a227' : undefined,
                                background:  isWorkspaceOpen ? 'rgba(201,162,39,0.1)' : undefined,
                            }}
                        >
                            🗂 WorkSpace
                        </button>
                        <button onClick={() => setScreen('TITLE')} className="back-button">
                            Titleへ戻る
                        </button>
                    </div>
                </div>

                {/* Secondary Navigation */}
                {primaryTab === 'library' && (
                    <div className="collection-nav-secondary">
                        {secondaryTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSecondaryTab(tab.id)}
                                className={`nav-item-secondary ${secondaryTab === tab.id ? 'active' : 'inactive'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Settings Sub-tabs */}
                {primaryTab === 'settings' && (
                    <div className="collection-nav-secondary">
                        {settingsTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSettingsTab(tab.id)}
                                className={`nav-item-secondary ${settingsTab === tab.id ? 'active' : 'inactive'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="collection-content">
                {/* Render Studio Screen directly if selected */}
                {primaryTab === 'studio' ? (
                    <StudioScreen />
                ) : (
                    <>
                        {/* Normal Collection Content */}
                        <div className="collection-header">
                            <h2 className="collection-title">
                                {primaryTab === 'library'
                                    ? secondaryTabs.find(t => t.id === secondaryTab)?.label
                                    : primaryTabs.find(t => t.id === primaryTab)?.label}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                                {primaryTab === 'library' && secondaryTab !== 'tag_db' && (
                                    <ViewSwitcher currentView={viewMode} onViewChange={setViewMode as any} />
                                )}
                                {/* [+] 新規追加ボタン */}
                                {primaryTab === 'library' && SECONDARY_TO_DBKEY[secondaryTab] && (
                                    <button
                                        onClick={() => setRecordCardDbKey(SECONDARY_TO_DBKEY[secondaryTab]!)}
                                        title={`${secondaryTabs.find(t => t.id === secondaryTab)?.label} に追加`}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '0.35rem 0.7rem',
                                            background: 'rgba(201,162,39,0.12)',
                                            border: '1px solid rgba(201,162,39,0.4)',
                                            color: '#c9a227', borderRadius: 6,
                                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                        }}
                                    >
                                        + 追加
                                    </button>
                                )}
                                {/* TitleDB 追加 */}
                                {primaryTab === 'story' && (
                                    <button
                                        onClick={() => setRecordCardDbKey('titles')}
                                        title="TitleDB に追加"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '0.35rem 0.7rem',
                                            background: 'rgba(201,162,39,0.12)',
                                            border: '1px solid rgba(201,162,39,0.4)',
                                            color: '#c9a227', borderRadius: 6,
                                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                        }}
                                    >
                                        + タイトル追加
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content switching logic */}
                        {primaryTab === 'library' && secondaryTab !== 'tag_db' ? (
                            <div className="collection-view-container">
                                {viewMode === 'list' && <TableView data={currentData} columns={currentColumns} />}
                                {viewMode === 'gallery' && <GalleryView data={currentData} />}
                                {viewMode === 'kanban' && <KanbanView data={currentData} />}
                                {viewMode === 'custom' && (
                                    // Custom "Detail" View Switcher logic
                                    (() => {
                                        switch (secondaryTab) {
                                            case 'character':
                                                return <CharacterDetailView data={currentData as any[]} />;
                                            case 'npc':
                                                return <NPCDetailView data={currentData as any[]} />;
                                            case 'enemy':
                                                return <EnemyDetailView data={currentData as any[]} />;
                                            case 'place':
                                                return <BackgroundDetailView data={currentData as any[]} />;
                                            case 'item_dict':
                                                return <TableView data={currentData as any[]} columns={ITEM_COLUMNS} />;
                                            case 'sound_db':
                                                return <BGMPlayerView />;
                                            default:
                                                return <div className="p-4 text-gray-500">このカテゴリの詳細表示は未実装です</div>;
                                        }
                                    })()
                                )}
                            </div>
                        ) : primaryTab === 'library' && secondaryTab === 'tag_db' ? null
                        : primaryTab !== 'sound' ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>準備中...</p>
                            </div>
                        ) : null}
                    </>
                )}

                {/* Render Sound/BGM Screen */}
                {primaryTab === 'sound' && (
                    <BGMPlayerView />
                )}

                {/* Render Tags DB */}
                {primaryTab === 'library' && secondaryTab === 'tag_db' && (
                    <TagsView />
                )}

                {/* Render Story Screen */}
                {primaryTab === 'story' && (
                    <StoryView deepLink={storyDeepLink} onDeepLinkConsumed={() => setStoryDeepLink(null)} />
                )}

                {/* Render Settings Screen */}
                {primaryTab === 'settings' && (
                    <div className="p-4">
                        {settingsTab === 'sound_settings' && <SoundSettingsView />}
                        {settingsTab === 'screen_settings' && <ScreenSettingsView />}
                        {settingsTab === 'key_settings' && <KeyConfigView />}
                    </div>
                )}

                {/* Render Report Screen */}
                {primaryTab === 'report' && (
                    <ReportView />
                )}

                {/* Render Document Inbox */}
                {primaryTab === 'document' && (
                    <DocumentInboxView />
                )}
            </main>

            {/* WorkSpace Panel */}
            {isWorkspaceOpen && (
                <WorkspacePanel onClose={() => setIsWorkspaceOpen(false)} />
            )}

            {/* Record Card Modal */}
            {recordCardDbKey && (
                <RecordCardModal
                    dbKey={recordCardDbKey}
                    onClose={() => setRecordCardDbKey(null)}
                    onSaved={() => setRecordCardDbKey(null)}
                />
            )}
        </div>
    );
}
