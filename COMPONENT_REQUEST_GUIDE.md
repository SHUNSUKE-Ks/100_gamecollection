# Component 依頼書テンプレート — 100_gamecollection

> このドキュメントは **AI（Claude / Gemini など）に新しいComponentを依頼するときの共通フォーマット**です。  
> 依存を最小限に保ち、単体で取り外しやすいComponentを受け取ることを目的とします。

---

## プロジェクト テックスタック（コピーして渡す）

```
## Tech Stack（変更禁止）
- React 19 + TypeScript ~5.9
- Vite 7 (ESM)
- Tailwind CSS v4  ← @import "tailwindcss" in CSS、config ファイル不要
- React Router v7 (SPA)
- Zustand v5 (グローバル状態)
- lucide-react ^0.562 (アイコン)
- Firebase ^12 (DB/Auth ※使う場合のみ import)

## CSS Variables（テーマ）
src/styles/variables.css に定義済み。TailwindユーティリティよりCSS変数優先。
主要変数:
  --color-primary: #c9a227      (ゴールドアクセント)
  --color-bg-dark: #0d0d12      (背景ダーク)
  --color-bg-medium: #1a1a24
  --color-bg-light: #252532
  --color-text-primary: #f0e6d3 (パーチメント白)
  --color-border: #3d3d4a
  --color-hp: #c44536
  --color-mp: #4a90c4
  --z-modal: 100 / --z-overlay: 200
```

---

## Component 依頼書フォーマット

```
### Component 依頼: [Component名]

#### 配置先
src/parts/[カテゴリ]/[ComponentName].tsx
（例: src/parts/collection/specific/ItemCard.tsx）

#### 概要
[何をするComponentか 1〜2行]

#### Props インターフェース（自分で定義して渡す場合）
type Props = {
  // 例
  title: string;
  onClose: () => void;
};

#### 依存ルール（必ずこのルールを守ること）
- [ ] このファイル単体で完結させる（子Componentを新規作成しない）
- [ ] 外部ライブラリは lucide-react のみ許可（追加インストール禁止）
- [ ] 状態管理が必要な場合は useState / useReducer をファイル内に閉じ込める
- [ ] Zustand の gameStore / settingsStore を読むのは OK（書き込みは要相談）
- [ ] Firebase は直接 import しない（必要なら Service 経由で Props に渡す）
- [ ] @google/genai は直接 import しない（同上）
- [ ] CSS は Tailwind ユーティリティ + CSS変数（var(--color-*)）を使用
- [ ] 外部への副作用（fetch, Firebase 書き込み）は Props の callback で受け取る

#### 取り外し方（削除時の影響範囲）
このComponentを削除するときに変更が必要なファイル:
- [ ] [呼び出し元ファイル名] の import を削除
- [ ] （他になければ「このファイルのみ」と記載）

#### 完成イメージ・参考
[スクリーンショット、類似Componentのパス、ラフ説明など]
```

---

## 良いPromptの例

```
以下の仕様でReact Componentを1ファイルで作成してください。

## Tech Stack（変更禁止）
（上のスタック欄をそのままペースト）

### Component 依頼: EnemyStatusBar

#### 配置先
src/parts/collection/specific/EnemyStatusBar.tsx

#### 概要
敵のHP/MP/状態異常を横バーで表示する読み取り専用Component。

#### Props
type Props = {
  name: string;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  statusEffects?: string[];
};

#### 依存ルール
（上のルール欄をそのままペースト）

#### 完成イメージ
HPバー（赤）、MPバー（青）、状態異常アイコン（lucide-react）を縦並び。
ゲーム風ダークUI。
```

---

## よくある失敗パターン（AIへの追加指示用）

| 失敗 | 追加する指示 |
|------|------------|
| 新しいnpmパッケージを提案してくる | 「追加インストール禁止。lucide-react と Tailwind v4 のみ使用」 |
| 複数ファイルに分割してくる | 「1ファイルで完結。子Componentは同ファイル内に書く」 |
| Tailwind v3 の設定ファイルを書いてくる | 「Tailwind v4。@import "tailwindcss" のみ。tailwind.config.js 不要」 |
| Context/Redux を使ってくる | 「状態は useState で完結。Zustand が必要な場合のみ import」 |
| Firebase を直接呼ぶ | 「Firebase は Props の callback として受け取ること」 |
| フォルダ構造ごと提案してくる | 「単一ファイルのみ。フォルダ構造は変えない」 |

---

## テックスタック Q&A

### Q: Tailwind CSS は v4（`^4.1.18`）でいい？
**A: はい、このプロジェクトは既に v4 で動いています。**

| | v3 | v4（このプロジェクト） |
|--|----|--------------------|
| 設定ファイル | `tailwind.config.js` 必須 | 不要 |
| CSS取り込み | `@tailwind base/components/utilities` | `@import "tailwindcss"` 1行のみ |
| PostCSS plugin | `tailwindcss` | `@tailwindcss/postcss` |
| カスタムテーマ | `extend` in config | CSS変数 or `@theme` ブロック |

v4 の `tailwindcss` と `@tailwindcss/postcss` は**両方** devDependencies に必要（現在の package.json は正しい）。

### Q: `@google/genai` は必要？
**A: `GeminiService.ts` が使っているので削除不可です。**  
ただし AI機能（ApiBattleScreen / GeminiService）を使わない画面のComponentでは **絶対に import しないこと**。  
Gemini を使う場合は `src/core/services/GeminiService.ts` 経由で呼ぶ。

### Q: React のバージョンは？
**A: React 19 で問題ありません。** 以下の点だけ注意：

```tsx
// ✅ React 19 スタイル（forwardRef 不要）
function MyInput({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// ✅ use() フック（React 19）— Promiseをそのまま読める
const data = use(somePromise);

// ❌ 古いスタイル（非推奨）
const MyInput = React.forwardRef((props, ref) => { ... });
```

---

## 現在のフォルダ構成（Component配置の目安）

```
src/
├── screens/          # 画面単位（ルーティング先）
│   ├── 00_Home/
│   ├── 02_Novel/
│   ├── 03_Battle/
│   └── 11_Collection/
├── parts/            # 画面をまたいで使う機能まとまり
│   ├── novel/        # ノベルエンジン
│   ├── battle/       # バトルシステム
│   └── collection/   # コレクション系
│       ├── specific/ # ← 個別詳細Component置き場
│       ├── story/
│       ├── report/
│       └── settings/
├── components/       # 汎用UI Component（data-views など）
├── core/
│   ├── types/        # 型定義
│   ├── stores/       # Zustand stores
│   ├── hooks/        # カスタムhooks
│   └── services/     # Firebase/Gemini/等 サービス層
└── styles/           # グローバルCSS・CSS変数
```

**新しいComponentの置き場の優先順位:**
1. 特定画面専用 → `screens/XX_Name/components/`
2. 複数画面で使う機能 → `parts/[カテゴリ]/`
3. 純粋なUIパーツ → `components/`
