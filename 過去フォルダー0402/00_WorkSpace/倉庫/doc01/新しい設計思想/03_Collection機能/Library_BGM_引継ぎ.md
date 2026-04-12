# Library BGM Player 引継ぎ資料
## Layout + 機能仕様

---

## 1. 画面構成

```
┌──────────────────────────────────────────────────────────────────────┐
│  [←戻る] [🎵BGM] [1/12]                    [選択した曲のみ🔘] [≡]  │ ← Header
├─────────────────────────────────┬────────────────────────────────────┤
│                                 │  [🔍 曲名、または説明で検索...]    │
│    ┌────────────────────┐      ├────────────────────────────────────┤
│    │  ■■■■■■■■■■■■■■■  │      │ [🎵] Battle Theme                  │
│    │  ■ NOVEL  GAME ■■  │      │      battle_theme_01.mp3       [⋮⋮]│
│    │  ■■■■■■■■■■■■■■■  │      ├────────────────────────────────────┤
│    └────────────────────┘      │ [🎵] Town BGM                      │
│                                 │      town_peaceful.mp3         [⋮⋮]│
│    ┌────────────────────────┐  ├────────────────────────────────────┤
│    │  Track Title           │  │ [🎵] Dungeon Theme                 │
│    │  filename.mp3          │  │      dungeon_dark.mp3          [⋮⋮]│
│    ├────────────────────────┤  ├────────────────────────────────────┤
│    │ 0:00 ━━━━━●━━━━ 3:45  │  │ [🎵] Boss Battle                   │
│    ├────────────────────────┤  │      boss_epic.mp3             [⋮⋮]│
│    │  [🔀] [⏮] [▶] [⏭] [🔁] │  └────────────────────────────────────┘
│    └────────────────────────┘  │
│         Player Area            │           Playlist Area             │
└─────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. ファイル構成

| ファイル | 役割 |
|---------|------|
| `screens/11_Collection/BGMPlayerScreen.jsx` | メイン画面コンポーネント |
| `hooks/useBGMPlayer.js` | 再生ロジック（useReducer） |
| `components/bgm/NowPlayingControl.jsx` | コントロールパネル部品 |
| `styles/screens/bgmPlayer.css` | スタイル定義 |
| `assets/sound/bgm/BGM/00_bgmlist01.json` | プレイリストJSON |

---

## 3. データ構造

### 3.1 プレイリストJSON
```json
// 00_bgmlist01.json
{
  "Battle Theme": "battle_theme_01.mp3",
  "Town BGM": "town_peaceful.mp3",
  "Dungeon Theme": "dungeon_dark.mp3"
}
```

### 3.2 Track型（内部変換後）
```typescript
interface Track {
  id: number;
  title: string;      // JSON key（表示名）
  subtitle: string;   // ファイル名
  url: string;        // 実際のURL（import.meta.url解決済み）
  selected?: boolean; // お気に入り選択
}
```

---

## 4. 機能一覧

### 4.1 再生コントロール
| 機能 | アクション | 説明 |
|------|-----------|------|
| ▶/⏸ | `togglePlay()` | 再生/一時停止 |
| ⏮ | `previous()` | 前の曲（3秒以上再生時は頭出し） |
| ⏭ | `next()` | 次の曲 |
| シーク | `seek(time)` | プログレスバークリックで移動 |

### 4.2 モード切替
| 機能 | アクション | 状態 |
|------|-----------|------|
| 🔀 シャッフル | `toggleShuffle()` | `shuffleMode: true/false` |
| 🔁 リピート | `cycleRepeat()` | `repeatMode: 'off' → 'all' → 'one'` |

### 4.3 フィルタリング
| 機能 | アクション | 説明 |
|------|-----------|------|
| 検索 | `setSearchQuery(query)` | title/subtitleで絞り込み |
| 選択のみ | `setFilter(bool)` | `selected: true`の曲のみ表示 |

---

## 5. State構造（useBGMPlayer）

```javascript
const initialState = {
  isPlaying: false,
  currentTrackIndex: 0,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  shuffleMode: false,
  repeatMode: 'off',      // 'off' | 'all' | 'one'
  playlist: [],
  originalPlaylist: [],
  showSelectedOnly: false,
  searchQuery: '',
};
```

---

## 6. コンポーネント詳細

### 6.1 BGMPlayerScreen.jsx
```jsx
<div className="bgm-player-screen">
  {/* Header */}
  <header className="bgm-header">
    <button onClick={goBack}>←</button>
    <span>BGM</span>
    <span>{currentIndex + 1}/{total}</span>
    <label>選択した曲のみ <input type="checkbox" /></label>
  </header>

  <div className="bgm-main-content">
    {/* 左: Player Area */}
    <div className="bgm-player-area">
      <div className="album-art-container">
        <div className="main-album-art">NOVEL GAME</div>
        <NowPlayingControl {...props} />
      </div>
    </div>

    {/* 右: Playlist Area */}
    <div className="bgm-playlist-area">
      <input placeholder="曲名で検索..." />
      {filteredPlaylist.map(track => (
        <div className="track-item" onClick={() => selectTrack(idx)}>
          <Music />
          <div>{track.title}</div>
          <div>{track.subtitle}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### 6.2 NowPlayingControl.jsx
```jsx
<div className="now-playing-container">
  <div className="now-playing-glass-card">
    {/* トラック情報 */}
    <h2>{currentTrack?.title}</h2>
    <p>{currentTrack?.subtitle}</p>

    {/* プログレスバー */}
    <div className="progress-track" onClick={handleProgressClick}>
      <div style={{ width: `${progress}%` }} />
    </div>
    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>

    {/* コントロールボタン */}
    <button onClick={onToggleShuffle}><Shuffle /></button>
    <button onClick={onPrevious}><SkipBack /></button>
    <button onClick={onTogglePlay}>{isPlaying ? <Pause /> : <Play />}</button>
    <button onClick={onNext}><SkipForward /></button>
    <button onClick={onToggleRepeat}><Repeat /></button>
  </div>
</div>
```

---

## 7. CSS クラス一覧

| クラス | 用途 |
|--------|------|
| `.bgm-player-screen` | ルートコンテナ |
| `.bgm-header` | ヘッダー（戻るボタン、タイトル等） |
| `.bgm-main-content` | flex: 左右分割 |
| `.bgm-player-area` | 左半分（アルバムアート+コントロール） |
| `.bgm-playlist-area` | 右半分（検索+トラックリスト） |
| `.track-item` | プレイリストの各行 |
| `.track-item.active` | 現在再生中のトラック |
| `.now-playing-glass-card` | グラスモーフィズムのコントロールパネル |
| `.progress-track` | シークバー背景 |
| `.progress-fill` | シークバー進捗 |
| `.btn-play-main` | 再生/停止ボタン（大） |

---

## 8. 移植チェックリスト

- [ ] `useBGMPlayer.js` をコピー
- [ ] `NowPlayingControl.jsx` をコピー
- [ ] `BGMPlayerScreen.jsx` をコピー
- [ ] `bgmPlayer.css` をコピー
- [ ] `00_bgmlist01.json` 形式でプレイリスト作成
- [ ] `formatTime` ユーティリティを用意
- [ ] lucide-react アイコン依存確認

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-18
