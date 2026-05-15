# Storybook 導入ロードマップ

---

## 現状確認

- プロジェクト: Vite 7 + React 19 + TypeScript + Tailwind CSS 4
- 既存 Storybook: なし（`C:\Users\enjoy\.storybook` は Claude 設定ファイルのみ）
- → **プロジェクト内に新規導入する**

---

## Phase 1 — セットアップ

```bash
# プロジェクトルートで実行
npx storybook@latest init
```

Vite + React 構成を自動検出し、以下が生成される：

```
.storybook/
├── main.ts          ← framework, addons 設定
└── preview.ts       ← グローバルデコレーター, CSS import
stories/             ← サンプル Story（削除してよい）
```

### Tailwind CSS 4 の追加設定

```typescript
// .storybook/preview.ts
import '../src/index.css';   // Tailwind の @import を含む CSS

export const parameters = {
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'dark',  value: '#1a1a2e' },
      { name: 'light', value: '#f9fafb' },
    ],
  },
};
```

---

## Phase 2 — P1 Stories（再利用性 ★★★）

実装順序：

### 2-1. ViewSwitcher

```
src/components/data-views/ViewSwitcher.stories.tsx
```

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ViewSwitcher } from './ViewSwitcher';

const meta: Meta<typeof ViewSwitcher> = {
  component: ViewSwitcher,
  args: { currentView: 'list' },
};
export default meta;

type Story = StoryObj<typeof ViewSwitcher>;

export const List: Story    = { args: { currentView: 'list' } };
export const Gallery: Story = { args: { currentView: 'gallery' } };
export const Kanban: Story  = { args: { currentView: 'kanban' } };
export const Custom: Story  = { args: { currentView: 'custom' } };
```

### 2-2. TableView / GalleryView / KanbanView

```
src/components/data-views/TableView.stories.tsx
src/components/data-views/GalleryView.stories.tsx
src/components/data-views/KanbanView.stories.tsx
```

各ビューにモックデータを渡す Stories を作成。

### 2-3. PlotNotebookShell

```
src/parts/collection/story/PlotNotebookShell.stories.tsx
```

4 種カード（Log / Chat / Choice / State）それぞれの Story を作成。
→ `PlotNotebook.md` の「Storybook Stories（予定）」参照。

---

## Phase 3 — P2 Stories（再利用性 ★★☆）

- `ItemCard.stories.tsx`
- `SkillCard.stories.tsx`
- `RecordCardModal.stories.tsx`（モック onSave/onDelete を渡す）
- `CatalogSidebar.stories.tsx`

---

## Phase 4 — P3（密結合コンポーネントのリファクタ後）

- `CollectionScreen` → Firestore をフック化してから
- `PlotNotebook` → `PlotNotebookShell` に完全移行してから

---

## npm scripts 追加

```json
// package.json
"scripts": {
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

---

## 優先度まとめ

| Priority | コンポーネント | 理由 |
|---------|-------------|------|
| P1 | `ViewSwitcher` | 最小 Props、即 Story 化できる |
| P1 | `TableView / GalleryView / KanbanView` | ジェネリクス動作の確認 |
| P1 | `PlotNotebookShell` | Shell パターンのため Firestore 不要 |
| P2 | `ItemCard / SkillCard` | デザイン確認に有用 |
| P2 | `RecordCardModal` | フォーム動作確認 |
| P3 | `CollectionScreen` | リファクタ後 |

---

## 参考

- Storybook 公式: https://storybook.js.org/docs/react/get-started/install
- Vite + React テンプレート: 自動検出されるため追加設定不要
- Tailwind CSS 4 + Storybook: `preview.ts` で CSS import するだけで動作
