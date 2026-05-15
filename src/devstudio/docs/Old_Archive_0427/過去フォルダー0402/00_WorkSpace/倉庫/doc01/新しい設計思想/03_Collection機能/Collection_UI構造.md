# Collection UI構造
## レイアウト・CSS・表示モード

---

## 1. 画面レイアウト

```
┌────────────────────────────────────────────────────────────────┐
│ Header: カテゴリナビゲーション                                    │
│ [アイテム] [装備] [スキル] [ストーリー] [ライブラリー] [Sound]     │
├────────────────────────────────────────────────────────────────┤
│ SubHeader: サブカテゴリ                                          │
│ [地名辞典] [キャラクター] [NPC] [エネミー] [アイテム] [Tips] [CG]  │
├──────────────────────┬─────────────────────────────────────────┤
│                      │                                          │
│   Left Sidebar       │           Main Content Area              │
│   (リスト / 選択)     │           (詳細 / ギャラリー)             │
│                      │                                          │
│   - キャラ一覧       │           - キャラカード                  │
│   - NPC一覧          │           - 立ち絵ギャラリー               │
│   - 地名一覧         │           - CGギャラリー                   │
│                      │                                          │
└──────────────────────┴───────────────────────────────────────┬─┤
                                                               │▶│ 
                                                               └─┘
                                                          (Right Panel Toggle)
```

---

## 2. 表示モード

### 2.1 ビューモード切替

| SubCategory | list | gallery | stepper/kanban |
|-------------|------|---------|----------------|
| character | - | - | - |
| npc | - | - | - |
| background | ✅ | ✅ | - |
| enemy | ✅ | ✅ | - |
| item_dict | ✅ | - | - |
| tips | ✅ | - | - |
| cg_gallery | ✅ | ✅ | - |
| story | - | - | ✅ |

### 2.2 State管理

```javascript
// 各SubCategory用のState
const [bgView, setBgView] = useState('All');
const [bgLayout, setBgLayout] = useState('gallery');

const [enemyView, setEnemyView] = useState('All');
const [enemyLayout, setEnemyLayout] = useState('gallery');

const [itemView, setItemView] = useState('All');

const [galleryView, setGalleryView] = useState('All');
const [galleryLayout, setGalleryLayout] = useState('gallery');
const [gallerySearch, setGallerySearch] = useState('');

const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
```

---

## 3. CSSクラス構造

### 3.1 メインコンテナ

```css
.collection-screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0a0a14;
}

.collection-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid #333;
}

.category-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
}

.nav-btn.active {
  background: var(--color-text-accent);
  color: #000;
  border-color: var(--color-text-accent);
}
```

### 3.2 リスト・ギャラリー

```css
/* キャラクターリスト（左サイドバー） */
.character-list {
  width: 250px;
  border-right: 1px solid #333;
  overflow-y: auto;
}

.character-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #222;
}

.character-list li.active {
  background: rgba(59, 130, 246, 0.2);
  border-left: 3px solid var(--color-text-accent);
}

/* ギャラリーグリッド */
.bg-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
```

### 3.3 カード

```css
/* 敵カード（カードゲーム風） */
.enemy-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.enemy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* 背景カード */
.bg-gallery-card {
  background: rgba(30, 30, 40, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}
```

---

## 4. コンポーネント構成

### 4.1 TableView（リスト表示）

```jsx
import { TableView } from '../../components/Collection/DB_system';

// 使用例
<TableView
  data={getFilteredEnemies()}
  columns={enemyColumns}
  onRowClick={(item) => console.log(item)}
/>
```

### 4.2 Column定義例

```javascript
const enemyColumns = [
  {
    key: 'id',
    label: 'ID',
    width: '120px',
    render: (id) => renderCopyCell(id)
  },
  {
    key: 'name',
    label: 'Name',
    width: '200px',
    render: (name) => renderCopyCell(name)
  },
  { key: 'label', label: 'Monster Label', width: '150px' },
  {
    key: 'tags',
    label: 'Tags',
    render: (tags) => (
      <div>
        {tags.map(tag => (
          <span key={tag} className="table-tag">{tag}</span>
        ))}
      </div>
    )
  },
  {
    key: 'stats',
    label: 'Stats',
    width: '200px',
    render: (stats) => `HP:${stats.hp} ATK:${stats.atk}`
  }
];
```

---

## 5. カードレンダラー

### 5.1 敵カード（レアリティ色）

```javascript
const getRarityColor = (rarity) => {
  const colors = {
    1: '#9ca3af', // Common - Gray
    2: '#22c55e', // Uncommon - Green
    3: '#3b82f6', // Rare - Blue
    4: '#a855f7', // Epic - Purple
    5: '#f59e0b'  // Legendary - Gold
  };
  return colors[rarity] || colors[1];
};

const renderEnemyCard = (enemy) => (
  <div className="enemy-card" style={{
    background: `linear-gradient(180deg, ${getRarityColor(enemy.rarity)}22 0%, #1a1a2e 30%)`,
    border: `2px solid ${getRarityColor(enemy.rarity)}`,
    boxShadow: `0 4px 20px ${getRarityColor(enemy.rarity)}33`
  }}>
    {/* Card Content */}
  </div>
);
```

### 5.2 背景カード

```javascript
const renderBackgroundCard = (bg) => (
  <div className="bg-gallery-card">
    <div className="bg-image-container" style={{ aspectRatio: '16/9' }}>
      <img src={resolveBgUrl(bg.image)} alt={bg.name} />
    </div>
    <div className="bg-card-footer">
      <h4>{bg.name}</h4>
      <span className="table-tag">{bg.category}</span>
    </div>
  </div>
);
```

---

## 6. CSS変数（variables.css）

```css
:root {
  --color-bg-primary: #0a0a14;
  --color-bg-secondary: #1a1a2e;
  --color-text-primary: #ffffff;
  --color-text-secondary: #888888;
  --color-text-accent: #d4af37;
  --color-border: #333333;
  
  /* Rarity Colors */
  --color-rarity-common: #9ca3af;
  --color-rarity-uncommon: #22c55e;
  --color-rarity-rare: #3b82f6;
  --color-rarity-epic: #a855f7;
  --color-rarity-legendary: #f59e0b;
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
