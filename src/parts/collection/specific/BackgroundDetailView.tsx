import './GridCardView.css';

interface Background {
    id: string;
    name: string;
    category?: string;
    description: string;
    image?: string;
    [key: string]: any;
}

interface BackgroundDetailViewProps {
    data: Background[];
}

const resolveAssetUrl = (path: string) => {
    if (!path) return '';
    return `/src/assets/${path}`;
};

export function BackgroundDetailView({ data }: BackgroundDetailViewProps) {
    return (
        <div className="gcv-container">
            <h2 className="text-xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-2">
                背景ギャラリー
            </h2>
            <div className="gcv-grid">
                {data.map((bg) => (
                    <div key={bg.id} className="gcv-card gcv-bg-card">
                        <div className="gcv-image-frame">
                            {bg.image ? (
                                <img src={resolveAssetUrl(bg.image)} alt={bg.name} />
                            ) : (
                                <span className="text-4xl">🏞️</span>
                            )}
                            {bg.category && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    {bg.category}
                                </div>
                            )}
                        </div>
                        <div className="gcv-content">
                            <div className="gcv-header">
                                <h3 className="gcv-title">{bg.name}</h3>
                            </div>
                            <p className="gcv-description">
                                {bg.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
