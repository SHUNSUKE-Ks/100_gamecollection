import { useState } from 'react';
import './CharacterDetailView.css';

interface Character {
    id: string;
    name: string;
    description: string;
    tags: string[];
    image?: string;
    standing?: string[];
    cgs?: string[];
    dict?: string; // Support both description/dict keys
    [key: string]: any;
}

interface CharacterDetailViewProps {
    data: Character[];
}

// Helper to resolve asset paths
const resolveAssetUrl = (path: string) => {
    if (!path) return '';
    // In Vite dev, /src/assets/... works if it's in the root
    // We assume 'path' is relative to src/assets, e.g. "chara/remi_unant/standing_01.png"
    return `/src/assets/${path}`;
};

export function CharacterDetailView({ data }: CharacterDetailViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>(data[0]?.id || null);

    const selectedChar = data.find(c => c.id === selectedId);

    // Filter logic for images (same as before to map to the new layout slots)
    const standingImages = selectedChar?.standing?.filter(p => !p.includes('face') && !p.includes('icon')) || [];
    const iconImages = selectedChar?.standing?.filter(p => p.includes('face') || p.includes('icon')) || [];

    // Map data to the user's expected structure for the "Card"
    // tags -> joined as subtitle
    // image -> profileImage
    const subtitle = selectedChar?.tags?.join(' / ') || '';

    return (
        <div className="cdv-container">
            {/* Left Sidebar - Character List */}
            <aside className="cdv-sidebar">
                <h2 className="cdv-sidebar-header">
                    キャラクター一覧
                </h2>
                <ul className="cdv-sidebar-list">
                    {data.map(char => (
                        <li
                            key={char.id}
                            className={`cdv-sidebar-item ${selectedId === char.id ? 'active' : ''}`}
                            onClick={() => setSelectedId(char.id)}
                        >
                            {char.name}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="cdv-main">
                {selectedChar ? (
                    <>
                        {/* Character Card Header */}
                        <h1 className="cdv-section-title">
                            キャラクターカード
                        </h1>

                        {/* Character Detail Card */}
                        <div className="cdv-card">
                            <div className="cdv-card-inner">
                                {/* Profile Image */}
                                <div className="cdv-profile-image-container">
                                    <div className="cdv-profile-image-frame">
                                        {selectedChar.image ? (
                                            <img
                                                src={resolveAssetUrl(selectedChar.image)}
                                                alt={selectedChar.name}
                                                className="cdv-image-cover"
                                            />
                                        ) : (
                                            <div className="cdv-no-img-text">NO IMG</div>
                                        )}
                                    </div>
                                </div>

                                {/* Character Info */}
                                <div className="cdv-info">
                                    <h2 className="cdv-name">
                                        {selectedChar.name}
                                    </h2>
                                    <p className="cdv-subtitle">
                                        {subtitle}
                                    </p>
                                    <p className="cdv-description">
                                        {selectedChar.description}
                                        {selectedChar.dict && <span className="cdv-dict-text">{selectedChar.dict}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2-Column Layout */}
                        <div className="cdv-grid">
                            {/* Left Column - Expression Icons */}
                            <div>
                                <h3 className="cdv-sub-title">
                                    表情アイコン (60x60)
                                </h3>
                                <div className="cdv-icons-wrapper">
                                    {iconImages.length > 0 ? iconImages.map((url, idx) => (
                                        <div key={idx} className="cdv-icon-item">
                                            <div className="cdv-icon-frame">
                                                <img
                                                    src={resolveAssetUrl(url)}
                                                    alt={`Face ${idx}`}
                                                    className="cdv-image-cover"
                                                />
                                            </div>
                                            <p className="cdv-icon-label">Face {idx + 1}</p>
                                        </div>
                                    )) : (
                                        <p className="cdv-no-content-text">No Icons</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Standing Gallery */}
                            <div>
                                <h3 className="cdv-sub-title">
                                    立ち絵ギャラリー
                                </h3>
                                <div className="cdv-standing-frame">
                                    {standingImages.length > 0 ? (
                                        <img
                                            src={resolveAssetUrl(standingImages[0])}
                                            alt="Standing"
                                            className="cdv-image-cover"
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div className="cdv-no-content-text">No Standing Art</div>
                                    )}
                                </div>
                                {/* If multiple standing images exist, showing them as thumbnails below could be an option, strictly following snippet logic for now which implies singular usage or gallery focus */}
                            </div>
                        </div>

                        {/* CG Gallery */}
                        <div style={{ marginTop: '2rem' }}>
                            <h3 className="cdv-sub-title">
                                CGギャラリー (1920x1080)
                            </h3>
                            <div className="cdv-cg-grid">
                                {selectedChar.cgs && selectedChar.cgs.length > 0 ? selectedChar.cgs.map((url, idx) => (
                                    <div key={idx} className="cdv-cg-frame">
                                        <img
                                            src={resolveAssetUrl(url)}
                                            alt="CG"
                                            className="cdv-image-cover"
                                        />
                                    </div>
                                )) : (
                                    <div className="cdv-cg-frame" style={{ backgroundColor: '#1f2937' }}>
                                        <p className="cdv-no-content-text">No CGs</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="cdv-empty-state">
                        <p>キャラクターを選択してください</p>
                    </div>
                )}
            </main>
        </div>
    );
}
