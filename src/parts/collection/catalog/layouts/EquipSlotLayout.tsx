/**
 * EquipSlotLayout — 装備A: 装備スロット画面
 *
 * キャラクターの装備中アイテムを3スロット（武器/防具/装飾品）で表示。
 * スロットをクリックすると下部に候補一覧が表示される。
 * 用途: RPG装備管理画面
 *
 * パーツ:
 *   [1] キャラクター名 + 基本ステータスサマリー
 *   [2] 装備スロット × 3（武器 / 防具 / 装飾品）
 *   [3] 装備候補リスト（スロット選択時）
 */
import React, { useState } from 'react';
import type { Item, EquipSlot } from '@/core/types/item';

const SLOT_CONFIG: { id: EquipSlot; label: string; icon: string; tag: string }[] = [
  { id: 'weapon',    label: '武器',   icon: '🗡️',  tag: 'WEAPON' },
  { id: 'armor',     label: '防具',   icon: '🛡️',  tag: 'ARMOR' },
  { id: 'accessory', label: '装飾品', icon: '💍', tag: 'ACCESSORY' },
];

const RARITY_COLOR: Record<number, string> = {
  1: '#9ca3af', 2: '#34d399', 3: '#60a5fa', 4: '#a78bfa', 5: '#f97316',
};

interface EquippedState {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

interface Props {
  equipItems: Item[];
  characterName?: string;
  initialEquipped?: EquippedState;
}

export function EquipSlotLayout({ equipItems, characterName = 'レミ・ウナント', initialEquipped = {} }: Props) {
  const [equipped, setEquipped] = useState<EquippedState>(initialEquipped);
  const [activeSlot, setActiveSlot] = useState<EquipSlot | null>(null);

  const candidatesFor = (slot: EquipSlot) =>
    equipItems.filter(i => i.tags.includes(SLOT_CONFIG.find(s => s.id === slot)!.tag));

  const handleEquip = (slot: EquipSlot, item: Item) => {
    setEquipped(prev => ({ ...prev, [slot]: item }));
    setActiveSlot(null);
  };

  const handleUnequip = (slot: EquipSlot) => {
    setEquipped(prev => { const n = { ...prev }; delete n[slot]; return n; });
  };

  return (
    <div style={{
      background: 'var(--color-bg-medium)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
    }}>
      {/* [1] キャラクターヘッダー */}
      <div style={{
        padding: '0.625rem 0.875rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(201,162,39,0.15)',
          border: '1px solid var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0,
        }}>
          👤
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {characterName}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>
            装備スロット: {Object.values(equipped).filter(Boolean).length} / {SLOT_CONFIG.length}
          </div>
        </div>
      </div>

      {/* [2] 装備スロット */}
      <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {SLOT_CONFIG.map(slot => {
          const item = equipped[slot.id];
          const isActive = activeSlot === slot.id;
          return (
            <div key={slot.id}>
              <button
                onClick={() => setActiveSlot(isActive ? null : slot.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  background: isActive ? 'rgba(201,162,39,0.1)' : 'var(--color-bg-dark)',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {/* スロットアイコン */}
                <span style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: item ? '1.2rem' : '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${item ? RARITY_COLOR[item.rarity] : '#2a2a38'}`,
                  borderRadius: 6,
                  flexShrink: 0,
                }}>
                  {item ? item.iconTag : slot.icon}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{slot.label}</div>
                  {item ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {item.name}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      — 未装備 —
                    </div>
                  )}
                </div>

                {item && (
                  <div style={{ fontSize: '0.73rem', color: 'var(--color-text-gold)', marginRight: '0.375rem' }}>
                    {item.effect}
                  </div>
                )}

                {item && (
                  <button
                    onClick={e => { e.stopPropagation(); handleUnequip(slot.id); }}
                    style={{
                      padding: '0.15rem 0.4rem', fontSize: '0.65rem',
                      border: '1px solid #3d3d4a', borderRadius: 4,
                      background: 'transparent', color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    外す
                  </button>
                )}

                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  {isActive ? '▲' : '▼'}
                </span>
              </button>

              {/* [3] 候補リスト（展開時） */}
              {isActive && (
                <div style={{
                  marginTop: '0.25rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--color-bg-dark)',
                }}>
                  {candidatesFor(slot.id).length === 0 ? (
                    <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      候補なし
                    </div>
                  ) : candidatesFor(slot.id).map(candidate => (
                    <button
                      key={candidate.id}
                      onClick={() => handleEquip(slot.id, candidate)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.4rem 0.75rem',
                        background: equipped[slot.id]?.id === candidate.id ? 'rgba(201,162,39,0.1)' : 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{candidate.iconTag}</span>
                      <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
                        {candidate.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-gold)' }}>
                        {candidate.effect}
                      </span>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700,
                        color: RARITY_COLOR[candidate.rarity],
                        border: `1px solid ${RARITY_COLOR[candidate.rarity]}`,
                        padding: '0 0.25rem', borderRadius: 3,
                      }}>
                        {['', 'C', 'B', 'A', 'S', 'SS'][candidate.rarity]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
