import { TableView, type TableColumn } from '@/components/data-views/TableView';

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

interface StoryListViewProps {
    episodes?: Episode[];
    questEvents?: QuestEvent[];
    locations: Location[];
    eventTypes: EventType[];
    isEventMode?: boolean;
}

export function StoryListView({ episodes, questEvents, locations, eventTypes, isEventMode = false }: StoryListViewProps) {
    const getLocationLabel = (locId: string): string => {
        return locations.find(l => l.id === locId)?.label || locId;
    };

    const getEventType = (typeId: string): EventType => {
        return eventTypes.find(t => t.id === typeId) || { id: typeId, label: typeId, color: '#6b7280' };
    };

    // Flatten episodes for main story list
    const getMainStoryData = (): any[] => {
        if (!episodes) return [];
        const data: any[] = [];
        episodes.forEach(ep => {
            ep.chapters.forEach(ch => {
                ch.events.forEach(ev => {
                    data.push({
                        id: ev.id,
                        title: ev.title,
                        description: ev.description,
                        location: getLocationLabel(ev.location || ''),
                        episode: ep.title,
                        chapter: ch.title,
                        type: ev.type || 'main',
                        startStoryID: ev.startStoryID
                    });
                });
            });
        });
        return data;
    };

    // Transform quest events for table
    const getEventData = (): any[] => {
        if (!questEvents) return [];
        return questEvents.map(ev => ({
            id: ev.id,
            title: ev.title,
            description: ev.description,
            location: getLocationLabel(ev.location),
            episode: ev.episode,
            chapter: ev.chapter,
            type: ev.type,
            reward: ev.reward,
            difficulty: ev.difficulty,
            startStoryID: ev.startStoryID
        }));
    };

    const mainColumns: TableColumn[] = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'タイトル' },
        { key: 'episode', label: 'エピソード' },
        { key: 'chapter', label: 'チャプター' },
        { key: 'location', label: '場所' },
        {
            key: 'type',
            label: 'タイプ',
            render: (type: string) => {
                const typeInfo = getEventType(type);
                return (
                    <span
                        className="type-badge"
                        style={{ backgroundColor: typeInfo.color, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}
                    >
                        {typeInfo.label}
                    </span>
                );
            }
        },
        { key: 'description', label: '説明' }
    ];

    const eventColumns: TableColumn[] = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'タイトル' },
        {
            key: 'type',
            label: 'タイプ',
            render: (type: string) => {
                const typeInfo = getEventType(type);
                return (
                    <span
                        className="type-badge"
                        style={{ backgroundColor: typeInfo.color, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}
                    >
                        {typeInfo.label}
                    </span>
                );
            }
        },
        { key: 'location', label: '場所' },
        { key: 'episode', label: 'EP' },
        { key: 'chapter', label: 'CH' },
        {
            key: 'difficulty',
            label: '難易度',
            render: (diff: number) => '★'.repeat(diff) + '☆'.repeat(3 - diff)
        },
        { key: 'reward', label: '報酬' },
        { key: 'description', label: '説明' }
    ];

    const data = isEventMode ? getEventData() : getMainStoryData();
    const columns = isEventMode ? eventColumns : mainColumns;

    return (
        <div className="story-list-view">
            <TableView data={data} columns={columns} />
        </div>
    );
}
