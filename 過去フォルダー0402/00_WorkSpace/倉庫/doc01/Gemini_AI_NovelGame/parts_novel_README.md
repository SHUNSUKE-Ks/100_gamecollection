# Novel Part

## 概要
ノベル進行・シナリオ表示・タグ連動演出を担当するパート。

---

## 責務

- シナリオ進行制御
- storyID遷移
- タグ → 画像 / サウンド反映
- 選択肢処理
- Gallery登録

---

## 禁止事項

- ❌ 永続データ管理は禁止（coreへ）
- ❌ Asset直接参照は禁止（AssetManager経由）
- ❌ グローバル状態直接操作禁止
- ❌ UIとロジックの混在禁止

---

## 構成

```
novel/
├── screens/          # UI表示専用
│   ├── TitleScreen.tsx
│   ├── ChapterScreen.tsx
│   ├── NovelScreen.tsx
│   └── ResultScreen.tsx
├── components/       # UI部品
├── hooks/           # パート固有ロジック
├── NovelManager.ts  # 状態遷移制御
├── README.md
└── index.ts
```

---

## External Dependencies Checklist

### Managers (core/managers)
- [ ] ScenarioManager
- [ ] AssetManager
- [ ] SoundManager
- [ ] TagManager
- [ ] SaveManager

### Hooks (core/hooks)
- [ ] useScenario
- [ ] useSound
- [ ] useAsset
- [ ] useFlags
- [ ] useSaveData
- [ ] useTagMatch

### Data (data/)
- [ ] scenario.json
- [ ] characters.json
- [ ] sound.json
- [ ] image_registry.json

### Utilities
- [ ] storyID parser
- [ ] tag resolver

---

## NovelManager API

```typescript
class NovelManager {
  // 次のストーリーへ進む
  next(): void
  
  // 特定のstoryIDへジャンプ
  jump(storyID: string): void
  
  // イベント処理を適用
  applyEvent(event: Event): void
  
  // タグを解決
  resolveTags(tags: string[]): ResolvedAssets
}
```

---

## 使用例

```typescript
import { NovelManager } from './NovelManager';
import { useScenario, useAsset, useSound } from '@/core/hooks';

function NovelScreen() {
  const { currentStory } = useScenario();
  const { getAsset } = useAsset();
  const { playBGM } = useSound();
  
  const manager = new NovelManager();
  
  const handleNext = () => {
    manager.next();
  };
  
  return (
    <div>
      <Background src={getAsset(currentStory.tags[0])} />
      <Dialog text={currentStory.text} />
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

---

## 備考

このパートは将来別プロジェクトに切り出し可能。
