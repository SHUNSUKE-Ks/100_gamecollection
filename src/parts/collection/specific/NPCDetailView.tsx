import { useState } from 'react';
import './CharacterDetailView.css'; // Reusing the same CSS for consistent look

interface NPC {
    id: string;
    name: string;
    description?: string;
    dict?: string;
    role: string;
    location?: string;
    tags?: string[];
    image?: string;
    standing?: string[]; // Might not exist for NPCs
    icons?: string[];    // Might not exist for NPCs
    [key: string]: any;
}

interface NPCDetailViewProps {
    data: NPC[];
}

const resolveAssetUrl = (path: string) => {
    if (!path) return '';
    return `/src/assets/${path}`;
};

export function NPCDetailView({ data }: NPCDetailViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>(data[0]?.id || null);

    const selectedChar = data.find(c => c.id === selectedId);

    // Map role and location to subtitle
    const subtitleParts = [];
    if (selectedChar?.role) subtitleParts.push(selectedChar.role);
    if (selectedChar?.location) subtitleParts.push(selectedChar.location);
    // Also add tags if they exist
    if (selectedChar?.tags) subtitleParts.push(...selectedChar.tags);

    const subtitle = subtitleParts.join(' / ');

    return (
        <div className="cdv-container">
            {/* Left Sidebar */}
            <aside className="cdv-sidebar">
                <h2 className="cdv-sidebar-header">
                    NPC一覧
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
                        <h1 className="cdv-section-title">
                            NPC詳細
                        </h1>

                        <div className="cdv-card">
                            <div className="cdv-card-inner">
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

                                <div className="cdv-info">
                                    <h2 className="cdv-name">
                                        {selectedChar.name}
                                    </h2>
                                    <p className="cdv-subtitle">
                                        {subtitle}
                                    </p>
                                    <p className="cdv-description">
                                        {selectedChar.dict || selectedChar.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Only show assets section if they actually exist, unlike Character view which expects them */}
                        {(selectedChar.standing && selectedChar.standing.length > 0) || (selectedChar.icons && selectedChar.icons.length > 0) ? (
                            <div className="cdv-grid">
                                <div>
                                    <h3 className="cdv-sub-title">アイコン</h3>
                                    {selectedChar.icons && selectedChar.icons.length > 0 ? (
                                        <div className="cdv-icons-wrapper">
                                            {selectedChar.icons.map((url, idx) => (
                                                <div key={idx} className="cdv-icon-item">
                                                    <div className="cdv-icon-frame">
                                                        <img src={resolveAssetUrl(url)} alt="icon" className="cdv-image-cover" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="cdv-no-content-text">No Icons</p>}
                                </div>

                                <div>
                                    <h3 className="cdv-sub-title">立ち絵</h3>
                                    {selectedChar.standing && selectedChar.standing.length > 0 ? (
                                        <div className="cdv-standing-frame">
                                            <img src={resolveAssetUrl(selectedChar.standing[0])} alt="standing" className="cdv-image-cover" style={{ objectFit: 'contain' }} />
                                        </div>
                                    ) : <p className="cdv-no-content-text">No Standing Art</p>}
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="cdv-empty-state">
                        <p>NPCを選択してください</p>
                    </div>
                )}
            </main>
        </div>
    );
}
