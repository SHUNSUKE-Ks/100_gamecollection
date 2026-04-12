# 📦 Asset Management Rules

このドキュメントは、プロジェクト「Novel PWA」におけるアセット管理、命名規則、JSON登録のルールを定義します。
JSON駆動開発（JSON-Driven Development）において、データとアセットの整合性を保つための「正（Source of Truth）」となるルールです。

## 1. ディレクトリ構造

アセットは `src/assets` 配下に種類ごとに分類して格納します。

```text
src/assets/
├── bg/             # 背景 (Backgrounds) - 1920x1080 jpg/png
├── chara/          # キャラクター (Characters)
│   ├── [name]/     # キャラクターごとの専用フォルダ
│   │   ├── standing/ # 立ち絵
│   │   └── faces/    # 表情差分アイコン (256x256 -> 60x60 display)
│   └── npc/        # NPC用フォルダ
├── sound/          # 音声 (Sounds)
│   ├── bgm/
│   └── se/
├── items/          # アイテムアイコン (Items) - 128x128 png
├── enemies/        # エネミー画像 (Enemies)
├── tips/           # Tips用イメージ (Tips) - 1920x1080 or 16:9
├── cg/             # イベントCG (Event CGs) - 1920x1080
└── ui/             # UIパーツ
```

## 2. 命名規則 (Naming Conventions)

ファイル名は全て**小文字の英数字とアンダースコア (`_`)** を使用します。

| カテゴリ | プレフィックス | 形式例 | 備考 |
| :--- | :--- | :--- | :--- |
| **背景** | なし | `village_day.jpg` | 場所名_時間帯/状況 |
| **立ち絵** | なし | `standing_01.png` | キャラフォルダ内なら単純化可 |
| **表情** | なし | `smile.png`, `angry.png` | 感情名 |
| **アイテム** | `item_` (推奨) | `item_potion_red.png` | `icon_` でも可 |
| **エネミー** | `enemy_` (推奨) | `enemy_slime_green.png` | |
| **イベントCG** | `cg_` | `cg_ep1_meeting.png` | エピソードやイベント名を含める |
| **Tips画像** | `tip_` | `tip_world_map.jpg` | |
| **BGM** | なし | `battle_theme.mp3` | |

### Character Art vs Event CG

*   **Portrait / Character Illust (`PORTRAIT`)**:
    *   キャラクター単体の高品質なイラスト。背景なしか簡易背景。
    *   用途: ステータス画面、キャラ紹介、会話時の大型立ち絵。
*   **Event CG (`EVENT_CG`)**:
    *   特定のイベントシーンを描いた一枚絵。背景とキャラが統合されている。
    *   用途: シナリオ中のイベント表示、ギャラリーモード。

## 3. JSON登録ルール

全ての素材は `src/assets/data/` 以下のJSONファイルで管理IDと紐付けられます。

*   **`characters.json`**: キャラクター定義、立ち絵パス。
*   **`backgrounds.json`**: 背景定義、パス。
*   **`items.json`**: アイテム定義、アイコンパス。
*   **`events.json` / `gallery.json`**: イベントCGパス。
*   **`tips.json`**: Tips定義、画像パス。

## 4. AIアセット発注フロー

1.  **不足確認**: `orders/` フォルダに必要なアセットの発注書JSONを作成。
2.  **生成**: AIを使用して画像を生成。
3.  **格納**: 適切なディレクトリに配置・リネーム。
4.  **登録**: 対応するデータJSON (characters.json等) にパスを登録。
