# COMPONENT_MAP — スクリーン別コンポーネント辞書

**AI指示の共通用語テーブル**

タスク作成時・AI指示時は、このテーブルのコンポーネント名を使用してください。  
「○○コンポーネントを実装」と言う際の正式名を統一することで、指示が曖昧にならないようにします。

---

## Phase 1: Engine（モック完成まで）

### TitleScreen（タイトル画面）

| Component | ファイルパス | 役割 | タスク例 |
|---|---|---|---|
| **TitleScreen** | `src/screens/01_Title/TitleScreen.tsx` | タイトル表示・画面遷移ハブ | TitleScreen に各画面へのボタンを配置 |
| TitleScreenButton | `src/screens/01_Title/components/TitleScreenButton.tsx` (想定) | ボタンコンポーネント | ボタンスタイル・クリック動作 |

**P1 Done条件:** TitleScreen が表示され、全画面への遷移ボタンがクリックできる

---

### NovelScreen（ADVプレイヤー）

| Component | ファイルパス | 役割 | タスク例 |
|---|---|---|---|
| **NovelScreen** | `src/screens/02_Novel/NovelScreen.tsx` | ADVプレイヤーのコンテナ | ノベル遷移・JSON読み込み |
| **ChapterScreen** | `src/screens/02_Novel/ChapterScreen.tsx` | チャプター内容表示 | 本文・選択肢の表示 |
| ChapterText | `src/screens/02_Novel/components/ChapterText.tsx` (想定) | テキスト描画 | モック本文の表示 |
| ChoiceButtons | `src/screens/02_Novel/components/ChoiceButtons.tsx` (想定) | 選択肢ボタン | 選択肢表示・クリック |

**P1 Done条件:** NovelScreen がモックJSONで各チャプターを順に表示できる、選択肢が反応する

---

### BattleScreen（バトルUI）

| Component | ファイルパス | 役割 | タスク例 |
|---|---|---|---|
| **BattleScreen** | `src/screens/03_Battle/BattleScreen.tsx` | バトル画面のコンテナ | モック戦闘の表示・ターン管理 |
| BattleUI | `src/screens/03_Battle/components/BattleUI.tsx` (想定) | UI表示（HP、ターン等） | ステータス表示 |
| CommandPanel | `src/screens/03_Battle/components/CommandPanel.tsx` (想定) | コマンド選択 | 攻撃・防御ボタン |

**P1 Done条件:** BattleScreen がモックデータで表示でき、コマンドが選択できる

---

### MenuScreen（メニュー）

| Component | ファイルパス | 役割 | タスク例 |
|---|---|---|---|
| **MenuScreen** | `src/screens/13_Menu/MenuScreen.tsx` | メニューコンテナ | パーティ・アイテム画面の切り替え |
| **PartyView** | `src/screens/13_Menu/views/PartyView.tsx` | パーティ構成表示 | キャラクター一覧・ステータス |
| ItemView | `src/screens/13_Menu/views/ItemView.tsx` (想定) | アイテム一覧 | インベントリ表示 |

**P1 Done条件:** MenuScreen がパーティ・アイテム情報をモックデータで表示できる

---

### WorkSpaceScreen（開発用ワークスペース）

| Component | ファイルパス | 役割 | P1 or P2 |
|---|---|---|---|
| **WorkSpaceScreen** | `src/screens/workspace/WorkSpaceScreen.tsx` | ワークスペースコンテナ | P1 |
| **WorkSpaceDashboard** | `src/screens/workspace/components/WorkSpaceDashboard.tsx` | ダッシュボード | P1 |
| **DevLogViewer** | `src/devstudio/components/DevLogViewer.tsx` | ログビューア | P1 |
| **WriterView** | `src/screens/workspace/WriterView.tsx` | シナリオメモエディタ | P2 |
| **ScenarioMemo** | `src/screens/workspace/components/ScenarioMemo.tsx` (想定) | メモ本体 | P2 |

**P1 Done条件:** WorkSpaceDashboard・DevLogViewer が表示でき、addLog でログが記録される  
**P2 Done条件:** WriterView でシナリオが作成・保存・読み込みできる

---

### DevStudioScreen（開発スタジオ）

| Component | ファイルパス | 役割 | P1 or P2 |
|---|---|---|---|
| **DevStudioScreen** | `src/devstudio/DevStudioScreen.tsx` | DevStudioのルート | P1 |
| **PhasePanel** | `src/devstudio/components/PhasePanel.tsx` | フェーズ状態表示 | P1 |
| **TasksPanel** | `src/devstudio/components/TasksPanel.tsx` | タスク一覧 | P1 |
| **LogsPanel** | `src/devstudio/components/LogsPanel.tsx` | ログパネル | P1 |
| **GamePackageScreen** | `src/devstudio/components/GamePackageScreen.tsx` | ゲームパッケージ管理・プレイヤー | P2 |
| EpicsScreen | `src/devstudio/components/EpicsScreen.tsx` | Epic一覧 | P1 |

**P1 Done条件:** PhasePanel・TasksPanel・LogsPanel が表示でき、addLog/addReport が正常動作  
**P2 Done条件:** GamePackageScreen にシナリオJSONが登録でき、プレイヤーで再生できる

---

## Phase 2: Content（実シナリオ入れ込み）

### 拡張：WriterView / ScenarioMemo

P1では「ビューが表示される」まで。P2では「シナリオが作成・保存される」まで。

| Component | 期待される機能 |
|---|---|
| WriterView | localStorage にメモを保存・復元 |
| ScenarioMemo | Markdown形式でシナリオを記述・編集 |

### 拡張：GamePackageScreen

P1では「UI表示」まで。P2では「JSON登録・プレイ」まで。

| 機能 | 説明 |
|---|---|
| JSON入力フィーム | GamePackageのスキーマに従ったJSONを入力 |
| JSON検証 | スキーマ検証でエラーを表示 |
| Game再生ボタン | 登録されたGameをGamePackageScreenで再生 |

---

## 使用例

### タスク作成時
```
【タスク】ChapterScreen テキスト・選択肢の実装
【対象Component】ChapterScreen, ChapterText, ChoiceButtons
【参考】COMPONENT_MAP.md 参照
【期待】モックJSONでテキストと選択肢が表示される
```

### AI指示時
```
ChapterScreen コンポーネントを実装してください。
- ChapterText でモックテキストを表示
- ChoiceButtons で選択肢を表示＆クリック反応
モック JSONは src/0420_WorkSpace/mock/chapter.json を参照
```

---

## コンポーネント変更時

コンポーネント名・ファイルパスが実装中に変更された場合、このファイルを更新してください。  
各タスク・レポートの対象コンポーネントと矛盾しないよう注意。

**最終更新:** 2026-04-24
