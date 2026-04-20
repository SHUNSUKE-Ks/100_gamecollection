# 外注発注書 — Collection レイアウト

> **作成日**: 2026-04-18  
> **対象**: Collection 画面に表示するゲームUIレイアウトComponent  
> **担当**: @peakexperience

---

## 1. このドキュメントの目的

Collection 画面（アイテム・装備・スキル・アビリティ）に使用するUIコンポーネントを、  
外注先でも一貫したルールで実装できるよう、必要な要素とルールをまとめたものです。

---

## 2. データ参照先（Library）

すべてのゲームデータは以下の JSON ファイルから取得します。  
コンポーネントは **Props でデータを受け取る** 形にしてください（直接 import 不可）。

| データ | ファイル | 主要フィールド |
|---|---|---|
| アイテム・装備 | `src/data/collection/items.json` | id, name, category, iconTag, tags, rarity(1-5), price, effect, description, equipSlot |
| スキル・アビリティ | `src/data/collection/skills.json` | id, name, **domain**, category, element, target, cost_mp, cost_cooldown, power_base, power_scale, effects[], tags[], description, iconTag |

### domain フィールドの意味（skills.json）

```
domain: "combat"   → 戦闘スキル（攻撃・回復・バフ・デバフ・パッシブ）
domain: "utility"  → 非戦闘アビリティ（探索・社交・生活）
```

### 型定義ファイル

```
src/core/types/item.ts
  - Item, ItemCategoryId, EquipSlot, Rarity
  - SkillEntry, SkillDomain, SkillCategoryDef, SkillElementDef, SkillDB
  - CatalogTheme, CatalogLayout
```

---

## 3. コンポーネントの配置ルール

```
src/parts/collection/catalog/layouts/
  ├── ItemGridLayout.tsx        ← アイテム: グリッド型
  ├── ItemListLayout.tsx        ← アイテム: リスト+詳細型
  ├── EquipSlotLayout.tsx       ← 装備: スロット管理型
  ├── EquipCompareLayout.tsx    ← 装備: 比較パネル型
  ├── SkillHotbarLayout.tsx     ← スキル: ホットバー型
  ├── SkillGridLayout.tsx       ← スキル: グリッド選択型
  ├── AbilityBadgeLayout.tsx    ← アビリティ: バッジ型
  └── AbilityMenuLayout.tsx     ← アビリティ: メニュー型
```

新しいレイアウトを追加する場合は上記フォルダに追加してください。

---

## 4. Props インターフェースのルール

### 必須原則

- **データは必ずPropsで受け取る**（コンポーネント内で直接importしない）
- **コールバックは `on + 動詞` 命名**（例: `onUse`, `onEquip`, `onSelect`）
- **デフォルト値を持つ Optional Props** は `?` で定義

### Props テンプレート

```tsx
// アイテム系
interface MyItemLayoutProps {
  items: Item[];                          // 必須: 表示するアイテム配列
  onSelect?: (item: Item) => void;        // 任意: アイテム選択時
  onUse?: (item: Item) => void;           // 任意: 使用時
  maxSlots?: number;                      // 任意: スロット上限（default: 20）
  title?: string;                         // 任意: ヘッダータイトル
}

// スキル系
interface MySkillLayoutProps {
  skills: SkillEntry[];                   // 必須: 表示するスキル配列
  categories: SkillCategoryDef[];         // 必須: カテゴリ定義（色・名称）
  onSelect?: (skill: SkillEntry) => void; // 任意: 選択時
  onUse?: (skill: SkillEntry) => void;    // 任意: 使用時
}
```

---

## 5. スタイリングルール

### CSS変数（必ず使用すること）

```
/* 背景 */
var(--color-bg-dark)       #0d0d12  ← 最も暗い背景
var(--color-bg-medium)     #1a1a24  ← 標準パネル背景
var(--color-bg-light)      #252532  ← ヘッダー・サイドバー

/* テキスト */
var(--color-text-primary)  #f0e6d3  ← メインテキスト
var(--color-text-secondary)#a89f8c  ← サブテキスト
var(--color-text-muted)    #6b7280  ← ミュート・ラベル
var(--color-text-gold)     #c9a227  ← エフェクト値・ハイライト

/* アクセント */
var(--color-primary)       #c9a227  ← ゴールド（選択・強調）
var(--color-border)        #3d3d4a  ← ボーダー全般

/* ステータス */
var(--color-hp)            #c44536  ← HP
var(--color-mp)            #4a90c4  ← MP

/* 角丸 */
var(--radius-sm)  4px
var(--radius-md)  8px
var(--radius-lg)  12px
```

