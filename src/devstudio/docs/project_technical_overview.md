# プロジェクト技術構成・構造ドキュメント

このドキュメントでは、本アプリケーションの `src` フォルダ構造、`package.json` の構成、および採用されている技術スタックについて説明します。

## 1. フォルダ構造 (`src/` 直下)

`src` ディレクトリ配下は、機能や役割ごとに以下の構造で整理されています。

| フォルダ名 | 内容・役割 |
| :--- | :--- |
| `AndoroidView01` | Android風の垂直レイアウトやモバイルビューをシミュレートする画面・コンポーネント |
| `assets` | 画像、アイコン、フォントなどの静的アセットファイル |
| `components` | 複数の画面で共有される汎用的なUIコンポーネント |
| `core` | アプリケーションの中核となるロジック（状態管理、APIクライアント、定数定義、ユーティリティ） |
| `data` | 初期データ、シード用JSONファイル、モックデータなど |
| `devstudio` | 開発スタジオ（エディタ、ツール、ドキュメント）専用のコンポーネントと文書 |
| `parts` | 特定の機能に特化した部品レベルのコンポーネント |
| `screens` | 各ページのメインビュー（ルーティングの対象となる画面単位） |
| `styles` | グローバルCSS、テーマ定義など |
| `0420_WorkSpace` | 特定の作業用または一時的なワークスペース（日付管理） |

---

## 2. `package.json` の構成

プロジェクトの依存関係と実行スクリプトの概要です。

### 基本情報
- **プロジェクト名**: `100_gamecollection`
- **バージョン**: `0.0.0`
- **タイプ**: `module` (ES Modules)

### 実行スクリプト
- `npm run dev`: 開発サーバー(Vite)の起動
- `npm run build`: TypeScriptの型チェックと本番用ビルドの実行
- `npm run lint`: ESLintによるコード解析
- `npm run preview`: ビルド後の成果物のプレビュー

### 主要な依存関係 (Dependencies)
- **UI Framework**: `react` / `react-dom` (v19.2)
- **Routing**: `react-router-dom` (v7.11)
- **State Management**: `zustand` (v5.0)
- **Icons**: `lucide-react`
- **AI Integration**: `@google/genai` (Google Gemini API)
- **Backend/DB**: `firebase`

### 開発用ツール (DevDependencies)
- **Build Tool**: `vite`
- **CSS Engine**: `tailwindcss` (v4.1) / `postcss` / `autoprefixer`
- **Language**: `typescript` (v5.9)
- **PWA Support**: `vite-plugin-pwa`
- **Image Processing**: `sharp`

---

## 3. 技術スタック (Tech Stack)

| カテゴリ | 採用技術 |
| :--- | :--- |
| **Frontend** | React 19 / TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS 4.x / PostCSS |
| **Routing** | React Router |
| **State Management** | Zustand |
| **AI** | Google Generative AI (Gemini) |
| **Database** | Firebase |
| **Testing/Linting** | ESLint |
| **PWA** | Vite PWA Plugin |

---
*最終更新日: 2026年4月21日*
