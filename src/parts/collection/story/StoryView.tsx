import { useState, useEffect } from 'react';
import { StoryStepper } from './StoryStepper';
import { StoryListView } from './StoryListView';
import { StoryEventCard } from './StoryEventCard';
import { PlotNotebook } from './PlotNotebook';
import { SchemaShortView } from './SchemaShortView';
import { NovelLibraryView } from './NovelLibraryView';
import { NovelDetailView } from './NovelDetailView';
import type { NovelEntry } from './NovelLibraryView';
import episodesData from '@/data/collection/episodes.json';
import eventsData from '@/data/collection/events.json';
import './StoryView.css';

// Types
type StorySubTab = 'main' | 'event' | 'plot' | 'schema' | 'library';
type SchemaVersionId = 'v11' | 'v12' | 'v21' | 'v31';

interface StoryViewProps {
    deepLink?: string | null;
    onDeepLinkConsumed?: () => void;
}
type StoryViewMode = 'stepper' | 'list';

interface Episode {
    id: string;
    title: string;
    chapters: Chapter[];
}

interface Chapter {
    id: string;
    title: string;
    events: StoryEvent[];
}

interface StoryEvent {
    id: string;
    title: string;
    description: string;
    location?: string;
    type?: string;
    startStoryID?: string;
}

interface QuestEvent {
    id: string;
    title: string;
    description: string;
    type: string;
    location: string;
    episode: string;
    chapter: string;
    reward: string;
    difficulty: number;
    startStoryID: string | null;
}

interface Location {
    id: string;
    label: string;
    color: string;
}

interface EventType {
    id: string;
    label: string;
    color: string;
}

