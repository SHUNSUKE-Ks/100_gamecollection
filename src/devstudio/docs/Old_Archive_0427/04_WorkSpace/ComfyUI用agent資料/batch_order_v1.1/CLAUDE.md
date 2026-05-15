# Batch Order Agent — Ver 1.1

## 役割
画像発注書（CSV）とスタイルテンプレート（JSON）を組み合わせて
ComfyUI に送信可能なバッチデータを生成するエージェント。

---

## ディレクトリ構造（毎回この形で納品）

```
delivery/YYYY-MM-DD_[project-slug]/
├── granblue_chara/          ← グラブル風キャラ（novaOrangeXL + LoRA）
│   ├── template.json
│   ├── prompts.csv
│   └── send_batch.py
├── granblue_background/     ← 背景・風景（novaOrangeXL、LoRAなし）
│   ├── template.json
│   ├── prompts.csv
│   └── send_batch.py
├── pixel_sprite/            ← ピクセルアート（pixelArtSpriteDiffusion）
│   ├── template.json
│   ├── prompts.csv
│   └── send_batch.py
└── report.md                ← 発注一覧・命名規則・メモ
```

> **モデルが違う場合は必ずサブフォルダーを分ける。**
> 同モデル・同LoRA設定のみ同一フォルダーに入れる。

---

## 命名規則

### 発注フォルダー名
```
YYYY-MM-DD_[project-slug]/
例: 2026-04-18_batch-chara-v1.1/
```

### prompts.csv の filename_prefix 列（出力ファイル名）
```
[type]_[character/object]_[variant]
例:
  chara_hero_standing        → 立ち絵・正面
  chara_hero_face_smile      → 表情差分
  bg_dungeon_01              → 背景・ダンジョン
  pixel_slime_sprite         → ピクセルスプライト
```

### ComfyUI 出力ファイル（SaveImage が自動付番）
```
[filename_prefix]_[連番4桁].png
例: chara_hero_standing_0001.png
```

### 納品先フォルダー（手動で移動）
```
src/assets/chara/[character_id]/    ← キャラ立ち絵
src/assets/chara/[character_id]/faces/  ← 表情差分
src/assets/bg/                      ← 背景
src/assets/pixel/                   ← ピクセルアート
```

---

## 使い方

1. `templates/` にある対応テンプレートを発注フォルダーにコピー
2. `prompts.csv` をキャラ・オブジェクトの数だけ記入
3. `send_batch.py` を実行
   ```bash
   python send_batch.py --template template.json --prompts prompts.csv
   ```
4. ComfyUI の output/ に生成される
5. 生成後、手動で `src/assets/` 以下へ移動

---

## テンプレート一覧（templates/ フォルダー）

| ファイル名                       | モデル                     | 用途               |
|----------------------------------|----------------------------|--------------------|
| granblue_chara_template.json     | novaOrangeXL + granblue LoRA | キャラ立ち絵・差分 |
| granblue_bg_template.json        | novaOrangeXL               | 背景・風景         |
| pixel_sprite_template.json       | pixelArtSpriteDiffusion    | ピクセルスプライト |

---

## 制約・注意事項

- granblue LoRA と Lightning LoRA は同時使用禁止
- バッチ間でモデルが異なる場合は **サブフォルダーを分けて別実行**
- seed は `-1`（ランダム）をデフォルトとし、再現が必要な場合のみ固定
- `send_batch.py` は ComfyUI が起動済み（BAT経由）であることを前提とする
- ComfyUI デフォルトポート: `http://127.0.0.1:8188`
