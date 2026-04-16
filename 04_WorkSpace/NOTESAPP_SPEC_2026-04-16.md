# ノートアプリ 画面レイアウト製作依頼書

**作成日**: 2026-04-16  
**依頼者**: peakexperience  
**目的**: プロット手帳に埋め込む独立ノートアプリのレイアウト設計

---

## 背景・課題

現在の PlotNotebook コンポーネントはノベルCollectionに埋め込まれており、
ノートブロックの表示幅が狭く、執筆体験が制限されている。

**解決方針**: ノートアプリを独立コンポーネントとして設計し、
Collection の「プロット手帳」タブから呼び出す形で埋め込む。

---

## 機能要件

### 1. ノート一覧画面（ListPanel）

- ノートをカード形式で一覧表示
- タイトル / 最終更新日時 / 冒頭テキスト（2行）を表示
- [+] ボタンで新規ノート作成
- カテゴリータグでフィルタリング
- 検索ボックス（タイトル全文）

### 2. ノート編集画面（EditorPanel）

**レイアウト（縦型優先・PC対応）**:

```
┌─────────────────────────────────┐
│  [← 一覧]  [タイトル入力欄]  [保存] │  ← ヘッダー (48px)
├─────────────────────────────────┤
│  カテゴリタグ  [+タグ追加]          │  ← タグバー (36px)
├─────────────────────────────────┤
│                                 │
│  本文エリア（全幅・可変高さ）       │  ← メイン
│  フォント: serif / 行間 1.9        │
│  最小高: 60vh                    │
│                                 │
└─────────────────────────────────┘
```

**本文エリア仕様**:
- `contenteditable` または `<textarea>` で全幅
- フォント: `"Hiragino Mincho ProN", "Yu Mincho", serif`
- 文字サイズ: `1rem`（可変設定: 0.85 / 1.0 / 1.15rem）
- 行間: `1.9`
- 最大幅: `680px`（中央配置）
- 文字カウンター表示（右下）

### 3. ブロック形式（Phase 2 以降）

将来的に Notion 風ブロック対応を検討:
- `/ + [enter]` でブロックタイプ選択
- 対応ブロック: テキスト / 見出し1-3 / リスト / コードブロック / 区切り線

---

## データ構造

```typescript
interface NoteEntry {
  id: string;
  title: string;
  body: string;           // プレーンテキスト（Phase 1）
  category: string;
  tags: string[];
  wordCount: number;
  createdAt: string;      // ISO 8601
  updatedAt: string;
}
```

**ストレージ**: `localStorage` キー `note_app_v1`（novel_library_v1 と別管理）

---

## 画面遷移

```
PlotNotebook タブ
    └─ NoteApp コンポーネント（埋め込み）
            ├─ ListPanel（一覧）
            │       └─ カードタップ → EditorPanel
            └─ EditorPanel（編集）
                    └─ ← 戻るボタン → ListPanel
```

---

## スタイル要件

- 背景: `var(--color-bg-dark)`（Collection 統一テーマ）
- テキスト: `var(--color-text-primary)`
- アクセント: `var(--color-primary)` (#c9a227 ゴールド)
- モバイル(430px以下): 一覧と編集を全画面切り替え
- PC(431px以上): 左サイドパネル(240px)＋エディター

---

## 実装優先順位

| Priority | 機能 | 工数目安 |
|----------|------|---------|
| P1 | ListPanel + EditorPanel（textarea） | 1.5h |
| P1 | localStorage 保存/読み込み | 0.5h |
| P2 | カテゴリタグ + フィルター | 1h |
| P2 | 文字カウンター | 0.25h |
| P3 | フォントサイズ切り替え | 0.5h |
| P3 | Notion 風ブロック | 4h+ |

**Phase 1 合計目安: 約 2〜3時間**

---

## 備考

- `novel_library_v1` のデータとは別管理（移行ツール後で検討）
- PlotNotebook.tsx の差し替えは後方互換なし（完全置換）
- AndroidLayout / CollectionScreen 両方から呼び出し可能な設計
