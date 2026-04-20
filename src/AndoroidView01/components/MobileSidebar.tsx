// ============================================================
// AndroidView01 — MobileSidebar
// オーバーレイ型サイドバー（左からスライドイン）
// セクション選択 + プロファイル切替
// ============================================================

import type { StudioSection, ViewProfile } from '@/devstudio/core/types';
import type { ReactNode } from 'react';
import { SECTIONS, PROFILES, PROFILE_COLOR } from '../adapters/useStudioAdapter';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  currentSection: StudioSection;
  currentProfile: ViewProfile;
  onSelectSection: (s: StudioSection) => void;
  onSelectProfile: (p: ViewProfile) => void;
  onBackToTitle: () => void;
  accentColor: string;
}

export function MobileSidebar({
  open,
  onClose,
  currentSection,
  currentProfile,
  onSelectSection,
  onSelectProfile,
  onBackToTitle,
  accentColor,
}: MobileSidebarProps) {
  if (!open) return null;

  return (
    <>
      {/* 暗幕 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 200,
        }}
      />

      {/* サイドバー本体 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 260,
        background: 'rgba(12,10,28,0.98)',
        borderRight: `1px solid ${accentColor}22`,
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* サイドバーヘッダー */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: `1px solid ${accentColor}22`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1rem' }}>⬡</span>
            <span style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: '#c4b5fd', letterSpacing: '0.08em',
            }}>DEV STUDIO</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '1.1rem', padding: 4,
          }}>✕</button>
        </div>

        {/* プロファイル選択 */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '0.58rem', color: '#4b5563',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>Profile</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {PROFILES.map(p => {
              const c = PROFILE_COLOR[p];
              const active = p === currentProfile;
              return (
                <button
                  key={p}
                  onClick={() => { onSelectProfile(p); }}
                  style={{
                    padding: '4px 10px', borderRadius: 12, cursor: 'pointer',
                    background: active ? `${c}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? `${c}88` : 'rgba(255,255,255,0.08)'}`,
                    color: active ? c : '#4b5563',
                    fontSize: '0.68rem', fontWeight: active ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >{p}</button>
              );
            })}
          </div>
        </div>

        {/* セクションナビ */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.58rem', color: '#4b5563',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '6px 16px 8px',
          }}>Navigation</div>
          {SECTIONS.map(s => {
            const active = s.id === currentSection;
            return (
              <button
                key={s.id}
                onClick={() => { onSelectSection(s.id); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '12px 16px',
                  background: active ? `${accentColor}15` : 'none',
                  border: 'none',
                  borderLeft: `3px solid ${active ? accentColor : 'transparent'}`,
                  color: active ? accentColor : 'var(--color-text-primary, #d1d5db)',
                  cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <span style={{ fontWeight: active ? 700 : 400 }}>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* フッター */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <button
            onClick={onBackToTitle}
            style={{
              width: '100%', padding: '10px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#6b7280',
              cursor: 'pointer', fontSize: '0.8rem',
            }}
          >← タイトルに戻る</button>
        </div>
      </div>
    </>
  );
}
