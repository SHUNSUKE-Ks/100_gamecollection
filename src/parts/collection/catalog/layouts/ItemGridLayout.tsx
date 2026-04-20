/**
 * ItemGridLayout — アイテムA: インベントリグリッド
 *
 * ゲーム内インベントリ風のアイコングリッド。
 * セルをクリックすると下部に詳細が展開される。
 * 用途: FF・Zelda系のインベントリ画面
 *
 * パーツ:
 *   [1] ヘッダー: タイトル + 所持数/上限
 *   [2] グリッドセル: アイコン + レアリティ縁取り + 個数バッジ
 *   [3] 詳細パネル (選択時に下部展開)
 */
import React, { useState } from 'react';
import type { Item } from '@/core/types/item';

const RARITY_BORDER: Record<number, string> = {
  1: '#6b7280',
  2: '#34d399',
  3: '#60a5fa',
  4: '#a78bfa',
  5: '#f97316',
};

const CATEGORY_LABEL: Record<string, string> = {
  consumable: '消費', equipment: '装備', key: '貴重品',
};

interface Props {
  items: Item[];
  maxSlots?: number;
  title?: string;
}

export function ItemGridLayout({ items, maxSlots = 20, title = 'アイテム袋' }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const selected = items.find(i => i.id === selectedId) ?? null;

  // 空スロットで埋める
  const slots = Array.from({ length: Math.max(maxSlots, items.length) }, (_, i) => items[i] ?? null);

  return (
    <div style={{
      background: 'var(--color-bg-medium)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
      userSelect: 'none',
    }}>
      {/* [1] ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 0.875rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-light)',
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          📦 {title}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
          {items.length} / {maxSlots}
        </span>
      </div>

      {/* [2] グリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.375rem',
        padding: '0.625rem',
        minHeight: 120,
      }}>
        {slots.map((item, idx) => (
          <button
            key={item?.id ?? `empty-${idx}`}
            onClick={() => item && setSelectedId(item.id)}
            style={{
              aspectRatio: '1',
              border: `2px solid ${item ? RARITY_BORDER[item.rarity] ?? '#6b7280' : '#2a2a35'}`,
              borderRadius: 8,
              background: selectedId === item?.id
                ? 'rgba(201,162,39,0.15)'
                : item ? 'var(--color-bg-light)' : 'rgba(255,255,255,0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.125rem',
              cursor: item ? 'pointer' : 'default',
              position: 'relative',
              transition: 'background 0.12s, transform 0.1s',
              transform: selectedId === item?.id ? 'scale(1.05)' : 'scale(1)',
              padding: 0,
            }}
          >
            {item ? (
              <>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{item.iconTag ?? '📦'}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)' }}>
                  {CATEGORY_LABEL[item.category]}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#2a2a38' }}>—</span>
            )}
          </button>
        ))}
      </div>

      {/* [3] 詳細パネル */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        padding: '0.625rem 0.875rem',
        minHeight: 80,
        background: 'var(--color-bg-dark)',
      }}>
        {selected ? (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{selected.iconTag ?? '📦'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selected.name}
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  color: RARITY_BORDER[selected.rarity],
                  border: `1px solid ${RARITY_BORDER[selected.rarity]}`,
                  padding: '0 0.3rem', borderRadius: 4,
                }}>
                  {['', 'C', 'B', 'A', 'S', 'SS'][selected.rarity]}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-gold)', marginBottom: '0.2rem' }}>
                {selected.effect}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {selected.description}
              </div>
              {selected.price > 0 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  💰 {selected.price.toLocaleString()}G
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', textAlign: 'center', paddingTop: '1rem' }}>
            アイテムを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
