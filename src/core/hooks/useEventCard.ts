// ============================================
// useEventCard Hook
// ============================================
// イベントカード型会話の進行を管理する
// ・毎回 node[0] から仕切り直し
// ・slot: null  → タップで次ノードへ
// ・slot: CHOICE → 選択肢を表示して待機
// ・slot: FLAG / ITEM → 即適用してタップ待ち
// ・slot: BATTLE / END / JUMP → 画面遷移
// ============================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { eventCardManager } from '@/core/managers/EventCardManager';
import type { EventCard, EventNode, ChoiceOption } from '@/core/types';

// ---------------------------
// イベントカードを一括ロード（全カードをここに追加していく）
// ---------------------------
import ev001Raw from '@/data/events/EV_001.json';

const ALL_EVENT_CARDS: EventCard[] = [ev001Raw as EventCard];

let _initialized = false;
function ensureInitialized() {
    if (_initialized) return;
    eventCardManager.loadCards(ALL_EVENT_CARDS);
    _initialized = true;
}

// ---------------------------
// Hook
// ---------------------------

interface LogEntry {
    nodeIndex: number;
    speaker: string;
    text: string;
}

export function useEventCard(eventID: string | null) {
    const { setFlag, addItem, setScreen } = useGameStore();

    ensureInitialized();

    const [nodeIndex, setNodeIndex] = useState<number>(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    // イベント開始 or 切り替え — 必ず [0] から仕切り直し
    useEffect(() => {
        if (!eventID) return;
        eventCardManager.startEvent(eventID);
        setNodeIndex(0);
        setLogs([]);
        setIsComplete(false);
    }, [eventID]);

    // 現在ノード
    const currentNode = useMemo<EventNode | undefined>(() => {
        if (!eventID) return undefined;
        const card = eventCardManager.getCurrentCard();
        return card?.nodes[nodeIndex];
    }, [eventID, nodeIndex]);

    const slot = currentNode?.slot ?? null;

    // 選択肢判定
    const hasChoices =
        slot?.type === 'CHOICE' && (slot.payload.choices?.length ?? 0) > 0;

    const choices: ChoiceOption[] = hasChoices
        ? (slot!.payload.choices ?? [])
        : [];

    // ログ追記（同一ノードの重複追加を防ぐ）
    useEffect(() => {
        if (!currentNode?.text || !currentNode?.speaker) return;
        setLogs(prev => {
            if (prev.some(l => l.nodeIndex === currentNode.index)) return prev;
            return [
                ...prev,
                {
                    nodeIndex: currentNode.index,
                    speaker: currentNode.speaker!,
                    text: currentNode.text!,
                },
            ];
        });
    }, [currentNode]);

    // タップ / クリック で進める
    const advance = useCallback((): boolean => {
        if (!eventID || !currentNode || isComplete) return false;

        // CHOICE は selectChoice を待つ
        if (slot?.type === 'CHOICE') return false;

        if (slot) {
            const { type, payload } = slot;

            // 即時適用スロット（処理後に次ノードへ）
            if (type === 'FLAG' && payload.key !== undefined) {
                setFlag(payload.key, payload.value);
            }
            if (type === 'ITEM' && payload.itemID) {
                addItem(payload.itemID, payload.count ?? 1);
            }

            // 画面遷移スロット
            if (type === 'END') {
                setScreen((payload.goto as any) ?? 'TITLE');
                setIsComplete(true);
                return true;
            }
            if (type === 'BATTLE') {
                setScreen('BATTLE');
                return true;
            }
            if (type === 'JUMP' && payload.targetEventID) {
                eventCardManager.startEvent(payload.targetEventID);
                setNodeIndex(0);
                setLogs([]);
                return true;
            }
        }

        // 次ノードへ
        const card = eventCardManager.getCurrentCard();
        const next = nodeIndex + 1;
        if (card && next < card.nodes.length) {
            setNodeIndex(next);
            return true;
        }

        setIsComplete(true);
        return false;
    }, [eventID, currentNode, nodeIndex, isComplete, slot, setFlag, addItem, setScreen]);

    // 選択肢を選んだとき
    const selectChoice = useCallback((nextIndex: number | 'END') => {
        if (nextIndex === 'END') {
            setIsComplete(true);
            return;
        }
        const card = eventCardManager.getCurrentCard();
        if (card && nextIndex >= 0 && nextIndex < card.nodes.length) {
            setNodeIndex(nextIndex);
        }
    }, []);

    const resetLogs = useCallback(() => setLogs([]), []);

    // 開発ツール: slot未設定タスクチケット
    const slotTaskTickets = useMemo(
        () => eventCardManager.getSlotTaskTickets(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nodeIndex] // カード更新のたびに再計算
    );

    // 開発ツール: 発火条件一覧
    const triggerMap = useMemo(
        () => eventCardManager.getTriggerMap(),
        []
    );

    return {
        currentNode,
        nodeIndex,
        hasChoices,
        choices,
        logs,
        isComplete,
        slot,
        advance,
        selectChoice,
        resetLogs,
        // 開発用
        slotTaskTickets,
        triggerMap,
    };
}
