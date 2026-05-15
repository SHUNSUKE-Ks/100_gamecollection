// ============================================
// NanoNovel - Title Detail Screen
// ============================================

import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/core/stores/gameStore';
import titlesData from '@/data/collection/titles.json';
import './TitleDetailScreen.css';

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

export function TitleDetailScreen() {
    const { titleId } = useParams<{ titleId: string }>();
    const navigate = useNavigate();
    const { setTitleId, setScreen } = useGameStore();

    const titles: TitleEntry[] = titlesData.titles;
    const title = titles.find(t => t.id === titleId);

    if (!title) {
        return (
            <div className="title-detail-screen title-detail-not-found">
                <h2>タイトルが見つかりません</h2>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    ライブラリに戻る
                </button>
            </div>
        );
    }

    const handlePlayDemo = () => {
        setTitleId(title.id);
        navigate(`/novel/${title.id}`);
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            dev: '開発中',
            alpha: 'アルファ版',
            beta: 'ベータ版',
            release: 'リリース版',
        };
        return labels[status] || status;
    };

    return (
        <div className="title-detail-screen">
            {/* Header with Back Button */}
            <div className="title-detail-header">
                <button onClick={() => navigate('/')} className="title-detail-back-btn">
                    ← ライブラリに戻る
                </button>
                <h1>{title.name}</h1>
            </div>

            <div className="title-detail-container">
                {/* Left Column: Thumbnail & Actions */}
                <div className="title-detail-left">
                    <div className="title-detail-thumbnail">
                        {title.thumbnail ? (
                            <img src={`/${title.thumbnail}`} alt={title.name} />
                        ) : (
                            <div className="title-detail-thumbnail-placeholder">📖</div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="title-detail-actions">
                        {title.hasPlayableNovel && (
                            <button
                                onClick={handlePlayDemo}
                                className="btn btn-primary btn-large"
                            >
                                ▶ Demo を Play
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-secondary btn-large"
                        >
                            ← 戻る
                        </button>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="title-detail-right">
                    {/* Subtitle */}
                    {title.subtitle && (
                        <p className="title-detail-subtitle">{title.subtitle}</p>
                    )}

                    {/* Status Badge */}
                    <div className="title-detail-meta">
                        <span className="title-detail-status">{getStatusLabel(title.status)}</span>
                        <span className="title-detail-date">
                            {new Date(title.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="title-detail-section">
                        <h3>概要</h3>
                        <p className="title-detail-description">{title.description}</p>
                    </div>

                    {/* Genre */}
                    <div className="title-detail-section">
                        <h3>ジャンル</h3>
                        <div className="title-detail-genres">
                            {title.genre.map(genre => (
                                <span key={genre} className="genre-badge">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {title.tags && title.tags.length > 0 && (
                        <div className="title-detail-section">
                            <h3>タグ</h3>
                            <div className="title-detail-tags">
                                {title.tags.map(tag => (
                                    <span key={tag} className="tag-badge">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="title-detail-info">
                        <div className="info-item">
                            <span className="info-label">ID:</span>
                            <span className="info-value">{title.id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">ステータス:</span>
                            <span className="info-value">{getStatusLabel(title.status)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">プレイ可能:</span>
                            <span className="info-value">
                                {title.hasPlayableNovel ? 'はい' : 'いいえ'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
