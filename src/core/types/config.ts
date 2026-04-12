// ============================================
// NanoNovel - Game Config Type Definitions
// ============================================

/**
 * タイトル画面設定
 */
export interface TitleConfig {
    title: string;
    subtitle: string;
    backgroundTag: string;
    logoPath: string;
    ui: {
        startLabel: string;
        continueLabel: string;
        settingsLabel: string;
    };
}

/**
 * ゲーム全体設定
 */
export interface GameConfig {
    worldType: string;
    difficulty: 'easy' | 'normal' | 'hard';
    imageGeneration: boolean;
    playerCount: number;
    seed: string;
}
