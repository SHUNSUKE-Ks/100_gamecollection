# Collection Part

コレクションパート（ギャラリー・Tips）の実装を担当するモジュールです。

## 責務

- ギャラリー画面（画像一覧）
- 画像検索・フィルタリング
- Tips閲覧機能
- 進捗表示

## ディレクトリ構成

```
collection/
├── screens/              # 画面コンポーネント
│   ├── GalleryScreen.tsx
│   ├── TipsScreen.tsx
│   └── ProgressScreen.tsx
├── components/           # UIコンポーネント
│   └── ImageModal.tsx
├── CollectionManager.ts  # コレクションロジック
└── index.ts              # エクスポート
```

## 依存関係

- `@/data/tips.json`
- `@/data/image_registry.json`
