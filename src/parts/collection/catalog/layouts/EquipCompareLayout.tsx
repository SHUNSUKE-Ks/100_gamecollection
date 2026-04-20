/**
 * EquipCompareLayout — 装備B: 装備比較パネル
 *
 * 現在の装備と候補アイテムを左右並列表示し、数値差分をハイライト。
 * 用途: アイテム取得時・ショップ購入前の確認画面
 *
 * パーツ:
 *   [1] スロット選択タブ（武器/防具/装飾品）
 *   [2] 左カラム: 現在装備中
 *   [3] 中央: ステータス差分表示
 *   [4] 右カラム: 比較候補（クリックで切替）
 */
import React, { useState } from 'react';
import type { Item, EquipSlot } from '@/core/types/item';

const SLOT_TABS: { id: EquipSlot; label: string }[] = [
  { id: 'weapon', label: '⚔️ 武器' },
  { id: 'armor',  label: '🛡️ 防具' },
  { id: 'accessory', label: '💍 装飾' },
];

const TAG_BY_SLOT: Record<EquipSlot, string> = {
  weapon: 'WEAPON', armor: 'ARMOR', accessory: 'ACCESSORY',
};

const RARITY_COLOR: Record<number, string> = {
  1: '#9ca3af', 2: '#34d399', 3: '#60a5fa', 4: '#a78bfa', 5: '#f97316',
};

// 簡易ステータス抽出（effect 文字列から数値を抽出）
function parseStats(effect: string): Record<string, number> {
  const result: Record<string, number> = {};
  const matches = effect.matchAll(/([A-Z]+)[+\-](\d+)/g);
  for (const m of matches) {
    result[m[1]] = parseInt(m[2], 10) * (m[0].includes('-') ? -1 : 1);
  }
  return result;
}

interface Props {
  equipItems: Item[];
  currentEquipped?: Partial<Record<EquipSlot, Item>>;
}

export function EquipCompareLayout({ equipItems, currentEquipped = {} }: Props) {
  const [slot, setSlot]           = useState<EquipSlot>('weapon');
  const [candidateIdx, setCandidateIdx] = useState(0);

  const candidates = equipItems.filter(i => i.tags.includes(TAG_BY_SLOT[slot]));
  const current    = currentEquipped[slot] ?? null;
  const candidate  = candidates[candidateIdx] ?? null;

  const curStats = current   ? parseStats(current.effect)   : {};
  const newStats = candidate ? parseStats(candidate.effect) : {};
  const allKeys  = Array.from(new Set([...Object.keys(curStats), ...Object.keys(newStats)]));

  const ItemColumn = ({ item, label }: { item: Item | null; label: string }) => (
    <div style={{
      flex: 1, padding: '0.75rem',
      display: 'flex', flexDirection: 'column', gap: '0.375rem',
    }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>
        {label}
      </div>
      {item ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{item.iconTag}</span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: RARITY_COLOR[item.rarity], fontWeight: 700 }}>
                {'★'.repeat(item.rarity)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--color-text-gold)' }}>{item.effect}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {item.description}
          </div>
        </>
      ) : (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)', borderRadius: 8, padding: '1rem',
        }}>
          未装備
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      background: 'var(--color-bg-medium)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
    }}>
      {/* [1] スロット選択タブ */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-light)' }}>
        {SLOT_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setSlot(t.id); setCandidateIdx(0); }}
            style={{
              flex: 1, padding: '0.45rem',
              fontSize: '0.75rem', fontWeight: slot === t.id ? 700 : 400,
              color: slot === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: 'transparent', border: 'none',
              borderBottom: slot === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* [2][3][4] 比較エリア */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        {/* [2] 現在装備 */}
        <ItemColumn item={current} label="現在の装備" />

        {/* [3] 差分カラム */}
        <div style={{
          width: 80, flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
          padding: '0.75rem 0',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'var(--color-bg-dark)',
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            差分
          </div>
          {allKeys.length === 0 ? (
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>—</span>
          ) : allKeys.map(key => {
            const diff = (newStats[key] ?? 0) - (curStats[key] ?? 0);
            return (
              <div key={key} style={{
                textAlign: 'center',
                fontSize: '0.7rem',
              }}>
                <div style={{ color: 'var(--color-text-muted)' }}>{key}</div>
                <div style={{
                  fontWeight: 700,
                  color: diff > 0 ? '#34d399' : diff < 0 ? '#f87171' : 'var(--color-text-muted)',
                }}>
                  {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : diff}
                </div>
              </div>
            );
          })}
        </div>

        {/* [4] 候補 */}
        <ItemColumn item={candidate} label="装備候補" />
      </div>

      {/* 候補セレクター */}
      {candidates.length > 1 && (
        <div style={{
          display: 'flex', gap: '0.375rem', padding: '0.5rem 0.75rem',
          background: 'var(--color-bg-dark)',
          overflowX: 'auto',
        }}>
          {candidates.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setCandidateIdx(i)}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                border: `1px solid ${candidateIdx === i ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 6,
                background: candidateIdx === i ? 'rgba(201,162,39,0.1)' : 'transparent',
                color: candidateIdx === i ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {c.iconTag} {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
