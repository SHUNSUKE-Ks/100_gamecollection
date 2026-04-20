import React, { useMemo, useState } from 'react';
import type { CatalogTheme, CatalogLayout, Item, SkillEntry } from '@/core/types/item';
import type { CatalogFilter } from '@/parts/collection/catalog/CatalogSidebar';
import { CatalogSidebar } from '@/parts/collection/catalog/CatalogSidebar';
import { ThemeSwitcher } from '@/parts/collection/catalog/ThemeSwitcher';
import { ItemCard } from '@/parts/collection/catalog/ItemCard';
import { SkillCard } from '@/parts/collection/catalog/SkillCard';
import '@/styles/catalog/catalog.css';

// Library データをインポート
import itemsRaw  from '@/data/collection/items.json';
import skillsRaw from '@/data/collection/skills.json';

const itemsData  = itemsRaw  as typeof itemsRaw  & { items: Item[] };
const skillsData = skillsRaw as typeof skillsRaw & { skills: SkillEntry[] };

interface Props {
  onClose: () => void;
}

export function LibraryCatalogScreen({ onClose }: Props) {
  const [theme, setTheme]   = useState<CatalogTheme>('fantasy');
  const [layout, setLayout] = useState<CatalogLayout>('default');
  const [filter, setFilter] = useState<CatalogFilter>({ section: 'items', sub: 'all' });

  // ── 表示データの絞り込み ──
  const visibleItems = useMemo<Item[]>(() => {
    if (filter.section === 'items') {
      const base = itemsData.items.filter(i => i.category !== 'equipment');
      return filter.sub === 'all' ? base : base.filter(i => i.category === filter.sub);
    }
    if (filter.section === 'equipment') {
      const base = itemsData.items.filter(i => i.category === 'equipment');
      return filter.sub === 'all' ? base : base.filter(i => i.tags.includes(filter.sub));
    }
    return [];
  }, [filter]);

  const visibleSkills = useMemo<SkillEntry[]>(() => {
    if (filter.section !== 'skills') return [];
    const base = skillsData.skills;
    return filter.sub === 'all' ? base : base.filter(s => s.category === filter.sub);
  }, [filter]);

  // ── カウント計算（サイドバー用） ──
  const counts = useMemo(() => {
    const bySub: Record<string, number> = {};
    itemsData.items.filter(i => i.category !== 'equipment').forEach(i => {
      bySub[`item_${i.category}`] = (bySub[`item_${i.category}`] ?? 0) + 1;
    });
    itemsData.items.filter(i => i.category === 'equipment').forEach(i => {
      i.tags.forEach(t => {
        if (['WEAPON', 'ARMOR', 'ACCESSORY'].includes(t)) {
          bySub[`equip_${t}`] = (bySub[`equip_${t}`] ?? 0) + 1;
        }
      });
    });
    skillsData.skills.forEach(s => {
      bySub[`skill_${s.category}`] = (bySub[`skill_${s.category}`] ?? 0) + 1;
    });
    return {
      allItems: itemsData.items.filter(i => i.category !== 'equipment').length,
      allEquip: itemsData.items.filter(i => i.category === 'equipment').length,
      allSkills: skillsData.skills.length,
      bySub,
    };
  }, []);

  // ── カテゴリ・属性ルックアップ ──
  const categoryMap = useMemo(() =>
    Object.fromEntries(skillsData.categories.map(c => [c.id, c])), []);
  const elementMap = useMemo(() =>
    Object.fromEntries(skillsData.elements.map(e => [e.id, e])), []);

  const totalVisible = visibleItems.length + visibleSkills.length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column',
      background: '#0d0d12',
    }}>
      {/* ── グローバルヘッダー ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #3d3d4a',
        background: '#1a1a24',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f0e6d3', fontFamily: 'Noto Sans JP, sans-serif' }}>
          📚 Library Catalog
        </span>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          — アイテム・装備・スキル・アビリティ一覧
        </span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto', padding: '0.25rem 0.75rem',
            borderRadius: 6, border: '1px solid #3d3d4a',
            background: 'transparent', color: '#a89f8c',
            fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          ✕ 閉じる
        </button>
      </div>

      {/* ── テーマ適用コンテナ ── */}
      <div data-cat-theme={theme} className="cat-screen" style={{ flex: 1, overflow: 'hidden' }}>

        {/* サイドバー */}
        <CatalogSidebar
          filter={filter}
          onFilterChange={setFilter}
          itemsData={itemsData}
          skillsData={skillsData}
          counts={counts}
        />

        {/* メインエリア */}
        <div className="cat-main">

          {/* ツールバー */}
          <div className="cat-toolbar">
            <ThemeSwitcher
              theme={theme} onThemeChange={setTheme}
              layout={layout} onLayoutChange={setLayout}
            />
            <span className="cat-toolbar-count">
              {totalVisible} 件
            </span>
          </div>

          {/* カードグリッド */}
          <div className="cat-grid">
            {totalVisible === 0 && (
              <div className="cat-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                <div>このカテゴリのデータはありません</div>
              </div>
            )}

            {visibleItems.map(item => (
              <ItemCard key={item.id} item={item} layout={layout} />
            ))}

            {visibleSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                layout={layout}
                categoryDef={categoryMap[skill.category]}
                elementDef={elementMap[skill.element]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
