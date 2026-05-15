// ============================================
// EventCard System - Type Definitions
// ============================================
// ノベル連番型からRPGイベント発生型への移行設計
// ============================================

// ---------------------------
// スロット（アタッチポイント）
// ---------------------------

export type SlotType = 'CHOICE' | 'BATTLE' | 'ITEM' | 'FLAG' | 'JUMP' | 'END';

export interface ChoiceOption {
    label: string;
    nextIndex: number | 'END';
}

export interface SlotPayload {
    // CHOICE
    choices?: ChoiceOption[];
    // BATTLE
    enemyIDs?: string[];
    reward?: { items?: string[]; exp?: number };
    // ITEM
    itemID?: string;
    count?: number;
    // FLAG
    key?: string;
    value?: unknown;
    // JUMP（別イベントカードへ飛ぶ）
    targetEventID?: string;
    // END（ゲーム画面へ遷移）
    goto?: string;
}

export interface EventSlot {
    type: SlotType;
    payload: SlotPayload;
}

// ---------------------------
// ノード（会話の1コマ）
// ---------------------------

export interface EventNode {
    index: number;
    speaker?: string;
    text?: string;
    characterImage?: string;
    backgroundImage?: string;
    bgm?: string;
    // slot: null → テキストのみ（後からアタッチ可能）
    // slot: {...} → CHOICE / BATTLE / ITEM 等がアタッチ済み
    slot: EventSlot | null;
}

// ---------------------------
// トリガー（発火条件）
// ---------------------------

export type TriggerType =
    | 'LOCATION'  // 場所に入ったとき
    | 'TALK'      // NPCに話しかけたとき
    | 'ITEM'      // アイテム使用時
    | 'FLAG'      // フラグ条件が満たされたとき
    | 'AUTO'      // 自動発火（シーン開始など）
    | 'MANUAL';   // 手動呼び出し（デバッグ・テスト用）

export interface EventTrigger {
    type: TriggerType;
    target?: string;    // エリアID / NPCID / アイテムID
    condition?: {
        flag: string;
        value: unknown;
    };
}

// ---------------------------
// イベントカード
// ---------------------------

export interface EventCard {
    eventID: string;                // 例: "EV_001"
    label: string;                  // 日本語ラベル（開発・表示用）
    trigger: EventTrigger | null;   // null = 後付け（未設定）
    nodes: EventNode[];
}

// ---------------------------
// 開発ツール用
// ---------------------------

/** trigger_map.json の1エントリ — 発火条件一覧表示用 */
export interface TriggerMapEntry {
    eventID: string;
    label: string;
    trigger: EventTrigger | null;
    status: '設定済み' | '未設定';
    note?: string;
}

/** slot: null のノードをスキャンして返すタスクチケット */
export interface SlotTaskTicket {
    eventID: string;
    label: string;
    nodeIndex: number;
    speaker?: string;
    text?: string;
    note: string;
}
