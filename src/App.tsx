
// ============================================
// NanoNovel - App Component
// ============================================

import { useGameStore } from '@/core/stores/gameStore';
import { TitleScreen } from '@/screens/01_Title/TitleScreen';
import { ChapterScreen } from '@/screens/02_Novel/ChapterScreen';
import { NovelScreen } from '@/screens/02_Novel/NovelScreen';
import { BattleScreen } from '@/screens/03_Battle/BattleScreen';
import { ApiBattleScreen } from '@/screens/04_ApiBattle/ApiBattleScreen';
import { HonoApiTestScreen } from '@/screens/05_HonoApiTest/HonoApiTestScreen';
import '@/styles/global.css';
import { CollectionScreen } from '@/screens/11_Collection/CollectionScreen';
import { AndroidLayout } from '@/screens/android/AndroidLayout';
import { HomeScreen } from '@/screens/00_Home/HomeScreen';
import { MenuScreen } from '@/screens/13_Menu/MenuScreen';
import { WorkSpaceScreen } from '@/screens/workspace/WorkSpaceScreen';

// Android / モバイル端末の自動判定（モジュール読み込み時に1回だけ評価）
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);

  // Screen router based on Zustand state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen />;
      case 'TITLE':
        return <TitleScreen />;
      case 'CHAPTER':
        return <ChapterScreen />;
      case 'NOVEL':
        return <NovelScreen />;
      case 'BATTLE':
        return <BattleScreen />;
      case 'API_BATTLE':
        return <ApiBattleScreen />;
      case 'RESULT':
        return <div className="screen-center"><h2>Result Screen</h2><p>（実装予定）</p></div>;
      case 'GALLERY':
        return <div className="screen-center"><h2>Gallery Screen</h2><p>（実装予定）</p></div>;
      case 'COLLECTION':
        // モバイル端末では自動的に Android レイアウトへ切り替え
        return IS_MOBILE ? <AndroidLayout /> : <CollectionScreen />;
      case 'ANDROID_COLLECTION':
        return <AndroidLayout />;
      case 'MENU':
        return <MenuScreen />;
      case 'HONO_API_TEST':
        return <HonoApiTestScreen />;
      case 'WORKSPACE':
        return <WorkSpaceScreen />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
}

export default App;

