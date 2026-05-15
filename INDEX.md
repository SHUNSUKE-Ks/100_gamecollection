# 📚 GameCollection — 資料目次

> 最終更新: 2026-04-27  
> PM: peakexperience  
> Status: Phase 1完了 → Phase 2進行中

---

## 📋 目次（クイックナビ）

1. [現在のプロジェクト資料](#現在のプロジェクト資料-04_workspace)（**優先的にアクセス**）
2. [Archive 資料](#archive-資料過去フォルダー0402)（参考・史料）
3. [タグ索引](#タグ索引)
4. [用語辞典](#用語辞典)

---

## 現在のプロジェクト資料 (`04_WorkSpace/`)

### 🎯 プロジェクト全体把握（最初に読むべき）

| ファイル | 説明 | Tags | 優先度 |
|---------|------|------|--------|
| [**PM_2026-04-17.md**](04_WorkSpace/PM_2026-04-17.md) | **PM ダッシュボード**。全体達成度・タスク・リスク管理。毎日更新 | `PM`, `Dashboard`, `Progress` | ⭐⭐⭐ |
| [**PROGRESS_REPORT_2026-04-16.md**](04_WorkSpace/PROGRESS_REPORT_2026-04-16.md) | Phase 1 完了報告。実装済み機能・ビルド状態・Phase 2 工数見積 | `Phase1`, `Report`, `Estimate` | ⭐⭐⭐ |
| [**PHASE2_SPEC_2026-04-16.md**](04_WorkSpace/PHASE2_SPEC_2026-04-16.md) | **Phase 2 仕様書**。新スキーマ・新機能・工数計画 | `Phase2`, `Spec`, `Schema` | ⭐⭐⭐ |

### 🖼️ UI 設計・画面仕様

| ファイル | 説明 | Tags | 対象 |
|---------|------|------|------|
| [**screen_overview.md**](04_WorkSpace/screen_overview.md) | **スクリーン構成全体**。TITLE / HOME / CHAPTER / NOVEL / BATTLE / MENU / COLLECTION の詳細 | `UI`, `Screen`, `Navigation` | PC版全般 |
| [**collection_detail.md**](04_WorkSpace/collection_detail.md) | **Collection 画面詳細仕様書**。タブ構成・ビューモード・コンポーネント依存関係 | `UI`, `Collection`, `Library` | Collection |
| [**ANDROID_PLAN_2026-04-15.md**](04_WorkSpace/ANDROID_PLAN_2026-04-15.md) | **Android 縦型レイアウト設計**。AndroidLayout / Library / Report の UI 計画 | `Android`, `Design`, `Layout` | Android版 |

### 🔌 API・テスト資料

| ファイル | 説明 | Tags | 対象 |
|---------|------|------|------|
| [API_test/**README.md**](04_WorkSpace/API_test/README.md) | **Hono MiniForge — API テスト資料**。エンドポイント一覧・curl サンプル | `API`, `Test`, `Hono` | バトル・パズルAPI |
| [API_test/HonoMiniForge_TestGuide.md](04_WorkSpace/API_test/HonoMiniForge_TestGuide.md) | API テスト手順ガイド | `API`, `Guide`, `Test` | テスト実行者向け |
| [API_test/TEST_REPORT_2026-04-13.md](04_WorkSpace/API_test/TEST_REPORT_2026-04-13.md) | テスト実行結果 | `Report`, `Test` | 履歴 |

### 🎨 ComfyUI（AI画像生成）資料

| ファイル | 説明 | Tags | 用途 |
|---------|------|------|------|
| **ComfyUI用agent資料/** | 生成AI用プロンプト・テンプレート |  |  |
| ├─ [CLAUDE.md](04_WorkSpace/ComfyUI用agent資料/CLAUDE.md) | ComfyUI Agent の システムプロンプト | `AI`, `Agent`, `ComfyUI` | システムプロンプト |
| ├─ [README.md](04_WorkSpace/ComfyUI用agent資料/README.md) | ComfyUI エージェント概要 | `AI`, `Readme`, `ComfyUI` | 概要 |
| ├─ [granblue.md](04_WorkSpace/ComfyUI用agent資料/granblue.md) | グランブルーファンタジー画風プロンプト | `AI`, `Prompt`, `Style` | キャラ生成 |
| ├─ [pixel.md](04_WorkSpace/ComfyUI用agent資料/pixel.md) | ドット絵（ピクセルアート）生成プロンプト | `AI`, `Prompt`, `Pixel` | 素材生成 |
| ├─ [batch_order_v1.1/](04_WorkSpace/ComfyUI用agent資料/batch_order_v1.1/) | **バッチ発注システム v1.1** | `Batch`, `Template`, `Automation` |  |
| │  ├─ CLAUDE.md | バッチ発注 Agent システムプロンプト |  |  |
| │  ├─ NAMING_RULES.md | ファイル命名規則 | `Naming` | ファイル管理 |
| │  ├─ send_batch.py | 発注スクリプト | `Python`, `Automation` | 実行 |
| │  └─ templates/ | テンプレート JSON（キャラ・背景・ドット） | `Template`, `JSON` |  |
| ├─ [DevStudio_Manual.md](04_WorkSpace/ComfyUI用agent資料/DevStudio_Manual.md) | DevStudio マニュアル（旧） | `Manual`, `DevStudio` | 参考 |
| └─ [DevStudio_Manual_v2.md](04_WorkSpace/ComfyUI用agent資料/DevStudio_Manual_v2.md) | DevStudio マニュアル v2 | `Manual`, `DevStudio` | 最新版 |

### 📦 データ・発注

| ファイル | 説明 | Tags | 対象 |
|---------|------|------|------|
| [CollectionOrders/01_CurrentOrder.md](04_WorkSpace/CollectionOrders/01_CurrentOrder.md) | **現在の発注書**。優先度・納期・検収基準 | `Order`, `Asset`, `Current` | 素材発注 |
| [CollectionOrders/02_OrderHistory.md](04_WorkSpace/CollectionOrders/02_OrderHistory.md) | 発注履歴・完了済み発注 | `Order`, `History` | 履歴 |

### 🛠️ 修正・調査

| ファイル | 説明 | Tags |
|---------|------|------|
| [修正依頼_2026-04-13.md](04_WorkSpace/修正依頼_2026-04-13.md) | バグ・修正要件リスト | `Bug`, `Fix` |
| [story_components.md](04_WorkSpace/story_components.md) | ストーリー・コンポーネント仕様 | `Story`, `Component` |

---

## Archive 資料（`過去フォルダー0402/`）

> ⚠️ **これらは Phase 0〜1 時代の資料です。** 現在のプロジェクトの基盤となった仕様書ですが、設計が進化している可能性があります。  
> 参考・史料用途で確認してください。

### 📖 基本設計資料（最初に読むべき）

| フォルダ・ファイル | 説明 | Tags | 役割 |
|---------|------|------|------|
| [**00_WorkSpace/00_GameManager/**](過去フォルダー0402/00_WorkSpace/00_GameManager/) | **ゲーム製作管理** | `GameManager`, `Schema` |  |
| ├─ [01_製作Phase.md](過去フォルダー0402/00_WorkSpace/00_GameManager/01_製作Phase.md) | 製作フェーズ定義（Phase 1〜4） | `Phase`, `Planning` | 工程定義 |
| ├─ [80_GameContentSystemConfig.md](過去フォルダー0402/00_WorkSpace/00_GameManager/80_GameContentSystemConfig.md) | ゲーム全体システム設定 | `System`, `Config` | システム設計 |
| └─ schemas/ | JSON スキーマ定義 | `Schema`, `JSON` | データ仕様 |

### 🎮 ゲーム企画資料

| フォルダ | 説明 | 含有ファイル | Tags |
|---------|------|--------|------|
| [**10_GamePlanner/**](過去フォルダー0402/00_WorkSpace/10_GamePlanner/) | **ゲーム企画・ゲームデザイン** | 4ファイル | `GameDesign` |
| | 📄 [01_アイテム設計書.md](過去フォルダー0402/00_WorkSpace/10_GamePlanner/01_アイテム設計書.md) | アイテムバランス・種類・効果 | `Item`, `Design` |
| | 📄 [02_武器・防具設計書.md](過去フォルダー0402/00_WorkSpace/10_GamePlanner/02_武器・防具設計書.md) | 装備システム設計 | `Equipment`, `Design` |
| | 📄 [03_スキル・アビリティ設計書.md](過去フォルダー0402/00_WorkSpace/10_GamePlanner/03_スキル・アビリティ設計書.md) | スキル一覧・仕様 | `Skill`, `Ability` |
| | 📄 [04_敵・モンスター設計書.md](過去フォルダー0402/00_WorkSpace/10_GamePlanner/04_敵・モンスター設計書.md) | 敵キャラ・バランス | `Enemy`, `Monster` |

### 📝 シナリオ制作資料

| ファイル | 説明 | Tags | 用途 |
|---------|------|------|------|
| **20_ScenarioWriter/** | シナリオ制作マニュアル | `Scenario`, `Manual` |  |
| ├─ [00_シナリオ制作依頼書.md](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/00_シナリオ制作依頼書.md) | シナリオ作成者向け依頼書 | `Request`, `Template` | 発注用 |
| ├─ [01_シナリオ制作マニュアル_JSON仕様書.md](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/01_シナリオ制作マニュアル_JSON仕様書.md) | JSON スキーマと制作フロー | `JSON`, `Manual` | スキーマ |
| ├─ template_scenario.json | シナリオテンプレート | `Template`, `JSON` | サンプル |
| └─ sample_scenario.json | シナリオサンプル | `Sample`, `JSON` | 参考実装 |

### 🎨 グラフィック資料

| ファイル | 説明 | Tags | 対象 |
|---------|------|------|------|
| **30_Graphicker/** | グラフィック制作仕様 | `Graphics` |  |
| ├─ [01_素材規格書.md](過去フォルダー0402/00_WorkSpace/30_Graphicker/01_素材規格書.md) | 立ち絵・背景・CG の解像度・形式基準 | `Spec`, `Asset` | 素材制作者向け |
| └─ [02_命名規則.md](過去フォルダー0402/00_WorkSpace/30_Graphicker/02_命名規則.md) | ファイル命名規則（キャラ・背景・CG） | `Naming`, `Convention` | ファイル管理 |

### 🎵 サウンド資料

| ファイル | 説明 | Tags | 対象 |
|---------|------|------|------|
| **50_SoundCreator/** | オーディオ・BGM 仕様 | `Sound`, `Audio` |  |
| ├─ [01_音声規格書.md](過去フォルダー0402/00_WorkSpace/50_SoundCreator/01_音声規格書.md) | BGM / SE のビットレート・形式基準 | `Spec`, `Format` | 音制作者向け |
| └─ [02_命名規則.md](過去フォルダー0402/00_WorkSpace/50_SoundCreator/02_命名規則.md) | BGM / SE ファイル命名規則 | `Naming`, `Convention` | ファイル管理 |

### 🔧 Archive — 倉庫（古い設計・参考資料）

| フォルダ | 説明 | Tags | 備考 |
|---------|------|------|------|
| **倉庫/doc01/古い設計資料/** | Phase 0 時代の古い設計書 | `Archive`, `Obsolete` | 参考のみ |
| | [Collection_レイアウト_Tags.md](過去フォルダー0402/00_WorkSpace/倉庫/doc01/古い設計資料/Collection_レイアウト_Tags.md) | 古い Collection UI 設計 | UI設計 |
| | [Collection設計書.md](過去フォルダー0402/00_WorkSpace/倉庫/doc01/古い設計資料/Collection設計書.md) | 古い Collection スキーマ | Schema |
| **倉庫/doc01/新しい設計思想/** | Phase 1 時代の詳細設計書 | `Archive`, `Reference` | 現在の設計ベース |
| | [フォルダ構成v1.6.md](過去フォルダー0402/00_WorkSpace/倉庫/doc01/新しい設計思想/00‗セットアップ/フォルダ構成v1.6.md) | フォルダ構成設計 | Structure |
| | [クエストJSONスキーマ.md](過去フォルダー0402/00_WorkSpace/倉庫/doc01/新しい設計思想/01_シナリオ作成/クエストJSONスキーマ.md) | クエスト JSON スキーマ | Schema |
| | [シナリオ作成マニュアル.md](過去フォルダー0402/00_WorkSpace/倉庫/doc01/新しい設計思想/01_シナリオ作成/シナリオ作成マニュアル.md) | シナリオ制作マニュアル | Manual |

---

## 📊 タグ索引

資料を目的別に検索したい場合は、以下のタグを参照してください：

### 🎯 用途別タグ

| タグ | 説明 | 含有資料数 |
|-----|------|----------|
| **`PM`** | プロジェクト管理・ダッシュボード | 1 |
| **`Phase1`, `Phase2`** | 各フェーズの設計・進捗 | 3+ |
| **`UI`** | 画面設計・レイアウト | 3+ |
| **`Schema`** | JSON スキーマ・データ仕様 | 5+ |
| **`API`** | API 連携・テスト | 3+ |
| **`Android`** | モバイル・縦型対応 | 2 |
| **`AI`** | 生成AI（ComfyUI）・プロンプト | 5+ |
| **`Design`** | ゲーム企画・バランス設計 | 4+ |
| **`Manual`** | 制作マニュアル・ガイド | 5+ |
| **`Naming`** | ファイル命名規則 | 3 |
| **`Order`** | 素材発注・納品 | 2 |
| **`Archive`** | 参考・履歴資料 | 10+ |

### 🏢 対象別タグ

| タグ | 対象 | 読み手 |
|-----|------|--------|
| **`PM`** | プロジェクト全体 | PM・マネージャー |
| **`Developer`** | 実装者向け | 開発者 |
| **`Scenario`** | シナリオ制作 | シナリオライター |
| **`Graphics`** | グラフィック制作 | グラフィッカー |
| **`Sound`** | サウンド制作 | サウンドクリエイター |
| **`Designer`** | デザイン | ゲームデザイナー |

---

## 📖 用語辞典

### プロジェクト用語

| 用語 | 定義 | 関連資料 |
|-----|------|---------|
| **NanoNovel** | このプロジェクトの核となるノベルゲームエンジン | screen_overview.md |
| **GameCollection** | NanoNovel + 素材ライブラリー＋開発管理ツールの統合 | PM_2026-04-17.md |
| **Collection** | キャラ・背景・BGM・敵等のJSONデータを閲覧・管理する画面 | collection_detail.md |
| **WorkSpace** | MD ドキュメント・発注書・プロット手帳を統合した開発管理画面 | ANDROID_PLAN_2026-04-15.md |
| **AndroidLayout** | スマホ縦型専用 UI。ハンバーガーメニュー＋ Gallery | ANDROID_PLAN_2026-04-15.md |

### データ構造用語

| 用語 | 定義 | スキーマ |
|-----|------|---------|
| **TitleDB** | プロジェクト単位のメタデータ（名前・サムネ・ステータス） | PHASE2_SPEC_2026-04-16.md |
| **characters.json** | キャラクター図鑑。立ち絵・表情差分・CG 含む | PHASE2_SPEC_2026-04-16.md |
| **enemies.json** | 敵キャラ図鑑 | collection_detail.md |
| **backgrounds.json** | 背景・ロケーション。複数背景画像登録対応 | PHASE2_SPEC_2026-04-16.md |
| **bgm.json** | BGM トラック。アルバム管理対応 | PHASE2_SPEC_2026-04-16.md |
| **episodes.json** | エピソード・チャプター | collection_detail.md |

### 機能用語

| 用語 | 説明 | 詳細 |
|-----|------|------|
| **StoryView** | ストーリー管理ビュー（StoryStepper + StoryEventCard） | collection_detail.md |
| **BGMPlayerView** | 音楽プレイヤー（検索・再生・プレイリスト） | collection_detail.md |
| **StudioScreen** | Gemini API を使ったキャラアセット生成プラン作成ツール | collection_detail.md |
| **ImageInbox** | 素材アップロード・テンポラリ保管 | PM_2026-04-17.md |
| **RecordCardModal** | DB エントリ追加フォーム | PM_2026-04-17.md |

---

## 🔗 クイックリンク

### よく見るファイル

- **毎日確認**: [PM_2026-04-17.md](04_WorkSpace/PM_2026-04-17.md)（PM ダッシュボード）
- **開発者向け**: [PHASE2_SPEC_2026-04-16.md](04_WorkSpace/PHASE2_SPEC_2026-04-16.md)（新規仕様）
- **素材発注**: [CollectionOrders/01_CurrentOrder.md](04_WorkSpace/CollectionOrders/01_CurrentOrder.md)
- **API テスト**: [API_test/README.md](04_WorkSpace/API_test/README.md)

### テンプレート・サンプル

- **シナリオ**: [sample_scenario.json](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/sample_scenario.json)
- **ComfyUI**: [batch_order_v1.1/](04_WorkSpace/ComfyUI用agent資料/batch_order_v1.1/)

---

## 📝 資料更新ガイドライン

各資料は以下のヘッダーを持つようにしてください：

```markdown
# タイトル

> 作成日: YYYY-MM-DD  
> 最終更新: YYYY-MM-DD  
> 対象: [PM / 開発者 / デザイナー / ...]  
> Status: [Draft / Ready / Approved / Archived]
```

---

## 🗂️ フォルダ構成（一覧）

```
100_gamecollection/
├── 📄 INDEX.md  (本ファイル)
├── 04_WorkSpace/  (★ 現在のプロジェクト)
│   ├── 📄 PM_2026-04-17.md
│   ├── 📄 PHASE2_SPEC_2026-04-16.md
│   ├── 📄 PROGRESS_REPORT_2026-04-16.md
│   ├── 📄 screen_overview.md
│   ├── 📄 collection_detail.md
│   ├── 📄 ANDROID_PLAN_2026-04-15.md
│   ├── 📁 API_test/
│   ├── 📁 ComfyUI用agent資料/
│   ├── 📁 CollectionOrders/
│   └── 📁 ...
│
└── 過去フォルダー0402/  (Archive)
    ├── 📁 00_WorkSpace/
    │   ├── 📁 00_GameManager/
    │   ├── 📁 10_GamePlanner/
    │   ├── 📁 20_ScenarioWriter/
    │   ├── 📁 30_Graphicker/
    │   ├── 📁 50_SoundCreator/
    │   └── 📁 倉庫/  (古い設計)
    └── ...
```

---

## 🎯 読者別ガイド

### 👨‍💼 PM / マネージャー向け
1. [PM_2026-04-17.md](04_WorkSpace/PM_2026-04-17.md) — 全体進捗
2. [PROGRESS_REPORT_2026-04-16.md](04_WorkSpace/PROGRESS_REPORT_2026-04-16.md) — 工数見積
3. [CollectionOrders/01_CurrentOrder.md](04_WorkSpace/CollectionOrders/01_CurrentOrder.md) — 素材発注

### 👨‍💻 開発者向け
1. [screen_overview.md](04_WorkSpace/screen_overview.md) — UI 全体像
2. [collection_detail.md](04_WorkSpace/collection_detail.md) — Collection 実装
3. [PHASE2_SPEC_2026-04-16.md](04_WorkSpace/PHASE2_SPEC_2026-04-16.md) — 新仕様
4. [ANDROID_PLAN_2026-04-15.md](04_WorkSpace/ANDROID_PLAN_2026-04-15.md) — モバイル対応

### 🎨 グラフィッカー向け
1. [30_Graphicker/01_素材規格書.md](過去フォルダー0402/00_WorkSpace/30_Graphicker/01_素材規格書.md)
2. [30_Graphicker/02_命名規則.md](過去フォルダー0402/00_WorkSpace/30_Graphicker/02_命名規則.md)
3. [PHASE2_SPEC_2026-04-16.md](04_WorkSpace/PHASE2_SPEC_2026-04-16.md) — サイズ規格表

### ✍️ シナリオライター向け
1. [20_ScenarioWriter/01_シナリオ制作マニュアル_JSON仕様書.md](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/01_シナリオ制作マニュアル_JSON仕様書.md)
2. [20_ScenarioWriter/sample_scenario.json](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/sample_scenario.json)

### 🎵 サウンドクリエイター向け
1. [50_SoundCreator/01_音声規格書.md](過去フォルダー0402/00_WorkSpace/50_SoundCreator/01_音声規格書.md)
2. [50_SoundCreator/02_命名規則.md](過去フォルダー0402/00_WorkSpace/50_SoundCreator/02_命名規則.md)

---

**このINDEX.mdは、すべての資料への入口です。定期的に更新してください。**

