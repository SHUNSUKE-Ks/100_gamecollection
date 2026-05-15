# Data Layer (JSON Specification)

## 概要
本プロジェクトの全挙動は JSON によって定義される。

**コードは JSON の解釈器であり、仕様はここが正。**

---

## 管理ファイル一覧

| File | Role | 優先度 |
|------|------|--------|
| scenario.json | シナリオ本体 | ⭐⭐⭐ |
| characters.json | キャラ定義 | ⭐⭐⭐ |
| enemy.json | 敵定義 | ⭐⭐ |
| skill.json | スキル定義 | ⭐⭐ |
| tips.json | 用語辞書 | ⭐ |
| sound.json | BGMメタ情報 | ⭐⭐ |
| image_registry.json | 生成画像管理 | ⭐⭐⭐ |
| title.json | タイトル定義 | ⭐ |
| game_config.json | 初期設定 | ⭐ |

---

## storyID ルール

### フォーマット

```
EP_CH_TXT

例:
01_01_01  → Episode 1, Chapter 1, Text 1
01_01_02  → Episode 1, Chapter 1, Text 2
02_03_015 → Episode 2, Chapter 3, Text 15
```

### 桁ルール

| 区分 | 桁数 | 説明 |
|-----|------|------|
| EP  | 2桁  | エピソード番号 |
| CH  | 2桁  | チャプター番号 |
| TXT | 2〜4桁 | テキスト連番 |

### パース用ユーティリティ

```typescript
const parseStoryID = (id: string) => {
  const [ep, ch, txt] = id.split("_");
  return { 
    ep: Number(ep), 
    ch: Number(ch), 
    txt: Number(txt) 
  };
};
```

---

## tags 命名規則

### フォーマット

```
{category}_{name}_{width}x{height}

例:
bg_forest_morning_1280x720
chara_hero_smile_1024x1024
item_magic_sword_512x512
```

### カテゴリ一覧

| category | 説明 | 推奨サイズ |
|---------|------|-----------|
| bg | 背景 | 1280x720 |
| chara | キャラクター | 1024x1024 |
| item | アイテム | 512x512 |
| effect | エフェクト | 可変 |
| skill | スキルアイコン | 256x256 |
| ui | UI素材 | 可変 |

### tag検証ルール

```typescript
// 正規表現パターン
const TAG_PATTERN = /^(bg|chara|item|effect|skill|ui)_[a-z0-9_]+_\d+x\d+$/;

function validateTag(tag: string): boolean {
  return TAG_PATTERN.test(tag);
}
```

---

## JSON参照マッピング

