# CollectionScreen — 詳細仕様書

> 作成日: 2026-04-06  
> ファイル: [src/screens/11_Collection/CollectionScreen.tsx](src/screens/11_Collection/CollectionScreen.tsx)

---

## 概要

Collection 画面は「各タイトルの素材・データ置き場」として機能する多機能ハブ画面。  
ノベルゲームのアセット管理、BGM再生、AI素材生成、開発管理レポートまでをまとめて提供する。

---

## タブ構成（全体）

### プライマリタブ（上段ナビ）

| タブID | ラベル | 状態 | 内容 |
|--------|--------|------|------|
| `item` | アイテム | 準備中 | — |
| `equipment` | 装備 | 準備中 | — |
| `skill` | スキル | 準備中 | — |
| `ability` | 能力 | 準備中 | — |
| `story` | ストーリー | **実装済** | StoryView |
| `library` | ライブラリー | **実装済** | セカンダリタブ + データビュー |
| `sound` | 音 | **実装済** | BGMPlayerView |
| `keymap` | キーマップ | 準備中 | — |
| `studio` | 工房 | **実装済** | StudioScreen |
| `settings` | 設定 | **実装済** | 設定サブタブ |
| `report` | レポート | **実装済** | ReportView |

「Titleへ戻る」ボタンは右端に固定配置。

---

## ライブラリー (`library`)

### セカンダリタブ（下段ナビ）

| タブID | ラベル | データソース | デフォルト表示 |
|--------|--------|-------------|--------------|
| `character` | キャラクター図鑑 | `characters.json` | custom (CharacterDetailView) |
| `npc` | NPC図鑑 | `npcs.json` | list |
| `enemy` | エネミー図鑑 | `enemies.json` | list |
| `place` | 地名辞典 | `backgrounds.json (.locations)` | list |
| `item_dict` | アイテム図鑑 | `items.json` | list |
| `event` | イベントDB | `events.json` | list |
| `cg` | CG・ギャラリー | `gallery.json` | list |
| `sound_db` | サウンド図鑑 | `bgm.json` + `se.json` (マージ) | list |

**注意:** `character` タブに切り替えると自動で `custom` ビューに変わる。  
他タブでは `custom` ビューだった場合 `list` に戻る。

---

### ビューモード（ViewSwitcher）

ライブラリータブ内のみ表示。4モードを切り替え可能。

| モード | コンポーネント | 説明 |
|--------|--------------|------|
| `list` | `TableView` | テーブル形式。カラム定義で各フィールドをレンダリング |
| `gallery` | `GalleryView` | カード形式のギャラリー表示 |
| `kanban` | `KanbanView` | カンバンボード形式 |
| `custom` | 各 DetailView | タブごとの専用詳細ビュー |

**custom ビューのマッピング:**

| セカンダリタブ | custom ビュー |
|--------------|--------------|
| `character` | `CharacterDetailView` |
| `npc` | `NPCDetailView` |
| `enemy` | `EnemyDetailView` |
| `place` | `BackgroundDetailView` |
| `item_dict` | `TableView`（ITEM_COLUMNS） |
| `sound_db` | `BGMPlayerView` |
| その他 | 「未実装」メッセージ |

---

### テーブルカラム定義

各タブのテーブルは `TableColumn[]` で定義。カスタムレンダラー対応。

#### キャラクター (`CHARACTER_COLUMNS`)
`ID` / `名前` / `説明` / `タグ`（5色ローテーションバッジ）

#### エネミー (`ENEMY_COLUMNS`)
`ID` / `名前` / `説明` / `ステータス`（HP赤・MP青のインライン表示）

#### NPC (`NPC_COLUMNS`)
`ID` / `名前` / `役割`（紫バッジ） / `場所`（緑バッジ + 📍） / `説明`

#### 地名 (`PLACE_COLUMNS`)
`ID` / `地名` / `地域`（黄バッジ） / `説明`

#### アイテム (`ITEM_COLUMNS`)
`ID` / `名前` / `カテゴリ`（回復=緑/素材=黄/装備=青/重要=赤） / `価格`（💰表示） / `説明`

