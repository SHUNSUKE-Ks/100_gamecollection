# Android版 + フルDB設計プラン
> 作成: 2026-04-15  
> 目的: novelCollection の Android縦型特化レイアウト + 新DBアーキテクチャ設計

---

## 現状マップ（CollectionScreen 既存タブ）

```
primaryTab（上段ナビ）
  ├── ストーリー   → StoryView
  │     ├── main（StoryStepper / StoryListView）
  │     ├── event（StoryEventCard）
  │     ├── plot（PlotNotebook）  ← プロット手帳
  │     ├── schema（SchemaShortView）
  │     └── library（NovelLibraryView / NovelDetailView）  ← 核心
  ├── ライブラリー → secondaryTab（character/npc/enemy/place/item_dict/sound_db/tag_db）
  ├── 工房（Studio）
  ├── 設定
  ├── レポート    → ReportView
  └── 発注書      → DocumentInboxView
```

---

## 提案①：フルDB新設（Notion型 Relations）

### 設計方針

| DB | 役割 | Relationする相手 |
|----|------|----------------|
| **titleDB** | プロジェクト単位。サムネ・説明・ステータス | characterDB, tagsDB |
| **characterDB** | キャラクター図鑑（既存強化） | titleDB, tagsDB |
| **tagsDB** | 作品横断タグ。タグ自体がページを持つ | titleDB, characterDB |

### tagsDB の「relationでtag分け」について

```
現状: characters.json → { defaultTags: ["主人公", "味方"] }  ← 文字列配列（片方向）

提案: tagsDB に id を持つTagエントリを作成し、
      characters.json → { tagIds: ["tag_001", "tag_003"] }  ← IDで参照（双方向）
      tagsDB → { id:"tag_001", name:"主人公", linkedCharacterIds:["char_001"] }
```

**メリット:** タグ側からキャラ一覧を引ける / タグページにメモ・画像追加可能  
**コスト:** JSON移行 + TagsView の改修（現在の TagsView.tsx はほぼ空）

### ページプロパティ（Notion風 JSON スロット）

```tsx
// PagePropertiesProps イメージ
type PropertySlot = {
  key: string;          // "genre" | "status" | "platform" など
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'date' | 'relation';
  candidates?: string[];  // type=select/multiselect のとき候補リスト
  value: any;
};
```

タイトルとメモの間に`PagePropertiesPanel`を置き、クリックで候補ドロップダウン表示。  
**配置先候補:** `src/parts/collection/specific/PagePropertiesPanel.tsx`（1ファイル完結）

---

## 提案②：Android縦型レイアウト 設計

### フォルダ構成

```
src/
└── screens/
    └── android/          ← 新規。PCコードには一切触れない
        ├── AndroidLayout.tsx       # ルートレイアウト（ハンバーガー込み）
        ├── AndroidNovelLibrary.tsx # メインView（最小MVP）
        ├── AndroidReport.tsx       # レポート（コメント書き込み）
        ├── AndroidDocument.tsx     # 発注書（書き込み用）
        └── AndroidSchemaViewer.tsx # スキーマーcopy（読み取り専用）
```

> **ルール:** `android/` フォルダは PC Collectionに依存しない。  
> データは同じ Firestore/JSON を読む。UI だけ別。

### App.tsx への追加（最小変更）

```tsx
// useMediaQuery or navigator.userAgent で切り替え
case 'ANDROID_COLLECTION':
  return <AndroidLayout />;
```

既存の `case 'COLLECTION'` は一切変更しない。

---

## Android ページ優先順（最小MVP）

### ① AndroidLayout.tsx（ハンバーガーナビ）

```
┌─────────────────────────┐
│ ≡  novelCollection   [+] │  ← ハンバーガー + 新規ノートボタン
├─────────────────────────┤
│                         │
│   [Gallery View]        │  ← デフォルト。タイトルカード並び
│   タイトル① サムネ      │
│   タイトル② サムネ      │
│        [TestPlay▶]      │  ← 各カードに TestPlay ボタン
│                         │
└─────────────────────────┘

ハンバーガーメニュー内容:
  - ノベルライブラリ（デフォルト）
  - ストーリー（PlotNotebook）
  - レポート
  - 発注書
  - スキーマー確認
```