| 参照元 | フィールド | 参照先 | 説明 |
|-------|----------|--------|------|
| scenario.tags | tag | tags_for_notion.csv | 画像・BGM解決 |
| scenario.tips | tip_id | tips.json | Tips表示 |
| scenario.event(BATTLE) | enemyIDs | enemy.json | 敵データ取得 |
| characters.skills | skill_id | skill.json | スキル情報 |
| enemy.skills | skill_id | skill.json | 敵スキル |
| skill.iconTag | tag | assets/skill | アイコン表示 |
| image_registry.tag | tag | assets/* | 画像パス |
| title.backgroundTag | tag | assets/bg | タイトル背景 |
| sound.tags | tag | scenario.tags | BGM再生 |

---

## 禁止事項

### ❌ 絶対にやってはいけないこと

1. **JSON構造を勝手に変更しない**
   - 新フィールド追加時は全員に共有
   - 削除は影響範囲を確認してから

2. **tag命名規則を破らない**
   - 必ず `{category}_{name}_{size}` 形式を守る
   - アンダースコアの位置を変えない

3. **path直書き禁止（tag解決）**
   - `❌ "path": "/assets/bg/forest.png"`
   - `✅ "tag": "bg_forest_morning_1280x720"`

4. **ID重複禁止**
   - storyID、characterID、enemyID等は必ずユニーク
   - 重複チェックを怠らない

---

## データ整合性チェック

### 参照整合性

```typescript
// scenario.jsonのenemyIDsが全てenemy.jsonに存在するか
function validateEnemyReferences(scenarios: Story[], enemies: Enemy[]) {
  const enemyIDs = new Set(enemies.map(e => e.id));
  
  scenarios.forEach(story => {
    if (story.event.type === 'BATTLE') {
      story.event.payload.enemyIDs.forEach(id => {
        if (!enemyIDs.has(id)) {
          console.error(`Invalid enemyID: ${id} in storyID: ${story.storyID}`);
        }
      });
    }
  });
}
```

### tag整合性

```typescript
// 全てのtagが命名規則に従っているか
function validateAllTags(data: AllJSON) {
  const allTags = [
    ...data.scenarios.flatMap(s => s.tags),
    ...data.characters.flatMap(c => c.defaultTags),
    ...data.enemies.map(e => e.imageTag),
    ...data.skills.map(s => s.iconTag)
  ];
  
  allTags.forEach(tag => {
    if (!validateTag(tag)) {
      console.error(`Invalid tag format: ${tag}`);
    }
  });
}
```

---

## バージョン管理

### スキーマバージョン

各JSONファイルにスキーマバージョンを記載推奨：

```json
{
  "$schema": "v2.0",
  "data": [...]
}
```

### マイグレーション

スキーマ変更時はマイグレーションスクリプトを用意：

```bash
# v1.0 → v2.0
node scripts/migrate_v1_to_v2.js
```

---

## バックアップルール

1. **毎日バックアップ**
   - 全JSONを自動バックアップ
   - `backups/YYYY-MM-DD/` に保存

2. **大きな変更前**
   - 手動バックアップ必須
   - コミットメッセージに変更理由を記載

3. **復元手順**
   ```bash
   # 特定日付のバックアップから復元
   cp backups/2026-01-07/* data/
   ```

---

## 編集ツール

### 推奨エディタ

- **VSCode** + JSON Schema拡張
- **Notion** → CSV → JSON変換
- **専用エディタ**（将来開発予定）

### JSON Linter

```bash
# フォーマット確認
npm run lint:json

# 自動整形
npm run format:json
```

---

## 開発ワークフロー

1. **企画段階**
   - Notionでシナリオ・キャラ整理
   - tags_for_notion.csv作成

2. **データ作成**
   - NotionからJSON生成
   - 参照整合性チェック

3. **実装**
   - コードはJSONを読むだけ
   - データ変更で挙動変更

4. **テスト**
   - JSON単体テスト
   - 統合テスト

---

## トラブルシューティング

### よくあるエラー

**エラー**: `storyID not found: 01_01_99`
**原因**: scenario.jsonに該当IDが存在しない
**解決**: storyIDを確認、または追加

**エラー**: `Invalid tag format: bg-forest-morning`
**原因**: アンダースコアではなくハイフンを使用
**解決**: `bg_forest_morning_1280x720` に修正

**エラー**: `enemyID "dragon" not found`
**原因**: enemy.jsonに該当IDが存在しない
**解決**: enemy.jsonに追加、またはIDを修正

---

## パフォーマンス最適化

### JSON読み込み最適化

```typescript
// ❌ 毎回ファイル読み込み
const scenario = JSON.parse(fs.readFileSync('scenario.json'));

// ✅ 起動時に一度だけ読み込み＋キャッシュ
const scenario = loadAndCacheJSON('scenario.json');
```

### インデックス作成

```typescript
// storyIDで高速検索できるようインデックス作成
const storyIndex = new Map(
  scenarios.map(s => [s.storyID, s])
);

// O(1)で検索
const story = storyIndex.get('01_01_01');
```

---

## セキュリティ

### 機密情報

- ❌ JSONにAPIキー等を含めない
- ✅ 環境変数で管理

### バリデーション

```typescript
// ユーザー入力を使う場合は必ずバリデーション
function safeGetStory(userInput: string): Story | null {
  // storyIDフォーマットチェック
  if (!/^\d{2}_\d{2}_\d{2,4}$/.test(userInput)) {
    return null;
  }
  return storyIndex.get(userInput) || null;
}
```

---

## まとめ

- **JSONがプロジェクトの唯一の真実**
- **命名規則は厳守**
- **参照整合性を常に確認**
- **変更時はバックアップ必須**

**このREADMEを守れば、データ品質が保たれます。**