#### イベント (`EVENT_COLUMNS`)
`ID` / `タイトル` / `種別`（main=赤/quest=黄/その他=青） / `章/時期` / `場所` / `概要`

#### CG・ギャラリー (`CG_COLUMNS`)
`ID` / `タイトル` / `カテゴリ`（cg=ピンク/その他=青） / `タグ` / `説明`

#### サウンド (`SOUND_COLUMNS`)
`ID` / `Type`（BGM=青/SE=黄バッジ） / `タイトル` / `アーティスト` / `ファイル名` / `タグ` / `説明`

---

## ストーリー (`story`) — StoryView

**ファイル:** [src/parts/collection/story/StoryView.tsx](src/parts/collection/story/StoryView.tsx)

### サブタブ

| タブ | データソース | 内容 |
|------|------------|------|
| `main` (メイン) | `episodes.json` | 本編エピソード/チャプター管理 |
| `event` (イベント) | `events.json` | クエスト・サブイベント一覧 |

### 表示モード

| モード | 表示内容 |
|--------|---------|
| `stepper` 📋 | 左サイドパネルに StoryStepper（エピソード/チャプターツリー）、右に StoryEventCard グリッド |
| `list` 📝 | StoryListView（テーブル形式で全エピソード/イベント一覧） |

**StoryEventCard** には type バッジ・場所・報酬・難易度・`startStoryID` を表示。  
サイドパネルは `◀/▶` ボタンで開閉可能。

---

## 音 (`sound`) — BGMPlayerView

**ファイル:** [src/parts/collection/specific/BGMPlayerView.tsx](src/parts/collection/specific/BGMPlayerView.tsx)

音楽プレイヤー。`sound` タブと `library > sound_db` の custom ビューで共用。

### レイアウト（左右2カラム）

**左: プレイヤーエリア**

| パーツ | 説明 |
|--------|------|
| アルバムアート | 280×280px 固定、現在は 🎵 アイコン |
| Now Playing カード | 曲名・アーティスト・プログレスバー・再生時間 |
| コントロール | シャッフル / 前 / 再生(停止) / 次 / リピート |

**右: プレイリストエリア**

| パーツ | 説明 |
|--------|------|
| 検索ボックス | 曲名・アーティスト名でリアルタイムフィルタ |
| トラックリスト | `bgm.json` の全曲、クリックで選択・再生 |
| 再生中アイコン | 🔊 (再生中) / 🎵 (停止中) |

**リピートモード:** `off` → `all` → `one` をサイクル  
**データソース:** `src/data/collection/bgm.json`

---

## 工房 (`studio`) — StudioScreen

**ファイル:** [src/screens/12_Studio/StudioScreen.tsx](src/screens/12_Studio/StudioScreen.tsx)

Gemini API を使ってキャラクターアセットの生成プランを作成するツール。  
CollectionScreen の nav をバイパスして直接フルレンダリング。

### レイアウト（左右2カラム）

**左: サイドバー（設定パネル、幅600px固定）**

| セクション | 説明 |
|-----------|------|
| 1. Reference Image | クリック or D&D で画像をアップロード |
| 2. Order JSON | `character_order.json` をプリセットとして表示、編集可能 |
| Analyze ボタン | 画像 + JSON を Gemini API に送り解析結果を生成 |

**右: メインエリア（解析結果）**

| パーツ | 説明 |
|--------|------|
| ヘッダー | キャラ名 / ID / タグ / 「Copy All Prompts」ボタン |
| アセットグリッド | 解析結果のアセット一覧（type バッジ付き画像カード） |
| Copy Prompt | 各カードのプロンプトをクリップボードにコピー |
| Show Prompt | 折りたたみで生プロンプトを表示 |

**依存:** `GeminiService.analyzeCharacterAndOrders()`  
**用途:** LoRA用差分絵の生成プロンプトを自動生成するワークフロー支援

---

## 設定 (`settings`)

サブタブで3つの設定ビューを切り替え。

| サブタブID | ラベル | コンポーネント |
|-----------|--------|--------------|
| `sound_settings` | サウンド | `SoundSettingsView` |
| `screen_settings` | 画面 | `ScreenSettingsView` |
| `key_settings` | キー設定 | `KeyConfigView` |

---

## レポート (`report`) — ReportView

