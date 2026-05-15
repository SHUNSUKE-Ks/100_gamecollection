# Collection機能 アジャイル開発計画

`src/screens/11_Collection` および `src/assets/data/Collection/Library` を基点とした、コレクション機能の段階的実装計画です。

## 全体方針
- **フェーズ単位**で「動くもの」を作り、DONEとする。
- 新しい**Screens設計思想**と**Libraryデータ集約**に従う。
- UIは**TSX**で実装する。

---

## 📅 Phase 1: 基盤構築 (Skeleton & Data)

**目標**: コレクション画面が開き、メニューが表示され、基礎データが読み込める状態。

### DONE定義
- [x] **データ移行**: `src/assets/data/Collection/Library` にJSONファイル（charas, items, etc.）が配置されている。
- [x] **Router設定**: アプリ起動時に「Collection」画面へ遷移できる（またはデバッグメニューから開ける）。
- [x] **Layout実装**: `CollectionScreen.tsx` が作成され、左サイドバー（メニュー）と右メインエリアのレイアウトができている。
- [ ] **Menu表示**: ヘッダー/サブヘッダー（Library, Sound, Story等）がメニューに表示されている。

---

## 📅 Phase 2: ビュー機能 & キャラクター図鑑 (Views & Character DB)

**目標**: NotionライクなView切り替え機能を実装し、キャラ一覧を表示する。

### DONE定義
- [x] **View Switcher**: リスト/ギャラリー/カンバンを切り替えるUIコンポーネントの実装。
- [x] **Data Loader**: `characters.json` を読み込む汎用フックの実装。
- [x] **List View (Table)**: データを表形式で表示するコンポーネント。
- [x] **Gallery View (Grid)**: データを画像メインのグリッドで表示するコンポーネント。
- [x] **Kanban View (Board)**: データをグループ（所属など）ごとにカンバン表示するコンポーネント。
- [ ] **Assets連携**: 画像パス (`src/assets/chara/...`) が正しく解決され、画像が表示される。

---

---

## 📅 Phase 3: ライブラリ網羅 & DBカラム適用 (Full Library & DB Columns)

**目標**: `Collection_DBカラム一覧.md` に基づき、正しいカラムでデータを表示する。フォルダ構成のリファクタリングも行う。

### DONE定義
- [x] **DB Definition**: `Collection_DBカラム一覧.md` の内容を `TableView` のヘッダーに反映する。
- [x] **Refactoring**: フォルダ構成を v1.4 に準拠させる (`src/parts/collection/`, `src/data/collection/`)。
- [x] **NPC/Enemy DB**: `npcs.json`, `enemies.json` を表示できる。
- [ ] **Universal Viewer**: キャラ図鑑のコンポーネントを汎用化する。

---

## 📅 Phase 4: ギャラリー & サウンド (Gallery & Sound)

**目標**: CGギャラリーとサウンドテスト機能の実装。

### DONE定義
- [ ] **Gallery UI**: `gallery.json` を読み込み、CG/イベントスチルをグリッド表示できる。
- [ ] **Image Modal**: 画像をクリックすると拡大表示（ライトボックス）できる。
- [ ] **Sound Player**: `SoundManager` と連携し、BGMリストの再生・停止ができる。
- [ ] **Tag Search**: ギャラリー内の画像をタグ検索できる。

---

## 📅 Phase 5: リッチ機能 & 仕上げ (Polish)

**目標**: 検索、ソート、演出強化、レスポンシブ対応。

### DONE定義
- [ ] **Search Bar**: 全データを横断して検索できる（名前、説明文）。
- [ ] **Collapsible Menu**: サイドバーの折りたたみ機能（モバイル対応）。
- [ ] **Animations**: 画面遷移やリスト表示時のフェードイン演出。
- [ ] **Theme**: 全体のCSSデザイン調整（Glassmorphism等のPremium感）。

---

## 技術スタック参照

- **UI**: `src/screens/11_Collection/`
- **Component**: `src/components/` (共通カード、リスト、モーダル)
- **Data**: `src/assets/data/Collection/Library/`
- **State**: `src/core/stores/gameStore.ts` (解放フラグ参照)