export function StoryView({ deepLink, onDeepLinkConsumed }: StoryViewProps = {}) {
    const [subTab, setSubTab] = useState<StorySubTab>('main');
    const [schemaInitialVersion, setSchemaInitialVersion] = useState<SchemaVersionId | undefined>(undefined);
    const [detailEntry, setDetailEntry] = useState<NovelEntry | null>(null);
    const [viewMode, setViewMode] = useState<StoryViewMode>('stepper');
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    // DeepLink 処理
    useEffect(() => {
        if (!deepLink) return;
        if (deepLink === 'story:plot') {
            setSubTab('plot');
        } else if (deepLink.startsWith('story:schema')) {
            setSubTab('schema');
            const versionMatch = deepLink.match(/story:schema:(\w+)/);
            if (versionMatch) {
                setSchemaInitialVersion(versionMatch[1] as SchemaVersionId);
            }
        }
        onDeepLinkConsumed?.();
    }, [deepLink]);

    const episodes: Episode[] = episodesData.episodes;
    const locations: Location[] = episodesData.locations;
    const questEvents: QuestEvent[] = eventsData.events;
    const eventTypes: EventType[] = eventsData.types;

    // Get events for selected chapter
    const getChapterEvents = (): StoryEvent[] => {
        if (!selectedChapterId) return [];
        for (const ep of episodes) {
            for (const ch of ep.chapters) {
                if (ch.id === selectedChapterId) {
                    return ch.events;
                }
            }
        }
        return [];
    };

    // Get location label by ID
    const getLocationLabel = (locId?: string): string => {
        if (!locId) return '-';
        return locations.find(l => l.id === locId)?.label || locId;
    };

    // Get event type info
    const getEventType = (typeId: string): EventType => {
        return eventTypes.find(t => t.id === typeId) || { id: typeId, label: typeId, color: '#6b7280' };
    };

    const chapterEvents = getChapterEvents();

    return (
        <div className="story-view">
            {/* Sub Navigation */}
            <div className="story-sub-nav">
                <div className="story-sub-tabs">
                    <button
                        className={`story-sub-tab ${subTab === 'main' ? 'active' : ''}`}
                        onClick={() => setSubTab('main')}
                    >
                        メイン
                    </button>
                    <button
                        className={`story-sub-tab ${subTab === 'event' ? 'active' : ''}`}
                        onClick={() => setSubTab('event')}
                    >
                        イベント
                    </button>
                    <button
                        className={`story-sub-tab ${subTab === 'plot' ? 'active' : ''}`}
                        onClick={() => setSubTab('plot')}
                    >
                        ✏ シナリオメモ
                    </button>
                    <button
                        className={`story-sub-tab ${subTab === 'schema' ? 'active' : ''}`}
                        onClick={() => setSubTab('schema')}
                    >
                        📄 スキーマーショート
                    </button>
                    <button
                        className={`story-sub-tab ${subTab === 'library' ? 'active' : ''}`}
                        onClick={() => { setSubTab('library'); setDetailEntry(null); }}
                    >
                        📚 ノベルライブラリ
                    </button>
                </div>
                {/* ビュー切替はプロット手帳・スキーマーショート・ライブラリでは非表示 */}
                {subTab !== 'plot' && subTab !== 'schema' && subTab !== 'library' && (
                    <div className="story-view-toggle">
                        <button
                            className={`view-toggle-btn ${viewMode === 'stepper' ? 'active' : ''}`}
                            onClick={() => setViewMode('stepper')}
                            title="ステッパー表示"
                        >
                            📋
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="リスト表示"
                        >
                            📝
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="story-content">
                {/* シナリオメモ */}
                {subTab === 'plot' && <PlotNotebook onBack={() => setSubTab('main')} />}

                {/* スキーマーショート */}
                {subTab === 'schema' && <SchemaShortView initialVersion={schemaInitialVersion} />}

                {/* ノベルライブラリ */}
                {subTab === 'library' && !detailEntry && (
                    <NovelLibraryView onOpenDetail={(entry) => setDetailEntry(entry)} />
                )}
                {subTab === 'library' && detailEntry && (
                    <NovelDetailView entry={detailEntry} onBack={() => setDetailEntry(null)} />
                )}

                {subTab !== 'plot' && subTab !== 'schema' && subTab !== 'library' && (subTab === 'main' ? (
                    // Main Story View
                    <div className="story-main-layout">
                        {viewMode === 'stepper' && (
                            <>
                                {/* Side Panel - Stepper */}
                                <div className={`story-side-panel ${isPanelOpen ? 'open' : 'closed'}`}>
                                    <StoryStepper
                                        episodes={episodes}
                                        selectedChapterId={selectedChapterId}
                                        onChapterSelect={setSelectedChapterId}
                                    />
                                    <button
                                        className="toggle-panel-btn"
                                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                                    >
                                        {isPanelOpen ? '◀' : '▶'}
                                    </button>
                                </div>

                                {/* Main Content Area - Event Cards */}
                                <div className="story-main-area">
                                    {selectedChapterId ? (
                                        <>
                                            <h3 className="chapter-title">
                                                {episodes.flatMap(e => e.chapters).find(c => c.id === selectedChapterId)?.title}
                                            </h3>
                                            <div className="events-grid">
                                                {chapterEvents.map(event => (
                                                    <StoryEventCard
                                                        key={event.id}
                                                        event={event}
                                                        eventType={getEventType(event.type || 'main')}
                                                        locationLabel={getLocationLabel(event.location)}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="no-selection">
                                            <p>← チャプターを選択してください</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {viewMode === 'list' && (
                            <StoryListView
                                episodes={episodes}
                                locations={locations}
                                eventTypes={eventTypes}
                            />
                        )}
                    </div>
                ) : (
                    // Event (Quest/Sub) View
                    <div className="story-event-layout">
                        {viewMode === 'list' ? (
                            <StoryListView
                                questEvents={questEvents}
                                locations={locations}
                                eventTypes={eventTypes}
                                isEventMode={true}
                            />
                        ) : (
                            <div className="events-grid quest-grid">
                                {questEvents.map(event => (
                                    <StoryEventCard
                                        key={event.id}
                                        event={{
                                            id: event.id,
                                            title: event.title,
                                            description: event.description,
                                            location: event.location,
                                            type: event.type,
                                            startStoryID: event.startStoryID || undefined
                                        }}
                                        eventType={getEventType(event.type)}
                                        locationLabel={getLocationLabel(event.location)}
                                        reward={event.reward}
                                        difficulty={event.difficulty}
                                        episodeLabel={event.episode}
                                        chapterLabel={event.chapter}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
