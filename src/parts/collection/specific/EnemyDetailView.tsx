import './GridCardView.css';

interface Enemy {
    id: string;
    name: string;
    label: string; // Species/Category
    rarity: number; // 1-5
    image?: string;
    description: string;
    stats?: {
        hp: number;
        mp: number;
        atk: number;
        def: number;
    };
    [key: string]: any;
}

interface EnemyDetailViewProps {
    data: Enemy[];
}

const resolveAssetUrl = (path: string) => {
    if (!path) return '';
    return `/src/assets/${path}`;
};

export function EnemyDetailView({ data }: EnemyDetailViewProps) {
    return (
        <div className="gcv-container">
            <h2 className="text-xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-2">
                エネミー図鑑
            </h2>
            <div className="gcv-grid">
                {data.map((enemy) => (
                    <div key={enemy.id} className={`gcv-card gcv-enemy-card gcv-rarity-${enemy.rarity || 1}`}>
                        <div className="gcv-image-frame">
                            {enemy.image ? (
                                <img src={resolveAssetUrl(enemy.image)} alt={enemy.name} />
                            ) : (
                                <span className="text-4xl">👾</span>
                            )}
                        </div>
                        <div className="gcv-content">
                            <div className="gcv-header">
                                <h3 className="gcv-title">{enemy.name}</h3>
                                <span className="gcv-badge">{enemy.label}</span>
                            </div>

                            {enemy.stats && (
                                <div className="gcv-stats">
                                    <span className="gcv-stat-item" title="Health Points">
                                        <span style={{ color: '#ef4444' }}>♥</span> {enemy.stats.hp}
                                    </span>
                                    <span className="gcv-stat-item" title="Mana Points">
                                        <span style={{ color: '#3b82f6' }}>♦</span> {enemy.stats.mp}
                                    </span>
                                    <span className="gcv-stat-item" title="Attack">
                                        <span>⚔️</span> {enemy.stats.atk}
                                    </span>
                                </div>
                            )}

                            <p className="gcv-description">
                                {enemy.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
