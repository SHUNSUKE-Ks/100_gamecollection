# Assets Folder

## 概要
全ての画像・音素材は **tag ベース**で管理される。

**パス直接参照は禁止。必ずtagを経由してアクセスすること。**

---

## フォルダ構成

```
assets/
├── bg/                     # 背景画像
│   ├── bg_forest_morning_1280x720.png
│   ├── bg_castle_sunset_1280x720.png
│   └── bg_dungeon_dark_1280x720.png
│
├── chara/                  # キャラクター画像
│   ├── chara_hero_normal_1024x1024.png
│   ├── chara_hero_smile_1024x1024.png
│   └── chara_enemy_goblin_1024x1024.png
│
├── item/                   # アイテム画像
│   ├── item_magic_sword_512x512.png
│   ├── item_potion_512x512.png
│   └── item_key_512x512.png
│
├── effect/                 # エフェクト画像・動画
│   ├── effect_slash_512x512.png
│   ├── effect_explosion_1024x1024.png
│   └── effect_heal_particle.mp4
│
├── skill/                  # スキルアイコン
│   ├── item_skill_slash_256x256.png
│   ├── item_skill_fireball_256x256.png
│   └── item_skill_heal_256x256.png
│
├── ui/                     # UI素材
│   ├── ui_logo_title.png
│   ├── ui_button_normal.png
│   └── ui_frame_dialog.png
│
├── sound/                  # 音楽・効果音（将来）
│   ├── bgm/
│   │   ├── bgm_title_01.mp3
│   │   └── bgm_battle_01.mp3
│   └── se/
│       ├── se_click.mp3
│       └── se_slash.mp3
│
└── tags/
    └── tags_for_notion.csv  # タグマスター
```

---

## パス規則

```
src/assets/{category}/{tag_key}.{ext}
```

### 例

| category | tag_key | full_path |
|---------|---------|-----------|
| bg | bg_forest_morning_1280x720 | src/assets/bg/bg_forest_morning_1280x720.png |
| chara | chara_hero_smile_1024x1024 | src/assets/chara/chara_hero_smile_1024x1024.png |
| item | item_magic_sword_512x512 | src/assets/item/item_magic_sword_512x512.png |

---

## tag命名規則

### フォーマット

```
{category}_{name}_{width}x{height}
```

### カテゴリ別推奨サイズ

| category | 推奨サイズ | 説明 |
|---------|-----------|------|
| bg | 1280x720 | 背景（16:9） |
| chara | 1024x1024 | キャラクター（正方形） |
| item | 512x512 | アイテム（正方形） |
| effect | 可変 | エフェクト |
| skill | 256x256 | スキルアイコン（正方形） |
| ui | 可変 | UI素材 |

### 命名例

```
✅ bg_forest_morning_1280x720
✅ chara_hero_smile_1024x1024
✅ item_magic_sword_512x512

❌ bg-forest-morning-1280x720  # ハイフン不可
❌ forest_morning              # カテゴリなし
❌ bg_forest_morning           # サイズなし
```

---

## ルール

### ✅ 必須ルール

1. **ファイル名 = tag_key**
   - ファイル名とtagは完全一致
   - 例: `bg_forest_morning_1280x720.png`

2. **直接パス参照禁止**
   - `❌ import forest from './assets/bg/forest.png'`
   - `✅ getAsset('bg_forest_morning_1280x720')`

3. **tag経由でアクセス**
   - AssetManagerを必ず使用
   - タグから自動的にパス解決

### ❌ 禁止事項

- スペースを含むファイル名
- 日本語ファイル名
- 大文字を含むファイル名
- サイズ情報のないファイル名
- カテゴリ違いのフォルダ配置

---

## AssetManager連携

### パス解決

```typescript
// AssetManager.ts
class AssetManager {
  resolve(tag: string): string {
    const [category] = tag.split('_');
    const ext = this.getExtension(category);
    return `/src/assets/${category}/${tag}.${ext}`;
  }
  
  private getExtension(category: string): string {
    const extMap = {
      bg: 'png',
      chara: 'png',
      item: 'png',
      effect: 'png',
      skill: 'png',
      ui: 'png'
    };
    return extMap[category] || 'png';
  }
}
```

### 使用例

```typescript
// ❌ 直接参照（禁止）
<img src="/assets/bg/forest.png" />

// ✅ AssetManager経由
const assetManager = new AssetManager();
const path = assetManager.resolve('bg_forest_morning_1280x720');
<img src={path} />

// ✅ Hook使用
const { getAsset } = useAsset();
<img src={getAsset('bg_forest_morning_1280x720')} />
```

