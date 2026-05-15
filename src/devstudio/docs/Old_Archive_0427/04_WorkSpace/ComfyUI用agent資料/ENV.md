# ComfyUI Environment Reference
> 全Agentが参照する環境情報マスター資料
> 最終更新: 2026-02-20

---

## ■ システム概要

| 項目 | 内容 |
|------|------|
| ComfyUI バージョン | v0.11.1 |
| ルートパス | `D:\ai\ComfyUI` |
| 起動方式 | BAT起動（PortableGit + venv）|
| 運用形態 | SSDポータブル／外出先PC接続 |
| Git管理 | `D:\MyTools\PortableGit` |

### ⚠️ 起動の注意
- 必ずBAT経由で起動すること
- CMDから直接実行するとModuleNotFoundErrorになる
- torchはvenv内にインストール済み

---

## ■ パス一覧

| 用途 | パス |
|------|------|
| ComfyUIルート | `D:\ai\ComfyUI` |
| Checkpoint | `D:\ai\ComfyUI\models\checkpoints` |
| LoRA | `D:\ai\ComfyUI\models\loras` |
| ControlNet | `D:\ai\ComfyUI\models\controlnet` |
| Embeddings | `D:\ai\ComfyUI\models\embeddings` |
| Workflow保存 | `D:\ai\ComfyUI\user\default\workflows` |
| Output | `D:\ai\ComfyUI\output` |
| CustomNodes | `D:\ai\ComfyUI\custom_nodes` |

---

## ■ Checkpointモデル

| モデル名 | サイズ | 主用途 | 対応Agent |
|----------|--------|--------|-----------|
| novaOrangeXL_v140 | 6.9GB | 汎用XL・立ち絵・差分 | Illustrator, Refiner |
| pixelArtSpriteDiffusion | 4.2GB | ピクセルアート・タイル | Pixeler |
| ace_step_v1_3.5b | 7.7GB | 音楽・BGM生成 | Composer |

**総容量: 約18.9GB**

### モデル選定ルール
```
立ち絵・差分・グラブル風  → novaOrangeXL_v140
ピクセル・ドット・タイル  → pixelArtSpriteDiffusion
音楽・BGM・効果音        → ace_step_v1_3.5b
```

---

## ■ LoRAモデル

| ファイル名 | 用途 | 推奨weight | 対応Agent |
|------------|------|-----------|-----------|
| granblue-klein9b.safetensors | グラブル風キャラスタイル | 0.6〜0.8 | Illustrator |
| Qwen-MultiAngle_v1.safetensors | 多角度視点・差分生成 | 0.7 | Illustrator, Refiner |
| Qwen-Lightning-4steps-V1.0-bf16.safetensors | 高速4step生成 | 1.0 | Illustrator, Refiner |

### LoRA選定ルール
```
グラブル風スタイル  → granblue-klein9b（weight: 0.7）
多角度・差分量産   → Qwen-MultiAngle（weight: 0.7）
高速プレビュー生成  → Qwen-Lightning-4steps（weight: 1.0）
```

### LoRA組み合わせ禁止
- granblue + Lightning の同時使用は画風が崩れるため非推奨
- MultiAngle + Lightning は速度優先時のみ許可（品質低下あり）

---

## ■ ControlNetモデル

| モデル | 用途 | 主な使用場面 |
|--------|------|-------------|
| openpose | ポーズ制御 | キャラのポーズ指定 |
| canny | 輪郭制御 | 線画からの生成 |
| scribble | 下書き生成 | ラフスケッチから生成 |
| depth | 奥行制御 | 3D感・空間制御 |
| tile | タイル生成 | 高解像度・テクスチャ |
| inpaint | 部分修正 | 局所的な修正・差分 |

**総容量: 約8.6GB**

### ControlNet選定ルール
```
ポーズを指定したい     → openpose
線画・輪郭から生成     → canny
ラフ下書きから生成     → scribble
奥行き・空間を制御     → depth
高解像度タイル化       → tile
部分的に修正・差分     → inpaint
```

---

## ■ 解像度ルール

| 用途 | 推奨解像度 |
|------|-----------|
| 立ち絵（縦長） | 512x768 / 768x1024 |
| 差分（元画像に合わせる） | 元画像と同解像度 |
| バスト・上半身 | 512x512 / 768x768 |
| ピクセルアート | 64x64 / 128x128 / 256x256 |
| タイル素材 | 32x32 / 48x48 / 64x64 |
| BGM・音楽 | 解像度不要（ACE-Step専用） |

