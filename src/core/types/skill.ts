// ============================================
// NanoNovel - Skill Type Definitions
// ============================================

/**
 * スキルターゲット種別
 */
export type SkillTarget = 'enemy' | 'self' | 'ally' | 'all_enemies' | 'all_allies';

/**
 * スキルスケール（どのステータスで威力が上がるか）
 */
export type SkillScale = 'str' | 'int' | 'dex';

/**
 * スキルコスト
 */
export interface SkillCost {
    mp: number;
    cooldown: number;  // ターン数
}

/**
 * スキル威力
 */
export interface SkillPower {
    base: number;
    scale: SkillScale;
}

/**
 * スキルデータ
 */
export interface Skill {
    id: string;
    name: string;
    description: string;
    iconTag: string;
    cost: SkillCost;
    power: SkillPower;
    target: SkillTarget;
    effects: string[];
    tags: string[];
}
