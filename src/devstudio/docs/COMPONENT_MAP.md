# Component Map

全コンポーネントの依存関係・再利用スコアの一覧。

---

## 凡例

- **再利用性** ★★★ = どこでも使える / ★★☆ = 軽い調整で使える / ★☆☆ = 密結合・要リファクタ
- **Firestore依存** = 直接 Firestore を呼ぶか
- **Store依存** = Zustand ストアを直接使うか

---

## 1. data-views（汎用ビュー）

| コンポーネント | パス | 再利用性 | Firestore | Store | 備考 |
|-------------|-----|--------|-----------|-------|------|
| `ViewSwitcher` | `components/data-views/ViewSwitcher.tsx` | ★★★ | なし | なし | Props のみ完結 |
| `GalleryView` | `components/data-views/GalleryView.tsx` | ★★★ | なし | なし | ジェネリクス対応 |
| `TableView` | `components/data-views/TableView.tsx` | ★★★ | なし | なし | ジェネリクス対応 |
| `KanbanView` | `components/data-views/KanbanView.tsx` | ★★★ | なし | なし | ジェネリクス対応 |

```
ViewSwitcher
  └─ Props: currentView, onViewChange
  └─ 型: CollectionViewType = 'list' | 'gallery' | 'kanban' | 'custom'
```

---

## 2. Collection 画面

| コンポーネント | パス | 再利用性 | Firestore | Store |
|-------------|-----|--------|-----------|-------|
| `CollectionScreen` | `screens/11_Collection/CollectionScreen.tsx` | ★☆☆ | ○ | useGameStore |
| `RecordCardModal` | `parts/collection/RecordCardModal.tsx` | ★★☆ | ○ | なし |
| `WorkspacePanel` | `parts/collection/workspace/WorkspacePanel.tsx` | ★★☆ | なし | なし |
| `TagsDBScreen` | `parts/collection/tagsdb/TagsDBScreen.tsx` | ★☆☆ | ○ | なし |
| `SoundCollectionView` | `parts/collection/sound/SoundCollectionView.tsx` | ★☆☆ | ○ | soundAlbumStore |

### catalog/

| コンポーネント | 再利用性 | 備考 |
|-------------|--------|------|
| `ItemCard` | ★★☆ | Props: `item: Item` |
| `SkillCard` | ★★☆ | Props: `skill: Skill` |
| `CatalogSidebar` | ★★☆ | Props: items / skills / onSelect |
| `ThemeSwitcher` | ★★★ | Props: theme, onThemeChange |
| `ItemGridLayout` | ★★☆ | |
| `ItemListLayout` | ★★☆ | |
| `SkillGridLayout` | ★★☆ | |
| `SkillHotbarLayout` | ★★☆ | |
| `AbilityBadgeLayout` | ★★☆ | |
| `AbilityMenuLayout` | ★★☆ | |
| `EquipCompareLayout` | ★★☆ | |
| `EquipSlotLayout` | ★★☆ | |

---

## 3. Notebook（PlotNotebook）

| コンポーネント | パス | 再利用性 | Firestore | Store |
|-------------|-----|--------|-----------|-------|
| `PlotNotebook` | `parts/collection/story/PlotNotebook.tsx` | ★☆☆ | ○ | なし（PlotService 経由） |
| `PlotNotebookShell` | `parts/collection/story/PlotNotebookShell.tsx` | ★★★ | なし | なし |
| `StoryView` | `parts/collection/story/StoryView.tsx` | ★☆☆ | ○ | なし |
| `NovelLibraryView` | `parts/collection/story/NovelLibraryView.tsx` | ★☆☆ | ○ | なし |
| `NovelDetailView` | `parts/collection/story/NovelDetailView.tsx` | ★☆☆ | ○ | なし |

---

## 4. Services（ロジック層）

| サービス | パス | 主な責務 |
|---------|-----|---------|
| `CollectionService` | `core/services/CollectionService.ts` | Firestore 全DB汎用 CRUD |
| `PlotService` | `core/services/PlotService.ts` | PlotCard CRUD |
| `GeminiService` | `core/services/GeminiService.ts` | Gemini AI シーン生成 |
| `SoundAlbumService` | `core/services/SoundAlbumService.ts` | サウンド管理 |
| `SeedService` | `core/services/SeedService.ts` | Firestore 初期データ投入 |

---

## 5. Stores（Zustand）

| ストア | パス | 主な状態 |
|-------|-----|---------|
| `useGameStore` | `core/stores/gameStore.ts` | currentScreen, flags, inventory, party, gold |
| `useSettingsStore` | `core/stores/settingsStore.ts` | ゲーム設定 |
| `useSoundAlbumStore` | `core/stores/soundAlbumStore.ts` | サウンドアルバム状態 |

---

## 6. Hooks

| フック | パス | 主な機能 |
|-------|-----|---------|
| `useScenario` | `core/hooks/useScenario.ts` | シナリオ再生ロジック |
| `useBGMPlayer` | `core/hooks/useBGMPlayer.ts` | BGM 再生 |
| `useEventCard` | `core/hooks/useEventCard.ts` | イベントカード |
| `useViewMode` | `core/hooks/useViewMode.ts` | ビュー切り替え状態 |

---

## 7. 型定義（core/types）

| ファイル | 主な型 |
|---------|--------|
| `character.ts` | `Character`, `CharacterStatus` |
| `scenario.ts` | シナリオ進行型 |
| `skill.ts` | `Skill` |
| `item.ts` | `Item`, `InventoryItem` |
| `enemy.ts` | `Enemy` |
| `eventCard.ts` | `EventCard` |
| `document.ts` | DB ドキュメント共通型 |
| `config.ts` | ゲーム設定型 |

PlotNotebook 専用の型は `PlotService.ts` 内で定義されている（→ 将来的に `types/plot.ts` に分離推奨）。