---

## ■ 推奨生成パラメータ

### 標準品質（立ち絵・差分）
```
Sampler: dpmpp_2m
Scheduler: karras
Steps: 25〜30
CFG: 7
Denoise: 1.0（txt2img）/ 0.5〜0.7（img2img）
```

### 高速生成（Lightningモード）
```
Sampler: euler
Steps: 4
CFG: 1.0〜1.5
LoRA: Qwen-Lightning-4steps（weight: 1.0）
```

### ピクセルアート
```
Sampler: dpmpp_2m
Steps: 20〜25
CFG: 7〜8
Model: pixelArtSpriteDiffusion
```

---

## ■ Custom Nodes（使用可能ツール）

| ノード名 | 役割 | 主な使用場面 |
|----------|------|-------------|
| ComfyUI-Manager | ノード管理 | ノード追加・更新 |
| ComfyUI-Easy-Use | ワークフロー効率化 | 簡略化ノード |
| comfyui_controlnet_aux | ControlNet前処理 | pose/canny/depth抽出 |
| comfyui_ultimatesdupscale | 高解像度アップスケール | 仕上げ・高解像度化 |
| batchimg-rembg / rembg | 背景除去 | 立ち絵の背景透過 |
| ComfyUI-qwenmultiangle | 多角度生成 | 差分・角度バリエーション |
| ComfyUI_Jags_Audiotools | 音声ツール | ACE-Step連携 |
| comfyui-image-saver | 画像保存拡張 | ファイル名・形式指定保存 |
| ComfyUI-Crystools | パフォーマンス計測 | 生成速度モニタリング |
| efficiency-nodes-comfyui | 効率化ノード群 | KSampler効率化 |
| rgthree-comfy | UI・ノード拡張 | ノードグループ管理 |

---

## ■ 既存ワークフロー一覧

保存先: `D:\ai\ComfyUI\user\default\workflows`

| ファイル名 | 内容 | 対応Agent |
|------------|------|-----------|
| txt2img_warkflow_v1.json | テキスト→画像 基本 | Illustrator, Pixeler |
| txt2img_warkflow_v1.2.json | テキスト→画像 改良版 | Illustrator, Pixeler |
| i2i_workflow_v2.1.json | 画像→画像 v2.1 | Refiner |
| MyDailyDriverWorkflow_v1.2.json | 日常使いメイン | Illustrator |
| Qwen-MultiAngle_v1.json | 多角度生成 | Illustrator |
| workflow_color_removal.json | 色除去処理 | Refiner |
| workflow_standard_nodes_only.json | 標準ノードのみ | 全Agent（互換確認用） |
| 0220_style_system_workflow.json | スタイルシステム | Illustrator |
| 05_audio_ace_step_1_t2a_song_subgraphed.json | 音楽生成 | Composer |

---

## ■ 主な制作用途

| 用途 | 使用モデル | 担当Agent |
|------|-----------|-----------|
| 立ち絵量産 | novaOrangeXL + granblue | Illustrator |
| 表情差分生成 | novaOrangeXL + Qwen-MultiAngle | Illustrator |
| 衣装差分生成 | novaOrangeXL + inpaint | Illustrator, Refiner |
| ポーズ制御 | novaOrangeXL + openpose | Refiner |
| 背景透過処理 | rembg nodes | Refiner |
| 高解像度化 | ultimatesdupscale + tile | Refiner |
| ピクセル素材 | pixelArtSpriteDiffusion | Pixeler |
| タイルマップ素材 | pixelArtSpriteDiffusion | Pixeler |
| BGM・音楽生成 | ace_step_v1_3.5b | Composer |

---

## ■ 未導入・今後の拡張予定

| 項目 | 状態 |
|------|------|
| Embeddings | 未導入（追加予定） |
| LoRAフォルダ整理 | 未対応 |
| Workflowカテゴリ別整理 | 未対応 |
| CSV自動生成連携 | 未対応 |
| JSONテンプレ管理 | 未対応 |

---

## ■ Agentへの参照指示

このファイルを参照するAgentは以下を守ること：

1. モデル選定は必ず上記ルール表に従う
2. 解像度は用途別ルールを適用する
3. LoRA組み合わせ禁止事項を確認してから提案する
4. 既存ワークフローが使える場合はゼロから作らず流用する
5. パスは必ず上記パス一覧を参照する（ハードコーディング禁止）
