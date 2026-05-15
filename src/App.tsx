
// ============================================
// NanoNovel - App Component
// ============================================

import { Routes, Route } from 'react-router-dom';
import { useGameStore } from '@/core/stores/gameStore';
import { TitleScreen } from '@/screens/01_Title/TitleScreen';
import { ChapterScreen } from '@/screens/02_Novel/ChapterScreen';
import { NovelScreen } from '@/screens/02_Novel/NovelScreen';
import { BattleScreen } from '@/screens/03_Battle/BattleScreen';
import { ApiBattleScreen } from '@/screens/04_ApiBattle/ApiBattleScreen';
import '@/styles/global.css';
import { CollectionScreen } from '@/screens/11_Collection/CollectionScreen';
import { AndroidLayout } from '@/screens/android/AndroidLayout';
import { HomeScreen } from '@/screens/00_Home/HomeScreen';
import { MenuScreen } from '@/screens/13_Menu/MenuScreen';
import { DevStudioScreen } from '@/devstudio/DevStudioScreen';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Android / モバイル端末の自動判定（モジュール読み込み時に1回だけ評価）
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);
  const navigate = useNavigate();

  // Sync Zustand currentScreen → URL (migration bridge for Phase 1)
  useEffect(() => {
    const screenToPath: Record<string, string> = {
      'HOME': '/',
      'TITLE': '/title-screen',
      'CHAPTER': '/chapter',
      'NOVEL': '/novel',
      'BATTLE': '/battle',
      'API_BATTLE': '/api-battle',
      'RESULT': '/result',
      'GALLERY': '/gallery',
      'COLLECTION': '/collection',
      'MENU': '/menu',
      'DEVSTUDIO': '/devstudio',
    };
    const path = screenToPath[currentScreen] ?? '/title-screen';
    navigate(path, { replace: true });
  }, [currentScreen, navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/title-screen" element={<TitleScreen />} />
      <Route path="/chapter" element={<ChapterScreen />} />
      <Route path="/novel/*" element={<NovelScreen />} />
      <Route path="/battle" element={<BattleScreen />} />
      <Route path="/api-battle" element={<ApiBattleScreen />} />
      <Route path="/result" element={
        <div className="screen-center"><h2>Result Screen</h2><p>（実装予定）</p></div>
      } />
      <Route path="/gallery" element={
        <div className="screen-center"><h2>Gallery Screen</h2><p>（実装予定）</p></div>
      } />
      <Route path="/collection" element={IS_MOBILE ? <AndroidLayout /> : <CollectionScreen />} />
      <Route path="/menu" element={<MenuScreen />} />
      <Route path="/devstudio" element={<DevStudioScreen />} />
    </Routes>
  );
}

export default App;

