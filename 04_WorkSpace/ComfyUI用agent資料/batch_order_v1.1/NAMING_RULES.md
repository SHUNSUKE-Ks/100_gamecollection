# 命名規則 — Ver1.1

---

## 発注フォルダー

```
delivery/YYYY-MM-DD_[project-slug]/
```

| 例                                   | 説明                       |
|--------------------------------------|----------------------------|
| `delivery/2026-04-18_batch-chara-v1.1/` | キャラ一括発注 v1.1 |
| `delivery/2026-05-01_batch-bg/`         | 背景追加発注            |
| `delivery/2026-05-10_pixel-enemies/`    | ピクセル敵スプライト    |

---

## バッチサブフォルダー（モデル別に必ず分ける）

| フォルダー名           | モデル                              | 用途               |
|------------------------|-------------------------------------|--------------------|
| `granblue_chara/`      | novaOrangeXL_v140 + granblue LoRA   | キャラ立ち絵・差分 |
| `granblue_background/` | novaOrangeXL_v140（LoRAなし）       | 背景・風景         |
| `pixel_sprite/`        | pixelArtSpriteDiffusion             | ピクセルスプライト |

> ⚠️ **モデルが違う場合は必ず別フォルダーで別実行する**

---

## prompts.csv の filename_prefix（出力ファイル名の prefix）

### 形式
```
[type]_[character/object]_[variant]
```

### type 一覧

| type     | 内容               |
|----------|--------------------|
| `chara`  | キャラクター全般   |
| `bg`     | 背景・風景         |
| `pixel`  | ピクセルアート全般 |
| `ui`     | UIパーツ           |
| `effect` | エフェクト素材     |

### variant 一覧（キャラ）

| variant              | 内容                  |
|----------------------|-----------------------|
| `standing`           | 立ち絵（デフォルト正面） |
| `standing_front`     | 正面立ち絵            |
| `standing_left`      | 左斜め立ち絵          |
| `standing_right`     | 右斜め立ち絵          |
| `standing_back`      | 後ろ立ち絵            |
| `face_normal`        | 表情・通常            |
| `face_smile`         | 表情・笑顔            |
| `face_angry`         | 表情・怒り            |
| `face_sad`           | 表情・悲しみ          |
| `face_surprise`      | 表情・驚き            |
| `bust`               | バストアップ          |
| `cg_[scene]`         | CG・イベント          |

### variant 一覧（背景）

| variant           | 内容           |
|-------------------|----------------|
| `exterior_day`    | 外観・昼間     |
| `exterior_night`  | 外観・夜間     |
| `interior`        | 室内           |
| `overworld`       | フィールドマップ |

### variant 一覧（ピクセル）

| variant    | 内容               |
|------------|--------------------|
| `idle`     | 待機モーション     |
| `walk_01`  | 歩行フレーム1      |
| `damage`   | ダメージ           |
| `icon`     | アイコン           |
| `frame01`  | アニメフレーム01   |

---

## 出力ファイル名（ComfyUI SaveImage が自動生成）

```
[filename_prefix]_[連番4桁].png
例: chara_hero_standing_0001.png
```

---

## 納品先フォルダー（手動移動）

```
src/assets/
├── chara/
│   ├── [character_id]/
│   │   ├── standing_front.png
│   │   └── faces/
│   │       ├── smile.png
│   │       └── angry.png
├── bg/
│   ├── [scene_id].png
├── pixel/
│   ├── enemies/
│   ├── items/
│   └── effects/
└── ui/
```

---

## 完成後チェックリスト

- [ ] ComfyUI output/ に生成されていることを確認
- [ ] filename が命名規則通りか確認  
- [ ] 各 `src/assets/` 以下の正しいフォルダーへ移動
- [ ] Firestoreまたはlocal JSONのパスを更新
- [ ] report.md に生成済みマークを記入
