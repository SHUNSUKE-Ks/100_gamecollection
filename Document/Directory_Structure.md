# 100_gamecollection フォルダ構成 (Current)

## Directory Structure v1.7

---

## 🗂️ ルート構成

```
100_gamecollection/
├── .env                  # 環境変数（API Key等）
├── .env.example          # 環境変数テンプレート
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js    # Tailwind 設定
├── postcss.config.js     # PostCSS 設定
├── eslint.config.js      # ESLint 設定
├── index.html
├── src/                  # ソースコード
├── public/               # 静的ファイル群
├── 00_WorkSpace/         # 開発・作業領域 (ロール別・フェーズ別)
├── 01_WorkSpace/         # タスク管理 (Taskticket等)
├── 03_WorkSpace/         # プロジェクト管理・全体ロードマップ等
├── doc_04/               # システム構成ドキュメント
└── _delivery/            # 納品物用ディレクトリ
```

---

## 📁 主要ディレクトリ詳細

### `00_WorkSpace/` (作業領域)

開発・運営に携わる各ロールや目的に応じた作業ディレクトリ。

```
00_WorkSpace/
├── 00_GameManager/       # 全体管理
├── 10_GamePlanner/       # プランニング
├── 20_ScenarioWriter/    # シナリオ執筆
├── 30_Graphicker/        # 画像制作
├── 40_Programmer/        # 実装関連メモ等
├── 50_SoundCreator/      # 音声制作
├── Phase01_製作フロー/   # フェーズ別進行
├── asset-manager/        # アセット管理ツール用
├── 1000_TestArea/        # テスト・検証用
├── 倉庫/                 # 過去データアーカイブ
└── 書き込みエリア/       # 一時メモ領域
```

### `03_WorkSpace/` (プロジェクト管理)

プロジェクト全体の進行、アセット納品ルール、フォルダ構成などのドキュメント。

- `Development_Roadmap.md`
- `Asset_Delivery_Guide.md`
- `AssetOrderList.jsonc.md`
- `フォルダ構成v1.x.md` (本書)

### `doc_04/` (アーキテクチャ・設計)

システムの各構造についてまとめられたドキュメント群。

- `00_Setup.md`
- `01_プロジェクト構成.md`
- `02_JSONスキーマ.md`
- `03_コンポーネント構造.md`
- `04_Library・Viewシステム.md`
- `05_アセット管理.md`
- `README.md`

### `src/` (ソースコード実装詳細)

（省略時はv1.6以前と同様、または現行実装に準ずる）

```
src/
├── screens/              # View層：画面コンポーネント
├── parts/                # Module層：機能パーツ
├── components/           # Shared UI層：共通コンポーネント
├── core/                 # Logic層：コアロジック (hooks, managers, services, stores, types, utils)
├── data/                 # Data層：JSONマスターデータ群
├── assets/               # Asset層：アプリ内組み込みリソース
└── styles/               # Global Styles
```

---

## 📦 `package.json` (依存パッケージ等)

現在のプロジェクト構成で主に使用されているライブラリ群を示す `package.json` の内容です。

```json
{
  "name": "100_gamecollection",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.37.0",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.11.0",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.24",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

---

## 🏷️ 更新履歴・備考

- **v1.7**: 現行の `00_WorkSpace` 等の作業フォルダ、`doc_04` 等のドキュメントフォルダ階層を反映。ルート直下の旧ドキュメント群 (`doc00_System`, `doc01`, `doc02`) の整理状況に対応。

**Document Version**: 1.7  
**Last Updated**: 2026-04-04
