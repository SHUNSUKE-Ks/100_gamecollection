# Style Skill: ピクセルアート（Pixel Art Style）

## 適用Agent
Pixeler

## 使用モデル
- Checkpoint: pixelArtSpriteDiffusion（固定）
- LoRA: 基本不使用

## プロンプトテンプレート

### Positive（ベース）
```
pixel art, pixel sprite, retro game style,
16bit, clean pixels, limited color palette,
game asset, {内容をここに追加}
```

### 用途別追加タグ
```
キャラチップ: character sprite, top-down view, rpg maker style
タイル素材:   tileset, map chip, seamless tile, texture
アイコン:     icon, ui element, item icon
ボスキャラ:   large sprite, boss character, detailed pixel art
エフェクト:   particle effect, animation frame, sprite sheet
```

### Negative（ベース）
```
blurry, smooth, anti-aliasing, realistic,
high resolution, detailed texture, 3d,
photo, painting, sketch
```

## 推奨パラメータ
```
Steps:   20〜25
CFG:     7〜8
Sampler: dpmpp_2m
Scheduler: karras
```

## 解像度別設定
| 解像度 | 用途 | 備考 |
|--------|------|------|
| 32x32 | マップチップ・小アイコン | RPGツクール標準 |
| 48x48 | キャラチップ（MV/MZ） | RPGツクールMV/MZ標準 |
| 64x64 | 汎用スプライト | Unity等汎用 |
| 128x128 | 大型キャラ・ボス | 詳細表現可能 |

## 注意事項
- 解像度を大きくしてからリサイズすると滲む
- 必ず目標解像度で直接生成する
- カラーパレット制限がある場合はプロンプトに枚数を明記
  （例: "4 color palette", "8 color palette"）
