# Collection Part

## 概要
収集要素（キャラ・画像・Tips・Gallery）の表示管理。

---

## 責務

- image_registry表示
- Tips閲覧
- タグ検索・フィルタ
- 進捗可視化

---

## 禁止事項

- ❌ ゲームロジック持ち込み禁止（Viewer専用）
- ❌ データ変更禁止（読み取り専用）
- ❌ 表示以外の機能禁止

---

## 構成

```
collection/
├── screens/
│   ├── GalleryScreen.tsx
│   ├── TipsScreen.tsx
│   └── ProgressScreen.tsx
├── components/
│   ├── ImageGrid.tsx
│   ├── TipCard.tsx
│   └── ProgressBar.tsx
├── hooks/
│   ├── useCollection.ts
│   └── useFilter.ts
├── CollectionManager.ts
├── README.md
└── index.ts
```

---

## External Dependencies Checklist

### Managers (core/managers)
- [ ] CollectionManager
- [ ] AssetManager
- [ ] SaveManager

### Hooks (core/hooks)
- [ ] useCollection
- [ ] useAsset

### Data (data/)
- [ ] image_registry.json
- [ ] tips.json

### Utilities
- [ ] tag filter
- [ ] search index

---

## CollectionManager API

```typescript
class CollectionManager {
  // 画像一覧取得
  getImages(filter?: FilterOptions): ImageEntry[]
  
  // Tips一覧取得
  getTips(unlocked?: boolean): Tip[]
  
  // タグでフィルタ
  filterByTag(tag: string): ImageEntry[]
  
  // 検索
  search(query: string): ImageEntry[]
  
  // 進捗計算
  calculateProgress(): Progress
}
```

---

## フィルタオプション

```typescript
interface FilterOptions {
  category?: 'bg' | 'chara' | 'item' | 'effect';
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  sortBy?: 'date' | 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
}
```

---

## 使用例

```typescript
import { CollectionManager } from './CollectionManager';
import { useCollection, useAsset } from '@/core/hooks';

function GalleryScreen() {
  const { images } = useCollection();
  const { getAsset } = useAsset();
  const manager = new CollectionManager();
  
  const [filter, setFilter] = useState<FilterOptions>({
    category: 'bg',
    sortBy: 'date'
  });
  
  const filteredImages = manager.getImages(filter);
  
  return (
    <div>
      <FilterBar value={filter} onChange={setFilter} />
      <ImageGrid images={filteredImages} />
    </div>
  );
}
```

---

## Tips表示ルール

```typescript
// TipsはunlockConditionを満たした場合のみ表示
const displayTips = tips.filter(tip => {
  if (!tip.unlockCondition) return true;
  
  const flagValue = getFlag(tip.unlockCondition.flag);
  return flagValue === tip.unlockCondition.value;
});
```

---

## 進捗計算例

```typescript
interface Progress {
  totalImages: number;
  collectedImages: number;
  percentage: number;
  byCategory: {
    bg: { total: number; collected: number };
    chara: { total: number; collected: number };
    item: { total: number; collected: number };
  };
}
```

---

## 備考

Viewer専用パート。ゲームロジックを持たない。
将来的には独立したビューアアプリとしても展開可能。
