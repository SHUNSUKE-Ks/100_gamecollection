/**
 * SkillHotbarLayout — スキルA: アクションホットバー
 *
 * アクションゲーム・ARPGスタイルのスキルスロット。
 * ドラッグ想定のスロットにスキルをセットして使用順を管理。
 * 用途: バトル画面下部のスキルパレット
 *
 * パーツ:
 *   [1] ホットバースロット（4枠）: アイコン + 名前 + MPコスト
 *   [2] スキル選択パネル（スロットクリックで展開）
 *   [3] 選択中スキルの詳細ツールチップ風パネル
 */
import React, { useState } from 'react';
import type { SkillEntry } from '@/core/types/item';

const CATEGORY_COLORS: Record<string, string> = {
  '攻撃': '#ef4444', '回復': '#34d399', 'バフ': '#60a5fa',
  'デバフ': '#a78bfa', 'パッシブ': '#fbbf24',
};

interface Props {
  skills: SkillEntry[];
  slotCount?: number;
}

export function SkillHotbarLayout({ skills, slotCount = 4 }: Props) {
  const [slots, setSlots]         = useState<(SkillEntry | null)[]>(
    Array.from({ length: slotCount }, (_, i) => skills[i] ?? null)
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<SkillEntry | null>(null);

  const combatSkills = skills.filter(s => s.domain === 'combat');

  const assignSkill = (skill: SkillEntry) => {
    if (activeSlot === null) return;
    const next = [...slots];
    next[activeSlot] = skill;
    setSlots(next);
    setActiveSlot(null);
  };

  return (
    <div style={{ fontFamily: 'var(--font-primary)', userSelect: 'none' }}>

      {/* [1] ホットバー */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        marginBottom: '0.5rem',
        justifyContent: 'center',
      }}>
        {slots.map((skill, idx) => {
          const isActive = activeSlot === idx;
          const catColor = skill ? (CATEGORY_COLORS[skill.category] ?? 'var(--color-primary)') : '#3d3d4a';
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => setActiveSlot(isActive ? null : idx)}
                onMouseEnter={() => skill && setHoveredSkill(skill)}
                onMouseLeave={() => setHoveredSkill(null)}
                style={{
                  width: 60, height: 60,
                  border: `2px solid ${isActive ? 'var(--color-primary)' : catColor}`,
                  borderRadius: 10,
                  background: skill
                    ? `${catColor}22`
                    : isActive ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.125rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  position: 'relative',
                  padding: 0,
                }}
              >
                {skill ? (
                  <>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{skill.iconTag}</span>
                    {skill.cost_mp > 0 && (
                      <span style={{
                        position: 'absolute', bottom: 2, right: 4,
                        fontSize: '0.55rem', color: '#60a5fa', fontWeight: 700,
                      }}>
                        {skill.cost_mp}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: '1.2rem', opacity: 0.2 }}>＋</span>
                )}
              </button>
              <span style={{
                fontSize: '0.6rem',
                color: skill ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                maxWidth: 60, textAlign: 'center', lineHeight: 1.2,
              }}>
                {skill ? skill.name : `スロット${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* [3] ホバー詳細 */}
      {hoveredSkill && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--color-bg-medium)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          marginBottom: '0.5rem',
          fontSize: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.1rem' }}>{hoveredSkill.iconTag}</span>
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{hoveredSkill.name}</span>
            <span style={{
              marginLeft: 'auto', fontSize: '0.65rem',
              color: CATEGORY_COLORS[hoveredSkill.category],
              border: `1px solid ${CATEGORY_COLORS[hoveredSkill.category]}`,
              padding: '0 0.3rem', borderRadius: 4,
            }}>
              {hoveredSkill.category}
            </span>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {hoveredSkill.description}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            {hoveredSkill.cost_mp > 0 && (
              <span style={{ color: '#4a90c4' }}>MP {hoveredSkill.cost_mp}</span>
            )}
            {hoveredSkill.power_base > 0 && (
              <span style={{ color: 'var(--color-text-gold)' }}>威力 {hoveredSkill.power_base}</span>
            )}
          </div>
        </div>
      )}

      {/* [2] スキル選択パネル */}
      {activeSlot !== null && (
        <div style={{
          border: '1px solid var(--color-primary)',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--color-bg-dark)',
        }}>
          <div style={{
            padding: '0.4rem 0.75rem',
            borderBottom: '1px solid var(--color-border)',
            fontSize: '0.72rem', color: 'var(--color-text-secondary)',
            background: 'var(--color-bg-light)',
          }}>
            スロット {activeSlot + 1} に設定するスキルを選択
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 0 }}>
            {combatSkills.map(skill => (
              <button
                key={skill.id}
                onClick={() => assignSkill(skill)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.625rem',
                  background: slots[activeSlot]?.id === skill.id ? 'rgba(201,162,39,0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{skill.iconTag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                    {skill.cost_mp > 0 ? `MP ${skill.cost_mp}` : 'ノーコスト'}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6rem', color: CATEGORY_COLORS[skill.category],
                  border: `1px solid ${CATEGORY_COLORS[skill.category]}`,
                  padding: '0 0.2rem', borderRadius: 3, flexShrink: 0,
                }}>
                  {skill.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
