/**
 * CollectionSamplesScreen — レイアウトサンプル一覧
 *
 * Library データを参照し、8種のゲームUIレイアウトを一覧表示。
 * 各レイアウトは本番で使用可能な状態の独立Componentです。
 */
import React, { useState } from 'react';
import { ItemGridLayout }     from '@/parts/collection/catalog/layouts/ItemGridLayout';
import { ItemListLayout }     from '@/parts/collection/catalog/layouts/ItemListLayout';
import { EquipSlotLayout }    from '@/parts/collection/catalog/layouts/EquipSlotLayout';
import { EquipCompareLayout } from '@/parts/collection/catalog/layouts/EquipCompareLayout';
import { SkillHotbarLayout }  from '@/parts/collection/catalog/layouts/SkillHotbarLayout';
import { SkillGridLayout }    from '@/parts/collection/catalog/layouts/SkillGridLayout';
import { AbilityBadgeLayout } from '@/parts/collection/catalog/layouts/AbilityBadgeLayout';
import { AbilityMenuLayout }  from '@/parts/collection/catalog/layouts/AbilityMenuLayout';
import type { Item, SkillEntry } from '@/core/types/item';

import itemsRaw  from '@/data/collection/items.json';
import skillsRaw from '@/data/collection/skills.json';

// Library データ取得
const allItems   = (itemsRaw.items as Item[]);
const allSkills  = (skillsRaw.skills as SkillEntry[]);
const equipItems = allItems.filter(i => i.category === 'equipment');
const nonEquips  = allItems.filter(i => i.category !== 'equipment');

// サイドバーメニュー定義
type SectionId = 'items' | 'equipment' | 'skills' | 'abilities';
const SECTIONS: { id: SectionId; label: string; icon: string; desc: string }[] = [
  { id: 'items',     label: 'アイテム',  icon: '🧪', desc: 'グリッド / リスト+詳細' },
  { id: 'equipment', label: '装備品',    icon: '⚔️', desc: 'スロット / 比較パネル' },
  { id: 'skills',    label: 'スキル',    icon: '✨', desc: 'ホットバー / グリッド選択' },
  { id: 'abilities', label: 'アビリティ', icon: '🌿', desc: 'バッジ / メニューリスト' },
];

interface Props {
  onClose: () => void;
}

