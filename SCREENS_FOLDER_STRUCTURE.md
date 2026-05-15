# Screens フォルダー構造ルール

## 概要
`src/screens` 直下のスクリーンは、統一されたフォルダー構造に従い、関心の分離（Separation of Concerns）を実現する。

---

## フォルダー構造テンプレート

```
src/screens/
├── {NN_ScreenName}/          # スクリーン名（数字プレフィックス + PascalCase）
│   ├── {ScreenName}Screen.tsx # メインスクリーンコンポーネント（必須）
│   ├── components/            # 画面内のサブコンポーネント（オプション）
│   │   ├── Component1.tsx
│   │   └── Component2.tsx
│   ├── data/                  # データ定義・定数（オプション）
│   │   └── constants.ts
│   ├── store/                 # 状態管理（Zustand等）（オプション）
│   │   └── useScreenStore.ts
│   └── views/                 # ビューバリアント（オプション）
│       ├── View1.tsx
│       └── View2.tsx
```

---

## 命名規則

### フォルダー名
- **形式**：`{NN_ScreenName}`
- **NN**：2桁の数字（表示順序・優先度を示す）
  - `00`～`09`：メイン画面（Home, Titleなど）
  - `10`～`19`：コンテンツ画面（Collection, Studioなど）
  - `20`～：その他・実験的画面
- **ScreenName**：PascalCase（スクリーンの役割を明確に）
- 例：`00_Home`, `01_Title`, `02_Novel`, `11_Collection`, `12_Studio`

### ファイル名
- **メインスクリーン**：`{ScreenName}Screen.tsx`
  - 例：`HomeScreen.tsx`, `CollectionScreen.tsx`
- **サブコンポーネント**：PascalCase + `.tsx`
  - 例：`CharacterBox.tsx`, `StatusGauge.tsx`
- **状態管理**：`use{ScreenName}Store.ts`
  - 例：`useInteractionStore.ts`, `useCollectionStore.ts`
- **定数・データ**：`constants.ts`, `{feature}Data.ts`

---

## 各フォルダーの役割

### `{ScreenName}Screen.tsx` （必須）
- スクリーンの**ルートコンポーネント**
- ルーティング、状態管理の接続、レイアウト定義
- 主要なデータフロー管理

```tsx
// 例：HomeScreen.tsx
import React from 'react';
import { useInteractionStore } from './store/useInteractionStore';
import CharacterBox from './components/CharacterBox';

export default function HomeScreen() {
  const { character } = useInteractionStore();
  return (
    <div>
      <CharacterBox character={character} />
    </div>
  );
}
```

### `components/` （オプション）
- スクリーン固有の**再利用可能なサブコンポーネント**
- 1コンポーネント = 1ファイル（ただし小さい関連コンポーネントはまとめても可）
- グローバルコンポーネント（`src/components`）ではなく、スクリーン固有のUIパーツ

### `store/` （オプション）
- スクリーン内の**状態管理**（Zustand, React Context等）
- 複数ファイルの場合：`useScreenStore.ts`, `useSubStore.ts`など

```tsx
// 例：useInteractionStore.ts
import { create } from 'zustand';

export const useInteractionStore = create((set) => ({
  character: null,
  setCharacter: (char) => set({ character: char }),
}));
```

### `data/` （オプション）
- **定数・スキーマ・デフォルト値**
- JSON、TS定義、サンプルデータ
- 例：`constants.ts`, `sampleCharacters.json`

### `views/` （オプション）
- **ビューバリアント・レイアウトパターン**
- 同じスクリーンの異なる表示状態（Desktop/Mobile等）
- 例：`13_Menu/views/MenuViewDesktop.tsx`, `MenuViewMobile.tsx`

---

## ガイドライン

### ✅ こうする
- 各フォルダーには**明確な責務**を持たせる
- スクリーン固有のコンポーネントは`components/`に配置
- グローバルコンポーネントは`src/components`に配置
- 複数スクリーンで使う機能は`src/lib`や`src/hooks`に配置

### ❌ こうしない
- スクリーン直下に`.tsx`ファイルを多数作成（構造が汚れる）
- スクリーン固有のコンポーネントを`src/components`に配置
- 機能別の深いネストフォルダー構造（3階層以上は避ける）

---

## 実装例

### 例1：シンプルなスクリーン（components のみ）
```
11_Collection/
├── CollectionScreen.tsx
└── components/
    ├── ItemCard.tsx
    └── ItemGrid.tsx
```

### 例2：複雑なスクリーン（store + components + data）
```
02_Novel/
├── NovelScreen.tsx
├── ChapterScreen.tsx
├── components/
│   ├── DialogBox.tsx
│   ├── StoryText.tsx
│   └── ChoiceButton.tsx
├── store/
│   ├── useNovelStore.ts
│   └── useDialogStore.ts
└── data/
    ├── chapters.json
    └── dialogStyles.ts
```

### 例3：複数ビューを持つスクリーン（views）
```
13_Menu/
├── MenuScreen.tsx
├── views/
│   ├── MenuViewDesktop.tsx
│   └── MenuViewMobile.tsx
└── components/
    ├── MenuItem.tsx
    └── MenuBackground.tsx
```

---

## チェックリスト（新規スクリーン追加時）

- [ ] フォルダー名：`{NN_ScreenName}` の形式か確認
- [ ] メインコンポーネント：`{ScreenName}Screen.tsx` を作成
- [ ] 必要に応じて`components/`, `store/`, `data/`, `views/`を作成
- [ ] ルーティングに登録（`src/App.tsx`等）
- [ ] README等の文書を更新
