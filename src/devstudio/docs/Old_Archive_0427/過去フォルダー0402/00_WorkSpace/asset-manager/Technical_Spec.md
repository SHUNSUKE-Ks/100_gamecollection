# Asset Manager 技術仕様書 (Technical Specification)

本ドキュメントは、NanoNovel Asset Manager のシステム仕様（技術スタック、フォルダ構造、データスキーマ）について定義したものです。外部の拡張機能用アプリ等の開発時に、プロジェクト間で齟齬が起きないように設計の前提として参照してください。

## 1. 技術スタック (Tech Stack)

*   **バックエンド**
    *   Node.js (v14以上推奨)
    *   標準モジュールのみ使用 (`http`, `fs/promises`, `path`, `url`)
    *   外部フレームワーク非依存 (Express等は不使用)
*   **フロントエンド**
    *   HTML5 / CSS3 (Vanilla CSS定義)
    *   Vanilla JavaScript (ES6+), Fetch API
    *   フレームワークレス実装 (React/Vue/Zustand等はここでは不使用)
*   **データストア**
    *   ファイルシステムベース（対象となる JSON ファイルをデータベースとして直接読み書き）

## 2. フォルダ・ファイル構造

```text
00_WorkSpace/asset-manager/
├── server.js                 # バックエンドサーバー処理群（各種APIエンドポイント実装）
├── README.md                 # 概要・使い方ドキュメント
├── Technical_Spec.md         # 本ドキュメント（技術仕様書）
└── public/                   # フロントエンド静的ファイル群
    ├── index.html            # メイン画面 (Asset Manager GUI)
    └── delivery_dashboard.html # Asset Delivery Tracker (ダッシュボード画面)
```

### システム間の参照ディレクトリ
本ツールはプロジェクトルートを基準に以下のディレクトリへアクセスします。
*   `src/data/collection/*.json` : マスタデータ（DB）として読み書きする対象。
*   `src/assets/` : アセットファイルの最終保存先（正規の配置先）。
*   `_delivery/` : 新規アセットの納品・一時置き場。

## 3. DBカラム (JSONデータスキーマ構造)

本システムではリレーショナルDBの代わりに `src/data/collection/` 配下のJSONファイルをDBとして扱います。
各マスターデータ（`characters.json`, `enemies.json`, `items.json` 等）は、それぞれ固有のルートキー（例: `"characters": [...]`）を持ち、その配列内にオブジェクト（DBにおけるレコード）を格納しています。

### 基本カラム（主な汎用プロパティ）
メインツール (`index.html`) では、主に以下のカラム情報を利用・更新しています。

| カラム名 (JSONキー) | 型 | 役割・説明 | GUIでの振る舞い |
| :--- | :--- | :--- | :--- |
| `id` | String | アセットのユニークID（例: `remi`）| 読み取り専用（識別子） |
| `name` | String | 表示名・キャラクター名・アイテム名など | 編集可能テキストボックス |
| `image` / `icon` 等 | String | 紐づく画像等の相対ファイルパス（例: `chara/hero/remi.png`） | Import実行時にパス文字列が自動更新される |

*(※ JSONファイルごとに `standing` (立ち絵の配列), `cgs` (CGの配列) など固有のネスト構造を持つ場合があります。それらも同様にファイルパスとして解釈・更新されます。)*

### ステータス判定について
ダッシュボード (`delivery_dashboard.html`) 等では、DBのステータスフラグを直接読み書きするのではなく、ファイルの実体との突き合わせで動的にステータスを判定しています。

*   **Ordered (発注済)** : JSONに名前やID定義があるが、該当パスにファイルが存在しない。
*   **Delivered (納品済)** : 該当ファイル名のファイルが `_delivery/` フォルダ内に存在する（ツール未取り込み）。
*   **Checked (確認済)** : 該当ファイルが `src/assets/` 以下の正しいパスに存在している。
