// ============================================
// NanoNovel - Scenario Manager
// ============================================

import type { Story, EventPayload } from '@/core/types';

/**
 * シナリオ管理クラス
 * シナリオの読み込み、進行、イベント処理を担当
 */
export class ScenarioManager {
    private scenarios: Story[] = [];
    private currentIndex: number = 0;

    /**
     * シナリオデータを初期化
     */
    init(scenarioData: Story[]): void {
        this.scenarios = scenarioData;
        this.currentIndex = 0;
    }

    /**
     * 現在のストーリーを取得
     */
    getCurrentStory(): Story | undefined {
        return this.scenarios[this.currentIndex];
    }

    /**
     * ストーリーIDから取得
     */
    getStoryByID(storyID: string): Story | undefined {
        return this.scenarios.find(s => s.storyID === storyID);
    }

    /**
     * ストーリーIDからインデックスを取得
     */
    getIndexByID(storyID: string): number {
        return this.scenarios.findIndex(s => s.storyID === storyID);
    }

    /**
     * 次のストーリーへ進む
     */
    next(): Story | undefined {
        if (this.currentIndex < this.scenarios.length - 1) {
            this.currentIndex++;
            return this.getCurrentStory();
        }
        return undefined;
    }

    /**
     * 指定したストーリーIDへジャンプ
     */
    jumpTo(storyID: string): Story | undefined {
        const index = this.getIndexByID(storyID);
        if (index !== -1) {
            this.currentIndex = index;
            return this.getCurrentStory();
        }
        return undefined;
    }

    /**
     * イベントを処理してアクションを返す
     */
    processEvent(story: Story): {
        type: string;
        payload: EventPayload;
        shouldWait: boolean;
    } {
        const { event } = story;

        switch (event.type) {
            case 'CHOICE':
                return {
                    type: 'CHOICE',
                    payload: event.payload,
                    shouldWait: true
                };

            case 'BATTLE':
                return {
                    type: 'BATTLE',
                    payload: event.payload,
                    shouldWait: true
                };

            case 'ITEM':
                return {
                    type: 'ITEM',
                    payload: event.payload,
                    shouldWait: false
                };

            case 'FLAG':
                return {
                    type: 'FLAG',
                    payload: event.payload,
                    shouldWait: false
                };

            case 'JUMP':
                return {
                    type: 'JUMP',
                    payload: event.payload,
                    shouldWait: false
                };

            default:
                return {
                    type: 'NONE',
                    payload: {},
                    shouldWait: false
                };
        }
    }

    /**
     * 全シナリオ数を取得
     */
    getTotalCount(): number {
        return this.scenarios.length;
    }

    /**
     * 現在のインデックスを取得
     */
    getCurrentIndex(): number {
        return this.currentIndex;
    }

    /**
     * 進捗率を取得 (0-100)
     */
    getProgress(): number {
        if (this.scenarios.length === 0) return 0;
        return Math.round((this.currentIndex / (this.scenarios.length - 1)) * 100);
    }
}

// シングルトンインスタンス
export const scenarioManager = new ScenarioManager();
