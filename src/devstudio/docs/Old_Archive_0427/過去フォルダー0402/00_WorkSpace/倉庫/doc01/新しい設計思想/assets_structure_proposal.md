# 新・アセットフォルダ構成案

「新しいノベルゲーム思想」に基づく、`src/assets/data` の構成案です。
機能単位（Novel/Collection/Battle）でデータを完全に分離し、各パートの独立性を高める構造です。

```
src/assets/data/
├── Novel/                    # ▼ シナリオ進行・演出用
│   ├── scenario.json         # メインシナリオ本文
│   ├── episodes.json         # 章立て・エピソード構造
│   ├── events.json           # イベント定義（選択肢・フラグ変動）
│   ├── title.json            # タイトル画面設定
│   ├── game_config.json      # ゲーム全体設定
│   └── scenarios/            # (Future) 分割クエスト/サブシナリオ
│
├── Collection/
│   └── Library/              # ▼ 全データベース集結 (Notion Full DBミラー)
│       ├── characters.json   # キャラクター図鑑データ
│       ├── npcs.json         # NPC図鑑データ
│       ├── enemies.json      # エネミーデータ
│       ├── items.json        # アイテムデータ
│       ├── backgrounds.json  # 地名・背景データ
│       ├── gallery.json      # CG/Galleryデータ
│       ├── tags.json         # 検索用タグ定義
│       ├── tips.json         # 用語集・Tipsデータ
│       ├── skills.json       # スキル効果・計算式
│       ├── battle_config.json # バトルバランス設定
│       └── formations.json   # 敵グループ定義
│
└── Result/                   # ▼ 報酬・クリア設計
    ├── result_sheets.json    # コレクション解放・報酬定義
    └── flags_master.json     # 全フラグ管理・初期値
└── Result/                   # ▼ 報酬・クリア設計
    ├── result_sheets.json    # コレクション解放・報酬定義
    └── flags_master.json     # 全フラグ管理・初期値
```

## 移行のポイント

1.  **`src/data` からの移設**: 現在ルートにある `src/data/` の中身を、用途に合わせて上記のサブフォルダへ振り分けます。
2.  **責務の明確化**:
    *   **Novel**: 「物語を読み進める」機能が必要とするもの。
    *   **Collection**: 「プレイヤーが見て楽しむ」データ。UIで表示されるもの。
    *   **Battle**: 「戦闘計算」に使うもの。
3.  **参照ルール**:
    *   Novel/BattleからCollectionのデータを参照するのはOK（例：シナリオでキャラ名を表示するため参照）。
    *   逆は避ける（依存関係を一方向に保つため）。
