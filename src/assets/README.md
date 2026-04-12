# Assets

ゲームで使用するアセット（画像・音声）を管理するディレクトリです。

## タグ命名規則

```
{category}_{name}_{width}x{height}

例:
bg_forest_morning_1280x720
chara_hero_smile_1024x1024
item_magic_sword_512x512
```

## ディレクトリ構成

```
assets/
├── bg/           # 背景画像
├── chara/        # キャラクター画像
├── item/         # アイテム画像
├── effect/       # エフェクト画像・動画
├── skill/        # スキルアイコン
├── ui/           # UI素材
├── sound/        # 音声ファイル
│   ├── bgm/      # BGM
│   └── se/       # 効果音
└── tags/         # タグ管理
    └── tags_for_notion.csv
```

## パス規則

```
src/assets/{category}/{tag_key}.{ext}
```

例: `src/assets/bg/bg_forest_morning_1280x720.png`

## 画像サイズ推奨

| カテゴリ | 推奨サイズ |
|---------|-----------|
| 背景 | 1280x720 |
| キャラクター | 1024x1024 |
| アイコン | 256x256 / 512x512 |
