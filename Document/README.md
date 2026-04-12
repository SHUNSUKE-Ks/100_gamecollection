# プロジェクト技術ドキュメント（2026年4月版）

このフォルダは、NanoNovel/ゲームコレクション管理プロジェクトの最新ドキュメントを集約したものです。

---

## 目次

1. プロジェクト概要
2. ディレクトリ構成
3. データ構造（JSONスキーマ）
4. コンポーネント構造
5. Collection画面の仕組み
6. アセット管理・運用フロー
7. 参考・旧資料一覧

---

## 1. プロジェクト概要

- 複数タイトルのゲーム素材管理DB・API/動作テスト用アプリ。
- React 19, TypeScript, Vite, Zustandを使用。
- 主にCollection（コレクション）画面の改良・拡張が今後の主目的。

## 2. ディレクトリ構成（抜粋・v1.7）

- src/ ... ソースコード
- public/ ... 静的ファイル
- data/collection/ ... 各種データJSON
- screens/11_Collection/ ... コレクション画面
- components/data-views/ ... TableView, GalleryView, KanbanView, ViewSwitcher
- parts/collection/specific/ ... 詳細ビュー各種
- core/hooks/, core/stores/, core/types/ ... ロジック・型定義

## 3. データ構造（JSONスキーマ例）

- characters.json, enemies.json, npcs.json, ...

```json
{
  "characters": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "tags": ["string"],
      "image": "string",
      "standing": ["string"],
      "cgs": ["string"]
    }
  ]
}
```

## 4. コンポーネント構造

- CollectionScreen（メイン）
  - ViewSwitcher（表示切替UI）
  - TableView / GalleryView / KanbanView（各種ビュー）
  - CharacterDetailView, EnemyDetailView, ...（詳細ビュー）
- Zustandで状態管理

## 5. Collection画面の仕組み

- 各種JSONデータをインポートし、Table/Gallery/Kanbanで表示切替。
- 詳細ビューで個別データを表示。
- データ・カラム定義は型ファイル(core/types/)で管理。

## 6. アセット管理・運用フロー

1. 必要なアセット（画像/BGM/SE等）をJSONで発注・定義
2. \_delivery/ フォルダに納品
3. Asset Managerでインポートし、src/assets/へ配置
4. コレクション画面等で利用

## 7. 参考・旧資料一覧

- doc_04/ ... 技術資料アーカイブ
- 過去フォルダー0402/ ... 旧作業・設計資料
- 00_WorkSpace/ ... 部署別資料

---

このドキュメントは今後の改良・拡張に合わせて随時更新してください。
