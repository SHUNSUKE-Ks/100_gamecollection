"""
send_batch.py — ComfyUI バッチ送信スクリプト Ver1.1
----------------------------------------------------
使い方:
  python send_batch.py --template template.json --prompts prompts.csv

オプション:
  --url          ComfyUI の URL (デフォルト: template.json の COMFYUI_URL)
  --dry-run      実際には送信せず、生成するプロンプトを標準出力に表示
  --delay        各ジョブ送信後の待機秒数 (デフォルト: 2)

必要ライブラリ:
  pip install requests
"""

import argparse
import csv
import json
import random
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path


# ─── ComfyUI ワークフロービルダー ──────────────────────────────────

def build_workflow(template: dict, row: dict) -> dict:
    """
    template.json と CSV の1行を受け取り ComfyUI API 用の workflow dict を返す。
    LoRA がある場合は LoraLoader ノードを自動挿入する。
    """
    checkpoint = template["CHECKPOINT"]
    loras      = template.get("LORA", [])
    steps      = int(row.get("steps", template["STEPS"]))
    cfg        = float(row.get("cfg", template["CFG"]))
    sampler    = row.get("sampler", template["SAMPLER"])
    scheduler  = row.get("scheduler", template["SCHEDULER"])
    width      = int(row.get("width",  template["WIDTH"]))
    height     = int(row.get("height", template["HEIGHT"]))
    denoise    = float(template.get("DENOISE", 1.0))

    # seed: -1 = ランダム
    seed_raw = int(row.get("seed", -1))
    seed = random.randint(0, 2**32 - 1) if seed_raw < 0 else seed_raw

    # プロンプト合成: ベースタグ + CSV の extra タグ
    style_base    = template["STYLE_BASE"]
    negative_base = template["NEGATIVE_BASE"]
    positive_extra = row.get("positive_extra", "").strip()
    negative_extra = row.get("negative_extra", "").strip()

    positive_prompt = f"{style_base}, {positive_extra}".strip(", ") if positive_extra else style_base
    negative_prompt = f"{negative_base}, {negative_extra}".strip(", ") if negative_extra else negative_base

    filename_prefix = row.get("filename_prefix", f"batch_{row.get('id','000')}")

    # ── ノード構築 ──────────────────────────────────────────────────

    nodes: dict = {}

    # 4: CheckpointLoader
    nodes["4"] = {
        "class_type": "CheckpointLoaderSimple",
        "inputs": {"ckpt_name": checkpoint}
    }

    # LoRA チェーン (0本以上)
    model_ref = ["4", 0]
    clip_ref  = ["4", 1]

    for i, lora in enumerate(loras):
        node_id = str(10 + i)
        nodes[node_id] = {
            "class_type": "LoraLoader",
            "inputs": {
                "model": model_ref,
                "clip":  clip_ref,
                "lora_name":       lora["name"],
                "strength_model":  lora["weight"],
                "strength_clip":   lora["weight"]
            }
        }
        model_ref = [node_id, 0]
        clip_ref  = [node_id, 1]

    # 5: EmptyLatentImage
    nodes["5"] = {
        "class_type": "EmptyLatentImage",
        "inputs": {"batch_size": 1, "height": height, "width": width}
    }

    # 6: Positive CLIP
    nodes["6"] = {
        "class_type": "CLIPTextEncode",
        "inputs": {"text": positive_prompt, "clip": clip_ref}
    }

    # 7: Negative CLIP
    nodes["7"] = {
        "class_type": "CLIPTextEncode",
        "inputs": {"text": negative_prompt, "clip": clip_ref}
    }

    # 3: KSampler
    nodes["3"] = {
        "class_type": "KSampler",
        "inputs": {
            "seed":          seed,
            "steps":         steps,
            "cfg":           cfg,
            "sampler_name":  sampler,
            "scheduler":     scheduler,
            "denoise":       denoise,
            "model":         model_ref,
            "positive":      ["6", 0],
            "negative":      ["7", 0],
            "latent_image":  ["5", 0]
        }
    }

    # 8: VAEDecode
    nodes["8"] = {
        "class_type": "VAEDecode",
        "inputs": {"samples": ["3", 0], "vae": ["4", 2]}
    }

    # 9: SaveImage
    nodes["9"] = {
        "class_type": "SaveImage",
        "inputs": {
            "filename_prefix": filename_prefix,
            "images": ["8", 0]
        }
    }

    return {"prompt": nodes}


