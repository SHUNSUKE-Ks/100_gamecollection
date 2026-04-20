import React from 'react';
import type { SkillEntry, SkillCategoryDef, SkillElementDef, CatalogLayout } from '@/core/types/item';

const DOMAIN_LABELS: Record<string, string> = {
  combat:  '戦闘',
  utility: '非戦闘',
};

const SCALE_LABELS: Record<string, string> = {
  str: 'STR',
  int: 'INT',
  dex: 'DEX',
};

const TARGET_LABELS: Record<string, string> = {
  enemy:       '敵単体',
  all_enemies: '敵全体',
  ally:        '味方単体',
  all_allies:  '味方全体',
  self:        '自分',
};

interface Props {
  skill: SkillEntry;
  categoryDef?: SkillCategoryDef;
  elementDef?: SkillElementDef;
  layout?: CatalogLayout;
  onClick?: (skill: SkillEntry) => void;
}

/**
 * SkillCard — スキル・アビリティの表示カード
 *
 * パーツ番号:
 *   [1] ヘッダー: ドメインバッジ(戦闘/非戦闘) + カテゴリチップ
 *   [2] アイコン + スキル名
 *   [3] 属性チップ + ターゲット
 *   [4] コスト行 (MP / クールダウン) — utility は省略
 *   [5] 威力行 (base / scale) — power_base > 0 の時のみ
 *   [6] エフェクト一覧
 *   [7] 説明文 (layout=detailed 時のみ)
 *   [8] フッター: タグ + 習得条件
 */
export function SkillCard({ skill, categoryDef, elementDef, layout = 'default', onClick }: Props) {
  const isCompact = layout === 'compact';
  const accentColor = categoryDef?.color ?? 'var(--cat-accent)';
  const domainClass = skill.domain === 'combat' ? 'cat-domain-combat' : 'cat-domain-utility';

  return (
    <div
      className={`cat-card${isCompact ? ' compact' : ''}`}
      style={{ borderLeftColor: accentColor, cursor: onClick ? 'pointer' : 'default' }}
      onClick={() => onClick?.(skill)}
    >
      {/* [1] ヘッダー: ドメイン + カテゴリ */}
      <div className="cat-card-header">
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          <span className={`cat-chip ${domainClass}`}>
            {DOMAIN_LABELS[skill.domain] ?? skill.domain}
          </span>
          <span
            className="cat-chip"
            style={{ color: accentColor, borderColor: `${accentColor}55`, background: `${accentColor}15` }}
          >
            {skill.category}
          </span>
        </div>
      </div>

      {/* [2] アイコン + 名前 */}
      <div className="cat-card-name-row">
        <span className="cat-item-icon" role="img" aria-label={skill.name}>
          {skill.iconTag}
        </span>
        <span className="cat-card-name">{skill.name}</span>
      </div>

      {/* [3] 属性 + ターゲット */}
      {!isCompact && (
        <div className="cat-skill-meta">
          {skill.element !== '無' && (
            <span
              className="cat-chip"
              style={{
                color: elementDef?.color ?? '#9ca3af',
                borderColor: `${elementDef?.color ?? '#9ca3af'}44`,
                background: `${elementDef?.color ?? '#9ca3af'}14`,
              }}
            >
              {skill.element}
            </span>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-sub)' }}>
            → {TARGET_LABELS[skill.target] ?? skill.target}
          </span>
        </div>
      )}

      {/* [4] コスト (戦闘スキルのみ) */}
      {!isCompact && skill.domain === 'combat' && (skill.cost_mp > 0 || skill.cost_cooldown > 0) && (
        <div className="cat-cost-row">
          {skill.cost_mp > 0 && (
            <span className="cat-cost-item">
              <span style={{ color: '#4a90c4' }}>MP</span>
              <span>{skill.cost_mp}</span>
            </span>
          )}
          {skill.cost_cooldown > 0 && (
            <span className="cat-cost-item">
              <span>⏳</span>
              <span>{skill.cost_cooldown}T</span>
            </span>
          )}
        </div>
      )}

      {/* [5] 威力 */}
      {!isCompact && skill.power_base > 0 && (
        <div style={{ fontSize: '0.73rem', color: 'var(--cat-text-sub)' }}>
          威力: <span style={{ color: 'var(--cat-text)', fontWeight: 600 }}>{skill.power_base}</span>
          <span style={{ opacity: 0.6 }}> ({SCALE_LABELS[skill.power_scale] ?? skill.power_scale})</span>
        </div>
      )}

      {/* [6] エフェクト */}
      {skill.effects.length > 0 && !isCompact && (
        <ul className="cat-effects-list">
          {skill.effects.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {/* [7] 説明文 */}
      {layout === 'detailed' && (
        <div className="cat-description">{skill.description}</div>
      )}

      {/* [8] フッター */}
      <div className="cat-card-footer">
        <div className="cat-tags">
          {skill.tags.filter(t => !t.includes('ENEMY') && !t.includes('UTILITY')).map(t => (
            <span key={t} className="cat-tag">{t}</span>
          ))}
        </div>
        {!isCompact && (
          <span className="cat-price" style={{ fontSize: '0.65rem' }}>
            {skill.learnCondition}
          </span>
        )}
      </div>
    </div>
  );
}