export function CollectionSamplesScreen({ onClose }: Props) {
  const [section, setSection] = useState<SectionId>('items');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 301,
      display: 'flex', flexDirection: 'column',
      background: 'var(--color-bg-dark)',
      fontFamily: 'var(--font-primary)',
      color: 'var(--color-text-primary)',
    }}>
      {/* ── ヘッダー ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-medium)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          🎮 Collection レイアウトサンプル
        </span>
        <span style={{ fontSize: '0.73rem', color: '#6b7280' }}>
          — Libraryデータ参照 · 本番使用可能な2種×4カテゴリ
        </span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto', padding: '0.25rem 0.75rem',
            borderRadius: 6, border: '1px solid var(--color-border)',
            background: 'transparent', color: 'var(--color-text-secondary)',
            fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          ✕ 閉じる
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── サイドバー ── */}
        <nav style={{
          width: 180, flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          padding: '0.75rem 0',
          background: 'var(--color-bg-medium)',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          <div style={{ padding: '0.25rem 0.875rem 0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>
            カテゴリ
          </div>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.1rem',
                padding: '0.45rem 0.875rem',
                background: section === s.id ? 'rgba(201,162,39,0.1)' : 'transparent',
                border: 'none',
                borderLeft: section === s.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span style={{
                fontSize: '0.82rem',
                color: section === s.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: section === s.id ? 700 : 400,
              }}>
                {s.icon} {s.label}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.3 }}>
                {s.desc}
              </span>
            </button>
          ))}

          <div style={{ marginTop: 'auto', padding: '0.75rem 0.875rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.5 }}>
              各Componentは<br />
              <code style={{ color: 'var(--color-text-secondary)' }}>parts/collection/<br />catalog/layouts/</code><br />
              に格納
            </div>
          </div>
        </nav>

        {/* ── メインコンテンツ ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

          {section === 'items' && (
            <SectionWrapper
              title="🧪 アイテム"
              layouts={[
                {
                  id: 'A',
                  name: 'グリッドレイアウト',
                  file: 'ItemGridLayout.tsx',
                  desc: 'インベントリグリッド。アイコン中心、選択で詳細展開。FF・Zelda系向け。',
                  points: ['[1] ヘッダー: タイトル + 所持数/上限', '[2] グリッドセル: レアリティ縁取り', '[3] 下部詳細パネル（選択時展開）'],
                  node: <ItemGridLayout items={nonEquips} />,
                },
                {
                  id: 'B',
                  name: 'リスト + 詳細パネル',
                  file: 'ItemListLayout.tsx',
                  desc: 'カテゴリフィルター付きスクロールリスト。DQ・ペルソナ系向け。',
                  points: ['[1] カテゴリフィルタータブ', '[2] アイテム行: アイコン/名前/レアリティ/価格', '[3] 右: 詳細パネル（効果 + 説明）'],
                  node: <ItemListLayout items={nonEquips} />,
                },
              ]}
            />
          )}

          {section === 'equipment' && (
            <SectionWrapper
              title="⚔️ 装備品"
              layouts={[
                {
                  id: 'A',
                  name: 'スロット装備画面',
                  file: 'EquipSlotLayout.tsx',
                  desc: '3スロット（武器/防具/装飾）。クリックで候補一覧展開・1クリック装備。',
                  points: ['[1] キャラクターヘッダー + 装備数', '[2] 各スロット行: アイコン/名前/効果/外すボタン', '[3] 候補リスト展開（▼ クリック）'],
                  node: <EquipSlotLayout equipItems={equipItems} />,
                },
                {
                  id: 'B',
                  name: '比較パネル',
                  file: 'EquipCompareLayout.tsx',
                  desc: '現在 vs 候補を左右並列。ステータス差分（▲▼）をリアルタイム計算。',
                  points: ['[1] スロット選択タブ（武器/防具/装飾）', '[2] 左: 現在装備', '[3] 中央: ステータス差分', '[4] 右: 候補（下部で切替可）'],
                  node: <EquipCompareLayout equipItems={equipItems} />,
                },
              ]}
            />
          )}

          {section === 'skills' && (
            <SectionWrapper
              title="✨ スキル（戦闘）"
              layouts={[
                {
                  id: 'A',
                  name: 'ホットバー',
                  file: 'SkillHotbarLayout.tsx',
                  desc: 'アクション系バトル画面下部のスキルパレット。スロットクリックで割り当て変更。',
                  points: ['[1] スロット（4枠）: アイコン + MPコスト', '[2] スキル選択パネル（スロット選択時展開）', '[3] ホバー詳細ツールチップ'],
                  node: <SkillHotbarLayout skills={allSkills} />,
                },
                {
                  id: 'B',
                  name: 'グリッド + 詳細パネル',
                  file: 'SkillGridLayout.tsx',
                  desc: 'カテゴリフィルター付きスキル一覧。FF・ペルソナ系スキル習得/選択画面向け。',
                  points: ['[1] カテゴリフィルターバー', '[2] スキルカードグリッド', '[3] 右: 詳細（属性/コスト/威力/説明）'],
                  node: <SkillGridLayout skills={allSkills.filter(s => s.domain === 'combat')} categories={skillsRaw.categories as any} />,
                },
              ]}
            />
          )}

          {section === 'abilities' && (
            <SectionWrapper
              title="🌿 アビリティ（非戦闘）"
              layouts={[
                {
                  id: 'A',
                  name: 'バッジバー',
                  file: 'AbilityBadgeLayout.tsx',
                  desc: '習得済みアビリティをバッジで可視化。ホバーで詳細展開。ステータス画面向け。',
                  points: ['[1] セクションヘッダー + 件数', '[2] バッジ: アイコン + 名前 + カテゴリ', '[3] ホバーポップアップ詳細'],
                  node: <AbilityBadgeLayout abilities={allSkills} categories={skillsRaw.categories as any} />,
                },
                {
                  id: 'B',
                  name: 'RPGメニューリスト',
                  file: 'AbilityMenuLayout.tsx',
                  desc: 'DQスタイルの縦型選択メニュー。↑↓キー + Enter対応。フィールドコマンド向け。',
                  points: ['[1] カーソル ▶ 付き選択行', '[2] 右: 詳細（説明/効果）', '[3] フッター: 使用する/戻るボタン'],
                  node: <AbilityMenuLayout abilities={allSkills} categories={skillsRaw.categories as any} />,
                },
              ]}
            />
          )}

        </div>
      </div>
    </div>
  );
}

// ── レイアウトセクションラッパー ──
interface LayoutDef {
  id: string;
  name: string;
  file: string;
  desc: string;
  points: string[];
  node: React.ReactNode;
}

function SectionWrapper({ title, layouts }: { title: string; layouts: LayoutDef[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
        {title}
      </h2>
      {layouts.map(layout => (
        <div key={layout.id}>
          {/* ラベル */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: '0.625rem',
            marginBottom: '0.625rem',
          }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              background: 'rgba(201,162,39,0.15)',
              color: 'var(--color-primary)',
              padding: '0.1rem 0.5rem', borderRadius: 4,
            }}>
              Layout {layout.id}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {layout.name}
            </span>
            <code style={{ fontSize: '0.65rem', color: '#6b7280' }}>{layout.file}</code>
          </div>

          {/* 説明 + パーツ番号 */}
          <div style={{
            display: 'flex', gap: '1.25rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flex: '1 1 200px' }}>
              {layout.desc}
            </div>
            <div style={{ flex: '1 1 200px' }}>
              {layout.points.map((p, i) => (
                <div key={i} style={{
                  fontSize: '0.72rem', color: 'var(--color-text-muted)',
                  marginBottom: '0.15rem',
                }}>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* コンポーネント */}
          <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--color-bg-dark)',
          }}>
            {layout.node}
          </div>
        </div>
      ))}
    </div>
  );
}
