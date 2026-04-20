// ============================================================
// AndroidView01 — MobileHeader
// ヘッダー：← 戻る(左上) / タイトル / ≡ ハンバーガー
// ============================================================

interface MobileHeaderProps {
  title: string;
  onMenuOpen: () => void;
  onBack?: () => void;
  backLabel?: string;
  accentColor?: string;
  badge?: string;
  rightExtra?: React.ReactNode;
}

export function MobileHeader({
  title,
  onMenuOpen,
  onBack,
  backLabel = '← 戻る',
  accentColor = '#c4b5fd',
  badge,
  rightExtra,
}: MobileHeaderProps) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 12px',
      height: 52, flexShrink: 0,
      background: 'rgba(10,8,20,0.98)',
      borderBottom: `1px solid ${accentColor}22`,
      position: 'relative', zIndex: 10,
    }}>
      {/* 戻るボタン（左上） または スペーサー */}
      {onBack ? (
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: accentColor, fontSize: '0.82rem',
            padding: '4px 6px', borderRadius: 6,
            display: 'flex', alignItems: 'center', gap: 3,
            flexShrink: 0,
          }}
        >
          {backLabel}
        </button>
      ) : (
        <button
          onClick={onMenuOpen}
          aria-label="メニュー"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '1.2rem',
            padding: '4px 6px', borderRadius: 6,
            display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}
        >
          ☰
        </button>
      )}

      {/* タイトル */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 8,
        overflow: 'hidden',
      }}>
        <span style={{
          fontSize: '0.88rem', fontWeight: 700,
          color: accentColor,
          letterSpacing: '0.05em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: '0.58rem',
            background: `${accentColor}25`, color: accentColor,
            borderRadius: 8, padding: '1px 6px',
            flexShrink: 0,
          }}>{badge}</span>
        )}
      </div>

      {rightExtra}

      {/* ハンバーガー（戻るボタンがある時だけ表示） */}
      {onBack && (
        <button
          onClick={onMenuOpen}
          aria-label="メニュー"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '1.1rem',
            padding: '4px 6px', borderRadius: 6,
            display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}
        >
          ☰
        </button>
      )}
    </header>
  );
}
