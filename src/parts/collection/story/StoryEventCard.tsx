interface StoryEvent {
    id: string;
    title: string;
    description: string;
    location?: string;
    type?: string;
    startStoryID?: string;
}

interface EventType {
    id: string;
    label: string;
    color: string;
}

interface StoryEventCardProps {
    event: StoryEvent;
    eventType: EventType;
    locationLabel: string;
    reward?: string;
    difficulty?: number;
    episodeLabel?: string;
    chapterLabel?: string;
}

export function StoryEventCard({
    event,
    eventType,
    locationLabel,
    reward,
    difficulty,
    episodeLabel,
    chapterLabel
}: StoryEventCardProps) {
    const handleStartEvent = () => {
        if (event.startStoryID) {
            console.log('Starting event:', event.id, 'Story ID:', event.startStoryID);
            // TODO: Navigate to NovelScreen with startStoryID
            alert(`イベント開始: ${event.title}\nストーリーID: ${event.startStoryID}`);
        }
    };

    return (
        <div
            className="story-event-card"
            style={{ borderLeftColor: eventType.color }}
        >
            {/* Header */}
            <div className="event-card-header">
                <span
                    className="event-type-badge"
                    style={{ backgroundColor: eventType.color }}
                >
                    {eventType.label}
                </span>
                {difficulty !== undefined && (
                    <span className="event-difficulty">
                        {'★'.repeat(difficulty)}{'☆'.repeat(3 - difficulty)}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="event-card-body">
                <h4 className="event-title">{event.title}</h4>
                <p className="event-description">{event.description}</p>
            </div>

            {/* Tags */}
            <div className="event-card-tags">
                <span className="event-tag location-tag">📍 {locationLabel}</span>
                {episodeLabel && chapterLabel && (
                    <span className="event-tag chapter-tag">{episodeLabel} / {chapterLabel}</span>
                )}
            </div>

            {/* Reward */}
            {reward && (
                <div className="event-reward">
                    💰 報酬: {reward}
                </div>
            )}

            {/* Action */}
            <button
                className="event-start-btn"
                onClick={handleStartEvent}
                disabled={!event.startStoryID}
            >
                {event.startStoryID ? 'イベントを開始' : '準備中'}
            </button>
        </div>
    );
}
