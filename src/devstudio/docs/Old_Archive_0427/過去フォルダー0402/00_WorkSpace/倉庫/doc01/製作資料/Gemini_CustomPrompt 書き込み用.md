# NanoNovel - Gemini AI カスタムプロンプト



## 🎯 プロジェクト概要

**カスタムname**は、JSON駆動型のモジュラーノベルゲームエンジンです。

### 核心思想

```
コードは JSON の解釈器であり、仕様は JSON（data/）が正。
→ JSONを差し替えるだけで別のノベルゲームをリリースできる
コメント：Gitで差し替えて、GitActionで違うプロジェクトとしてリリースsる。
Vol1.1＝Done：
Vol1.2＝Done：
Vol1.3＝Done：
Vol2.0＝Done：

```

### 開発哲学

| 原則 | 説明 |
|-----|------|
| **JSON駆動開発** | ゲームの挙動はすべてJSONで定義。コード変更なしでゲーム内容を変更可能 |
| **Part分離** | Novel / Battle / Collection を独立させ、組み替えやバージョンアップを容易化 |
| **アセット同居JSON** | 画像・音楽フォルダ内にJSONを配置し、パス管理と差し替えを容易化 |
| **Git差し替えリリース** | JSONを差し替えるだけで新しいノベルゲームをリリース可能 |

---

## 📂 フォルダ構成

```
NanoNovel/
├── src/
│   ├── app/              # アプリケーション設定
│   ├── assets/           # 全アセット（画像・音楽）
│   │   ├── bg/           # 背景画像
│   │   ├── chara/        # キャラクター画像
│   │   ├── item/         # アイテム画像
│   │   ├── effect/       # エフェクト
│   │   ├── skill/        # スキルアイコン
│   │   ├── ui/           # UI素材
│   │   └── sound/        # 音楽・効果音
│   │       ├── bgm/
│   │       │   └── bgmlist01/    # BGMセット（JSON + 音楽ファイル同居）
│   │       └── se/
│   ├── core/             # 全パート共通ロジック層
│   │   ├── managers/     # AssetManager, SoundManager, SaveManager等
│   │   ├── hooks/        # useScenario, useAsset, useSound等
│   │   ├── stores/       # Zustand状態管理
│   │   └── types/        # 型定義
│   ├── data/             # JSON定義（プロジェクトの真実）
│   │   ├── scenario.json
│   │   ├── characters.json
│   │   ├── enemy.json
│   │   ├── skill.json
│   │   └── ...
│   ├── parts/            # 機能パート（モジュール）
│   │   ├── novel/        # ノベルパート
│   │   ├── battle/       # バトルパート
│   │   └── collection/   # コレクションパート
│   └── styles/           # グローバルスタイル
└── doc01/                # ドキュメント
    └── Gemini_AI_NovelGame/  # AI向け詳細仕様
```

---

## 🔧 Part分離アーキテクチャ

### 3つのPart

| Part | 責務 | 特徴 |
|-----|------|------|
| **Novel** | シナリオ進行・対話表示・選択肢 | 将来別プロジェクトへ切り出し可能 |
| **Battle** | 戦闘ロジック・敵AI・スキル処理 | ターン制/リアルタイム切替対応 |
| **Collection** | ギャラリー・Tips閲覧（Viewer専用） | 独立ビューアアプリ展開可能 |

### Part間ルール

```
✅ 許可：
- core/ の Managers / Hooks を使用
- data/ の JSON を読み取り

❌ 禁止：
- Part間の直接参照
- data/ の直接書き込み（SaveManager経由のみ）
- assets/ の直接パス参照（AssetManager経由のみ）
```

---

## 📄 JSON駆動開発

### 管理ファイル一覧

| File | Role | 優先度 |
|------|------|--------|
| `scenario.json` | シナリオ本体 | ⭐⭐⭐ |
| `characters.json` | キャラ定義 | ⭐⭐⭐ |
| `enemy.json` | 敵定義 | ⭐⭐ |
| `skill.json` | スキル定義 | ⭐⭐ |
| `tips.json` | 用語辞書 | ⭐ |
| `sound.json` | BGMメタ情報 | ⭐⭐ |

### storyID フォーマット

```
EP_CH_TXT

例：
01_01_01  → Episode 1, Chapter 1, Text 1
02_03_015 → Episode 2, Chapter 3, Text 15
```

### tag 命名規則

```
{category}_{name}_{width}x{height}

例：
bg_forest_morning_1280x720
chara_hero_smile_1024x1024
item_magic_sword_512x512
```

#### カテゴリ別推奨サイズ

| category | 推奨サイズ | 説明 |
|---------|-----------|------|
| bg | 1280x720 | 背景（16:9） |
| chara | 1024x1024 | キャラクター |
| item | 512x512 | アイテム |
| effect | 可変 | エフェクト |
| skill | 256x256 | スキルアイコン |
| ui | 可変 | UI素材 |

