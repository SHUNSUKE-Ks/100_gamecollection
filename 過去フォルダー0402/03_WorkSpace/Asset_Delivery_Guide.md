# アセット納品ガイド
> NanoNovel Asset Manager を使った制作フロー

---

## 納品ワークフロー

```
JSONマスターデータ定義 → 発注（Ordered）→ 制作 → _delivery/ に配置 → Asset Manager で Import → 確認済み（Checked）
```

### ステータス定義

| ステータス | 色 | 意味 |
|---|---|---|
| 🟡 **発注（Ordered）** | オレンジ | JSONに定義済み、ファイル未作成 |
| 🔵 **納品済み（Delivered）** | ブルー | `_delivery/` フォルダにファイル到着 |
| 🟢 **確認済み（Checked）** | グリーン | `src/assets/` に正しく配置済み |

---

## 操作手順

### 1. Dashboard で発注内容を確認
```
http://localhost:3000/dashboard
```
カテゴリ別に必要なアセットを確認。規格（サイズ・形式）を参照。

### 2. 素材を制作
各カテゴリの規格に従って制作。

### 3. `_delivery/` フォルダに配置
完成ファイルをプロジェクトルートの `_delivery/` に入れる。

### 4. Asset Manager で Import
```
http://localhost:3000
```
対象JSONを選択 → ファイルをドラッグ&ドロップ → Import ボタン

### 5. Dashboard で確認
ステータスが 🟢 確認済み に変わることを確認。

---

## カテゴリ別 納品規格

| カテゴリ | 形式 | サイズ | 保存先 | ソースJSON |
|---|---|---|---|---|
| キャラクター立ち絵 | PNG | 1024×1024 | `chara/{id}/` | `characters.json` |
| キャラクターCG | PNG | 1920×1080 | `chara/{id}/` | `characters.json` |
| 敵モンスター | PNG | 512×512 | `enemy/` | `enemies.json` |
| NPC | PNG | 1024×1024 | `npc/` | `npcs.json` |
| 背景 | PNG/JPG | 1920×1080 | `bg/` | `events.json` |
| ギャラリーCG | PNG/JPG | 1920×1080 | `bg/`, `chara/` | `gallery.json` |
| アイテムアイコン | PNG | 128×128 | `item/` | `items.json` |
| スキルアイコン | PNG | 128×128 | `skill/` | `skills.json` |
| BGM | MP3/M4A/WAV | — | `sound/bgm/` | `bgm.json` |
| SE（効果音） | MP3 | — | `sound/se/` | `se.json` |

---

## サーバー起動
```bash
node 00_WorkSpace/asset-manager/server.js
```
または `Launch_Asset_Manager.bat` をダブルクリック。

- Asset Manager: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
