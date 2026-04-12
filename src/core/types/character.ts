// ============================================
// NanoNovel - Character Type Definitions
// ============================================

/**
 * キャラクターステータス
 */
export interface CharacterStatus {
    hp: number;
    mp: number;
    str: number;  // 力
    dex: number;  // 器用さ
    int: number;  // 知力
}

/**
 * キャラクターデータ
 */
export interface Character {
    id: string;
    name: string;
    description: string;
    defaultTags: string[];      // デフォルト立ち絵タグ
    portraitTag: string;        // 顔アイコンタグ
    promptTemplate: string;     // AI生成用プロンプト
    status: CharacterStatus;
    skills: string[];           // スキルID配列
}
