import React from 'react';
import type { ItemDB, SkillDB } from '@/core/types/item';

export type SectionId = 'items' | 'equipment' | 'skills';

export interface CatalogFilter {
  section: SectionId;
  sub: string; // 'all' | category id | equip tag
}

interface Props {
  filter: CatalogFilter;
  onFilterChange: (f: CatalogFilter) => void;
  itemsData: ItemDB;
  skillsData: SkillDB;
  counts: {
    allItems: number;
    allEquip: number;
    allSkills: number;
    bySub: Record<string, number>;
  };
}

export function CatalogSidebar({ filter, onFilterChange, itemsData, skillsData, counts }: Props) {
  const set = (section: SectionId, sub = 'all') =>
    onFilterChange({ section, sub });

  const isActive = (section: SectionId, sub = 'all') =>
    filter.section === section && filter.sub === sub;

  return (
    <nav className="cat-sidebar">

      {/* ── アイテム ── */}
      <div className="cat-nav-section">
        <div className="cat-nav-section-title">🧪 アイテム</div>

        <button
          className={`cat-nav-item${isActive('items') ? ' active' : ''}`}
          onClick={() => set('items')}
        >
          全て
          <span className="cat-nav-count">{counts.allItems}</span>
        </button>

        {itemsData.categories
          .filter(c => c.id !== 'equipment')
          .map(c => (
            <button
              key={c.id}
              className={`cat-nav-item${isActive('items', c.id) ? ' active' : ''}`}
              onClick={() => set('items', c.id)}
            >
              {c.icon ?? ''} {c.label}
              <span className="cat-nav-count">{counts.bySub[`item_${c.id}`] ?? 0}</span>
            </button>
          ))}
      </div>

      <div className="cat-nav-sep" />

      {/* ── 装備品 ── */}
      <div className="cat-nav-section">
        <div className="cat-nav-section-title">⚔️ 装備品</div>

        <button
          className={`cat-nav-item${isActive('equipment') ? ' active' : ''}`}
          onClick={() => set('equipment')}
        >
          全て
          <span className="cat-nav-count">{counts.allEquip}</span>
        </button>

        {[
          { id: 'WEAPON', label: '武器', icon: '🗡️' },
          { id: 'ARMOR',  label: '防具', icon: '🛡️' },
          { id: 'ACCESSORY', label: '装飾品', icon: '💍' },
        ].map(slot => (
          <button
            key={slot.id}
            className={`cat-nav-item${isActive('equipment', slot.id) ? ' active' : ''}`}
            onClick={() => set('equipment', slot.id)}
          >
            {slot.icon} {slot.label}
            <span className="cat-nav-count">{counts.bySub[`equip_${slot.id}`] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="cat-nav-sep" />

      {/* ── スキル / アビリティ ── */}
      <div className="cat-nav-section">
        <div className="cat-nav-section-title">✨ スキル / 能力</div>

        <button
          className={`cat-nav-item${isActive('skills') ? ' active' : ''}`}
          onClick={() => set('skills')}
        >
          全て
          <span className="cat-nav-count">{counts.allSkills}</span>
        </button>

        {/* 戦闘スキル */}
        <div className="cat-nav-sub-label">⚔️ 戦闘</div>
        {skillsData.categories
          .filter(c => c.domain === 'combat')
          .map(c => (
            <button
              key={c.id}
              className={`cat-nav-item${isActive('skills', c.id) ? ' active' : ''}`}
              onClick={() => set('skills', c.id)}
              style={{ paddingLeft: '1.5rem' }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: c.color, flexShrink: 0, display: 'inline-block',
                }}
              />
              {c.id}
              <span className="cat-nav-count">{counts.bySub[`skill_${c.id}`] ?? 0}</span>
            </button>
          ))}

        {/* 非戦闘アビリティ */}
        <div className="cat-nav-sub-label">🌿 非戦闘</div>
        {skillsData.categories
          .filter(c => c.domain === 'utility')
          .map(c => (
            <button
              key={c.id}
              className={`cat-nav-item${isActive('skills', c.id) ? ' active' : ''}`}
              onClick={() => set('skills', c.id)}
              style={{ paddingLeft: '1.5rem' }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: c.color, flexShrink: 0, display: 'inline-block',
                }}
              />
              {c.id}
              <span className="cat-nav-count">{counts.bySub[`skill_${c.id}`] ?? 0}</span>
            </button>
          ))}
      </div>
    </nav>
  );
}
