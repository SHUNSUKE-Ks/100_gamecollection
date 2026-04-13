// ============================================
// NanoNovel - Scenario Type Definitions
// ============================================

/**
 * シナリオイベントの種類
 */
export type EventType = 'CHOICE' | 'BATTLE' | 'FLAG' | 'ITEM' | 'JUMP' | 'NONE';

/**
 * 選択肢
 */
export interface Choice {
    label: string;
    nextStoryID: string;
    conditions?: {
        flag: string;
        operator: '==' | '!=' | '>' | '<';
        value: unknown;
    };
}

/**
 * イベントペイロード
 */
export interface EventPayload {
    // CHOICE
    choices?: Choice[];
    // BATTLE
    enemyIDs?: string[];
    reward?: {
        items?: string[];
        exp?: number;
    };
    // ITEM
    itemID?: string;
    count?: number;
    // FLAG
    key?: string;
    value?: unknown;
    // JUMP
    nextStoryID?: string;
}

/**
 * シナリオイベント
 */
export interface ScenarioEvent {
    type: EventType;
    payload: EventPayload;
}

/**
 * ストーリーエントリ（scenario.jsonの1行）
 */
export interface Story {
    storyID: string;        // EP_CH_TXT形式 (例: 01_01_01)
    speaker: string;        // 話者名
    text: string;           // セリフ・ナレーション
    tags: string[];         // タグ駆動制御
    event: ScenarioEvent;   // イベント
    flags: Record<string, unknown>;  // フラグ設定
    effects: string[];      // 演出効果
    tips: string[];         // 関連Tips ID
    note: string;           // 開発メモ
}

/**
 * ゲーム画面の種類
 */
export type ScreenType = 'TITLE' | 'CHAPTER' | 'NOVEL' | 'BATTLE' | 'API_BATTLE' | 'RESULT' | 'GALLERY' | 'COLLECTION' | 'HOME' | 'MENU' | 'HONO_API_TEST';
