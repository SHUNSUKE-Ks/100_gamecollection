# Battle Part

バトルパート（戦闘システム）の実装を担当するモジュールです。

## 責務

- バトル画面表示
- ターン制戦闘ロジック
- スキル処理
- 敵AI
- ダメージ計算
- 勝敗判定
- リザルト表示

## ディレクトリ構成

```
battle/
├── screens/          # 画面コンポーネント
│   ├── BattleScreen.tsx
│   └── ResultScreen.tsx
├── components/       # UIコンポーネント
│   ├── EnemyDisplay.tsx
│   ├── PlayerStatus.tsx
│   ├── SkillMenu.tsx
│   └── BattleLog.tsx
├── hooks/            # カスタムフック
├── ai/               # 敵AIロジック
│   └── enemyAI.ts
├── utils/            # ユーティリティ
│   └── damageCalculator.ts
├── BattleManager.ts  # バトルロジック
├── types.ts          # 型定義
└── index.ts          # エクスポート
```

## 依存関係

- `@/core/stores/gameStore`
- `@/data/enemy.json`
- `@/data/skill.json`
