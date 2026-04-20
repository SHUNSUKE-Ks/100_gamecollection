# バッチ発注レポート — Sample Ver1.1
> 作成日: 2026-04-18

---

## 発注概要

| バッチ                | モデル                         | 件数 | 解像度    |
|-----------------------|--------------------------------|------|-----------|
| granblue_chara        | novaOrangeXL_v140 + granblue LoRA | 7  | 512×768 / 512×512 |
| granblue_background   | novaOrangeXL_v140              | 5    | 1920×1080 |
| pixel_sprite          | pixelArtSpriteDiffusion        | 8    | 64×64 / 32×32 / 48×48 |
| **合計**              |                                | **20** |         |

---

## 実行手順

```bash
# ① ComfyUI を BAT で起動してから実行
# ② 各フォルダーで順番に送信

cd granblue_chara
python send_batch.py --template template.json --prompts prompts.csv

cd ../granblue_background
python send_batch.py --template template.json --prompts prompts.csv

cd ../pixel_sprite
python send_batch.py --template template.json --prompts prompts.csv
```

### ドライラン（確認のみ）
```bash
python send_batch.py --template template.json --prompts prompts.csv --dry-run
```

---

## 出力先と命名規則

| 生成後ファイル名                   | 納品先（手動移動）                     |
|------------------------------------|----------------------------------------|
| `chara_hero_standing_0001.png`     | `src/assets/chara/hero/`               |
| `chara_hero_face_smile_0001.png`   | `src/assets/chara/hero/faces/`         |
| `chara_mage_standing_0001.png`     | `src/assets/chara/mage/`               |
| `bg_royal_city_day_0001.png`       | `src/assets/bg/`                       |
| `bg_dungeon_interior_0001.png`     | `src/assets/bg/`                       |
| `pixel_slime_idle_0001.png`        | `src/assets/pixel/enemies/`            |
| `pixel_item_potion_hp_0001.png`    | `src/assets/pixel/items/`              |

---

## 備考・メモ

- [ ] 勇者の後ろ姿が必要なら MultiAngle LoRA (weight: 0.7) を追加
- [ ] 背景は 1920×1080 → 必要に応じてゲーム内解像度にリサイズ
- [ ] スプライトはリサイズ禁止（必ず目標サイズで生成）
- [ ] seed 固定が必要な場合は prompts.csv の seed 列に値を入力
