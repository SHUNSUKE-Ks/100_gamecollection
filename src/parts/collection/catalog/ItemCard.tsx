import React from 'react';
import type { Item, CatalogLayout } from '@/core/types/item';

// レアリティ定義
const RARITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'C',  color: '#9ca3af' },
  2: { label: 'B',  color: '#34d399' },
  3: { label: 'A',  color: '#60a5fa' },
  4: { label: 'S',  color: '#a78bfa' },
  5: { label: 'SS', color: '#f97316' },
};

const CATEGORY_LABELS: Record<string, string> = {
  consumable: '消費',
  equipment:  '装備',
  key:        '貴重品',
};

// 装備スロットラベル
const EQUIP_SLOT_LABELS: Record<string, string> = {
  weapon:    '武器',
  armor:     '防具',
  accessory: '装飾品',
};

interface Props {
  item: Item;
  layout?: CatalogLayout;
  onClick?: (item: Item) => void;
}

/**
 * ItemCard — アイテム・装備品の表示カード
 *
 * パーツ番号:
 *   [1] ヘッダー: カテゴリバッジ + レアリティランク
 *   [2] アイコン + アイテム名
 *   [3] 装備スロット（装備品のみ）
 *   [4] エフェクトテキスト（ステータス変化など）
 *   [5] 説明文（layout=detailed 時のみ表示）
 *   [6] フッター: タグチップ群 + 価格
 */
export function ItemCard({ item, layout = 'default', onClick }: Props) {
  const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG[1];
  const isCompact = layout === 'compact';

  return (
    <div
      className={`cat-card${isCompact ? ' compact' : ''}`}
      style={{ borderLeftColor: rarity.color, cursor: onClick ? 'pointer' : 'default' }}
      onClick={() => onClick?.(item)}
      title={item.description}
    >
      {/* [1] ヘッダー */}
      <div className="cat-card-header">
        <span className="cat-badge">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <span className="cat-rarity" style={{ color: rarity.color }}>
          {rarity.label}
        </span>
      </div>

      {/* [2] アイコン + 名前 */}
      <div className="cat-card-name-row">
        <span className="cat-item-icon" role="img" aria-label={item.name}>
          {item.iconTag ?? '📦'}
        </span>
        <span className="cat-card-name">{item.name}</span>
      </div>

      {/* [3] 装備スロット */}
      {item.equipSlot && !isCompact && (
        <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-sub)' }}>
          装備: {EQUIP_SLOT_LABELS[item.equipSlot] ?? item.equipSlot}
        </div>
      )}

      {/* [4] エフェクト */}
      {!isCompact && item.effect && item.effect !== '—' && (
        <div className="cat-effect">{item.effect}</div>
      )}

      {/* [5] 説明文 */}
      {layout === 'detailed' && (
        <div className="cat-description">{item.description}</div>
      )}

      {/* [6] フッター */}
      <div className="cat-card-footer">
        <div className="cat-tags">
          {item.tags.map(t => (
            <span key={t} className="cat-tag">{t}</span>
          ))}
        </div>
        {item.price > 0 ? (
          <span className="cat-price">💰 {item.price.toLocaleString()}G</span>
        ) : (
          <span className="cat-price" style={{ opacity: 0.4 }}>売却不可</span>
        )}
      </div>
    </div>
  );
}
