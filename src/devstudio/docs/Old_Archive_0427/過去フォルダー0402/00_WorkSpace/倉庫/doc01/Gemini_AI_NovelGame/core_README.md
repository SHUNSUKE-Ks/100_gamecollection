# Core Layer

## 概要
全パート共通ロジック層。

---

## 含まれるもの

- **Managers** (Asset / Sound / Save / Tag / Scenario)
- **Global hooks**
- **State管理**
- **Utility**

---

## ルール

- ❌ UIロジック禁止
- ❌ Part依存禁止
- ✅ 副作用はManagerに集約
- ✅ 純粋関数優先

---

## 構成

```
core/
├── managers/
│   ├── AssetManager.ts
│   ├── SoundManager.ts
│   ├── SaveManager.ts
│   ├── TagResolver.ts
│   └── ScenarioManager.ts
├── hooks/
│   ├── useGameState.ts
│   ├── useScenario.ts
│   ├── useAsset.ts
│   ├── useSound.ts
│   ├── useFlags.ts
│   ├── useSaveData.ts
│   └── useTagMatch.ts
├── stores/
│   └── gameStore.ts
├── types/
│   ├── scenario.ts
│   ├── character.ts
│   └── asset.ts
└── README.md
```

---

## Managers詳細

### AssetManager

```typescript
class AssetManager {
  // タグからパスを解決
  resolve(tag: string): string
  
  // 画像をプリロード
  preload(tags: string[]): Promise<void>
  
  // キャッシュクリア
  clearCache(): void
}
```

### SoundManager

```typescript
class SoundManager {
  // BGM再生（タグ駆動）
  playBGM(tags: string[]): void
  
  // SE再生
  playSE(soundID: string): void
  
  // フェード制御
  fade(type: 'in' | 'out', duration: number): void
}
```

### SaveManager

```typescript
class SaveManager {
  // セーブ
  save(slot: number, data: SaveData): void
  
  // ロード
  load(slot: number): SaveData | null
  
  // オートセーブ
  autoSave(data: SaveData): void
  
  // セーブ一覧取得
  listSaves(): SaveInfo[]
}
```

### TagResolver

```typescript
class TagResolver {
  // タグマッチング
  match(scenarioTags: string[], assetTags: string[]): boolean
  
  // 優先度解決
  resolve(tags: string[], category: string): string
  
  // フォールバック処理
  fallback(tag: string): string
}
```

### ScenarioManager

```typescript
class ScenarioManager {
  // storyID遷移
  transition(nextStoryID: string): void
  
  // event処理
  handleEvent(event: Event): void
  
  // flag管理
  setFlag(key: string, value: any): void
  getFlag(key: string): any
}
```

---

## Hooks詳細

### useScenario

```typescript
function useScenario() {
  const currentStory: Story;
  const next: () => void;
  const jump: (storyID: string) => void;
  const history: Story[];
}
```

### useAsset

```typescript
function useAsset() {
  const getAsset: (tag: string) => string;
  const preload: (tags: string[]) => Promise<void>;
}
```

### useSound

```typescript
function useSound() {
  const playBGM: (tags: string[]) => void;
  const playSE: (soundID: string) => void;
  const stop: () => void;
}
```

### useFlags

```typescript
function useFlags() {
  const flags: Record<string, any>;
  const setFlag: (key: string, value: any) => void;
  const getFlag: (key: string) => any;
}
```

### useSaveData

```typescript
function useSaveData() {
  const save: (slot: number) => void;
  const load: (slot: number) => void;
  const autoSave: () => void;
  const saves: SaveInfo[];
}
```

---

## State管理

```typescript
// gameStore.ts
interface GameState {
  currentStoryID: string;
  flags: Record<string, any>;
  inventory: Item[];
  characters: Character[];
  progress: Progress;
}
```

---

## Types定義

### scenario.ts

```typescript
interface Story {
  storyID: string;
  speaker: string;
  text: string;
  tags: string[];
  event: Event;
  flags: Record<string, any>;
  effects: string[];
  tips: string[];
  note: string;
}

interface Event {
  type: 'CHOICE' | 'BATTLE' | 'FLAG' | 'ITEM' | 'JUMP' | 'NONE';
  payload: any;
}
```

### character.ts

```typescript
interface Character {
  id: string;
  name: string;
  description: string;
  defaultTags: string[];
  portraitTag: string;
  promptTemplate: string;
  status: Status;
  skills: string[];
}

interface Status {
  hp: number;
  mp: number;
  str: number;
  dex: number;
  int: number;
}
```

### asset.ts

```typescript
interface ImageEntry {
  id: string;
  name: string;
  tag: string;
  category: 'bg' | 'chara' | 'item' | 'effect';
  prompt: string;
  path: string;
  size: { width: number; height: number };
  createdAt: string;
}
```

---

## 再利用方針

このフォルダは別プロジェクトへコピー可能な設計とする。

**移植時の手順**:
1. `core/`フォルダをそのままコピー
2. `data/`フォルダの構造を維持
3. `parts/`は必要なものだけ選択
4. 新プロジェクトで動作確認

---

## テスト方針

- Managers: 単体テスト必須
- Hooks: カスタムフック用テスト
- Utilities: 純粋関数テスト

---

## 備考

このレイヤーは**プロジェクトの心臓部**。
変更時は全パートへの影響を考慮すること。
