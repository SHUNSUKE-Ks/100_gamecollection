// ============================================
// NanoNovel - Title Library Screen
// ============================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import titlesData from '@/data/collection/titles.json';
import './TitleLibraryScreen.css';

interface TitleEntry {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    thumbnail: string;
    genre: string[];
    status: string;
    hasPlayableNovel: boolean;
    tags: string[];
    createdAt: string;
}

export function TitleLibraryScreen() {
    const navigate = useNavigate();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const titles: TitleEntry[] = titlesData.titles;

    // Extract unique genres
    const allGenres = useMemo(() => {
        const genreSet = new Set<string>();
        titles.forEach(title => {
            title.genre.forEach(g => genreSet.add(g));
        });
        return Array.from(genreSet);
    }, [titles]);

    // Filter titles by selected genres
    const filteredTitles = useMemo(() => {
        if (selectedGenres.length === 0) return titles;
        return titles.filter(title =>
            selectedGenres.some(genre => title.genre.includes(genre))
        );
    }, [titles, selectedGenres]);

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            dev: '#fbbf24',     // amber
            alpha: '#f97316',   // orange
            beta: '#3b82f6',    // blue
            release: '#10b981', // green
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div className="title-library-screen">
            <div className="title-library-header">
                <h1>ゲームライブラリ</h1>
                <p className="title-library-subtitle">全タイトルから選んでプレイ</p>
            </div>

            {/* Genre Filter Chips */}
            <div className="title-library-filters">
                <div className="genre-filter-label">ジャンル：</div>
                <div className="genre-chips">
                    {allGenres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className={`genre-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title Count */}
            <div className="title-library-count">
                {filteredTitles.length} / {titles.length} タイトル
            </div>

            {/* Title Grid */}
            {filteredTitles.length === 0 ? (
                <div className="title-library-empty">
                    <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>📖</span>
                    <p>この条件に該当するタイトルはありません</p>
                </div>
            ) : (
                <div className="title-library-grid">
                    {filteredTitles.map(title => (
                        <div
                            key={title.id}
                            className="title-card"
                            onClick={() => navigate(`/title/${title.id}`)}
                        >
                            {/* Thumbnail */}
                            <div className="title-card-thumbnail">
                                {title.thumbnail ? (
                                    <img
                                        src={`/${title.thumbnail}`}
                                        alt={title.name}
                                        onError={e => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="title-card-thumbnail-placeholder">📖</div>
                                )}
                                {/* Status Badge */}
                                <span
                                    className="title-card-status"
                                    style={{
                                        background: getStatusColor(title.status),
                                    }}
                                >
                                    {title.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="title-card-content">
                                <h3 className="title-card-name">{title.name}</h3>
                                {title.subtitle && (
                                    <p className="title-card-subtitle">{title.subtitle}</p>
                                )}
                                <p className="title-card-description">{title.description}</p>

                                {/* Genre Tags */}
                                <div className="title-card-genres">
                                    {title.genre.map(genre => (
                                        <span key={genre} className="genre-tag">
                                            {genre}
                                        </span>
                                    ))}
                                </div>

                                {/* Play Button */}
                                {title.hasPlayableNovel && (
                                    <button className="title-card-play">
                                        ▶ Demo を Play
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
