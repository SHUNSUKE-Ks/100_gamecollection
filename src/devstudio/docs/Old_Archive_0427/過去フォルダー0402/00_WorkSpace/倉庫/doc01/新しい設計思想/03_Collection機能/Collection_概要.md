# Collection機能 概要資料
## Novel-PWA Engine - Collection Module Overview

---

## 1. Collection機能とは

Collectionは**ゲーム内の素材ライブラリUI**であり、プレイヤーが閲覧可能な全ての情報資産を管理・表示する機能です。

### 主要特徴
- 📚 図鑑形式のデータ閲覧
- 🔖 タグによるフィルター機能
- 📋 リスト/ギャラリーの表示切替
- ✏️ JSONエディター連携（開発モード）

---

## 2. ファイル構成

```
src/
├── screens/11_Collection/
│   ├── CollectionScreen.jsx     # メイン画面（1567行）
│   ├── BGMPlayerScreen.jsx      # BGMプレイヤー
│   └── GalleryScreen.jsx        # 画像ギャラリー
│
├── components/Collection/
│   ├── DB_system/               # テーブル・ギャラリー表示
│   │   ├── TableView.jsx
│   │   └── GalleryView.jsx
│   ├── views/
│   └── index.js
│
├── components/common/
│   ├── MultiSelect.jsx          # 複数選択UI
│   └── TagManager.jsx           # タグ管理モーダル
│
├── styles/screens/collection.css
│
└── assets/data/                  # データJSON
    ├── characters.json
    ├── npcs.json
    ├── enemies.json
    ├── items.json
    ├── backgrounds.json
    ├── gallery.json
    ├── tags.json
    └── tips.json
```

---

## 3. 画面構成（Header/SubHeader）

### 3.1 Category Navigation（1st Level）

```javascript
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
```

### 3.2 Library SubCategories（2nd Level）

```javascript
const librarySubCategories = [
    { id: 'background', label: '地名辞典', implemented: true },
    { id: 'character', label: 'キャラクター図鑑', implemented: true },
    { id: 'npc', label: 'NPC図鑑', implemented: true },
    { id: 'enemy', label: 'エネミー図鑑', implemented: true },
    { id: 'item_dict', label: 'アイテム図鑑', implemented: true },
    { id: 'tips', label: 'TipsDB', implemented: true },
    { id: 'cg_gallery', label: 'CG・Gallery', implemented: true },
];
```

### 3.3 Sound SubCategories

```javascript
const soundSubCategories = [
    { id: 'bgm', label: 'BGM', implemented: true },
    { id: 'se', label: 'SE', implemented: false },
    { id: 'voice', label: 'Voice', implemented: false },
];
```

---

## 4. データ読み込み（Import文）

```javascript
// JSON Imports
import characterDataJson from '../../assets/data/characters.json';
import backgroundsDataJson from '../../assets/data/backgrounds.json';
import enemyDataJson from '../../assets/data/enemies.json';
import tagsDataJson from '../../assets/data/tags.json';
import itemsDataJson from '../../assets/data/items.json';
import npcsDataJson from '../../assets/data/npcs.json';
import eventsDataJson from '../../assets/data/events.json';
import galleryDataJson from '../../assets/data/gallery.json';

// Utils Imports
import { resolveAssetUrl, resolveBgUrl, resolveEnemyUrl } from '../../utils/assetUtils';
import { getCharacterIconUrl, getCharacterVariants } from '../../utils/characterRegistry';

// Components
import { TableView } from '../../components/Collection/DB_system';
import { MultiSelect } from '../../components/common/MultiSelect';
import { TagManager } from '../../components/common/TagManager';
```

---

## 5. 関連ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [Collection_DB一覧.md](./Collection_DB一覧.md) | 全JSONスキーマ詳細 |
| [Collection_UI構造.md](./Collection_UI構造.md) | レイアウト・CSS構造 |
| [Collection_タグシステム.md](./Collection_タグシステム.md) | タグ管理仕様 |
| [Collection_コード参照.md](./Collection_コード参照.md) | 主要コード抜粋 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
