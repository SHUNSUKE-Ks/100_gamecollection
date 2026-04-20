/**
 * ItemListLayout — アイテムB: スクロールリスト + 詳細パネル
 *
 * 左列にアイテム一覧、右列に詳細説明。
 * RPGメニュー画面（DQ・ペルソナ系）スタイル。
 *
 * パーツ:
 *   [1] 左: カテゴリフィルタータブ
 *   [2] 左: アイテムリスト行（アイコン + 名前 + レアリティ + 価格）
 *   [3] 右: 詳細パネル（大アイコン + 全フィールド + タグ）
 */
import React, { useState } from 'react';
import type { Item, ItemCategoryId } from '@/core/types/item';

const RARITY_COLOR: Record<number, string> = {
  1: '#9ca3af', 2: '#34d399', 3: '#60a5fa', 4: '#a78bfa', 5: '#f97316',
};

const TABS: { id: ItemCategoryId | 'all'; label: string }[] = [
  { id: 'all',        label: '全て' },
  { id: 'consumable', label: '消費' },
  { id: 'key',        label: '貴重品' },
];

interface Props {
  items: Item[];
}

export function ItemListLayout({ items }: Props) {
  const [tab, setTab]         = useState<ItemCategoryId | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);

  const filtered = tab === 'all' ? items : items.filter(i => i.category === tab);
  const selected = items.find(i => i.id === selectedId) ?? null;

  return (
    <div style={{
      display: 'flex',
      height: 340,
      background: 'var(--color-bg-medium)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
    }}>
      {/* 左ペイン */}
      <div style={{
        width: '55%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--color-border)',
      }}>
        {/* [1] フィルタータブ */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-light)',
          flexShrink: 0,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '0.4rem 0',
                fontSize: '0.72rem',
                fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.12s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* [2] アイテムリスト */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
              該当なし
            </div>
          )}
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.45rem 0.75rem',
                background: selectedId === item.id ? 'rgba(201,162,39,0.12)' : 'transparent',
                border: 'none',
                borderLeft: selectedId === item.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.iconTag ?? '📦'}</span>
              <span style={{
                flex: 1, fontSize: '0.82rem',
                color: selectedId === item.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: selectedId === item.id ? 600 : 400,
              }}>
                {item.name}
              </span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: RARITY_COLOR[item.rarity],
              }}>
                {['', 'C', 'B', 'A', 'S', 'SS'][item.rarity]}
              </span>
              {item.price > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', width: 48, textAlign: 'right' }}>
                  {item.price}G
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 右ペイン: [3] 詳細 */}
      <div style={{
        flex: 1,
        padding: '1rem',
        background: 'var(--color-bg-dark)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflowY: 'auto',
      }}>
        {selected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{selected.iconTag ?? '📦'}</span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selected.name}
                </div>
                <div style={{
                  fontSize: '0.68rem', color: RARITY_COLOR[selected.rarity], fontWeight: 700,
                  marginTop: '0.125rem',
                }}>
                  {'★'.repeat(selected.rarity)}{'☆'.repeat(5 - selected.rarity)}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-gold)',
              padding: '0.375rem 0.5rem',
              background: 'rgba(201,162,39,0.08)',
              borderRadius: 6,
              borderLeft: '2px solid var(--color-primary)',
            }}>
              {selected.effect}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {selected.description}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 'auto' }}>
              {selected.tags.map(t => (
                <span key={t} style={{
                  fontSize: '0.62rem', padding: '0.1rem 0.4rem',
                  background: 'rgba(255,255,255,0.07)',
                  color: 'var(--color-text-muted)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: 'auto' }}>
            ← アイテムを選択
          </div>
        )}
      </div>
    </div>
  );
}
