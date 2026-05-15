// ============================================================
// Archive Doc Loader
// Old_Archive_0427 のドキュメントを DevStudio Doc Library に登録
// ============================================================

import type { Doc, DocTag } from '@/devstudio/core/types';

export const ARCHIVE_TAG: DocTag = {
    id: 'tag_archive',
    name: 'Archive',
    color: '#9ca3af',  // gray
    createdAt: Date.now(),
};

/**
 * Archive ドキュメントのシード（初期化）
 * Note: markdown 内容は以下の README で確認可能
 */
export const ARCHIVE_DOCS: Doc[] = [
    {
        id: 'arc_index',
        title: '【Archive】資料目次 — Old_Archive_0427',
        body: `# 📚 GameCollection — 資料目次 (Archive)

> 保管日: 2026-04-27
> Location: \`src/devstudio/docs/Old_Archive_0427/\`

## 主要資料

### 現在のプロジェクト（04_WorkSpace/）
- **PM_2026-04-17.md** — 進捗管理・ダッシュボード
- **PHASE2_SPEC_2026-04-16.md** — Phase 2 仕様書
- **PROGRESS_REPORT_2026-04-16.md** — 進捗報告
- **screen_overview.md** — UI 全体構成
- **collection_detail.md** — Collection 画面詳細
- **API_test/** — API テスト資料

### 初期段階の資料（過去フォルダー0402/）
- **00_GameManager/** — ゲーム製作管理
- **10_GamePlanner/** — ゲーム企画
- **20_ScenarioWriter/** — シナリオ制作マニュアル
- **30_Graphicker/** — グラフィック規格
- **50_SoundCreator/** — サウンド仕様

詳細は各ドキュメントのアーカイブエントリを参照してください。`,
        tagIds: ['tag_archive'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: 'Old_Archive_0427',
    },
    {
        id: 'arc_navigation',
        title: '【Archive】ナビゲーション — ファイル一覧',
        body: `# Old_Archive_0427 — ドキュメントナビゲーション

## 📁 ファイル構成

### 現在のプロジェクト \`04_WorkSpace/\`
最新の開発・設計資料が保管されています。

\`\`\`
04_WorkSpace/
├── PM_2026-04-17.md                    (PM ダッシュボード)
├── PHASE2_SPEC_2026-04-16.md           (Phase 2 仕様書)
├── PROGRESS_REPORT_2026-04-16.md       (進捗報告)
├── screen_overview.md                  (UI 全体像)
├── collection_detail.md                (Collection 詳細)
├── ANDROID_PLAN_2026-04-15.md          (Android 設計)
├── story_components.md                 (ストーリーコンポーネント)
├── 修正依頼_2026-04-13.md              (修正依頼追跡)
│
├── API_test/
│   ├── README.md
│   ├── HonoMiniForge_TestGuide.md
│   ├── HonoMiniForge_TestChecklist.md
│   └── TEST_REPORT_2026-04-13.md
│
├── CollectionOrders/
│   ├── 01_CurrentOrder.md
│   └── 02_OrderHistory.md
│
└── ComfyUI用agent資料/
    ├── README.md
    ├── DevStudio_Manual.md
    ├── DevStudio_Manual_v2.md
    ├── ENV.md
    └── batch_order_v1.1/
\`\`\`

### アーカイブ資料 \`過去フォルダー0402/\`
初期段階の設計・企画・マニュアルが保管されています。

\`\`\`
過去フォルダー0402/
├── 00_WorkSpace/
│   ├── 00_GameManager/          (ゲーム製作フロー)
│   ├── 10_GamePlanner/          (ゲーム企画資料)
│   ├── 20_ScenarioWriter/       (シナリオ制作マニュアル)
│   ├── 30_Graphicker/           (グラフィック規格)
│   ├── 50_SoundCreator/         (サウンド仕様)
│   └── 倉庫/                    (その他資料)
│
├── 01_WorkSpace/
├── 03_WorkSpace/
└── API_Test/
\`\`\`

## 🔍 用途別クイックアクセス

### PM・マネージャー
→ PM_2026-04-17.md, PROGRESS_REPORT_2026-04-16.md

### 開発者
→ screen_overview.md, collection_detail.md, PHASE2_SPEC_2026-04-16.md

### グラフィッカー
→ 30_Graphicker/01_素材規格書.md, PHASE2_SPEC_2026-04-16.md

### シナリオライター
→ 20_ScenarioWriter/01_シナリオ制作マニュアル_JSON仕様書.md

### サウンドクリエイター
→ 50_SoundCreator/01_音声規格書.md

## 📋 確認方法

すべてのドキュメントは \`src/devstudio/docs/Old_Archive_0427/\` フォルダ内に保管されています。

**WebStorm・VS Code から直接アクセス可能：**
\`\`\`
src/devstudio/docs/Old_Archive_0427/00_INDEX.md
\`\`\``,
        tagIds: ['tag_archive'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: 'Old_Archive_0427',
    },
];

/**
 * アーカイブドキュメントを初期化
 * 既に登録されている場合はスキップ
 */
export function shouldInitializeArchiveDocs(existingDocs: Doc[]): boolean {
    return !existingDocs.some(d => d.id === 'arc_index');
}