# ─── ComfyUI 送信 ───────────────────────────────────────────────────

def send_to_comfyui(url: str, workflow: dict) -> str | None:
    """workflow を ComfyUI の /prompt エンドポイントへ POST する。成功時は prompt_id を返す。"""
    payload = json.dumps(workflow).encode("utf-8")
    req = urllib.request.Request(
        f"{url.rstrip('/')}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result.get("prompt_id")
    except Exception as e:
        print(f"  [ERROR] ComfyUI 送信失敗: {e}", file=sys.stderr)
        return None


# ─── メイン処理 ─────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="ComfyUI バッチ送信スクリプト Ver1.1")
    parser.add_argument("--template", required=True, help="template.json のパス")
    parser.add_argument("--prompts",  required=True, help="prompts.csv のパス")
    parser.add_argument("--url",      default=None,  help="ComfyUI URL (省略時は template から取得)")
    parser.add_argument("--dry-run",  action="store_true", help="送信せずプロンプトだけ表示")
    parser.add_argument("--delay",    type=float, default=2.0, help="各ジョブ間の待機秒 (default: 2)")
    args = parser.parse_args()

    # ── ファイル読み込み ──────────────────────────────────────────
    template_path = Path(args.template)
    prompts_path  = Path(args.prompts)

    if not template_path.exists():
        print(f"[ERROR] template が見つかりません: {template_path}", file=sys.stderr)
        sys.exit(1)
    if not prompts_path.exists():
        print(f"[ERROR] prompts.csv が見つかりません: {prompts_path}", file=sys.stderr)
        sys.exit(1)

    with open(template_path, encoding="utf-8") as f:
        template = json.load(f)

    url = args.url or template.get("COMFYUI_URL", "http://127.0.0.1:8188")

    with open(prompts_path, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"━━━ ComfyUI Batch Send Ver1.1 ━━━")
    print(f"  Template : {template_path.name}")
    print(f"  Prompts  : {prompts_path.name}  ({len(rows)} 件)")
    print(f"  Model    : {template['CHECKPOINT']}")
    print(f"  LoRA     : {[l['name'] for l in template.get('LORA', [])] or 'なし'}")
    print(f"  URL      : {url}")
    print(f"  Mode     : {'DRY RUN' if args.dry_run else 'SEND'}")
    print()

    ok_count  = 0
    err_count = 0

    for i, row in enumerate(rows, 1):
        workflow = build_workflow(template, row)
        prompt_text = workflow["prompt"]["6"]["inputs"]["text"]
        filename    = row.get("filename_prefix", f"batch_{row.get('id','???')}")

        print(f"[{i:03d}/{len(rows):03d}] {filename}")
        print(f"  Positive: {prompt_text[:80]}{'...' if len(prompt_text) > 80 else ''}")

        if args.dry_run:
            print(f"  → DRY RUN: スキップ")
        else:
            prompt_id = send_to_comfyui(url, workflow)
            if prompt_id:
                print(f"  → 送信完了 (prompt_id: {prompt_id})")
                ok_count += 1
                if i < len(rows):
                    time.sleep(args.delay)
            else:
                print(f"  → 送信失敗")
                err_count += 1
        print()

    print(f"━━━ 完了 ━━━")
    if not args.dry_run:
        print(f"  成功: {ok_count} / 失敗: {err_count}")
    print(f"  出力先: {template.get('OUTPUT_DIR', 'D:/ai/ComfyUI/output/batch')}")


if __name__ == "__main__":
    main()
