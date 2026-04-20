# Style Skill: グラブル風（Granblue Fantasy Style）

## 適用Agent
Illustrator

## 使用モデル
- Checkpoint: novaOrangeXL_v140
- LoRA: granblue-klein9b.safetensors
- LoRA weight: 0.6〜0.8（デフォルト: 0.7）

## プロンプトテンプレート

### Positive（ベース）
```
granblue fantasy style, anime illustration,
official art, highly detailed character,
vivid colors, clean lineart, flat shading,
soft shadows, game cg,
{キャラ説明をここに追加}
```

### Negative（ベース）
```
lowres, bad anatomy, bad hands, worst quality,
blurry, realistic, 3d render, western style,
sketch, rough, unfinished, watermark,
multiple characters
```

## 推奨パラメータ
```
Steps:   25〜30
CFG:     7
Sampler: dpmpp_2m
Scheduler: karras
解像度:  512x768（立ち絵）/ 768x768（バスト）
```

## 差分生成時の追加設定
- LoRA: Qwen-MultiAngle（weight: 0.7）を追加
- ワークフロー: Qwen-MultiAngle_v1.json を使用
- 角度: 正面・左斜め・右斜め・後ろ の4点セット

## 注意事項
- granblue + Lightning の同時使用禁止（画風崩れ）
- CFG 8以上でグラブル感が薄れる傾向あり
- weight 0.8以上でキャラが固定されすぎる場合がある
