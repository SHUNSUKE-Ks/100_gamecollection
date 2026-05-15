# クエスト JSON スキーマ

## ファイル構造

クエストファイルは **配列形式** のJSONです。

```json
[
    { /* ノード1 */ },
    { /* ノード2 */ },
    ...
]
```

---

## ノード共通スキーマ

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| `storyID` | string | ✅ | 一意のID（例: `"Q_03_01_01"`） |
| `scene` | number | ✅ | シーン番号（グルーピング用） |
| `type` | string | △ | ノードタイプ（`SCENE_START`のみ） |
| `speaker` | string | ○ | 話者名 |
| `text` | string | ○ | 本文テキスト |
| `event` | object | △ | イベント定義 |
| `backgroundImage` | string | ○ | 背景画像パス |
| `characterImage` | string | △ | キャラ画像パス |
| `bgm` | string | ○ | BGMキー |
| `questTitle` | string | △ | タイトルコール用テキスト |
| `note` | string | △ | 開発用メモ（表示されない） |

**凡例:** ✅=必須 / ○=推奨 / △=任意

---

## ノードタイプ別サンプル

### 1. SCENE_START（シーン開始）

クエスト開始時に必須。タイトルコールを表示します。

```json
{
    "storyID": "Q_03_01_01",
    "scene": 1,
    "type": "SCENE_START",
    "questTitle": "森の遺跡の調査",
    "backgroundImage": "bg/forest_ruins.png",
    "bgm": "mori01",
    "note": "Quest 03 開始"
}
```

---

### 2. 通常テキスト（会話・ナレーション）

```json
{
    "storyID": "Q_03_01_02",
    "scene": 1,
    "speaker": "ナレーション",
    "text": "依頼を受けたあなたは、森の奥深くにある遺跡へとやってきた。",
    "backgroundImage": "bg/forest_ruins.png",
    "bgm": "mori01"
}
```

キャラクター表示あり:
```json
{
    "storyID": "Q_03_01_03",
    "scene": 1,
    "speaker": "シャドウウルフ",
    "text": "グルルル...",
    "characterImage": "Monster_01.png",
    "backgroundImage": "bg/forest_ruins.png",
    "bgm": "mori01"
}
```

---

### 3. BATTLE_START（バトル開始）

```json
{
    "storyID": "Q_03_01_05",
    "scene": 1,
    "event": {
        "type": "BATTLE_START"
    },
    "speaker": "システム",
    "text": "バトル開始！シャドウウルフが襲い掛かってきた！",
    "characterImage": "Monster_01.png",
    "backgroundImage": "bg/forest_ruins.png",
    "bgm": "mori01"
}
```

---

### 4. CHOICE（選択肢）

```json
{
    "storyID": "Q_03_01_10",
    "scene": 1,
    "event": {
        "type": "CHOICE",
        "payload": {
            "choices": [
                { "label": "戦う", "nextStoryID": "Q_03_01_11" },
                { "label": "逃げる", "nextStoryID": "Q_03_01_20" }
            ]
        }
    },
    "speaker": "あなた",
    "text": "どうする？"
}
```

---

### 5. END（クエスト終了）

```json
{
    "storyID": "Q_03_01_99",
    "scene": 1,
    "event": {
        "type": "END",
        "payload": {
            "goto": "COLLECTION"
        }
    },
    "backgroundImage": "bg/forest_ruins.png"
}
```

| `goto` 値 | 遷移先 |
|-----------|--------|
| `"COLLECTION"` | クエスト一覧画面（推奨） |
| `"RESULT"` | リザルト画面 |

---

## 完全サンプル

```json
[
    {
        "storyID": "Q_03_01_01",
        "scene": 1,
        "type": "SCENE_START",
        "questTitle": "森の遺跡の調査",
        "backgroundImage": "bg/forest_ruins.png",
        "bgm": "mori01"
    },
    {
        "storyID": "Q_03_01_02",
        "scene": 1,
        "speaker": "ナレーション",
        "text": "あなたは森の奥深くにある遺跡へとやってきた。"
    },
    {
        "storyID": "Q_03_01_03",
        "scene": 1,
        "speaker": "シャドウウルフ",
        "text": "グルルル...",
        "characterImage": "Monster_01.png"
    },
    {
        "storyID": "Q_03_01_04",
        "scene": 1,
        "event": { "type": "BATTLE_START" },
        "speaker": "システム",
        "text": "バトル開始！"
    },
    {
        "storyID": "Q_03_01_05",
        "scene": 1,
        "speaker": "システム",
        "text": "ミッション達成！報酬を獲得した。"
    },
    {
        "storyID": "Q_03_01_06",
        "scene": 1,
        "event": {
            "type": "END",
            "payload": { "goto": "COLLECTION" }
        }
    }
]
```

---

## バリデーションルール

1. **storyID** は同一ファイル内で一意
2. **最初のノード** は `type: "SCENE_START"` 必須
3. **最後のノード** は `event.type: "END"` 必須
4. **nextStoryID** は同一ファイル内に存在するIDを指定