---

## 🎵 アセット同居JSONパターン

### 概要

アセットフォルダ内にJSONを配置することで、パス管理と差し替えを容易にする。

### 実例：bgmlist01

```
src/assets/sound/bgm/bgmlist01/
├── bgmlist01.json          ← パスマッピング定義
├── Battle_igiigi.mp3
├── Cafeinebgm.m4a
├── GameOp.m4a
├── kazeno.mp3
└── ... (他の音楽ファイル)
```

#### bgmlist01.json の内容

```json
{
  "op": "_OP_.mp3",
  "battle_igiigi": "Battle_igiigi.mp3",
  "bgm_heiya1": "bgm_heiya1.wav",
  "cafeinebgm": "Cafeinebgm.m4a",
  "game_op": "Game_Op.mp3",
  "mori01": "mori01.m4a"
}
```

### メリット

| メリット | 説明 |
|---------|------|
| **パス管理の容易化** | キー → ファイル名のマッピングで相対パス解決 |
| **差し替えの容易化** | フォルダごと入れ替え可能 |
| **バージョン管理** | `bgmlist01`, `bgmlist02` と複数セット管理可能 |
| **Git差し替え** | JSONとアセットをセットでpushするだけでリリース |

### 適用パターン

```
assets/
├── bg/
│   └── bgset01/
│       ├── bgset01.json      ← 背景セット定義
│       ├── forest.png
│       └── castle.png
├── chara/
│   └── charalist01/
│       ├── charalist01.json  ← キャラセット定義
│       ├── hero_normal.png
│       └── hero_smile.png
└── sound/bgm/
    └── bgmlist01/
        ├── bgmlist01.json    ← BGMセット定義
        └── *.mp3
```

---

## ⛔ 禁止事項

### 絶対禁止

| ❌ 禁止 | 理由 |
|--------|------|
| パス直接参照 | `❌ import bg from './assets/bg/forest.png'` |
| JSON構造の勝手な変更 | 他のコードへの影響大 |
| tag命名規則違反 | パース処理が壊れる |
| ID重複 | データ整合性が壊れる |
| Part間直接参照 | モジュラリティ崩壊 |
| グローバル状態直接操作 | Store経由で管理 |

### 正しいアクセス方法

```typescript
// ❌ 直接参照（禁止）
<img src="/assets/bg/forest.png" />

// ✅ AssetManager経由
const { getAsset } = useAsset();
<img src={getAsset('bg_forest_morning_1280x720')} />

// ✅ SoundManager経由
const { playBGM } = useSound();
playBGM(['bgm_battle']);
```

---

## 🔄 再利用・移植ガイド

### 新プロジェクト作成時

1. `core/` フォルダをそのままコピー
2. `data/` フォルダの構造を維持
3. `parts/` は必要なものだけ選択（Novel only, Battle only 等）
4. `assets/` は新しいアセットで差し替え
5. 動作確認

### ゲーム内容差し替え

```bash
# 1. 新しいJSONセットを用意
cp new_game_data/*.json src/data/

# 2. 新しいアセットを用意
cp -r new_assets/* src/assets/

# 3. コミット & プッシュ
git add .
git commit -m "New game: [Game Name]"
git push
```

---

## 📋 開発時チェックリスト

### 新しいシナリオ追加時

- [ ] `scenario.json` に Story 追加
- [ ] storyID フォーマット確認 (`EP_CH_TXT`)
- [ ] 参照するキャラが `characters.json` に存在
- [ ] 参照する敵が `enemy.json` に存在（BATTLE event時）
- [ ] 使用するtagが命名規則準拠

### 新しいアセット追加時

- [ ] tag命名規則に従っている
- [ ] 適切なフォルダに配置
- [ ] 同居JSONにマッピング追加（該当する場合）
- [ ] `image_registry.json` に登録（画像の場合）

### 新しいPart追加時

- [ ] `parts/{part_name}/` に配置
- [ ] README.md を作成
- [ ] External Dependencies Checklist を記載
- [ ] core/のManagers/Hooksのみを使用
- [ ] 他Partへの依存なし

---

---

## 🤖 AI開発支援時の注意

### Geminiへの指示

1. **コード生成時**
   - 必ずManager/Hook経由でデータアクセス
   - パス直接参照禁止
   - tag命名規則準拠

2. **JSON編集時**
   - 既存構造を維持
   - ID重複チェック
   - 参照整合性確認

3. **新機能追加時**
   - 適切なPartに配置
   - Part間依存を作らない
   - core/のみを参照

4. **アセット追加時**
   - 同居JSONパターンを検討
   - 命名規則遵守
   - registry更新

---

