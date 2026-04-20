import React from 'react';
import type { CatalogTheme, CatalogLayout } from '@/core/types/item';

const THEMES: { id: CatalogTheme; label: string; color: string }[] = [
  { id: 'fantasy', label: 'Fantasy',  color: '#c9a227' },
  { id: 'scifi',   label: 'Sci-Fi',   color: '#00d4ff' },
  { id: 'minimal', label: 'Minimal',  color: '#2563eb' },
];

const LAYOUTS: { id: CatalogLayout; label: string }[] = [
  { id: 'compact',  label: 'S' },
  { id: 'default',  label: 'M' },
  { id: 'detailed', label: 'L' },
];

interface Props {
  theme: CatalogTheme;
  onThemeChange: (t: CatalogTheme) => void;
  layout: CatalogLayout;
  onLayoutChange: (l: CatalogLayout) => void;
}

export function ThemeSwitcher({ theme, onThemeChange, layout, onLayoutChange }: Props) {
  return (
    <>
      {/* テーマ丸ボタン */}
      <div className="cat-theme-switcher">
        <span className="cat-toolbar-label">テーマ:</span>
        {THEMES.map(t => (
          <button
            key={t.id}
            className={`cat-theme-btn${theme === t.id ? ' active' : ''}`}
            style={{ background: t.color }}
            title={t.label}
            onClick={() => onThemeChange(t.id)}
            aria-label={`テーマ: ${t.label}`}
          />
        ))}
      </div>

      {/* レイアウト切替 */}
      <div className="cat-layout-switcher">
        <span className="cat-toolbar-label">表示:</span>
        {LAYOUTS.map(l => (
          <button
            key={l.id}
            className={`cat-layout-btn${layout === l.id ? ' active' : ''}`}
            title={{ compact: 'コンパクト', default: '標準', detailed: '詳細' }[l.id]}
            onClick={() => onLayoutChange(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </>
  );
}
