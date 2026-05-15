# DataViews — 詳細ドキュメント

`src/components/data-views/`

再利用性 ★★★ — Firestore 非依存・Store 非依存のピュア Props コンポーネント群。

---

## ViewSwitcher

### Props

```typescript
export type CollectionViewType = 'list' | 'gallery' | 'kanban' | 'custom';

interface ViewSwitcherProps {
  currentView: CollectionViewType;
  onViewChange: (view: CollectionViewType) => void;
}
```

### 使用例

```tsx
import { ViewSwitcher, CollectionViewType } from '@/components/data-views/ViewSwitcher';

const [view, setView] = useState<CollectionViewType>('list');

<ViewSwitcher currentView={view} onViewChange={setView} />
```

### Storybook Stories（予定）

- Default（list 選択状態）
- Gallery 選択状態
- Kanban 選択状態
- Custom 選択状態

---

## TableView

### Props

```typescript
interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableViewProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectedId?: string;
  emptyMessage?: string;
}
```

### 使用例

```tsx
import { TableView } from '@/components/data-views/TableView';

type CharacterRecord = { id: string; name: string; role: string };

<TableView<CharacterRecord>
  data={characters}
  columns={[
    { key: 'name', label: '名前', width: '200px' },
    { key: 'role', label: '役割' },
    {
      key: 'id',
      label: 'ID',
      render: (val) => <code>{String(val)}</code>,
    },
  ]}
  onRowClick={(row) => console.log(row)}
  emptyMessage="キャラクターがいません"
/>
```

### Storybook Stories（予定）

- 標準テーブル（複数行）
- 行クリックハンドラ付き
- カスタムレンダー列
- 空状態（data = []）

---

## GalleryView

### Props

```typescript
interface GalleryViewProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  columns?: 2 | 3 | 4 | 5;   // グリッド列数、デフォルト 3
  gap?: string;
  emptyMessage?: string;
}
```

### 使用例

```tsx
import { GalleryView } from '@/components/data-views/GalleryView';

<GalleryView<CharacterRecord>
  data={characters}
  columns={4}
  renderCard={(char) => (
    <CharacterCard
      key={char.id}
      name={char.name}
      portrait={char.portraitTag}
    />
  )}
  emptyMessage="キャラクターなし"
/>
```

### Storybook Stories（予定）

- 3 列グリッド（デフォルト）
- 4 列グリッド
- カスタムカード（ItemCard）
- 空状態

---

## KanbanView

### Props

```typescript
interface KanbanColumn<T> {
  id: string;
  label: string;
  filter: (item: T) => boolean;
  color?: string;
}

interface KanbanViewProps<T> {
  data: T[];
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => React.ReactNode;
  onMoveCard?: (item: T, toColumnId: string) => void;
}
```

### 使用例

```tsx
import { KanbanView } from '@/components/data-views/KanbanView';

const kanbanColumns: KanbanColumn<PlotCard>[] = [
  { id: 'idea',  label: 'アイデア', filter: (c) => c.status === 'idea',  color: '#6b7280' },
  { id: 'draft', label: 'ドラフト', filter: (c) => c.status === 'draft', color: '#3b82f6' },
  { id: 'fixed', label: '確定',     filter: (c) => c.status === 'fixed', color: '#10b981' },
];

<KanbanView<PlotCard>
  data={plotCards}
  columns={kanbanColumns}
  renderCard={(card) => <PlotCardThumbnail card={card} />}
  onMoveCard={(card, toCol) => updatePlotStatus(card.id, toCol)}
/>
```

### Storybook Stories（予定）

- PlotCard ステータス管理（idea/draft/fixed）
- カスタムカラー列
- ドラッグ移動（onMoveCard）
- 空列の表示

---

## 共通事項

### 型安全性

全コンポーネントがジェネリクス `<T>` を使用しているため、
`T` に任意のレコード型を渡せば型安全に動作する。

### Tailwind クラス

内部スタイルは全て Tailwind CSS 4 クラスで記述。
ダークモード切り替えは `dark:` プレフィックスで対応済み。

### アクセシビリティ

- `TableView`: `<table>` / `<th>` / `<td>` のセマンティクス使用
- `GalleryView`: `role="list"` / `role="listitem"` 付与
- `KanbanView`: ドラッグ操作に `aria-grabbed` / `aria-dropeffect` 付与（予定）
