# 00. Setup & Tech Stack

## 開発環境構築 (Setup)

このプロジェクトをローカル環境で実行するための手順です。

### 前提条件 (Prerequisites)
- **Node.js**: v18.0.0 以上 (推奨)
- **Package Manager**: npm (または yarn, pnpm)

### インストール (Installation)

プロジェクトのルートディレクトリで以下のコマンドを実行し、依存ライブラリをインストールします。

```bash
npm install
```

### 開発サーバー起動 (Run Dev Server)

ローカルサーバーを起動します。

```bash
npm run dev
```

起動後、ターミナルに表示されるURL（通常は [http://localhost:5173](http://localhost:5173)）にブラウザでアクセスしてください。

### ビルド (Build)

本番環境向けにビルドする場合のコマンドです。`dist` フォルダに静的ファイルが出力されます。

```bash
npm run build
```

---

## 技術スタック (Technology Stack)

主要な使用パッケージとバージョン情報です（`package.json` より）。

| カテゴリ | パッケージ名 | バージョン | 概要 |
| :--- | :--- | :--- | :--- |
| **Framework** | **React** | `^19.2.0` | UI構築ライブラリ（最新のv19系） |
| **Build Tool** | **Vite** | `^7.2.4` | 高速なフロントエンドビルドツール |
| **Language** | **TypeScript** | `~5.9.3` | 静的型付け言語 |
| **Styling** | **Tailwind CSS** | `^4.1.18` | ユーティリティファーストCSSフレームワーク（v4系） |
| **State Management** | **Zustand** | `^5.0.9` | 軽量でシンプルな状態管理ライブラリ |
| **Routing** | **React Router** | `^7.11.0` | SPA用ルーティング（v7系） |
| **Icons** | **Lucide React** | `^0.562.0` | 軽量で美しいアイコンセット |
| **AI Integration** | **Google GenAI SDK** | `^1.37.0` | Gemini API との連携用SDK |

### 開発ツール・その他 (Dev Tools)

| パッケージ名 | バージョン | 概要 |
| :--- | :--- | :--- |
| **ESLint** | `^9.39.1` | JavaScript/TypeScriptの静的検証ツール |
| **PostCSS** | `^8.5.6` | CSS変換ツール（Tailwindの依存） |
| **Autoprefixer** | `^10.4.24` | ベンダープレフィックス自動付与 |

※ バージョンは `package.json` の記載に基づきます（`^` は互換性のある最新版、`~` はパッチバージョンの更新を意味します）。
