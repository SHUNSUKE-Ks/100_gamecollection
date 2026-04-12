import { useState } from 'react';

interface Episode {
    id: string;
    title: string;
    chapters: Chapter[];
}

interface Chapter {
    id: string;
    title: string;
    events: any[];
}

interface StoryStepperProps {
    episodes: Episode[];
    selectedChapterId: string | null;
    onChapterSelect: (chapterId: string) => void;
}

export function StoryStepper({ episodes, selectedChapterId, onChapterSelect }: StoryStepperProps) {
    const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set(['ep1']));

    const toggleEpisode = (episodeId: string) => {
        setExpandedEpisodes(prev => {
            const next = new Set(prev);
            if (next.has(episodeId)) {
                next.delete(episodeId);
            } else {
                next.add(episodeId);
            }
            return next;
        });
    };

    return (
        <div className="story-stepper">
            <h3 className="stepper-title">エピソード選択</h3>
            <div className="stepper-container">
                {episodes.map(episode => (
                    <div key={episode.id} className="episode-item">
                        <button
                            className="episode-header"
                            onClick={() => toggleEpisode(episode.id)}
                        >
                            <span className="episode-toggle">
                                {expandedEpisodes.has(episode.id) ? '▼' : '▶'}
                            </span>
                            <span className="episode-title">{episode.title}</span>
                        </button>

                        {expandedEpisodes.has(episode.id) && (
                            <div className="chapters-list">
                                {episode.chapters.map(chapter => (
                                    <button
                                        key={chapter.id}
                                        className={`chapter-item ${selectedChapterId === chapter.id ? 'active' : ''}`}
                                        onClick={() => onChapterSelect(chapter.id)}
                                    >
                                        <span className="chapter-marker">
                                            {selectedChapterId === chapter.id ? '●' : '○'}
                                        </span>
                                        <span className="chapter-title">{chapter.title}</span>
                                        <span className="chapter-count">({chapter.events.length})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