**ファイル:** [src/parts/collection/report/ReportView.tsx](src/parts/collection/report/ReportView.tsx)

Notion DB スタイルの開発管理ツール。

### サブタブ

| タブ | 状態 | 内容 |
|------|------|------|
| 開発日記 | **実装済** | エントリー管理（テーブル/グループ/カンバン） |
| マニュアル | 準備中 | — |
| チュートリアル | 準備中 | — |
| Tips | 準備中 | — |

### 開発日記のビューモード

| モード | アイコン | 説明 |
|--------|---------|------|
| テーブル | `Filter` | Notion 風テーブル、行クリックでドロワー展開 |
| グループ | `LayoutGrid` | 4グループ（本日実装予定/実装済み/未実装/アイディア）の2×2グリッド |
| カンバン | `Columns` | ステータス列ごとのカンバンボード |

### エントリーのステータス / ジャンル

**ステータス:** 未実装 / 確認済み / 実装済み / 変更依頼 / 本日実装予定 / アイディア  
**ジャンル:** UI / システム / バトル / ツール / オーディオ / シナリオ / データ / その他

**インライン編集:** テーブル内の select ドロップダウンでステータス/ジャンルを直接変更可能  
**ノートドロワー:** 行クリックで右からスライドインするサイドパネル。詳細内容・編集フォームを表示。

**データソース:** `src/data/collection/reports.json`

---

## データファイル一覧

**パス:** `src/data/collection/`

| ファイル | 内容 | キー |
|---------|------|------|
| `characters.json` | メインキャラクター | `characters[]` |
| `enemies.json` | エネミー | `enemies[]` |
| `npcs.json` | NPC | `npcs[]` |
| `backgrounds.json` | 背景・ロケーション | `locations[]` |
| `items.json` | アイテム | `items[]` |
| `skills.json` | スキル | ルート配列 |
| `bgm.json` | BGMトラック | `bgm[]` |
| `se.json` | 効果音 | `se[]` |
| `events.json` | イベント・クエスト | `events[]`, `types[]` |
| `episodes.json` | エピソード/チャプター | `episodes[]`, `locations[]` |
| `gallery.json` | CGギャラリー | — |
| `reports.json` | 開発日記エントリー | `devDiary[]`, `statusOptions[]`, `genreOptions[]` |

---

## コンポーネント依存関係

```
CollectionScreen
│
├── [library タブ]
│   ├── ViewSwitcher（list/gallery/kanban/custom）
│   ├── TableView（list モード）
│   ├── GalleryView（gallery モード）
│   ├── KanbanView（kanban モード）
│   └── [custom モード]
│       ├── CharacterDetailView（character）
│       ├── NPCDetailView（npc）
│       ├── EnemyDetailView（enemy）
│       ├── BackgroundDetailView（place）
│       └── BGMPlayerView（sound_db）
│
├── [story タブ]
│   └── StoryView
│       ├── StoryStepper
│       ├── StoryListView
│       └── StoryEventCard
│
├── [sound タブ]
│   └── BGMPlayerView
│
├── [studio タブ]
│   └── StudioScreen（フルオーバーライド）
│
├── [settings タブ]
│   ├── SoundSettingsView
│   ├── ScreenSettingsView
│   └── KeyConfigView
│
└── [report タブ]
    └── ReportView
```

---

## 過去フォルダー0402 との対応

`過去フォルダー0402/` に保管されている旧ドキュメント群:

| フォルダ | 内容 |
|---------|------|
| `00_WorkSpace/` | GameManager / 旧テストエリア |
| `01_WorkSpace/` | Development_Roadmap / フォルダ構成 v1.6~v1.7 / Taskticket |
| `03_WorkSpace/` | AssetOrderList / Asset_Delivery_Guide |
| `API_Test/` | BS01_API連携マニュアル.md |
| `doc_04/` | Setup / プロジェクト構成 / JSONスキーマ / コンポーネント構造 / Library・Viewシステム / アセット管理 / JSON_Design_Specification |

これらは現行コードの設計ベースとなる仕様書群。  
特に `doc_04/04_Library・Viewシステム.md` と `05_アセット管理.md` は Collection 設計の原典。
