# Collection コード参照
## 主要コード抜粋・再現用リファレンス

---

## 1. Import文一覧

```javascript
// React
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

// Hooks & Store
import { useGameStore } from '../../hooks/useGameStore';

// Styles
import '../../styles/screens/collection.css';
import '../../styles/screens/chapterGallery.css';

// Utils
import { getCharacterIconUrl, getCharacterVariants } from '../../utils/characterRegistry';
import { resolveAssetUrl, resolveBgUrl, resolveEnemyUrl } from '../../utils/assetUtils';

// JSON Data
import characterDataJson from '../../assets/data/characters.json';
import backgroundsDataJson from '../../assets/data/backgrounds.json';
import enemyDataJson from '../../assets/data/enemies.json';
import tagsDataJson from '../../assets/data/tags.json';
import itemsDataJson from '../../assets/data/items.json';
import npcsDataJson from '../../assets/data/npcs.json';
import eventsDataJson from '../../assets/data/events.json';
import galleryDataJson from '../../assets/data/gallery.json';

// Components
import { BGMPlayerScreen } from './BGMPlayerScreen';
import { TableView } from '../../components/Collection/DB_system';
import { MultiSelect } from '../../components/common/MultiSelect';
import { TagManager } from '../../components/common/TagManager';
```

---

## 2. State定義

```javascript
export const CollectionScreen = ({ onToggleGenerator }) => {
  const { goBack, episodes, selectedChapter, setSelectedChapter, startEvent } = useGameStore();
  
  // Navigation State
  const [activeCategory, setActiveCategory] = useState('library');
  const [activeSubCategory, setActiveSubCategory] = useState('character');
  
  // Selection State
  const [selectedCharacterId, setSelectedCharacterId] = useState(characterDataJson.characters[0]?.id);
  const [selectedNpcId, setSelectedNpcId] = useState(npcsDataJson.npcs[0]?.id);
  const [selectedLocationId, setSelectedLocationId] = useState(locationsData[0]?.id);
  
  // Panel State
  const [isStoryPanelOpen, setIsStoryPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  
  // View Mode State
  const [bgView, setBgView] = useState('All');
  const [bgLayout, setBgLayout] = useState('gallery');
  const [enemyView, setEnemyView] = useState('All');
  const [enemyLayout, setEnemyLayout] = useState('gallery');
  const [itemView, setItemView] = useState('All');
  const [tipsView, setTipsView] = useState('All');
  const [galleryView, setGalleryView] = useState('All');
  const [galleryLayout, setGalleryLayout] = useState('gallery');
  const [gallerySearch, setGallerySearch] = useState('');
  
  // Tag Filter State
  const [filterCharacter, setFilterCharacter] = useState([]);
  const [filterNpcRole, setFilterNpcRole] = useState([]);
  const [filterLocation, setFilterLocation] = useState([]);
  
  // Tag Manager
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [localTags, setLocalTags] = useState(tagsDataJson.tags);
};
```

---

## 3. カテゴリ定義

```javascript
// Main Categories
const categories = [
  { id: 'item', label: 'アイテム', implemented: false },
  { id: 'equipment', label: '装備', implemented: false },
  { id: 'skill', label: 'スキル', implemented: false },
  { id: 'ability', label: 'アビリティ', implemented: false },
  { id: 'story', label: 'ストーリー', implemented: true },
  { id: 'library', label: 'ライブラリー', implemented: true },
  { id: 'sound', label: 'Sound', implemented: true },
  { id: 'keymap', label: 'KeyMap', implemented: false },
];

// Library SubCategories
const librarySubCategories = [
  { id: 'background', label: '地名辞典', implemented: true },
  { id: 'character', label: 'キャラクター図鑑', implemented: true },
  { id: 'npc', label: 'NPC図鑑', implemented: true },
  { id: 'enemy', label: 'エネミー図鑑', implemented: true },
  { id: 'item_dict', label: 'アイテム図鑑', implemented: true },
  { id: 'tips', label: 'TipsDB', implemented: true },
  { id: 'cg_gallery', label: 'CG・Gallery', implemented: true },
];

// Sound SubCategories
const soundSubCategories = [
  { id: 'bgm', label: 'BGM', implemented: true },
  { id: 'se', label: 'SE', implemented: false },
  { id: 'voice', label: 'Voice', implemented: false },
];

// Story SubCategories
const storySubCategories = [
  { id: 'main', label: 'メイン', implemented: true },
  { id: 'event', label: 'イベント', implemented: true },
];
```

---

## 4. フィルター関数