### ② AndroidNovelLibrary.tsx

- Collection > ストーリー > NovelLibrary の縦型ビュー
- 既存 `NovelLibraryView.tsx` のデータをそのまま読む
- サイドパネルなし。タップでフルスクリーンのノート詳細に遷移
- アプリ起動時に最後開いたページを localStorage で復元

### ③ AndroidReport.tsx

- 既存 `ReportView.tsx` の表示内容を縦型に最適化
- コメント入力欄を追加 → 修正メモとして使う
  - `reports.json` に `comments: []` フィールドを追加する or Firestore 書き込み

### ④ AndroidDocument.tsx（発注書）

- 既存 `DocumentInboxView.tsx` の書き込み特化版
- PC版は閲覧・管理。Android版は「その場で発注メモ」特化

### ⑤ AndroidSchemaViewer.tsx（スキーマーcopy）

- 既存 `SchemaShortView.tsx` を縦型フルスクリーンで表示
- コピーボタン付き（clipboard API）

---

## 実装フェーズ提案

```
Phase 0（設計確定）
  └── このMDをレビュー → 合意

Phase 1（Android最小）
  ├── AndroidLayout.tsx（ハンバーガー + Gallery）
  ├── AndroidNovelLibrary.tsx（ノート一覧 + 詳細）
  └── App.tsx に ANDROID_COLLECTION ルート追加

Phase 2（フルDB基盤）
  ├── tagsDB スキーマー確定（relations型）
  ├── PagePropertiesPanel.tsx
  └── titleDB JSON作成

Phase 3（残Androidページ）
  ├── AndroidReport.tsx（コメント付き）
  ├── AndroidDocument.tsx
  └── AndroidSchemaViewer.tsx

Phase 4（TestPlayリンク）
  └── Gallery各カードに TestPlay ボタン追加
       → setScreen('TITLE') + titleId をDeepLinkで渡す
```

---

## アドバイス・懸念点

### ✅ 良い方向性

- **Android フォルダ分離**: PC コードをまったく変えないのは正しい。デグレのリスクゼロ。
- **VIEW感覚でDB参照**: 同じ Firestore コレクションを読むだけ → データは1つ、見た目だけ変える設計は王道。
- **ハンバーガーで画面完全切り替え**: サイドパネルを隠すより「別画面」にする方が縦型でシンプル。

### ⚠️ 要確認・調整

| 懸念 | 推奨対処 |
|------|---------|
| `useMediaQuery` vs ルート分岐 | Zustandに `deviceMode: 'pc' \| 'android'` を追加してTitleScreenで切り替えボタン（開発用）を置くと楽 |
| タグRelationの移行コスト | `tags.json` は既にある。まず tagsDB VIEW だけ作り、データ移行は Phase2 で |
| `PlotNotebook` がサイドパネル依存か | 既存コードを確認してから Android に組み込む（要調査） |
| `localStorage` でページ復元 | `useEffect + localStorage.setItem` で currentNovelId を保存する単純実装で十分 |

### 💡 追加提案

- **TestPlay ボタン**: `titleDB` の各エントリに `hasPlayableNovel: boolean` フラグを持たせ、trueのタイトルだけボタンを表示する
- **発注書をAndroid特化にする理由**: PC版は発注一覧管理、Android版は「現場で思いついたときにメモ」の違いがある。2つのViewを持つのは合理的
- **スキーマーcopy**: AI（Claude/Gemini）に依頼書を渡すときにそのままコピーする用途なので、Android で使うのは理にかなっている

---

## 次のアクション（確認してください）

- [ ] Phase 1 の開始 OK？ → `AndroidLayout.tsx` から作り始める
- [ ] `deviceMode` をどこで切り替えるか？（自動検出 or 手動ボタン）
- [ ] tagsDB の relation: Firestore実装 or JSONのみ？
- [ ] TestPlay ボタンは `TITLE` 画面に飛ぶだけ？ or 特定タイトルにDeepLink？
