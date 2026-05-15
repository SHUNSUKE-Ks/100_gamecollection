# DevStudio Archive Docs — ドキュメント管理ガイド

## 概要

`Old_Archive_0427` フォルダ内のドキュメントが DevStudio Doc Library に自動登録されます。

## ファイル構成

```
src/devstudio/utils/
├── archiveDocLoader.ts          # Archive ドキュメント初期化ロジック
└── README_ARCHIVE_DOCS.md       (本ファイル)

src/devstudio/docs/
├── Old_Archive_0427/            # アーカイブ本体
│   ├── 00_INDEX.md
│   ├── 04_WorkSpace/
│   └── 過去フォルダー0402/
│
├── archive_manifest.json        # Archive 一覧マニフェスト（リファレンス用）
└── ...
```

## アーカイブドキュメント管理

### 現在登録されている Doc

| Doc ID | タイトル | 説明 |
|--------|---------|------|
| `arc_index` | 【Archive】資料目次 | Old_Archive_0427 の全体索引 |
| `arc_navigation` | 【Archive】ナビゲーション | ファイル構成・用途別ガイド |

すべて `tag_archive` タグで分類されています。

### 新しいドキュメントを追加する方法

#### 1. テキスト内容が小さい場合（～5000文字）

`archiveDocLoader.ts` の `ARCHIVE_DOCS` 配列に追加：

```typescript
{
    id: 'arc_new_doc',
    title: '【Archive】新しいドキュメントのタイトル',
    body: `# ドキュメント本文
    
内容をここに書く...
`,
    tagIds: ['tag_archive'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source: 'Old_Archive_0427',
}
```

#### 2. テキスト内容が大きい場合（>5000文字）

- `archive_manifest.json` に登録する
- DevStudio Doc Library 画面で「新規資料追加」して手動で登録
- タグ `tag_archive` を付与

### ドキュメント更新時

`archiveDocLoader.ts` の該当エントリを修正 → localhost でリロード

※ localStorage が初期化される場合、古いドキュメントは保持されます（マージ）

## アーカイブドキュメントの物理的場所

すべてのファイルは以下の場所に保管されています：

```
src/devstudio/docs/Old_Archive_0427/
├── 00_INDEX.md                              (全体目次)
├── 04_WorkSpace/                            (最新資料)
│   ├── PM_2026-04-17.md
│   ├── PHASE2_SPEC_2026-04-16.md
│   ├── screen_overview.md
│   └── ...
└── 過去フォルダー0402/                      (初期段階の資料)
    ├── 00_WorkSpace/
    │   ├── 00_GameManager/
    │   ├── 10_GamePlanner/
    │   ├── 20_ScenarioWriter/
    │   ├── 30_Graphicker/
    │   └── 50_SoundCreator/
    └── ...
```

WebStorm・VS Code から直接アクセス可能。

## DevStudio での見方

1. **DevStudio 画面** → **DOC_LIBRARY** タブをクリック
2. 左側のタグから **Archive** を選択
3. 登録済みのドキュメント一覧が表示される
4. ドキュメントをクリックで内容を表示

## 参考資料

- `archive_manifest.json` — Archive 一覧マニフェスト（ファイル構成・タグ・説明）
- `Old_Archive_0427/00_INDEX.md` — 全体索引（クイックアクセス・読者別ガイド）

---

**最終更新**: 2026-04-28  
**管理者**: Claude  
**Location**: `src/devstudio/utils/archiveDocLoader.ts`
