/**
 * AbilityBadgeLayout — アビリティA: パッシブバッジバー
 *
 * 習得済みの非戦闘アビリティをバッジ形式で一覧表示。
 * 常時発動型の能力を「装備中パッシブ」として可視化。
 * 用途: ステータス画面のアビリティ欄、フィールドHUD
 *
 * パーツ:
 *   [1] セクションヘッダー（ドメインラベル + 件数）
 *   [2] アビリティバッジ: アイコン + 名前 + カテゴリチップ
 *   [3] バッジホバー時のポップアップ詳細
 */
import React, { useState } from 'react';
import type { SkillEntry, SkillCategoryDef } from '@/core/types/item';

const CAT_COLORS: Record<string, string> = {
  探索: '#f97316', 社交: '#ec4899', 生活: '#84cc16',
};

interface Props {
  abilities: SkillEntry[];
  categories: SkillCategoryDef[];
  maxVisible?: number;
}

export function AbilityBadgeLayout({ abilities, categories, maxVisible = 8 }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const utilityAbilities = abilities.filter(a => a.domain === 'utility').slice(0, maxVisible);
  const hovered = utilityAbilities.find(a => a.id === hoverId) ?? null;

  const catColor = (cat: string) =>
    categories.find(c => c.id === cat)?.color ?? CAT_COLORS[cat] ?? '#6b7280';

  return (
    <div style={{
      background: 'var(--color-bg-medium)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
    }}>
      {/* [1] ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.875rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-light)',
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          🌿 非戦闘アビリティ
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.68rem', color: 'var(--color-text-secondary)',
        }}>
          {utilityAbilities.length} 件習得済み
        </span>
      </div>

      {/* [2] バッジグリッド */}
      <div style={{
        padding: '0.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        {utilityAbilities.map(ability => {
          const color = catColor(ability.category);
          const isHovered = hoverId === ability.id;
          return (
            <button
              key={ability.id}
              onMouseEnter={() => setHoverId(ability.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.35rem 0.625rem',
                background: isHovered ? `${color}22` : 'var(--color-bg-dark)',
                border: `1px solid ${isHovered ? color : 'var(--color-border)'}`,
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{ability.iconTag}</span>
              <span style={{
                fontSize: '0.78rem',
                color: isHovered ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: isHovered ? 600 : 400,
                whiteSpace: 'nowrap',
              }}>
                {ability.name}
              </span>
              <span style={{
                fontSize: '0.6rem', padding: '0.05rem 0.3rem',
                background: `${color}20`, color,
                borderRadius: 999,
                whiteSpace: 'nowrap',
              }}>
                {ability.category}
              </span>
            </button>
          );
        })}

        {utilityAbilities.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', padding: '0.5rem' }}>
            習得済みのアビリティはありません
          </div>
        )}
      </div>

      {/* [3] ホバー詳細 */}
      {hovered && (
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: '0.625rem 0.875rem',
          background: 'var(--color-bg-dark)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{hovered.iconTag}</span>
          <div>
            <div style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '0.2rem',
            }}>
              {hovered.name}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {hovered.description}
            </div>
            <div style={{ marginTop: '0.375rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {hovered.effects.map((e, i) => (
                <span key={i} style={{
                  fontSize: '0.68rem', color: catColor(hovered.category),
                  background: `${catColor(hovered.category)}15`,
                  padding: '0.1rem 0.4rem', borderRadius: 4,
                }}>
                  {e}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              習得条件: {hovered.learnCondition}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
