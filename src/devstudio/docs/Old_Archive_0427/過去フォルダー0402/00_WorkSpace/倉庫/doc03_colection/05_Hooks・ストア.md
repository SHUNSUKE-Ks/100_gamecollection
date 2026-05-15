# Hooks・ストア

## 1. useViewMode

```typescript
// src/core/hooks/useViewMode.ts
export type ViewMode = 'list' | 'gallery' | 'kanban' | 'custom';

export function useViewMode(initialMode: ViewMode = 'list') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  return { viewMode, setViewMode };
}
```

**使用方法:**
```typescript
const { viewMode, setViewMode } = useViewMode('list');
setViewMode('gallery');
```

---

## 2. useBGMPlayer

```typescript
// src/core/hooks/useBGMPlayer.ts
export interface BGMTrack {
  id: string; title: string; filename: string;
  description: string; tags: string[];
  category: string; duration: number | null; artist: string;
}

// 戻り値
const {
  state,              // BGMPlayerState
  currentTrack,       // 現在再生中のトラック
  filteredPlaylist,   // フィルタ済みリスト
  togglePlay,         // 再生/停止
  next, previous,     // 前/次の曲
  seek,               // シーク
  setVolume,          // ボリューム設定
  toggleMute,         // ミュート切替
  toggleShuffle,      // シャッフル切替
  cycleRepeat,        // リピート切替 (off→all→one)
  selectTrack,        // 曲選択
} = useBGMPlayer('/src/assets/sound/bgm/bgmlist01/');
```

**移植時の注意:** `basePath` を移植先のオーディオファイル配置に合わせて変更

---

## 3. gameStore (Zustand)

```typescript
// src/core/stores/gameStore.ts
import { create } from 'zustand';

interface GameState {
  currentScreen: ScreenType;
  currentStoryID: string;
  flags: Record<string, unknown>;
  inventory: { itemID: string; count: number }[];
  
  setScreen: (screen: ScreenType) => void;
  setStoryID: (storyID: string) => void;
  setFlag: (key: string, value: unknown) => void;
  addItem: (itemID: string, count: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScreen: 'TITLE',
  // ...
  setScreen: (screen) => set({ currentScreen: screen }),
}));
```

**CollectionScreenでの使用:**
```typescript
const setScreen = useGameStore(state => state.setScreen);
<button onClick={() => setScreen('TITLE')}>戻る</button>
```

**移植時の注意:** 
- React Routerの場合は `useNavigate()` に置換
- Next.jsの場合は `useRouter()` に置換
