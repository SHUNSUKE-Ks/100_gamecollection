# BGM Player 独立アプリ移行＆引継ぎガイド

このドキュメントは、現在の`NanoNovel`プロジェクトから**BGM Player機能**を切り出し、独立したReactアプリケーションとして構築するための手順と資料をまとめたものです。

## 1. 概要
- **目的**: BGM Player機能の独立コンポーネント化および単体アプリ化
- **主な機能**:
    - 楽曲の再生・一時停止・停止
    - トラックリスト表示（フィルタリング機能付き）
    - 音量調整、シーク機能
    - リピート（1曲/全曲）、シャッフル再生
- **技術スタック**: React (Hooks), TypeScript, CSS-in-JS (Inline Styles for portability)

## 2. 配布ファイル構成
`doc01\BGM_Player\source` フォルダ内に、独立アプリですぐに使える形のソースコード一式を格納しました。

```text
source/
├── BGMPlayer.tsx       # メインUIコンポーネント（スタイル・ロジック統合）
├── useBGMPlayer.ts     # 再生ロジックを管理するカスタムフック
└── bgm.json            # 楽曲データ定義
```

## 3. 独立アプリの構築手順 (Vite + React)

新しいReactプロジェクトを作成し、BGM Playerを移植する手順は以下の通りです。

### 手順 1: プロジェクトの作成
ターミナルで以下のコマンドを実行し、ViteでReact(TypeScript)プロジェクトを作成します。

```bash
npm create vite@latest bgm-player-app -- --template react-ts
cd bgm-player-app
npm install
```

### 手順 2: ソースコードの配置
作成されたプロジェクトの `src` フォルダ内に、配布ファイルをコピーします。

copy source/* -> bgm-player-app/src/

### 手順 3: アセット（音楽ファイル）の準備
`public` フォルダ内に `bgm` フォルダを作成し、音楽ファイルを配置します。
※ `useBGMPlayer.ts` のデフォルトパス設定 (`/bgm/`) に合わせてください。

```bash
bgm-player-app/
├── public/
│   └── bgm/
│       ├── _OP_.mp3
│       ├── Battle_igiigi.mp3
│       └── ... (bgm.jsonのfilenameと一致させる)
```

また、背景画像を使用する場合は `public` フォルダに配置し、`BGMPlayer.tsx` の `backgroundOverlay` スタイル内のパスを修正してください。

### 手順 4: アプリへの組み込み
`src/App.tsx` を以下のように編集して、BGMPlayerを表示します。

```tsx
import { BGMPlayer } from './BGMPlayer';
import './App.css'; // 必要に応じてリセットCSSなど

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0 }}>
      <BGMPlayer />
    </div>
  );
}

export default App;
```

### 手順 5: 実行
```bash
npm run dev
```

## 4. コンポーネント詳細

### `useBGMPlayer.ts`
- **役割**: オーディオ要素(`Apple HTMLAudioElement`)の管理、再生状態の管理を行うHooks。
- **依存**: `react` のみ。外部ライブラリ不要。
- **設定**: 引数 `basePath` で音楽ファイルのルートパスを指定可能。デフォルトは `/bgm/` です。

### `BGMPlayer.tsx`
- **役割**: UI表示。
- **スタイル**: コンポーネント内に `styles` オブジェクトとして定義されているため、外部CSSファイルへの依存はありません（ゼロコンフィグで使用可能）。
- **アイコン**: 文字列（絵文字）を使用しているため、`lucide-react` などのアイコンライブラリは不要です。

### `bgm.json`
- **役割**: 楽曲リストの定義。
- **構造**: `bgm` 配列内に各トラックの情報を記述します。`filename` は `public/bgm/` 以下のファイル名と一致させる必要があります。

## 5. カスタマイズのポイント
- **デザイン変更**: `BGMPlayer.tsx` 内の `styles` オブジェクトを編集してください。
- **機能追加**: `useBGMPlayer.ts` の `reducer` にアクションを追加することで、API経由でのプレイリスト読み込みなども実装可能です。

---
このガイドと `source` フォルダ内のファイルを使用することで、どの環境でも即座にBGM Playerを再現できます。
