# NanoNovel / GameCollection — スクリーン構成概要

> 作成日: 2026-04-06  
> 対象コード: `src/screens/` `src/parts/` `src/components/`

---

## アプリ概要

もとはノベルゲームエンジン「NanoNovel」として製作されたが、現在は以下3用途で運用:

| 用途 | 内容 |
|------|------|
| **Collection / 素材置き場** | 各タイトルのキャラ・背景・BGM・イベント等をJSONで管理・閲覧 |
| **API テスト** | BS01 バトル API サーバーとの通信テスト (`ApiBattleScreen`) |
| **ノベルゲーム実機テスト** | シナリオ・バトル・セーブロードなどの動作確認 |

---

## 画面遷移マップ

```
TITLE ──┬──→ CHAPTER → NOVEL ──→ BATTLE / MENU
        ├──→ HOME（待機）
        ├──→ COLLECTION
        ├──→ MENU
        └──→ NOVEL（API Battle Test）→ API_BATTLE
```

画面は Zustand の `gameStore.currentScreen` で管理。`setScreen()` で遷移。

---

## 各スクリーン詳細

---

### `TITLE` — TitleScreen
**ファイル:** [src/screens/01_Title/TitleScreen.tsx](src/screens/01_Title/TitleScreen.tsx)

タイトル画面。ゲームのエントリーポイント。

| ボタン | 動作 |
|--------|------|
| New Game | `resetGame()` → `CHAPTER` へ |
| Continue | セーブデータがあれば SaveLoadModal (load モード) を開く |
| Home (Standby) | `HOME` へ |
| Collection | `COLLECTION` へ |
| Menu | `MENU` へ |
| 🧪 API Battle Test | `storyID = 'API_TEST_01'` を設定して `NOVEL` へ |

**依存:** `SaveManager.hasSaveData()`, `SaveLoadModal`

---

### `HOME` — HomeScreen
**ファイル:** [src/screens/00_Home/HomeScreen.tsx](src/screens/00_Home/HomeScreen.tsx)

キャラクターとのインタラクション待機画面。

**主要機能:**

| 機能 | 詳細 |
|------|------|
| キャラ表示 | `ChromaKeyCharacter` でクロマキー処理した立ち絵表示 |
| AI 画像生成 | Google Gemini (`gemini-2.5-flash-image`) で感情ごとの差分絵を生成 |
| ステータスゲージ | 左側に HP/MP 等を `StatusGauge` で表示 |
| クイックアクション | 右側のボタン群、クールダウン付き |
| アイドル検知 | 15秒無操作で `idle()` を呼び出し |
| プレゼント | `Inventory` からプレゼントを選択して渡す |
| イベント | `EventOverlay` でシナリオイベントをオーバーレイ表示 |
| キャラ切替 | `CharacterBox` で複数キャラを切り替え |

**コンポーネント構成:**
```
HomeScreen
├── ChromaKeyCharacter（立ち絵）
├── StatusGauge × N（HP/MP等）
├── CharacterBox（キャラ選択）
├── Inventory（プレゼント）
├── ActionButton × N（クイックアクション）
├── EventOverlay（イベント演出）
└── ローディングオーバーレイ（画像生成中）
```

---

### `CHAPTER` — ChapterScreen
**ファイル:** [src/screens/02_Novel/ChapterScreen.tsx](src/screens/02_Novel/ChapterScreen.tsx)

チャプター開幕の演出画面。

- デフォルト4秒後に自動で `NOVEL` へフェードアウト遷移
- クリック or Skip ボタンで即スキップ可能
- プロップスで `chapterNumber` / `title` / `description` を変更可能

---

### `NOVEL` — NovelScreen
**ファイル:** [src/screens/02_Novel/NovelScreen.tsx](src/screens/02_Novel/NovelScreen.tsx)

ノベルゲームの本編画面。

| 機能 | 詳細 |
|------|------|
| テキスト進行 | クリックで `advance()` |
| 選択肢 | `hasChoices` が true のとき選択肢ボタンを表示 |
| オート | 2.5秒ごとに自動進行、選択肢で自動停止 |
| タイトルコール | `isSceneStart` + `titleCallText` でオーバーレイ演出 (3秒) |
| チャットログ | `ChatLog` モーダルで過去ログを確認 |
| セーブ/ロード | `SaveLoadModal` で 4スロット対応 |
| 進行度 | ヘッダーに `progress%` 表示 |

**依存 Hook:** `useScenario()`

---

### `BATTLE` — BattleScreen
**ファイル:** [src/screens/03_Battle/BattleScreen.tsx](src/screens/03_Battle/BattleScreen.tsx)

ローカルデータを使ったスタンドアロンバトル画面。

| 要素 | 詳細 |
|------|------|
| 敵 | `enemies.json` からランダム選出 |
| スキル | `skills.json` の slash / guard / heal を使用 |
| ターン制 | player → enemy の順で進行、1.5秒ディレイ |
| 計算 | `base + stat * 0.5` にランダム補正 (±10%) |
| 防御 | guard 発動中はダメージ50%軽減 |
| 報酬 | 勝利時に `drop.items` を `addItem()` |
| 遷移 | 勝利→NOVEL / 敗北→TITLE |

---

### `API_BATTLE` — ApiBattleScreen
**ファイル:** [src/screens/04_ApiBattle/ApiBattleScreen.tsx](src/screens/04_ApiBattle/ApiBattleScreen.tsx)

BS01 API サーバー (`localhost:3000/api/bs01`) と通信するバトル画面。  
デバッグコード [1B-xxx] が各所に入っており開発テスト用途が主。

**v2 レスポンス対応:**

| API | 用途 |
|-----|------|
| `GET /health` | 接続確認 |
| `GET /start` | バトル開始、モンスター/シーン/コマンド/playerStatus 取得 |
| `POST /action` | コマンド実行、v2 result フィールドで勝敗判定 |

**result フィールド:**
- `ongoing` → バトル継続
- `win` → 勝利オーバーレイ + 報酬
- `gameover` → ゲームオーバーオーバーレイ
- `fled` → 逃走成功
- `flee_failed` → 逃走失敗、敵の反撃後バトル継続

**コマンド v1/v2 互換:** `cmd.ActionID || cmd.id` で正規化

---

### `MENU` — MenuScreen
**ファイル:** [src/screens/13_Menu/MenuScreen.tsx](src/screens/13_Menu/MenuScreen.tsx)

ゲームメニュー。`menuConfig.json` で構成を外部定義。

| メニュー項目 | 状態 |
|------------|------|
| パーティ | `PartyView` — 実装済 |
| ステータス | 未実装 |
| アイテム | 未実装 |
| 装備 | 未実装 |
| セーブ | 未実装 |

フッターにゴールド表示、ヘッダーにプレイ時間表示。  
戻るボタンは `NOVEL` へ遷移。

---

## Collection 画面（詳細）

→ 別ドキュメント参照: [collection_detail.md](collection_detail.md)
