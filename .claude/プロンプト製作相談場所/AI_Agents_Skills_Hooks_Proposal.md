# NanoNovel AI開発ツール設定（Agents / Skills / Hooks）候補

NanoNovelのコードベース（React/TypeScript製のエンジン本体と、00_WorkSpace下の各役割ファルダ・APIテストサーバー等）を調査し、このプロジェクトをより効率的に進めるためのAIアシスタント設定候補を提案します。

## Agents候補
プロジェクト内の「00_WorkSpace」で定義されている役割分担やディレクトリ階層に沿った形でのAgent分割が最適と考えます。

| name | description | 担当範囲 |
|---|---|---|
| ProgrammerAgent | アプリケーションのフロントエンド及び基盤ロジック開発を担当。 | `src/`（Reactコンポーネント, TypeScriptエンジンコア）、`API_Test/` および基盤ツールの開発など。 |
| ScenarioWriterAgent | シナリオJSONのオーサリングと管理を担当。文字ベースの原稿からJSONフォーマットへの変換も行う。 | `00_WorkSpace/20_ScenarioWriter/` などのシナリオデータ、テキストファイルのパース。 |
| AssetManagerAgent | 画像・音楽などのリソース管理、アセット配信（Delivery）用リストの自動生成や整合性チェックを担当。 | `00_WorkSpace/asset-manager/` (APIサーバーやPython/Nodeスクリプトなど)、`30_Graphicker/`, `50_SoundCreator/` の登録作業。 |
| PlannerAgent | ゲームの仕様策定、バランス調整、テストプレイに基づくパラメータ調整を担当。 | `00_WorkSpace/10_GamePlanner/`, バトルシステムAPIや各種ゲーム内パラメータ定義ファイル。 |

## Skills候補
NanoNovel開発に固有の繰り返し作業を自動化・効率化するスクリプトやコマンド群です。

| name | description | 発動条件 |
|---|---|---|
| validate_scenario_json | シナリオJSONがNanoNovelエンジンのスキーマ定義（`src/core/types/scenario.ts`等）に準拠しているかをチェックする。 | ScenarioWriterがJSONシナリオを新規作成・更新した際。 |
| generate_delivery_list | 現在のローカルアセット状況を走査し、アセット配信用のリスト（`delivery_list.json`など）を自動生成・更新する。 | GraphickerやSoundCreatorのアセットディレクトリに変更があった際。 |
| test_api_battle | `_api_test_server.js` などを起動し、自動でバトルのAPI通信テストを実行。エラーログの有無を確認する。 | API連携ロジック（`ApiBattleScreen`など）を改修した直後。 |
| run_type_check | `npm run tsc` または `vite build` 相当のコマンドを実行し、プロジェクト全体のTypeScript構文エラーを検査する。 | ProgrammerAgentが大幅なコード変更（例えば `src/core/*` への変更）を完了した際。 |

## Hooks候補
ツールの実行前後で安全性を担保したり、後続作業を自動化するためのフック処理です。

| タイミング | 処理内容 | 理由 |
|---|---|---|
| PreToolUse (write_to_file) | 対象ファイルがシナリオJSONの場合、必ず仮のLint/バリデーションにかけて壊れたJSONを書き込まないようにブロックする。 | アプリケーション本体（Reactエンジン）実行時に、JSONフォーマット不正によるクラッシュ（進行不可バグ）を未然に防ぐため。 |
| PostToolUse (run_command) | `npm install` などのパッケージ追加コマンドが走った直後に、自動で依存関係のロックファイル（`package-lock.json`）をチェック・コミット提案する。 | Nodeモジュールの競合やGitのコンフリクトを回避し、プロジェクトの安定性を保つため。 |
| PostToolUse (write_to_file) | `API_Test` 関連ファイルや `_api_test_server.js` を書き換えた場合、起動中のTest Serverプロセスをリスタートするかユーザーに確認プロンプトを出す。 | 古いキャッシュ・プロセスのままテストして「直っていない」と勘違いする手戻りを防ぐため。 |

## 判断根拠
- **ディレクトリ階層との親和性**: NanoNovelは `00_WorkSpace` 配下に「GamePlanner」「ScenarioWriter」「Graphicker」などの専門フォルダが既に用意されているため、これに1対1で対応するAgentを設けることでコンテキストが明確に分かれます。
- **データ駆動アーキテクチャへの対応**: JSON駆動である本プロジェクトにおいて、JSONファイルの構文エラーは致命的なバグに直結します。そのため Skill と Hook で「書き込み前のJSONバリデーション」を最優先に組み込んでいます。
- **APIとローカル機能の切り分け**: 最近のチャット履歴より、API通信によるバトルテスト機能などが追加されていることが分かります。それらのテストサーバー起動忘れ等のヒューマンエラーを防ぐためのHookやSkillを設けることで、開発テンポの向上を狙っています。
