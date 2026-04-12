# Core Layer

全パート共通のロジック・ユーティリティを提供する層です。

## 責務

- アセット管理（AssetManager）
- シナリオ管理（ScenarioManager）
- サウンド管理（SoundManager）
- セーブ/ロード（SaveManager）
- タグ解決（TagResolver）
- グローバル状態管理（Zustand Store）

## ディレクトリ構成

```
core/
├── managers/         # マネージャークラス
│   ├── AssetManager.ts
│   ├── ScenarioManager.ts
│   ├── SoundManager.ts
│   ├── SaveManager.ts
│   └── TagResolver.ts
├── hooks/            # カスタムフック
│   ├── useScenario.ts
│   ├── useAsset.ts
│   ├── useSound.ts
│   ├── useFlags.ts
│   └── useSaveData.ts
├── stores/           # Zustand Store
│   └── gameStore.ts
├── types/            # TypeScript型定義
│   ├── scenario.ts
│   ├── character.ts
│   ├── enemy.ts
│   ├── skill.ts
│   └── index.ts
├── utils/            # ユーティリティ
│   ├── storyIDParser.ts
│   ├── tagValidator.ts
│   └── assetPathResolver.ts
└── README.md
```

## 設計原則

1. **パート非依存**: Core層は特定のパートに依存しない
2. **再利用可能**: 他プロジェクトへの移植を考慮
3. **テスト容易**: 単体テストが書きやすい設計
