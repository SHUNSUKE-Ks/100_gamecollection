# Component Docs — 100_gamecollection

再利用性向上・Storybook 導入のためのコンポーネント資料集。

---

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| [COMPONENT_MAP.md](./COMPONENT_MAP.md) | 全コンポーネントの一覧・依存・再利用スコア |
| [collection/CollectionScreen.md](./collection/CollectionScreen.md) | Collection 画面の詳細・タブ構造・拡張方法 |
| [collection/DataViews.md](./collection/DataViews.md) | GalleryView / TableView / KanbanView / ViewSwitcher |
| [notebook/PlotNotebook.md](./notebook/PlotNotebook.md) | PlotNotebook 型定義・カード種別・API・使用例 |
| [jsoncard/JsonCard.md](./jsoncard/JsonCard.md) | **[構想]** JsonCard システム — Core-Decal 構造・全機能仕様 |
| [storybook/STORYBOOK_PLAN.md](./storybook/STORYBOOK_PLAN.md) | Storybook 導入ロードマップ |

---

## ディレクトリ構成（src）

```
src/
├── components/
│   └── data-views/          ← ビュー切り替えコンポーネント（再利用性 ★★★）
├── core/
│   ├── hooks/               ← カスタム React フック
│   ├── managers/            ← イベント / セーブ / シナリオ管理
│   ├── services/            ← Firestore / Gemini / Sound CRUD
│   ├── stores/              ← Zustand ストア
│   └── types/               ← 全型定義
├── parts/
│   ├── collection/          ← Collection 画面パーツ群（再利用性 ★★☆）
│   │   ├── catalog/         ← アイテム/スキルカタログ
│   │   ├── story/           ← PlotNotebook 関連
│   │   ├── sound/           ← サウンド管理
│   │   ├── specific/        ← キャラ詳細・敵詳細
│   │   ├── settings/        ← 設定画面
│   │   ├── workspace/       ← ワークスペース
│   │   └── tagsdb/          ← タグ DB
│   ├── battle/              ← バトルパーツ
│   └── novel/               ← ノベルパーツ
└── screens/                 ← ゲーム画面単位
    ├── 00_Home/
    ├── 01_Title/
    ├── 11_Collection/       ← Collection メイン画面
    ├── 12_Studio/
    └── ...
```

---

## 再利用性クイックリファレンス

| コンポーネント | 再利用性 | Storybook 優先度 |
|-------------|--------|----------------|
| `ViewSwitcher` | ★★★ | P1 |
| `GalleryView` | ★★★ | P1 |
| `TableView` | ★★★ | P1 |
| `KanbanView` | ★★★ | P1 |
| `PlotNotebookShell` | ★★★ | P1 |
| `ItemCard` | ★★☆ | P2 |
| `SkillCard` | ★★☆ | P2 |
| `RecordCardModal` | ★★☆ | P2 |
| `CollectionScreen` | ★☆☆ | P3 |
| `PlotNotebook` | ★☆☆ | P3（Firestore依存） |
