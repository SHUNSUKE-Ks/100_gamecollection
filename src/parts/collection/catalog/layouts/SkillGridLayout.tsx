/**
 * SkillGridLayout — スキルB: カテゴリフィルター付きグリッド
 *
 * FFXスフィア盤・ペルソナ系スキル一覧に近い選択画面。
 * カテゴリで絞り込み、選択スキルの詳細を右パネルに表示。
 * 用途: スキル習得画面・スキル図鑑
 *
 * パーツ:
 *   [1] カテゴリフィルターバー（タブ）
 *   [2] スキルカードグリッド（アイコン + 名前 + コスト）
 *   [3] 右: 詳細パネル（選択時）
 */
import React, { useState } from 'react';
import type { SkillEntry, SkillCategoryDef } from '@/core/types/item';

const ELEMENT_COLORS: Record<string, string> = {
  '物理': '#f87171', '火': '#fb923c', '水': '#60a5fa',
  '風': '#34d399', '毒': '#a78bfa', '無': '#6b7280',
};
const TARGET_LABEL: Record<string, string> = {
  enemy: '敵単体', all_enemies: '敵全体', ally: '味方単体',
  all_allies: '味方全体', self: '自分',
};

interface Props {
  skills: SkillEntry[];
  categories: SkillCategoryDef[];
}

export function SkillGridLayout({ skills, categories }: Props) {
  const combatCats = categories.filter(c => c.domain === 'combat');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selected, setSelected]   = useState<SkillEntry | null>(skills[0] ?? null);

  const visible = catFilter === 'all'
    ? skills.filter(s => s.domain === 'combat')
    : skills.filter(s => s.category === catFilter && s.domain === 'combat');

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
      {/* 左: フィルター + グリッド */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* [1] カテゴリフィルターバー */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-light)',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setCatFilter('all')}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              fontWeight: catFilter === 'all' ? 700 : 400,
              color: catFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: 'transparent', border: 'none',
              borderBottom: catFilter === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            全て ({skills.filter(s => s.domain === 'combat').length})
          </button>
          {combatCats.map(c => {
            const count = skills.filter(s => s.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  fontWeight: catFilter === c.id ? 700 : 400,
                  color: catFilter === c.id ? c.color : 'var(--color-text-secondary)',
                  background: 'transparent', border: 'none',
                  borderBottom: catFilter === c.id ? `2px solid ${c.color}` : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {c.id} ({count})
              </button>
            );
          })}
        </div>

        {/* [2] スキルグリッド */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '0.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '0.375rem',
          alignContent: 'start',
        }}>
          {visible.map(skill => {
            const catColor = categories.find(c => c.id === skill.category)?.color ?? '#6b7280';
            const isSel = selected?.id === skill.id;
            return (
              <button
                key={skill.id}
                onClick={() => setSelected(skill)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '0.25rem', padding: '0.5rem 0.375rem',
                  background: isSel ? `${catColor}20` : 'var(--color-bg-dark)',
                  border: `1px solid ${isSel ? catColor : 'var(--color-border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
              >
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{skill.iconTag}</span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: isSel ? 700 : 400,
                  color: isSel ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  textAlign: 'center', lineHeight: 1.3,
                }}>
                  {skill.name}
                </span>
                {skill.cost_mp > 0 && (
                  <span style={{ fontSize: '0.6rem', color: '#4a90c4' }}>MP {skill.cost_mp}</span>
                )}
              </button>
            );
          })}
          {visible.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
              スキルなし
            </div>
          )}
        </div>
      </div>

      {/* 右: [3] 詳細パネル */}
      <div style={{
        width: 180,
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-bg-dark)',
        padding: '0.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        {selected ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', lineHeight: 1, marginBottom: '0.25rem' }}>
                {selected.iconTag}
              </span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {selected.name}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
              {[selected.category, selected.element !== '無' ? selected.element : null]
                .filter(Boolean).map((label) => {
                const color = categories.find(c => c.id === label)?.color
                  ?? ELEMENT_COLORS[label!] ?? '#6b7280';
                return (
                  <span key={label} style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.4rem',
                    border: `1px solid ${color}`, borderRadius: 4,
                    color, background: `${color}15`,
                  }}>
                    {label}
                  </span>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
              {selected.cost_mp > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#4a90c4' }}>■ MP </span>{selected.cost_mp}
                </div>
              )}
              {selected.power_base > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--color-text-gold)' }}>■ 威力 </span>
                  {selected.power_base}
                </div>
              )}
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>対象 </span>
                {TARGET_LABEL[selected.target] ?? selected.target}
              </div>
            </div>

            <div style={{
              fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.6,
              borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem',
            }}>
              {selected.description}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
              {selected.effects.map((e, i) => (
                <div key={i} style={{ fontSize: '0.7rem', color: 'var(--color-text-gold)', marginBottom: '0.15rem' }}>
                  ・{e}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
              {selected.learnCondition}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: 'auto', textAlign: 'center' }}>
            スキルを選択
          </div>
        )}
      </div>
    </div>
  );
}
