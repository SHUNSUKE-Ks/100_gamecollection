# Collection > ストーリー画面 コンポーネント一覧

> 作成日: 2026-04-06

## ファイル構成

```
src/parts/collection/story/
├── StoryView.tsx        // 親コンテナ。サブタブ切替・全体レイアウト管理
├── StoryStepper.tsx     // 左サイドパネル：エピソード/チャプターのツリー
├── StoryListView.tsx    // テーブル形式のリスト表示（メイン・イベント共用）
├── StoryEventCard.tsx   // 各イベント/クエストのカード表示
├── PlotNotebook.tsx     // 会話ログ形式のプロット編集ツール
└── StoryView.css        // ストーリー画面全体のスタイル（PlotNotebook含む）
```

## コンポーネントツリー

```
StoryView
├── [メインタブ]
│   ├── StoryStepper       // 左サイドパネル：エピソード/チャプターのツリー
│   └── StoryEventCard     // 右エリア：各イベントのカード表示
│
├── [イベントタブ]
│   ├── StoryListView      // テーブル形式のリスト表示
│   └── StoryEventCard     // クエスト/サブイベントのカード表示
│
└── [プロット手帳タブ]
    └── PlotNotebook       // 会話ログ形式のプロット編集ツール
```

## サブタブ / ビューモード

| サブタブ | ビューモード |
|---------|------------|
| メイン | stepper（📋） / list（📝） |
| イベント | stepper（📋） / list（📝） |
| ✏ プロット手帳 | 専用UI固定（切替なし） |
