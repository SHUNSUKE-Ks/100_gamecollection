// ============================================
// NanoNovel - Enemy Type Definitions
// ============================================

import type { CharacterStatus } from './character';

/**
 * 敵AIパターン
 */
export type AIPattern = 'aggressive' | 'defensive' | 'random';

/**
 * ドロップアイテム情報
 */
export interface EnemyDrop {
    items: string[];
    exp: number;
    gold: number;
}

/**
 * 敵AI設定
 */
export interface EnemyAI {
    pattern: AIPattern;
    thinkDelay: number;  // 行動前の待機時間（秒）
}

/**
 * 敵キャラクターデータ
 */
export interface Enemy {
    id: string;
    name: string;
    description: string;
    imageTag: string;
    promptTemplate: string;
    status: CharacterStatus;
    skills: string[];
    drop: EnemyDrop;
    ai: EnemyAI;
}
