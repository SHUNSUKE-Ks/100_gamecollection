// ============================================
// Asset Type Definitions
// ============================================

export type AssetType = 'character' | 'bgm' | 'background' | 'item' | 'skill' | 'enemy' | 'npc';

export interface BaseAsset {
    id: string;
    assetType: AssetType;
    name: string;
    description?: string;
    tags: string[];
    thumbnail?: string;
}

export interface Character extends BaseAsset {
    assetType: 'character';
    standing?: Record<string, string>; // pose → image path
    cgs?: string[];
    actor?: string;
}

export interface BGM extends BaseAsset {
    assetType: 'bgm';
    filename: string;
    artist?: string;
    length?: number; // seconds
    tags: string[];
}

export interface Background extends BaseAsset {
    assetType: 'background';
    filename?: string;
    resolution?: string;
    category?: string;
}

export interface Item extends BaseAsset {
    assetType: 'item';
    rarity?: string;
    price?: number;
    usableIn?: string[]; // battle, story, etc
}

export interface Skill extends BaseAsset {
    assetType: 'skill';
    skillType?: string;
    damage?: number;
    cost?: number;
}

export interface Enemy extends BaseAsset {
    assetType: 'enemy';
    level?: number;
    hp?: number;
    attack?: number;
    defense?: number;
    exp?: number;
}

export interface NPC extends BaseAsset {
    assetType: 'npc';
    role?: string;
    affiliations?: string[];
}

export type Asset = Character | BGM | Background | Item | Skill | Enemy | NPC;
