# 🎬 GameManager (ディレクター) フォルダ

ゲーム全体の進行管理・発注書を一元管理するフォルダです。

---

## 📁 フォルダ構成

```
00_GameManager/
├── README.md                    (このファイル)
├── 01_製作Phase.md              (開発フェーズと各部署タスク)
├── 発注書/                      (各部署への発注書)
│   ├── シナリオ発注/
│   ├── グラフィック発注/
│   ├── サウンド発注/
│   └── プログラム発注/
└── 進捗管理/                    (進捗トラッキング)
```

---

## 📋 部署一覧と依存関係

| No | 部署 | 主な成果物 | 依存先 |
|----|------|-----------|--------|
| 10 | GamePlanner | ゲーム設計書、データ定義 | - (起点) |
| 20 | ScenarioWriter | シナリオJSON | Planner (設定) |
| 30 | Graphicker | 画像素材 | Planner (仕様)、Scenario (演出指示) |
| 40 | Programmer | 実装コード | 全部署 |
| 50 | SoundCreator | BGM/SE | Planner (仕様)、Scenario (演出指示) |

---

## 🔄 基本ワークフロー

```
[10_GamePlanner] 設計・仕様策定
        ↓
[20_ScenarioWriter] シナリオ執筆
        ↓
[30_Graphicker] + [50_SoundCreator] 素材制作
        ↓
[40_Programmer] 実装・統合
        ↓
[00_GameManager] 検収・リリース
```
