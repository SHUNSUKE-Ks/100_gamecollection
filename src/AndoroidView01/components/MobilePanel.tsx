// ============================================================
// AndroidView01 — MobilePanel
// 共通カードパネルコンポーネント（モバイル版）
// ============================================================

import type { ReactNode } from 'react';

interface MobilePanelProps {
  title: string;
  icon?: string;
  children: ReactNode;
  accent?: string;
  noPadding?: boolean;
  action?: ReactNode;
}

export function MobilePanel({ title, icon, children, accent = '#a78bfa', noPadding, action }: MobilePanelProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {icon && <span style={{ fontSize: '0.95rem' }}>{icon}</span>}
        <span style={{
          flex: 1,
          fontSize: '0.72rem', fontWeight: 700,
          color: '#9ca3af', letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>{title}</span>
        {action}
      </div>
      {/* Body */}
      <div style={{ padding: noPadding ? 0 : '12px 14px' }}>
        {children}
      </div>
    </div>
  );
}