---

## プリロード戦略

### 基本方針

```typescript
// シーン開始前に必要なアセットをプリロード
async function preloadScene(storyID: string) {
  const story = getStory(storyID);
  const tags = story.tags;
  
  await Promise.all(
    tags.map(tag => assetManager.preload(tag))
  );
}
```

### プリロードプライオリティ

| プライオリティ | 対象 | タイミング |
|-------------|------|----------|
| 1. 必須 | 現在シーンのBG・キャラ | シーン遷移前 |
| 2. 重要 | 次シーンのBG | バックグラウンド |
| 3. 任意 | UI素材・エフェクト | アイドル時 |

---

## ファイルフォーマット

### 画像

| 形式 | 用途 | 説明 |
|-----|------|------|
| PNG | BG, キャラ, UI | 透過が必要な場合 |
| JPG | BG | ファイルサイズ削減 |
| WebP | 全般 | 次世代フォーマット（推奨） |
| SVG | UI, ロゴ | ベクター形式 |

### 音声（将来）

| 形式 | 用途 | 説明 |
|-----|------|------|
| MP3 | BGM, SE | 汎用 |
| OGG | BGM | ループ向き |
| WAV | SE | 高品質 |

---

## 最適化

### 画像圧縮

```bash
# PNGを最適化
pngquant --quality=65-80 input.png -o output.png

# JPGを最適化
jpegoptim --max=80 input.jpg

# WebPに変換
cwebp -q 80 input.png -o output.webp
```

### リサイズ

```bash
# ImageMagickでリサイズ
convert input.png -resize 1280x720 output.png

# 一括処理
for f in *.png; do
  convert "$f" -resize 1280x720 "resized_$f"
done
```

---

## AI生成画像の管理

### 生成フロー

```
1. シナリオにtagが指定される
   例: "bg_forest_morning_1280x720"

2. image_registryに未登録か確認

3. 未登録の場合:
   a. promptTemplateを取得
   b. ナノバナナへ送信
   c. 画像生成
   d. assets/{category}/に保存
   e. image_registry.jsonへ追記

4. 登録済みの場合:
   既存画像を使用
```

### image_registry.json更新

```json
{
  "id": "img_0001",
  "name": "森の朝",
  "tag": "bg_forest_morning_1280x720",
  "category": "bg",
  "prompt": "fantasy forest morning sunlight",
  "path": "/assets/bg/bg_forest_morning_1280x720.png",
  "size": { "width": 1280, "height": 720 },
  "createdAt": "2026-01-07T12:00:00"
}
```

---

## tags_for_notion.csv

### フォーマット

```csv
tag,category,name,width,height,note
bg_forest_morning_1280x720,bg,forest_morning,1280,720,朝の森
chara_hero_smile_1024x1024,chara,hero_smile,1024,1024,主人公笑顔
item_magic_sword_512x512,item,magic_sword,512,512,魔法の剣
```

### Notion連携

1. Notionでタグ情報を管理
2. CSV出力
3. `assets/tags/tags_for_notion.csv` に配置
4. ビルド時に読み込み

---

## バージョン管理

### Git管理対象

- ✅ tags_for_notion.csv
- ✅ 手動作成したアセット
- ❌ AI生成画像（容量大）

### AI生成画像の管理

```bash
# .gitignoreに追加
assets/bg/*.png
assets/chara/*.png
assets/item/*.png

# ただしサンプルは管理対象
!assets/bg/sample_*.png
```

---

## トラブルシューティング

### 画像が表示されない

1. **tagが正しいか確認**
   ```typescript
   console.log('tag:', tag);
   console.log('path:', assetManager.resolve(tag));
   ```

2. **ファイルが存在するか確認**
   ```bash
   ls assets/bg/bg_forest_morning_1280x720.*
   ```

3. **拡張子が正しいか確認**
   - PNG/JPG/WebPのどれか
   - 大文字小文字の違い

### パフォーマンスが悪い

1. **画像サイズを確認**
   - 必要以上に大きくないか
   - WebP形式を検討

2. **プリロードを確認**
   - 必要な画像がプリロードされているか
   - 不要な画像をプリロードしていないか

---

## まとめ

- **tagベース管理を徹底**
- **直接パス参照禁止**
- **命名規則を守る**
- **AssetManager経由でアクセス**
- **AI生成画像も統一管理**

**このルールを守れば、アセット管理が破綻しません。**