```javascript
// 背景フィルター
const getFilteredBackgrounds = () => {
  if (bgView === 'All') return locationsData;
  return locationsData.filter(loc => loc.category === bgView);
};

// 敵フィルター
const getFilteredEnemies = () => {
  if (enemyView === 'All') return enemyData;
  return enemyData.filter(enemy => enemy.label === enemyView);
};

// アイテムフィルター
const getFilteredItems = () => {
  if (itemView === 'All') return itemsData;
  return itemsData.filter(item => item.category === itemView);
};

// タグフィルター
const getFilteredTags = () => {
  if (tipsView === 'All') return tagsData;
  return tagsData.filter(tag => tag.category === tipsView);
};

// ギャラリーフィルター（検索含む）
const getFilteredGallery = () => {
  let items = galleryDataJson.images || [];
  if (galleryView !== 'All') {
    items = items.filter(i => i.category === galleryView);
  }
  if (gallerySearch) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      i.tags?.some(t => t.toLowerCase().includes(gallerySearch.toLowerCase()))
    );
  }
  return items;
};
```

---

## 5. カラム定義（TableView用）

```javascript
// 敵カラム
const enemyColumns = [
  { key: 'id', label: 'ID', width: '120px', render: (id) => renderCopyCell(id) },
  { key: 'name', label: 'Name', width: '200px', render: (name) => renderCopyCell(name) },
  { key: 'label', label: 'Monster Label', width: '150px' },
  { key: 'tags', label: 'Tags', render: (tags) => (
    <div>{tags.map(tag => <span key={tag} className="table-tag">{tag}</span>)}</div>
  )},
  { key: 'stats', label: 'Stats', width: '200px', render: (stats) => `HP:${stats.hp} ATK:${stats.atk}` }
];

// アイテムカラム
const itemColumns = [
  { key: 'id', label: 'ID', width: '150px', render: (id) => renderCopyCell(id) },
  { key: 'name', label: '名前', width: '150px', render: (name) => renderCopyCell(name) },
  { key: 'category', label: 'カテゴリ', width: '100px', render: (catId) => {
    const cat = itemsDataJson.categories?.find(c => c.id === catId);
    return <span className="table-tag">{cat ? cat.label : catId}</span>;
  }},
  { key: 'rarity', label: 'レア度', width: '80px', render: (rarity) => '★'.repeat(rarity) },
  { key: 'price', label: '価格', width: '80px', render: (price) => price > 0 ? `${price}G` : '-' },
  { key: 'effect', label: '効果', width: '150px', render: (effect) => effect || '-' },
  { key: 'description', label: '説明' }
];

// タグカラム
const tagsColumns = [
  { key: 'id', label: 'ID', width: '150px', render: (id) => renderCopyCell(id) },
  { key: 'name', label: 'Name', width: '200px', render: (name) => renderCopyCell(name) },
  { key: 'category', label: 'Category', width: '150px', render: (cat) => <span className="table-tag">{cat}</span> },
  { key: 'description', label: 'Description' }
];
```

---

## 6. コピー機能付きセル

```javascript
const renderCopyCell = (text) => (
  <div className="cell-with-copy">
    <span style={{ marginRight: '8px' }}>{text}</span>
    <button
      className="copy-btn-inline"
      title="Copy"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </button>
  </div>
);
```

---

## 7. レアリティカラー関数

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
```

---

## 8. コンポーネント構造（JSX骨格）

```jsx
return (
  <div className="collection-screen">
    {/* Header: Category Navigation */}
    <header className="collection-header">
      <button className="back-btn" onClick={goBack}>← 閉じる</button>
      <nav className="category-nav">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            disabled={!cat.implemented}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </header>

    {/* SubNav */}
    <div className="sub-nav-container">
      <nav className="sub-nav">
        {getSubCategories().map(sub => (
          <button key={sub.id} ...>{sub.label}</button>
        ))}
      </nav>
    </div>

    {/* Main Content */}
    <div className="collection-content">
      {activeCategory === 'library' && activeSubCategory === 'character' ? (
        <div className="character-encyclopedia">
          <div className="character-list">...</div>
          <div className="character-detail">...</div>
        </div>
      ) : activeCategory === 'library' && activeSubCategory === 'enemy' ? (
        <TableView data={getFilteredEnemies()} columns={enemyColumns} />
      ) : /* other subcategories */ null}
    </div>
  </div>
);
```

---

## 9. 関連ファイルパス

| ファイル | パス |
|---------|------|
| CollectionScreen | `src/screens/11_Collection/CollectionScreen.jsx` |
| BGMPlayerScreen | `src/screens/11_Collection/BGMPlayerScreen.jsx` |
| GalleryScreen | `src/screens/11_Collection/GalleryScreen.jsx` |
| TableView | `src/components/Collection/DB_system/TableView.jsx` |
| MultiSelect | `src/components/common/MultiSelect.jsx` |
| TagManager | `src/components/common/TagManager.jsx` |
| collection.css | `src/styles/screens/collection.css` |
| assetUtils | `src/utils/assetUtils.js` |
| characterRegistry | `src/utils/characterRegistry.js` |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
