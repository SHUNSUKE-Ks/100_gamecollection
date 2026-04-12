# Novel Part

ノベルパート（物語進行）の実装を担当するモジュールです。

## 責務

- タイトル画面表示
- チャプター画面表示
- ノベル画面（メインゲーム画面）
- 会話ログ機能
- オート進行機能
- 選択肢分岐処理

## ディレクトリ構成

```
novel/
├── screens/          # 画面コンポーネント
│   ├── TitleScreen.tsx
│   ├── ChapterScreen.tsx
│   └── NovelScreen.tsx
├── components/       # UIコンポーネント
│   ├── Background.tsx
│   ├── Character.tsx
│   ├── Dialog.tsx
│   └── ChoiceButtons.tsx
├── hooks/            # カスタムフック
│   └── useAutoPlay.ts
├── NovelManager.ts   # ノベルロジック
└── index.ts          # エクスポート
```

## 依存関係

- `@/core/managers/ScenarioManager`
- `@/core/managers/AssetManager`
- `@/core/hooks/useScenario`
