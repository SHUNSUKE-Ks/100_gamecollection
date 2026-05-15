# キャラクター生成ワークフロー改善案メモ

現状の環境（`30_Graphicker`ディレクトリのルール、NotionのComfyUI構成）を確認し、キャラクター生成がうまくいかない原因と対策、および今後作成する生成依頼スキーマの案をまとめました。

## 1. 現状分析

### 📋 ローカルルール
- **命名規則**: `ch_{カテゴリ}_{名前}_{バリエーション}.png` (例: `ch_hero_normal.png`)
- **画像サイズ**:
    - 立ち絵(全身): **1024x2048**
    - バストアップ: **512x512**
- **形式**: PNG (背景透過必須)

### 🛠️ ComfyUI環境 (Notionより)
- **モデル**:
    - `ace_step_v1_3.5b` (アニメ調?)
    - `novaOrangeXL_v140` (SDXL系?)
    - `pixelArtSpriteDiffusion` (ドット絵用、SD1.5ベース?)
- **ControlNet**:
    - `OpenPose`, `Depth`, `Canny`, `Scribble` (SD1.5用)
    - `Tile` (高画質化・アップスケール用)
- **Custom Nodes**:
    - `ComfyUI-Crystools` (リソースモニター)
    - `ComfyUI-Manager` (管理ツール)
    - `efficiency-nodes-comfyui` (効率化ノード)

## 2. 生成がうまくいかない主な原因と対策

現状「なかなか生成できない」とのことで、以下のボトルネックが考えられます。

### ① 解像度の問題 (SD1.5 vs SDXL)
- **現象**: いきなり `1024x2048` で生成しようとすると、特にSD1.5ベース（`pixelArtSpriteDiffusion`など）では構図が破綻したり、体が複数になったりします。
- **対策**: **Hires Fix (高解像度化補助)** の導入が必須です。
    - まず `512x768` 程度で生成 → `2倍` または `2.5倍` にアップスケールするフローを組みます。
    - SDXLモデル（`novaOrangeXL`）を使う場合は `1024x1024` 近辺からスタートできますが、縦長 `1024x2048` はワンショットだと厳しい場合があります。

### ② ポーズの固定
- **現象**: プロンプトだけでは「立ち絵」として使いやすいポーズ（棒立ち、少し斜め）が出にくい。
- **対策**: **ControlNet OpenPose** を使用します。
    - `models/controlnet` に `control_v11p_sd15_openpose.pth` があるため、棒立ちの棒人間画像を用意し、それを参照させて生成することで、確実に立ち絵ポーズを作れます。

### ③ 画風の制御 (ドット絵 vs イラスト)
- **現象**: モデルによってプロンプトの効き方が異なります。
- **対策**:
    - **ドット絵**: `pixelArtSpriteDiffusion` を使用。VAEやClip Skipの設定も重要。
    - **高精細イラスト**: `novaOrangeXL` や `ace_step` を使用。こちらはプロンプト（"masterpiece, best quality"など）がより重要になります。

## 3. ComfyUI キャラクター生成スキーマ案

「ComfyUIに生成依頼するCharacterのスキーマ」として、JSON形式で以下の構造を提案します。これをPythonスクリプトなどで読み込み、ComfyUIのAPIに投げる想定です。

### 📄 schema_character_gen.json (案)

```json
{
  "project_name": "NanoNovel_Project",
  "requests": [
    {
      "id": "ch_hero_001",
      "filename": "ch_hero_normal.png",
      "config": {
        "model": "novaOrangeXL_v140.safetensors",
        "vae": "vae-ft-mse-840000-ema-pruned.safetensors",
        "loras": [
            { "name": "flat_color_lora.safetensors", "strength": 0.8 }
        ],
        "width": 1024,
        "height": 2048,
        "batch_size": 4
      },
      "params": {
        "positive_prompt": "1boy, hero, fantasy armor, sword on back, standing, simple background, white background",
        "negative_prompt": "nsfw, worst quality, low quality, (multiple views:1.2)",
        "seed": -1,
        "steps": 30,
        "cfg": 7.0,
        "sampler": "dpmpp_2m",
        "scheduler": "karras"
      },
      "controlnet": {
        "enabled": true,
        "module": "openpose",
        "image_path": "./poses/tachi_e_pose.png" // 棒人間画像のパス
      },
      "post_processing": {
        "remove_background": true, // 背景削除処理
        "face_detailer": true // 顔補正処理
      }
    }
  ]
}
```

## 4. 推奨ワークフロー構成

以下のノード構成を推奨します。

1.  **Checkpoint Loader**: モデル選択
2.  **LoRA Loader** (任意): 画風調整
3.  **ControlNet Apply (OpenPose)**: ポーズ指定
4.  **KSampler (T2I)**: 低解像度で生成 (`512x1024`等)
5.  **VAE Decode** -> **Image Scale (Upscale)**: 拡大
6.  **KSampler (I2I / Hires Fix)**: ディテールアップしながら拡大
7.  **Face Detailer** (Impact Pack等): 顔の崩れを修正
8.  **Image Rembg (背景削除)**: キャラクターを切り抜き
9.  **Save Image**: 指定の命名規則で保存

---

まずはこの方針で進めてよろしいでしょうか？
問題なければ、このスキーマをより詳細化し、実際のJSONファイル作成に進みます。
