# 80_GameContentSystemConfig (ゲームコンテンツ管理システム計画書)

## 概要
本プロジェクト（NanoNovel Engine）を**ゲームエンジン**として確立し、シナリオや画像素材などの**コンテンツ**を完全に分離・差し替え可能にするための計画書です。
ファミコンのカセットのように、フォルダ（Inbox）を差し替えるだけで全く別のゲームとして動作することを目指します。

## 目標
1. **エンジニアと非エンジニアの完全分業**
   - エンジニア：機能追加、バグ修正、システム改修 (Engine)
   - クリエイター：シナリオ執筆、素材作成、パラメータ設定 (Content)
2. **Inbox 納品フローの確立**
   - `[GameID]_[GameTitle]_Inbox` というフォルダを作成し、そこに全ての素材とデータを入れる。
   - AI スキーマテストを通過したものだけをプロジェクトに取り込む。
3. **ゲームエンジンの汎用化**
   - `src/data` や `public/assets` を直接いじるのではなく、外部からロード、またはビルド時にインジェクトする仕組みを作る。

## フォルダ構成案 (Inbox)

納品フォルダ `G001_MyFirstNovel_Inbox/` の構成イメージ：

```text
G001_MyFirstNovel_Inbox/
├── manifest.json          # ゲーム基本設定 (タイトル、ID、バージョン、初期設定)
├── scenario/              # シナリオデータ (JSON)
│   ├── chapter1.json
│   └── ...
├── assets/                # 素材データ
│   ├── backgrounds/
│   ├── characters/
│   ├── bgm/
│   ├── se/
│   └── ...
└── db/                    # データベース (JSON)
    ├── characters.json    # キャラクター定義
    ├── items.json         # アイテム定義
    ├── terms.json         # 用語集
    └── ...
```

## AI スキーマバリデーション (Schema Test)

Inbox に納品されたデータが正しい形式か、統合前に AI (またはスクリプト) でチェックします。

### チェック項目例
1. **manifest.json の必須項目**
   - `gameId`, `title`, `version`, `entryPoint` (最初のシナリオファイル) があるか。
2. **ファイル参照の整合性**
   - シナリオ JSON 内で指定されている画像 (`bg_school.jpg` 等) が `assets/backgrounds/` に実際に存在するか。
   - BGM/SE のファイル名が一致しているか。
3. **JSON 構造の妥当性**
   - シナリオコマンド (`Text`, `Background`, `Character` 等) が定義通りか。
   - キャラクター ID が `characters.json` に定義されているか。

## 導入フロー (Workflow)

1. **Production (制作)**
   - クリエイターが規定のフォルダ構成で素材と JSON を作成。
   - `[GameID]_[GameTitle]_Inbox` にまとめる。

2. **Validation (検品)**
   - スキーマテストツールを実行 (CLI or Web UI)。
   - エラーがあれば修正 → 再納品。

3. **Integration (統合)**
   - テストパスした Inbox フォルダをエンジンの `src/games/[GameID]/` (仮) に配置。
   - エンジン側で `GameID` を指定して起動すると、そのゲームがロードされる。
   - ※将来的にはビルド時にリソースをコピーして単独アプリ化。

## Phase 90: GitAction Automation (自動化とCI/CD)

仕様が固まった後、GitHub Actions を利用してプロセスを自動化します。

1.  **JSON 差し替えテスト**
    - `Inbox` への Push をトリガーに Action が起動。
    - スキーマバリデーションを自動実行。
    - パスした場合、自動的にテスト環境（Staging）へデプロイし、ブラウザテストを実行。
2.  **リリースフロー**
    - Main ブランチへのマージで本番環境へ反映。
    - Android / PC 向けのビルドを自動生成。

## Phase 100: PWA Production Tool (Android対応制作ツール)

「出先で新しいゲームをリリースする」を実現するため、エンジンの Collection 画面（ライブラリー機能）をベースにした **PWA 制作ツール** を開発します。

1.  **Android 対応 PWA**
    - PC だけでなく、スマホ（Android）のブラウザでも動作する制作環境。
    - `Collection` の UI を流用し、スマホからアイテム定義やシナリオ編集を行えるようにする。
2.  **固定スキーマ出力**
    - ツールから出力される JSON は、検証済みの「固定スキーマ」に完全準拠。
    - 手書きのミスを排除し、バリデーションエラーを防ぐ。
3.  **Mobile-to-Cloud Workflow**
    - スマホで編集 → Commit & Push → GitHub Actions が作動 → 新規ゲームとしてリリース。
    - これにより、PC レスでのゲーム開発・運営サイクルを実現。

## 今後のタスク
- [ ] 簡易バリデーションスクリプト (Node.js) の作成
- [ ] エンジン側のデータロード部分の抽象化 (今の `import ... from ...` を動的読み込みに対応させる)
- [ ] `manifest.json` のフォーマット策定
