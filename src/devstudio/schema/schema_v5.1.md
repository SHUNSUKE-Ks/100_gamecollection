# 📘 スキーマ Ver5.1（統合版）

（Scenarioたたき台 + Asset + 実行用パッケージ）

---

# ■ 🎯 目的（Ver5.1）

* Scenarioのたたき台から**即実行可能な状態**を作る
* JSONと素材を**1フォルダで完結**
* エンジンにそのまま渡せる構成

---

# ■ 📦 フォルダ構成

```text id="folder_v51"
Title/
 ├ events.json
 ├ chats.json
 ├ choices.json
 ├ state.json
 ├ AssetOrderList.jsonc
 └ assets/
     ├ images/
     └ audio/
```

---

# ■ 🧱 JSON一覧（最小構成）

```text id="json_list_v51"
events   → スロット（進行）
chats    → 会話ブロック
choices  → 分岐イベント
state    → 状態
assets   → アセット辞書
```

---

# ■ 📦 events.json（スロット）

```json id="events_v51"
{
  "version": "5.1",
  "start_event_id": "EV_001",
  "events": [
    { "event_id": "EV_001", "type": "CHAT", "ref_id": "CHAT_001", "next": "EV_002" },
    { "event_id": "EV_002", "type": "CHAT", "ref_id": "CHAT_002", "next": "EV_003" },
    { "event_id": "EV_003", "type": "CHOICE", "ref_id": "CHOICE_001" },

    { "event_id": "EV_010", "type": "CHAT", "ref_id": "CHAT_010", "next": "EV_030" },
    { "event_id": "EV_020", "type": "CHAT", "ref_id": "CHAT_020", "next": "EV_030" },

    { "event_id": "EV_030", "type": "CHAT", "ref_id": "CHAT_030" }
  ]
}
```

---

# ■ 💬 chats.json（会話ブロック）

```json id="chats_v51"
{
  "version": "5.1",
  "chats": [
    {
      "chat_id": "CHAT_001",
      "lines": [
        {
          "speaker": "",
          "text": "古びた塔の扉が開いた。",
          "tags": ["bg:BG_DEFAULT", "se:SE_DOOR"]
        }
      ]
    },
    {
      "chat_id": "CHAT_002",
      "lines": [
        { "speaker": "レミ", "text": "ここが塔…", "tags": ["char:CHAR_REMI"] },
        { "speaker": "レミ", "text": "どうする？" }
      ]
    },
    {
      "chat_id": "CHAT_010",
      "lines": [
        { "speaker": "", "text": "回廊が続いていた。" }
      ]
    },
    {
      "chat_id": "CHAT_020",
      "lines": [
        { "speaker": "", "text": "慎重に観察した。" }
      ]
    },
    {
      "chat_id": "CHAT_030",
      "lines": [
        { "speaker": "長老", "text": "よく来た。" }
      ]
    }
  ]
}
```

---

# ■ 🎲 choices.json（選択）

```json id="choices_v51"
{
  "version": "5.1",
  "choices": [
    {
      "choice_id": "CHOICE_001",
      "question": {
        "speaker": "レミ",
        "text": "この先へ進む？"
      },
      "options": [
        {
          "label": "進む",
          "next": "EV_010",
          "effects": {
            "flags": { "brave": true },
            "params": { "courage": 2 }
          },
          "result": {
            "speaker": "",
            "text": "進んだ。"
          }
        },
        {
          "label": "様子を見る",
          "next": "EV_020",
          "effects": {
            "flags": { "careful": true }
          },
          "result": {
            "speaker": "",
            "text": "様子を見た。"
          }
        }
      ]
    }
  ]
}
```

---

# ■ 🧠 state.json（状態）

```json id="state_v51"
{
  "version": "5.1",
  "flags": {
    "brave": false,
    "careful": false
  },
  "params": {
    "courage": 0,
    "money": 100
  }
}
```

---

# ■ 📦 AssetOrderList.jsonc（Ver5.1）

```jsonc id="asset_v51"
{
  "ASSET_ORDER": {
    "NOVEL": {
      "BG_DEFAULT": "bg_default_1280x720.svg",
      "CHAR_REMI": "char_remi_512x1024.svg",
      "CHAR_ELDER": "char_elder_512x1024.svg",

      "SE_DOOR": "se_door.mp3",
      "SE_BUTTON": "se_button.mp3"
    }
  }
}
```

---

# ■ 🔄 実行フロー

```text id="flow_v51"
Event取得
 ↓
CHAT → chats参照 → 表示
CHOICE → choices参照 → UI
 ↓
effects → state更新
 ↓
nextへ
```

---

# ■ 🔥 Ver5.1のポイント

```text id="point_v51"
・Eventは完全スロット
・Chatは会話ブロック
・Choiceは独立イベント
・Stateは1ファイル
・Assetはキー参照
```

---

# ■ 🎯 最終定義

```text id="final_v51"
1フォルダ = 1ゲーム
JSON + assets を渡せば動く
```
