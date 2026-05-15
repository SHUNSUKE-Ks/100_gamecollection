import type { Meta, StoryObj } from '@storybook/react';
import { InBoxView } from './InBoxView';
import type { BaseAsset } from '@/core/types/asset';

const meta = {
    title: 'Components/InBoxView',
    component: InBoxView,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof InBoxView>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAssets: BaseAsset[] = [
    {
        id: 'remi_unant',
        assetType: 'character',
        name: 'レミ・ウナント',
        description: 'ヒロイン。明るく元気な性格だが、どこか影がある。',
        tags: ['MAIN', 'HEROINE', 'MAGIC'],
        thumbnail: 'chara/remi_unant/standing_01.png',
    },
    {
        id: 'op',
        assetType: 'bgm',
        name: 'OP',
        description: 'ゲームのオープニングテーマ',
        tags: ['OPENING', 'MAIN'],
    },
    {
        id: 'field_bg',
        assetType: 'background',
        name: 'フィールド',
        description: 'フィールド探索用の背景',
        tags: ['FIELD', 'PEACEFUL'],
    },
    {
        id: 'health_potion',
        assetType: 'item',
        name: 'ヒールポーション',
        description: 'HPを回復するアイテム',
        tags: ['HEALING', 'CONSUMABLE'],
    },
    {
        id: 'fire_spell',
        assetType: 'skill',
        name: 'ファイアスペル',
        description: '炎魔法を放つ',
        tags: ['MAGIC', 'OFFENSIVE'],
    },
    {
        id: 'goblin',
        assetType: 'enemy',
        name: 'ゴブリン',
        description: '緑色の小鬼',
        tags: ['MONSTER', 'WEAK'],
    },
];

export const Default: Story = {
    args: {
        assets: sampleAssets,
        title: 'InBox',
    },
};

export const Empty: Story = {
    args: {
        assets: [],
        title: 'Empty InBox',
    },
};

export const SingleType: Story = {
    args: {
        assets: sampleAssets.filter(a => a.assetType === 'character'),
        title: 'Characters Only',
    },
};
