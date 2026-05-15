# ComfyUI Agent Studio - フォルダ構造

```
company/
├── CLAUDE.md                          ← 会社全体ルール・Agent一覧
├── .claude/
│   ├── settings.json                  ← 自動承認設定
│   └── commands/
│       ├── assign.md                  ← /assign  タスク割当
│       ├── review.md                  ← /review  Manager評価
│       ├── sprint-plan.md             ← /sprint-plan
│       ├── dod.md                     ← /dod
│       └── wbs.md                     ← /wbs
│
├── manager/
│   ├── CLAUDE.md
│   ├── inbox/
│   ├── reviewed/
│   └── reports/
│       └── evaluations/
│
├── agents/
│   ├── _shared/                       ← 全Agent共通リソース
│   │   ├── ENV.md                     ← ★ComfyUI環境情報マスター
│   │   ├── SUBMISSION_RULE.md         ← 納品ルール
│   │   ├── skills/
│   │   │   ├── dod-definition.md
│   │   │   ├── wbs-breakdown.md
│   │   │   ├── sprint-planning.md
│   │   │   └── styles/
│   │   │       ├── granblue.md        ← グラブル風スタイル
│   │   │       ├── pixel.md           ← ピクセルアートスタイル
│   │   │       └── realistic.md       ← （追加予定）
│   │   └── workflows/
│   │       ├── txt2img.md             ← （追加予定）
│   │       ├── img2img.md             ← （追加予定）
│   │       └── controlnet.md          ← （追加予定）
│   │
│   ├── illustrator/                   ← 立ち絵・差分専門
│   │   ├── CLAUDE.md
│   │   ├── context/
│   │   └── workspace/
│   │
│   ├── refiner/                       ← ControlNet・加工専門
│   │   ├── CLAUDE.md
│   │   ├── context/
│   │   └── workspace/
│   │
│   ├── pixeler/                       ← ピクセルアート専門
│   │   ├── CLAUDE.md
│   │   ├── context/
│   │   └── workspace/
│   │
│   ├── composer/                      ← 音楽・BGM専門
│   │   ├── CLAUDE.md
│   │   ├── context/
│   │   └── workspace/
│   │
│   └── planner/                       ← 秘書・計画管理
│       ├── CLAUDE.md
│       ├── context/
│       └── workspace/
│
└── delivery/                          ← 全納品物の一律置き場
    ├── YYYY-MM-DD_task-name/
    │   ├── artifact/
    │   └── report.md
    └── reviewed/                      ← Manager承認済み
```

## 起動方法

```bash
# プロジェクトルートで起動（.claude/ が読まれる）
cd company/
claude

# 特定Agentとして作業する場合
cd company/agents/illustrator/
claude
```

## 仕事の振り方（例）

```
「グラブル風の立ち絵を差分4種作って」
  → Illustrator が ENV.md + granblue.md を参照して対応

「さっきの立ち絵の背景を透過して」
  → Refiner が ENV.md + rembg設定を参照して対応

「フィールド曲のBGMプロンプトを作って」
  → Composer が ENV.md + ACE-Step設定を参照して対応

「32x32のキャラチップを10種作って」
  → Pixeler が ENV.md + pixel.md を参照して対応
```
