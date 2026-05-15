# NanoNovel - Gemini AI Custom Prompt (New Philosophy)

このドキュメントは、**新しいノベルゲーム思想**に基づいてNanoNovelプロジェクトを開発するためのAI指示書です。

---

## 🎯 プロジェクト概要

**NanoNovel** は、React + Vite + TypeScript で構築された **JSON駆動型 PWA ノベルゲームエンジン** です。
**画面単位の構成 (Screens)** と **集約型ライブラリ (Library)** を特徴とします。

### 核心思想 (Development Philosophy)

1.  **JSON駆動 (JSON Driven)**
    *   コードは「JSONの解釈器」である。仕様の正（Source of Truth）は `src/assets/data` 内の JSON にある。
    *   JSONとアセットを差し替えるだけで、全く別のゲームとしてリリース可能（Gitベースのリリース管理）。

2.  **Screens & Library 構造**
    *   **UI**: `src/screens` 配下に画面/機能単位で配置（Title, Novel, Battle, Collection等）。
    *   **Data**: `src/assets/data/Collection/Library` に全データベースを集約。ゲームの全構成要素はここにある。
    *   **Asset**: Notion DB のような統括管理を行う。

3.  **独立性と再利用性**
    *   Novelパート、Battleパート、Collectionパートは独立し、相互依存を避ける。
    *   共通機能は `src/core` (Managers, Stores, Hooks) に集約。

---

## 📂 新・フォルダ構成 (Directory Structure)

```
NanoNovel/
├── src/
│   ├── app/              # アプリケーション設定
│   ├── screens/          # ▼ 画面UI単位コンポーネント
│   │   ├── 00_GameManager/
│   │   ├── 01_Title/     # タイトル画面
│   │   ├── 02_NovelPart/ # ノベルパート
│   │   ├── 03_BattlePart/# バトルパート
│   │   ├── 10_RESULTPart/# リザルト
│   │   └── 11_Collection/# コレクション画面
│   ├── components/       # 共通UI部品
│   ├── core/             # コアロジック (Managers, Hooks, Stores)
│   ├── assets/           # ▼ アセット＆データ
│   │   ├── data/         # ★ JSONデータ格納場所
│   │   │   ├── Novel/    # シナリオ進行用 (scenario.json, episodes.json)
│   │   │   ├── Collection/
│   │   │   │   └── Library/ # ★ 全DB集約 (characters, items, skills, etc.)
│   │   │   └── Result/   # リザルト設計
│   │   ├── bg/           # 背景画像
│   │   ├── chara/        # キャラクター画像
│   │   └── ...
│   └── styles/
└── doc01/                # ドキュメント
    ├── 新しい設計思想/   # 現在の仕様定義
    └── ...
```

---

## 📄 データ仕様 (Data Specification)

### 1. シナリオID形式 (Scenario ID)
フォーマット: `EP_CH_TXT`

```
例:
01_01_01  → Episode 1, Chapter 1, Text 1
02_03_015 → Episode 2, Chapter 3, Text 15
```

### 2. アセット発注書スキーマ (NanoBanana Order)
`doc01/新しい設計思想/Assets_OrderList_Ver1.1` 内のJSON定義を参照。
AI画像生成（NanoBanana）への発注は、このスキーマに従う。

### 3. ライブラリ (`src/assets/data/Collection/Library`)
以下のファイルが集約されている：
*   `characters.json`
*   `enemies.json`
*   `items.json`
*   `skills.json`
*   `backgrounds.json`
*   ...他多数

---

## 💻 技術スタック (Tech Stack)

*   **Language**: TypeScript (`.tsx`, `.ts`) ※JSXからの完全移行
*   **Framework**: React 19 + Vite
*   **State Management**: Zustand
*   **Routing**: React Router (Screens構成に対応)

---

## 🤖 AI開発上のルール (Rules for AI)

1.  **ファイルの配置**:
    *   UIコンポーネントは `src/screens` 内の適切な番号フォルダ（例: `02_NovelPart`）に作成・修正すること。
    *   JSONデータは `src/assets/data/Collection/Library` または `Novel` から読み込むこと。

2.  **インポートパス**:
    *   エイリアス `@/` を活用し、深い相対パス (`../../`) を避ける。
    *   `useScenario` などのHooksは `src/core/hooks` からインポート。

3.  **コード生成**:
    *   必ず **TypeScript** で記述する。
    *   型定義は `src/core/types` を参照・更新する。

4.  **仕様の確認**:
    *   迷ったときは `doc01/新しい設計思想/src_structure_proposal.md` および `assets_structure_proposal.md` を確認する。