定義元: `src/styles/variables.css`

### 禁止事項

- ❌ ハードコードの色（例: `color: '#ffffff'`）は使わない
  - 例外: レアリティ・属性・カテゴリなど**データ由来の色**はハードコード可
- ❌ 外部CSSファイルの新規作成（インラインstyle または catalog.css のクラスを使用）
- ❌ Tailwind クラスの使用（このプロジェクトはインラインstyle統一）

### レアリティカラー（固定値）

```tsx
const RARITY_COLOR = {
  1: '#9ca3af',  // C — グレー
  2: '#34d399',  // B — グリーン
  3: '#60a5fa',  // A — ブルー
  4: '#a78bfa',  // S — パープル
  5: '#f97316',  // SS — オレンジ
};
```

---

## 6. カテゴリカラー（skills.json から取得）

スキル・アビリティのカテゴリカラーは **skills.json の categories 配列** を参照してください。  
コンポーネント内にハードコードしないこと。

```tsx
// 正しい参照方法
const catColor = categories.find(c => c.id === skill.category)?.color ?? '#6b7280';
```

---

## 7. インタラクション仕様

### 選択状態

```tsx
// 選択時のスタイルパターン（統一）
background: 'rgba(201,162,39,0.12)'   // アクセント背景
borderLeft: '3px solid var(--color-primary)'  // 左ボーダー強調
color: 'var(--color-text-primary)'     // テキスト強調
```

### ホバー

```tsx
// ホバー時の最小スタイル（transition必須）
transition: 'background 0.12s'
background: 'rgba(255,255,255,0.04)'  // ホバー背景
```

### アニメーション

- 選択時のスケール変化は `transform: scale(1.05)` まで
- `transition` は常に `0.1s〜0.15s` の短い値を使用

---

## 8. レイアウトパターン一覧

現在実装済みのレイアウトと用途：

### アイテム

| Layout | ファイル | 用途 | 特徴 |
|---|---|---|---|
| A | `ItemGridLayout.tsx` | インベントリ画面 | 5列グリッド、下部詳細パネル |
| B | `ItemListLayout.tsx` | メニュー選択画面 | 左リスト + 右詳細、カテゴリタブ |

### 装備品

| Layout | ファイル | 用途 | 特徴 |
|---|---|---|---|
| A | `EquipSlotLayout.tsx` | 装備管理画面 | 3スロット展開式、1クリック装備 |
| B | `EquipCompareLayout.tsx` | アイテム取得/購入確認 | 左右比較、ステータス差分△ |

### スキル（戦闘）

| Layout | ファイル | 用途 | 特徴 |
|---|---|---|---|
| A | `SkillHotbarLayout.tsx` | バトル画面下部 | 4スロット割当、ホバー詳細 |
| B | `SkillGridLayout.tsx` | スキル習得/選択画面 | カテゴリフィルター + 右詳細パネル |

### アビリティ（非戦闘）

| Layout | ファイル | 用途 | 特徴 |
|---|---|---|---|
| A | `AbilityBadgeLayout.tsx` | ステータス画面 | バッジ形式、ホバー詳細 |
| B | `AbilityMenuLayout.tsx` | フィールドコマンド | DQ風縦リスト、キーボード操作 |

---

## 9. 新レイアウト追加時のチェックリスト

```
受け入れ条件:
  [ ] Props でデータを受け取り、直接 import していない
  [ ] CSS変数 (--color-*) を使用している
  [ ] ハードコード色を使っていない（データ由来の色は除く）
  [ ] hover / 選択状態のスタイルが実装されている
  [ ] TypeScript の型エラーが 0件（npx tsc --noEmit）
  [ ] npx vite build でビルドが通る
  [ ] 空データ渡し時にクラッシュしない（空配列を渡してテスト）
  [ ] ファイルを src/parts/collection/catalog/layouts/ に配置した
```

---

## 10. プレビュー方法

Collection 画面ヘッダーの **「🎮 Samples」** ボタンを開くと、  
全8レイアウトを実データで確認できます。

```
CollectionScreen → 🎮 Samples ボタン → CollectionSamplesScreen
```

---

> **最終更新**: 2026-04-18  
> **担当**: @peakexperience
