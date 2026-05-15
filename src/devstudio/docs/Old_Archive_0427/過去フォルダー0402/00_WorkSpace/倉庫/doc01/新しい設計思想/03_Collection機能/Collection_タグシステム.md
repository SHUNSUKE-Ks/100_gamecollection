# Collection タグシステム
## タグ管理・フィルタリング仕様

---

## 1. タグシステム概要

Collectionでは、全DBアイテムに対して**タグ**を付与し、フィルタリング・分類に使用。

### タグの役割
- 📋 アイテムの分類・検索
- 🔖 関連データの紐付け
- 🎨 視覚的なカテゴリ表示

---

## 2. tags.json スキーマ

```json
{
  "tags": [
    {
      "id": "ALLY",
      "name": "味方",
      "category": "Affiliation",
      "color": "#22c55e",
      "description": "主人公と共に戦う仲間。"
    },
    {
      "id": "ENEMY",
      "name": "敵",
      "category": "Affiliation",
      "color": "#ef4444",
      "description": "敵対する存在。"
    }
  ]
}
```

---

## 3. タグカテゴリ一覧

| Category | 日本語 | 用途 | 例 |
|----------|--------|------|-----|
| `Affiliation` | 所属 | 陣営分類 | ALLY, ENEMY |
| `Class` | 職業 | キャラ職業 | WARRIOR, KNIGHT, MAGE |
| `Role` | 役割 | ゲーム内役割 | TACTICIAN, HEALER |
| `Type` | 種別 | エンティティ種別 | MONSTER, BOSS |
| `Species` | 種族 | 敵の種族 | SLIME, DRAGON, GOBLIN |
| `Appearance` | 外見 | 外見特徴 | GOTHIC_LOLI, WHITE_HAIR |
| `Trait` | 性格 | 性格・特性 | MYSTERIOUS, CHEERFUL |
| `Location` | 場所 | 出現場所 | STARTING_VILLAGE, CAPITAL_CITY |
| `NPCRole` | NPC役割 | NPC職業 | MERCHANT, BLACKSMITH |

---

## 4. タグID命名規則

```
形式: UPPER_SNAKE_CASE

例:
- STARTING_VILLAGE
- CAPITAL_CITY
- GOTHIC_LOLI
- WHITE_HAIR
```

---

## 5. 各DBでのタグ使用

### 5.1 characters.json

```json
{
  "id": "remi_unant",
  "name": "レミ宇ナント",
  "tags": ["ALLY", "GOTHIC_LOLI", "WHITE_HAIR", "MYSTERIOUS"]
}
```

### 5.2 enemies.json

```json
{
  "id": "monster_01",
  "name": "スライム",
  "tags": ["ENEMY", "MONSTER", "SLIME"]
}
```

### 5.3 npcs.json

```json
{
  "id": "npc_merchant_001",
  "name": "マルコ",
  "tags": ["MERCHANT", "FRIENDLY"],
  "location": "CAPITAL_CITY"
}
```

### 5.4 backgrounds.json

```json
{
  "id": "loc_starting_village",
  "name": "始まりの村",
  "tags": ["STARTING_VILLAGE", "PEACEFUL"]
}
```

---

## 6. フィルタリング実装

### 6.1 State定義

```javascript
// タグフィルターState
const [filterCharacter, setFilterCharacter] = useState([]);
const [filterNpcRole, setFilterNpcRole] = useState([]);
const [filterLocation, setFilterLocation] = useState([]);

// カテゴリ別タグ取得
const characterTags = localTags.filter(t => 
  t.category === 'Character' || t.category === 'Class' || t.category === 'Affiliation'
);
const npcRoleTags = localTags.filter(t => t.category === 'NPCRole');
const locationTags = localTags.filter(t => t.category === 'Location');
```

### 6.2 フィルター適用

```javascript
const getFilteredData = () => {
  let data = allData;
  
  // タグフィルター適用
  if (filterCharacter.length > 0) {
    data = data.filter(item => 
      item.tags?.some(tag => filterCharacter.includes(tag))
    );
  }
  
  return data;
};
```

---

## 7. MultiSelectコンポーネント

### 7.1 使用例

```jsx
import { MultiSelect } from '../../components/common/MultiSelect';

<MultiSelect
  options={characterTags.map(t => ({ value: t.id, label: t.name }))}
  value={filterCharacter}
  onChange={setFilterCharacter}
  placeholder="タグで絞り込み..."
/>
```

### 7.2 MultiSelect Props

| Prop | 型 | 説明 |
|------|-----|------|
| `options` | array | `[{value, label}]` 形式 |
| `value` | array | 選択中の値配列 |
| `onChange` | function | 変更時コールバック |
| `placeholder` | string | 未選択時テキスト |

---

## 8. TagManagerコンポーネント

### 8.1 使用例

```jsx
import { TagManager } from '../../components/common/TagManager';

<TagManager
  isOpen={isTagManagerOpen}
  onClose={() => setIsTagManagerOpen(false)}
  tags={localTags}
  onCreate={handleCreateTag}
/>
```

### 8.2 タグ作成機能

```javascript
const handleCreateTag = (newTag) => {
  // newTag: { id, name, category, color, description }
  setLocalTags([...localTags, newTag]);
};
```

---

## 9. タグ表示スタイル

### 9.1 CSS

```css
.table-tag {
  display: inline-block;
  padding: 2px 8px;
  margin: 2px;
  border-radius: 4px;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  margin: 2px;
  border-radius: 6px;
  font-size: 0.8rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}
```

### 9.2 カテゴリ別カラー

```javascript
const getCategoryColor = (category) => {
  const colors = {
    'Affiliation': '#22c55e',
    'Class': '#3b82f6',
    'Role': '#06b6d4',
    'Type': '#dc2626',
    'Species': '#10b981',
    'Appearance': '#ec4899',
    'Trait': '#7c3aed',
    'Location': '#f59e0b',
    'NPCRole': '#8b5cf6'
  };
  return colors[category] || '#666';
};
```

---

## 10. タグ一覧（現在登録済み）

### Affiliation
| ID | Name | Color |
|----|------|-------|
| ALLY | 味方 | #22c55e |
| ENEMY | 敵 | #ef4444 |

### Class
| ID | Name | Color |
|----|------|-------|
| ADVENTURER | 冒険者 | #3b82f6 |
| WARRIOR | 戦士 | #f59e0b |
| KNIGHT | 騎士 | #8b5cf6 |

### Appearance
| ID | Name | Color |
|----|------|-------|
| GOTHIC_LOLI | ゴスロリ | #ec4899 |
| WHITE_HAIR | 白髪 | #e5e7eb |

### Location
| ID | Name | Color |
|----|------|-------|
| STARTING_VILLAGE | 始まりの村 | #22c55e |
| CAPITAL_CITY | 王都 | #f59e0b |
| FOREST_ENTRANCE | 森の入り口 | #10b981 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
