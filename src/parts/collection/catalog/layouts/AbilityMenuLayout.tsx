/**
 * AbilityMenuLayout — アビリティB: RPGメニュー選択リスト
 *
 * DQ・FFスタイルの縦型選択メニュー。
 * フィールドでのアビリティ使用選択に適した形式。
 * 用途: フィールドコマンドメニュー、NPC会話中の選択肢
 *
 * パーツ:
 *   [1] メニューリスト行: カーソル▶ + アイコン + 名前 + カテゴリ
 *   [2] 右: 選択中アビリティの詳細（効果 + 使用可能状況）
 *   [3] フッター: 使用ボタン / 戻るボタン
 */
import React, { useState, useEffect } from 'react';
import type { SkillEntry, SkillCategoryDef } from '@/core/types/item';

const CAT_COLORS: Record<string, string> = {
  探索: '#f97316', 社交: '#ec4899', 生活: '#84cc16',
};

interface Props {
  abilities: SkillEntry[];
  categories: SkillCategoryDef[];
  onUse?: (ability: SkillEntry) => void;
}

export function AbilityMenuLayout({ abilities, categories, onUse }: Props) {
  const utilityAbils = abilities.filter(a => a.domain === 'utility');
  const [cursor, setCursor] = useState(0);
  const [usedId, setUsedId] = useState<string | null>(null);

  const selected = utilityAbils[cursor] ?? null;

  const catColor = (cat: string) =>
    categories.find(c => c.id === cat)?.color ?? CAT_COLORS[cat] ?? '#6b7280';

  // キーボード操作
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(c => Math.max(0, c - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(c => Math.min(utilityAbils.length - 1, c + 1));
      } else if (e.key === 'Enter' && selected) {
        handleUse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cursor, selected, utilityAbils.length]);

  const handleUse = () => {
    if (!selected) return;
    setUsedId(selected.id);
    onUse?.(selected);
    setTimeout(() => setUsedId(null), 1500);
  };

  return (
    <div style={{
      display: 'flex',
      height: 300,
      background: 'var(--color-bg-medium)',
      border: '2px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
    }}>
      {/* [1] メニューリスト */}
      <div style={{
        width: '55%',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '0.4rem 0.75rem',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.72rem',
          color: 'var(--color-text-secondary)',
          background: 'var(--color-bg-light)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>アビリティ</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>
            ↑↓ 選択 · Enter 使用
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {utilityAbils.map((ability, idx) => {
            const isCursor = idx === cursor;
            const color = catColor(ability.category);
            return (
              <button
                key={ability.id}
                onClick={() => { setCursor(idx); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.45rem 0.75rem',
                  background: isCursor ? `${color}18` : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                  borderLeft: isCursor ? `3px solid ${color}` : '3px solid transparent',
                }}
              >
                {/* カーソル */}
                <span style={{
                  fontSize: '0.7rem',
                  color,
                  opacity: isCursor ? 1 : 0,
                  flexShrink: 0,
                  width: 12,
                }}>
                  ▶
                </span>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ability.iconTag}</span>
                <span style={{
                  flex: 1,
                  fontSize: '0.82rem',
                  color: isCursor ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontWeight: isCursor ? 600 : 400,
                }}>
                  {ability.name}
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '0.05rem 0.35rem',
                  border: `1px solid ${color}`,
                  borderRadius: 4,
                  color,
                  background: `${color}12`,
                  flexShrink: 0,
                }}>
                  {ability.category}
                </span>
              </button>
            );
          })}

          {utilityAbils.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              アビリティがありません
            </div>
          )}
        </div>
      </div>

      {/* 右パネル */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-dark)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* [2] 詳細 */}
        <div style={{ flex: 1, padding: '0.875rem', overflowY: 'auto' }}>
          {selected ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', lineHeight: 1, marginBottom: '0.375rem' }}>
                  {selected.iconTag}
                </span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selected.name}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '0.25rem',
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.5rem',
                  border: `1px solid ${catColor(selected.category)}`,
                  borderRadius: 999,
                  color: catColor(selected.category),
                }}>
                  {selected.category}
                </div>
              </div>

              <div style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.625rem' }}>
                {selected.description}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {selected.effects.map((e, i) => (
                  <div key={i} style={{
                    fontSize: '0.7rem',
                    color: catColor(selected.category),
                    padding: '0.2rem 0.5rem',
                    background: `${catColor(selected.category)}10`,
                    borderRadius: 6,
                    borderLeft: `2px solid ${catColor(selected.category)}`,
                  }}>
                    {e}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
              ← 選択してください
            </div>
          )}
        </div>

        {/* [3] フッターボタン */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--color-bg-medium)',
        }}>
          <button
            onClick={handleUse}
            disabled={!selected}
            style={{
              flex: 1,
              padding: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: selected
                ? (usedId === selected.id ? '#34d39922' : 'rgba(201,162,39,0.15)')
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected ? (usedId === selected.id ? '#34d399' : 'var(--color-primary)') : 'var(--color-border)'}`,
              borderRadius: 6,
              color: selected
                ? (usedId === selected.id ? '#34d399' : 'var(--color-primary)')
                : 'var(--color-text-muted)',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {usedId === selected?.id ? '✓ 使用した' : '使用する'}
          </button>
          <button
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
