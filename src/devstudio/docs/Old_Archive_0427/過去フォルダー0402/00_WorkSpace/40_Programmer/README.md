# 💻 Programmer (プログラマー) フォルダ

プログラム実装に関する資料・仕様書を管理するフォルダです。

---

## 📁 フォルダ構成

```
40_Programmer/
├── README.md                  (このファイル)
├── 01_技術仕様.md              (使用技術・環境)
├── 02_データ仕様.md            (JSON構造リファレンス)
├── バグ報告/                   (バグトラッキング)
└── 実装メモ/                   (技術メモ)
```

---

## ✅ 作業開始前に確認すること

| 確認項目 | 取得先 | 状態 |
|---------|-------|------|
| ゲーム設計書 (GDD) | GamePlanner | [ ] |
| JSON仕様書 | GamePlanner / ScenarioWriter | [ ] |
| 素材規格 | Graphicker | [ ] |
| 音声規格 | SoundCreator | [ ] |

---

## 🛠️ 技術スタック (クイックリファレンス)

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React + TypeScript |
| ビルドツール | Vite |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS |
| 開発サーバー | `npm run dev` → http://localhost:5173 |

---

## 📂 プロジェクト構造

```
src/
├── assets/          # 画像・音声素材
├── components/      # 再利用可能コンポーネント
├── core/            # コアロジック (hooks, stores, types)
├── data/            # JSONデータ
│   ├── collection/  # アイテム、敵、キャラ等
│   └── novel/       # シナリオJSON
├── screens/         # 各画面コンポーネント
└── parts/           # 画面固有パーツ
```

---

## 🔗 他部署との連携

### 必要な情報 (受け取る)

| 情報 | 提供元 | 用途 |
|------|-------|------|
| JSON仕様書 | GamePlanner | データ型定義 |
| シナリオJSON | ScenarioWriter | ゲーム進行データ |
| 画像素材 | Graphicker | 表示用 |
| 音声素材 | SoundCreator | 再生用 |

### 提供する情報 (渡す)

| 情報 | 提供先 | 用途 |
|------|-------|------|
| 動作確認ビルド | 全部署 | テストプレイ |
| 技術制約 | GamePlanner | 仕様調整 |
| 素材タグ一覧 | ScenarioWriter | JSON記述用 |

---

## 📦 素材受け入れ場所

| 素材タイプ | 配置先 |
|-----------|-------|
| キャラクター | `src/assets/chara/` |
| 背景 | `src/assets/bg/` |
| UI | `src/assets/ui/` |
| アイコン | `src/assets/icon/` |
| BGM | `src/assets/bgm/` |
| SE | `src/assets/se/` |

または **Asset Manager** (`tools/asset-manager`) で自動振分け
