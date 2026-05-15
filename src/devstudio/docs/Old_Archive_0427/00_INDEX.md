# 📚 GameCollection — 資料目次

> 最終更新: 2026-04-27  
> PM: peakexperience  
> Status: Phase 1完了 → Phase 2進行中
> Archive Location: `src/devstudio/docs/Old_Archive_0427/`

---

## 📋 クイックアクセス

### 🎯 最優先（毎日確認）
- [PM_2026-04-17.md](04_WorkSpace/PM_2026-04-17.md) — **PM ダッシュボード**
- [PHASE2_SPEC_2026-04-16.md](04_WorkSpace/PHASE2_SPEC_2026-04-16.md) — **Phase 2 仕様書**
- [PROGRESS_REPORT_2026-04-16.md](04_WorkSpace/PROGRESS_REPORT_2026-04-16.md) — **進捗報告**

### 📚 現在のプロジェクト資料 (`04_WorkSpace/`)
**UI設計 / API テスト / 発注書 / ComfyUI資料**
- [screen_overview.md](04_WorkSpace/screen_overview.md) — スクリーン構成全体
- [collection_detail.md](04_WorkSpace/collection_detail.md) — Collection 画面詳細
- [ANDROID_PLAN_2026-04-15.md](04_WorkSpace/ANDROID_PLAN_2026-04-15.md) — Android設計
- [API_test/README.md](04_WorkSpace/API_test/README.md) — API テスト資料
- [CollectionOrders/01_CurrentOrder.md](04_WorkSpace/CollectionOrders/01_CurrentOrder.md) — 現在の発注書

### 📖 Archive 資料 (`過去フォルダー0402/`)
**ゲーム企画 / シナリオ / グラフィック / サウンド仕様**
- [00_GameManager/](過去フォルダー0402/00_WorkSpace/00_GameManager/) — ゲーム製作管理
- [10_GamePlanner/](過去フォルダー0402/00_WorkSpace/10_GamePlanner/) — ゲーム企画資料
- [20_ScenarioWriter/](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/) — シナリオ制作マニュアル
- [30_Graphicker/](過去フォルダー0402/00_WorkSpace/30_Graphicker/) — グラフィック規格
- [50_SoundCreator/](過去フォルダー0402/00_WorkSpace/50_SoundCreator/) — サウンド仕様

---

## 🏷️ タグ検索

| 目的 | タグ | 関連資料 |
|-----|------|---------|
| **PM・進捗管理** | `PM`, `Dashboard` | PM_2026-04-17.md |
| **UI・画面設計** | `UI`, `Design` | screen_overview.md, collection_detail.md |
| **仕様書** | `Schema`, `Spec` | PHASE2_SPEC_2026-04-16.md |
| **API テスト** | `API`, `Test` | API_test/README.md |
| **AI生成** | `AI`, `ComfyUI` | ComfyUI用agent資料/ |
| **ゲーム企画** | `Design`, `GameDesign` | 10_GamePlanner/ |
| **制作マニュアル** | `Manual` | 20_ScenarioWriter/, 30_Graphicker/ |
| **グラフィック** | `Graphics`, `Spec` | 30_Graphicker/01_素材規格書.md |
| **サウンド** | `Sound`, `Audio` | 50_SoundCreator/ |

---

## 👤 読者別ガイド

### PM・マネージャー
1. [PM_2026-04-17.md](04_WorkSpace/PM_2026-04-17.md) — 全体進捗
2. [PROGRESS_REPORT_2026-04-16.md](04_WorkSpace/PROGRESS_REPORT_2026-04-16.md) — 工数見積
3. [CollectionOrders/01_CurrentOrder.md](04_WorkSpace/CollectionOrders/01_CurrentOrder.md) — 素材発注

### 開発者
1. [screen_overview.md](04_WorkSpace/screen_overview.md) — UI 全体像
2. [collection_detail.md](04_WorkSpace/collection_detail.md) — Collection 実装
3. [PHASE2_SPEC_2026-04-16.md](04_WorkSpace/PHASE2_SPEC_2026-04-16.md) — 新仕様

### グラフィッカー
1. [30_Graphicker/01_素材規格書.md](過去フォルダー0402/00_WorkSpace/30_Graphicker/01_素材規格書.md) — 解像度・形式
2. [30_Graphicker/02_命名規則.md](過去フォルダー0402/00_WorkSpace/30_Graphicker/02_命名規則.md) — 命名規則
3. [PHASE2_SPEC_2026-04-16.md](04_WorkSpace/PHASE2_SPEC_2026-04-16.md) — サイズ規格表

### シナリオライター
1. [20_ScenarioWriter/01_シナリオ制作マニュアル_JSON仕様書.md](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/01_シナリオ制作マニュアル_JSON仕様書.md)
2. [20_ScenarioWriter/sample_scenario.json](過去フォルダー0402/00_WorkSpace/20_ScenarioWriter/sample_scenario.json)

### サウンドクリエイター
1. [50_SoundCreator/01_音声規格書.md](過去フォルダー0402/00_WorkSpace/50_SoundCreator/01_音声規格書.md)
2. [50_SoundCreator/02_命名規則.md](過去フォルダー0402/00_WorkSpace/50_SoundCreator/02_命名規則.md)

---

## 📊 用語辞典

| 用語 | 定義 |
|-----|------|
| **NanoNovel** | ノベルゲームエンジン |
| **GameCollection** | NanoNovel + ライブラリー + 開発管理ツール |
| **Collection** | キャラ・背景・BGM・敵等を管理する画面 |
| **WorkSpace** | MD ドキュメント・発注書・プロット手帳の管理画面 |
| **TitleDB** | プロジェクト単位のメタデータ |
| **characters.json** | キャラクター図鑑（立ち絵・表情差分・CG） |
| **bgm.json** | BGM トラック管理 |
| **AndroidLayout** | スマホ縦型専用 UI |

---

## 🗂️ フォルダ構成

```
src/devstudio/docs/Old_Archive_0427/
├── 00_INDEX.md  (本ファイル)
├── 04_WorkSpace/  (現在のプロジェクト)
│   ├── PM_2026-04-17.md
│   ├── PHASE2_SPEC_2026-04-16.md
│   ├── PROGRESS_REPORT_2026-04-16.md
│   ├── screen_overview.md
│   ├── collection_detail.md
│   ├── ANDROID_PLAN_2026-04-15.md
│   ├── API_test/
│   ├── ComfyUI用agent資料/
│   └── CollectionOrders/
│
└── 過去フォルダー0402/  (Archive)
    ├── 00_WorkSpace/
    │   ├── 00_GameManager/
    │   ├── 10_GamePlanner/
    │   ├── 20_ScenarioWriter/
    │   ├── 30_Graphicker/
    │   ├── 50_SoundCreator/
    │   └── 倉庫/
    ├── 01_WorkSpace/
    ├── 03_WorkSpace/
    └── API_Test/
```

---

**Archive 保管日**: 2026-04-27  
**Archive管理者**: peakexperience  
**Location**: src/devstudio/docs/Old_Archive_0427/

このフォルダ内のすべての資料は DevStudio から閲覧・検索可能です。

