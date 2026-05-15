# CollectionScreen 移植ガイド

## 概要
このドキュメントは、NanoNovelプロジェクトの**CollectionScreen**機能を他のプロジェクトへ移植するための完全なガイドです。

---

## ⚠️ 移植時の注意点

### 必須依存関係

1. **Reactフレームワーク**
   - React 18.x 以降
   - TypeScript推奨

2. **状態管理: Zustand**
   ```bash
   npm install zustand
   ```

3. **アイコンライブラリ: Lucide React**
   ```bash
   npm install lucide-react
   ```

4. **パスエイリアス設定**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": { "@/*": ["./src/*"] }
     }
   }
   ```

---

## 必要ファイル一覧

### メインスクリーン
| ファイル | 説明 |
|---------|------|
| `src/screens/11_Collection/CollectionScreen.tsx` | メイン画面（462行） |
| `src/screens/11_Collection/CollectionScreen.css` | スタイル |

### 共通コンポーネント (data-views)
| ファイル | 説明 |
|---------|------|
| `TableView.tsx` | テーブル表示 |
| `GalleryView.tsx` | ギャラリー表示 |
| `KanbanView.tsx` | カンバン表示 |
| `ViewSwitcher.tsx` | 表示切替UI |

### 詳細表示 (parts/collection/specific)
| ファイル | 説明 |
|---------|------|
| `CharacterDetailView.tsx` | キャラクター詳細 |
| `NPCDetailView.tsx` | NPC詳細 |
| `EnemyDetailView.tsx` | エネミー詳細 |
| `BackgroundDetailView.tsx` | 背景詳細 |
| `BGMPlayerView.tsx` | BGMプレイヤー |

### Hooks・ストア
| ファイル | 説明 |
|---------|------|
| `useViewMode.ts` | ビューモード管理 |
| `useBGMPlayer.ts` | BGMプレイヤーロジック |
| `gameStore.ts` | 画面遷移管理 |

### JSONデータ (11ファイル)
`characters.json`, `enemies.json`, `npcs.json`, `backgrounds.json`, `bgm.json`, `se.json`, `events.json`, `gallery.json`, `items.json`, `episodes.json`, `skills.json`

---

## 関連ドキュメント

- [01_ファイル一覧.md](./01_ファイル一覧.md)
- [02_JSONスキーマ.md](./02_JSONスキーマ.md)
- [03_コンポーネント構造.md](./03_コンポーネント構造.md)
- [04_レイアウト詳細.md](./04_レイアウト詳細.md)
- [05_Hooks・ストア.md](./05_Hooks・ストア.md)
- **[06_LibraryDB・Viewシステム.md](./06_LibraryDB・Viewシステム.md)** ← 新規追加
