// ============================================
// InBox View - Unified Asset Browser
// ============================================

import { useState, useMemo } from 'react';
import type { BaseAsset, AssetType } from '@/core/types/asset';
import './InBoxView.css';

interface InBoxViewProps {
    assets: BaseAsset[];
    title?: string;
}

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
    character: 'キャラクター',
    bgm: 'BGM',
    background: '背景',
    item: 'アイテム',
    skill: 'スキル',
    enemy: '敵',
    npc: 'NPC',
};

const ASSET_TYPE_COLORS: Record<AssetType, string> = {
    character: '#fbbf24',   // amber
    bgm: '#8b5cf6',         // purple
    background: '#06b6d4',  // cyan
    item: '#10b981',        // emerald
    skill: '#f97316',       // orange
    enemy: '#ef4444',       // red
    npc: '#ec4899',         // pink
};

export function InBoxView({ assets, title = 'InBox' }: InBoxViewProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);

    // Extract unique tags
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        assets.forEach(asset => {
            asset.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [assets]);

    // Extract unique asset types
    const assetTypes = useMemo(() => {
        const types = new Set<AssetType>();
        assets.forEach(asset => types.add(asset.assetType));
        return Array.from(types).sort();
    }, [assets]);

    // Filter assets
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            // Filter by search query
            if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Filter by asset type
            if (selectedAssetType && asset.assetType !== selectedAssetType) {
                return false;
            }
            // Filter by tags
            if (selectedTags.length > 0) {
                return selectedTags.some(tag => asset.tags.includes(tag));
            }
            return true;
        });
    }, [assets, searchQuery, selectedTags, selectedAssetType]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const toggleAssetType = (type: AssetType) => {
        setSelectedAssetType(selectedAssetType === type ? null : type);
    };

    return (
        <div className="inbox-view">
            {/* Header */}
            <div className="inbox-header">
                <h2>{title}</h2>
                <span className="inbox-count">{filteredAssets.length} / {assets.length} アセット</span>
            </div>

            {/* Search Bar */}
            <div className="inbox-search">
                <input
                    type="text"
                    placeholder="アセット名で検索..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="inbox-search-input"
                />
            </div>

            {/* Asset Type Filter */}
            <div className="inbox-filters">
                <div className="filter-section">
                    <label className="filter-label">アセットタイプ</label>
                    <div className="type-chips">
                        {assetTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleAssetType(type)}
                                className={`type-chip ${selectedAssetType === type ? 'active' : ''}`}
                                style={
                                    selectedAssetType === type
                                        ? { background: ASSET_TYPE_COLORS[type], color: 'white' }
                                        : { borderColor: ASSET_TYPE_COLORS[type], color: ASSET_TYPE_COLORS[type] }
                                }
                            >
                                {ASSET_TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tag Filter */}
                <div className="filter-section">
                    <label className="filter-label">タグ</label>
                    <div className="tag-chips">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Asset Grid */}
            {filteredAssets.length === 0 ? (
                <div className="inbox-empty">
                    <p>この条件に該当するアセットはありません</p>
                </div>
            ) : (
                <div className="inbox-grid">
                    {filteredAssets.map(asset => (
                        <div key={`${asset.assetType}-${asset.id}`} className="asset-card">
                            {/* Thumbnail */}
                            <div className="asset-thumbnail">
                                {asset.thumbnail ? (
                                    <img src={`/${asset.thumbnail}`} alt={asset.name} />
                                ) : (
                                    <div className="asset-thumbnail-placeholder">
                                        {asset.assetType === 'character' && '👤'}
                                        {asset.assetType === 'bgm' && '🎵'}
                                        {asset.assetType === 'background' && '🎨'}
                                        {asset.assetType === 'item' && '📦'}
                                        {asset.assetType === 'skill' && '⚔️'}
                                        {asset.assetType === 'enemy' && '👹'}
                                        {asset.assetType === 'npc' && '🧙'}
                                    </div>
                                )}
                                <span
                                    className="asset-type-badge"
                                    style={{ background: ASSET_TYPE_COLORS[asset.assetType] }}
                                >
                                    {ASSET_TYPE_LABELS[asset.assetType]}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="asset-content">
                                <h4 className="asset-name">{asset.name}</h4>
                                {asset.description && (
                                    <p className="asset-description">{asset.description}</p>
                                )}
                                {asset.tags.length > 0 && (
                                    <div className="asset-tags">
                                        {asset.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="asset-tag">
                                                {tag}
                                            </span>
                                        ))}
                                        {asset.tags.length > 3 && (
                                            <span className="asset-tag">+{asset.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
