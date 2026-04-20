// ============================================================
// AndroidView01 — MobileShell
// アプリ全体のシェル（ヘッダー + コンテンツ + サイドバー）
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { useStudioAdapter } from '../adapters/useStudioAdapter';
import { MobileHeader } from './MobileHeader';
import { MobileSidebar } from './MobileSidebar';
import { DashboardPage }  from '../pages/DashboardPage';
import { EpicsPage }      from '../pages/EpicsPage';
import { TasksPage }      from '../pages/TasksPage';
import { LogsPage }       from '../pages/LogsPage';
import { WorkspacePage }  from '../pages/WorkspacePage';
import { OrchestraPage }  from '../pages/OrchestraPage';
import { SchemaPage }     from '../pages/SchemaPage';
import type { StudioSection } from '@/devstudio/core/types';
import { GamePackageScreen } from '@/devstudio/gamepackage/GamePackageScreen';

// ─── Section labels ────────────────────────────────────────

const SECTION_TITLE: Record<StudioSection, string> = {
  DASHBOARD:    'Dashboard',
  EPIC:         'Epic',
  TASKS:        'Tasks',
  LOGS:         'Logs',
  WORKSPACE:    'WorkSpace',
  ORCHESTRA:    'Orchestra',
  SCHEMA:       'Schema',
  GAME_PACKAGE: 'GamePkg',
};

// ─── Shell ────────────────────────────────────────────────────

export function MobileShell() {
  const setScreen = useGameStore(s => s.setScreen);
  const adapter   = useStudioAdapter();
  const { currentSection, currentProfile, accentColor, setSection, setProfile } = adapter;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subPage, setSubPage] = useState<string | null>(null);

  // Schema と Tasks と GAME_PACKAGE は全高を使う（overflow: hidden を保つ）
  const isFullHeight = currentSection === 'SCHEMA' || currentSection === 'TASKS' || currentSection === 'WORKSPACE' || currentSection === 'GAME_PACKAGE';

  const renderPage = () => {
    switch (currentSection) {
      case 'DASHBOARD':  return <DashboardPage />;
      case 'EPIC':       return <EpicsPage />;
      case 'TASKS':      return <TasksPage />;
      case 'LOGS':       return <LogsPage />;
      case 'WORKSPACE':  return <WorkspacePage />;
      case 'ORCHESTRA':  return <OrchestraPage />;
      case 'SCHEMA':     return <SchemaPage />;
      case 'GAME_PACKAGE': return <GamePackageScreen />;
      default:           return <DashboardPage />;
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      height: '100dvh', width: '100vw',
      background: '#020207', overflow: 'hidden',
    }}>
      {/* スマホフレーム（最大 430px） */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        width: '100%', maxWidth: 430,
        height: '100%', position: 'relative',
        background: '#0a0a14',
        color: '#d1d5db',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <MobileHeader
          title={SECTION_TITLE[currentSection]}
          onMenuOpen={() => setSidebarOpen(true)}
          accentColor={accentColor}
          badge={currentProfile}
          rightExtra={
            <span style={{
              fontSize: '0.55rem', color: '#4b5563',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 6, padding: '2px 6px',
            }}>β</span>
          }
        />

        {/* Main content */}
        {isFullHeight ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {renderPage()}
          </div>
        ) : (
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {renderPage()}
          </main>
        )}

        {/* Overlay sidebar */}
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentSection={currentSection}
          currentProfile={currentProfile}
          onSelectSection={(s) => { setSection(s); setSidebarOpen(false); }}
          onSelectProfile={(p) => { setProfile(p); }}
          onBackToTitle={() => { setSidebarOpen(false); setScreen('TITLE'); }}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}
