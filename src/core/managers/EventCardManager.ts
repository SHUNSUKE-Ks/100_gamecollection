// ============================================
// EventCard Manager
// ============================================
// イベントカードの読み込み・進行・スキャンを担当
// ============================================

import type { EventCard, EventNode, TriggerMapEntry, SlotTaskTicket } from '@/core/types';

export class EventCardManager {
    private cards: Map<string, EventCard> = new Map();
    private currentCard: EventCard | null = null;
    private currentNodeIndex: number = 0;

    // ---------------------------
    // カードの登録
    // ---------------------------

    loadCard(card: EventCard): void {
        this.cards.set(card.eventID, card);
    }

    loadCards(cards: EventCard[]): void {
        cards.forEach(card => this.loadCard(card));
    }

    // ---------------------------
    // イベント開始（毎回 [0] から）
    // ---------------------------

    startEvent(eventID: string): EventNode | undefined {
        const card = this.cards.get(eventID);
        if (!card) return undefined;
        this.currentCard = card;
        this.currentNodeIndex = 0;
        return this.getCurrentNode();
    }

    // ---------------------------
    // 現在ノード取得
    // ---------------------------

    getCurrentNode(): EventNode | undefined {
        return this.currentCard?.nodes[this.currentNodeIndex];
    }

    getCurrentCard(): EventCard | null {
        return this.currentCard;
    }

    getNodeIndex(): number {
        return this.currentNodeIndex;
    }

    // ---------------------------
    // ノード移動
    // ---------------------------

    nextNode(): EventNode | undefined {
        if (!this.currentCard) return undefined;
        const next = this.currentNodeIndex + 1;
        if (next < this.currentCard.nodes.length) {
            this.currentNodeIndex = next;
            return this.getCurrentNode();
        }
        return undefined;
    }

    jumpToNode(index: number): EventNode | undefined {
        if (!this.currentCard) return undefined;
        const node = this.currentCard.nodes[index];
        if (node !== undefined) {
            this.currentNodeIndex = index;
            return node;
        }
        return undefined;
    }

    isEventComplete(): boolean {
        if (!this.currentCard) return true;
        return this.currentNodeIndex >= this.currentCard.nodes.length;
    }

    // ---------------------------
    // 開発ツール: 発火条件一覧
    // ---------------------------

    getTriggerMap(): TriggerMapEntry[] {
        return Array.from(this.cards.values()).map(card => ({
            eventID: card.eventID,
            label: card.label,
            trigger: card.trigger,
            status: card.trigger ? '設定済み' : '未設定',
        }));
    }

    // ---------------------------
    // 開発ツール: スロット未設定ノードをタスクチケット化
    // ---------------------------

    getSlotTaskTickets(): SlotTaskTicket[] {
        const tickets: SlotTaskTicket[] = [];
        for (const card of this.cards.values()) {
            for (const node of card.nodes) {
                if (node.slot === null) {
                    tickets.push({
                        eventID: card.eventID,
                        label: card.label,
                        nodeIndex: node.index,
                        speaker: node.speaker,
                        text: node.text,
                        note: 'スロット未設定 — CHOICE / BATTLE / ITEM / FLAG 等をアタッチ可能',
                    });
                }
            }
        }
        return tickets;
    }
}

export const eventCardManager = new EventCardManager();
