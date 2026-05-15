# 新・ソースコード構成案 (src/)

ユーザー様ご提示の「Screens概念（画面単位のフォルダ分割）」を取り入れ、かつ「TSX移行」を反映したソースコード構成案です。
`src/parts` 構成から `src/screens` ベースの構成へ移行し、画面ID (`01_Title` 等) で管理します。

```
src/
├── App.tsx              # アプリケーションエントリポイント
├── App.css              # グローバルAppスタイル
├── main.tsx             # Reactマウントポイント
├── index.css            # グローバルスタイル
│
├── screens/             # ▼ 画面単位コンポーネント (New!)
│   ├── 00_GameManager/          # ゲーム全体管理
│   │   └── GameManager.tsx
│   │
│   ├── 01_Title/                # タイトル画面
│   │   ├── TitleScreen.tsx
│   │   └── QuestMenu.tsx
│   │
│   ├── 02_NovelPart/            # ノベルパート
│   │   ├── MainGameScreen.tsx
│   │   └── ChapterGalleryScreen.tsx
│   │
│   ├── 03_BattlePart/           # バトルパート
│   │   ├── BattleScreen.tsx
│   │   └── Battleboard01.tsx
│   │
│   ├── 10_RESULTPart/           # リザルトパート
│   │   └── ResultScreen.tsx
│   │
│   └── 11_Collection/           # コレクション画面
│       ├── CollectionScreen.tsx
│       ├── BGMPlayerScreen.tsx
│       └── GalleryScreen.tsx
│
├── components/          # 共通UIコンポーネント
├── hooks/               # カスタムReactフック
├── core/                # コアロジック (Managers, Stores)
├── styles/              # CSS分離
└── assets/              # 静的アセット (データ含む)
    └── data/            # (assets_structure_proposal.md参照)
```

## 移行のポイント

1.  **`src/parts` の廃止**: 現在の `src/parts` ディレクトリの中身を、上記の `src/screens` 内の各番号付きフォルダへ移動・統合します。
2.  **TSX化**: 全て `.jsx` を `.tsx` に変換して配置します。
3.  **ScreenID管理**: アプリケーションのルーティング（またはState管理）を、このディレクトリ構造に合わせたScreenID (`TITLE`, `NOVEL`, `BATTLE`...) で行います。
