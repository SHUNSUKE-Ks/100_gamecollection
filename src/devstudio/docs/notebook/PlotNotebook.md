# PlotNotebook — 詳細ドキュメント

`src/parts/collection/story/PlotNotebook.tsx`  
`src/parts/collection/story/PlotNotebookShell.tsx`

---

## 概要

シナリオのプロットカードを編集するエディター。  
4 種類のカード（Log / Chat / Choice / State）と 4 人のキャストスロットで構成される。

| バージョン | パス | Firestore依存 | 再利用性 |
|----------|-----|-------------|--------|
| `PlotNotebook` | `parts/collection/story/PlotNotebook.tsx` | ○ | ★☆☆ |
| `PlotNotebookShell` | `parts/collection/story/PlotNotebookShell.tsx` | なし | ★★★ |

> **推奨**: Storybook / 単体テストには `PlotNotebookShell` を使う。

---

## Props

### PlotNotebook（Firestore 接続版）

```typescript
interface ScenarioMemoProps {
  onBack?: () => void;
}
```

### PlotNotebookShell（Props のみ版）

```typescript
interface PlotNotebookShellProps {
  initialCards?: PlotCard[];
  characterData?: Character[];
  episodesData?: Episode[];
  onSave?: (card: PlotCard) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAIGenerate?: (prompt: string) => Promise<string>;
  onBack?: () => void;
}
```

---

## 型定義（PlotService.ts）

> 将来的に `src/core/types/plot.ts` への分離を推奨。

### PlotCard

```typescript
interface PlotCard {
  id: string;
  title: string;
  cardType?: CardType;            // カード種別
  lines: PlotLine[];              // Log / Chat 用
  choiceData?: ChoiceData;        // Choice 用
  stateData?: StateData;          // State 用
  castSlots: [CastSlot, CastSlot, CastSlot, CastSlot];  // 4人固定
  episodeId: string;
  chapterId: string;
  sceneTag: string;
  status: PlotStatus;
  updatedAt?: number;
}
```

### CardType

```typescript
type CardType = 'log' | 'chat' | 'choice' | 'state';
```

### PlotStatus

```typescript
type PlotStatus = 'idea' | 'draft' | 'fixed';
```

---

## カード種別詳細

### 1. Log カード（ナレーション・地の文）

```typescript
// cardType === 'log'
// lines[] を使用
interface PlotLine {
  id: string;
  speaker: string;    // 話者名（空文字でナレーション扱い）
  text: string;       // セリフ / 地の文
  isComment?: boolean;  // true = ト書き（グレー表示）
  // icon, face は Log では未使用
}
```

**使用シーン**: ナレーション、説明文、演出ト書き

---

### 2. Chat カード（キャラクター会話）

```typescript
// cardType === 'chat'
// lines[] を使用（icon / face フィールドが有効）
interface PlotLine {
  id: string;
  speaker: string;    // キャラクター名
  text: string;       // セリフ
  isComment?: boolean;
  icon?: string;      // キャラアイコン画像パス
  face?: string;      // 表情差分パス（例: "happy", "sad"）
}
```

**使用シーン**: キャラクター同士の会話シーン  
**特有機能**:
- キャストスロットからアイコン自動補完
- 表情差分ピッカー（Alt+A / Alt+D で切り替え）
- Alt+1〜4 でキャスト挿入

---

### 3. Choice カード（分岐選択肢）

```typescript
// cardType === 'choice'
// choiceData を使用
interface ChoiceData {
  question: {
    speaker: string;
    text: string;
  };
  options: ChoiceOption[];
}

interface ChoiceOption {
  id: string;
  label: string;          // 選択肢テキスト
  next?: string;          // 次のシーン ID（任意）
  effects: OptionEffects; // フラグ / パラメータ変化
  result: {
    speaker: string;
    text: string;         // 選択後のセリフ
  };
}

interface OptionEffects {
  flags?: Record<string, boolean>;   // フラグ変化
  params?: Record<string, number>;   // パラメータ増減
}
```

**使用シーン**: 選択肢分岐、フラグ変動イベント

---

### 4. State カード（フラグ / パラメータ管理）

```typescript
// cardType === 'state'
// stateData を使用
interface StateData {
  flags: FlagEntry[];
  params: ParamEntry[];
}

interface FlagEntry {
  key: string;
  value: boolean;
  label?: string;
}

interface ParamEntry {
  key: string;
  value: number;
  label?: string;
  min?: number;
  max?: number;
}
```

**使用シーン**: シーン開始条件の記録、変数初期化メモ

---

## CastSlot（キャストスロット）

```typescript
// 4人固定スロット（インデックス 0〜3）
interface CastSlot {
  characterId?: string;   // キャラクター ID（characters DB から）
  displayName?: string;   // 表示名オーバーライド
  iconPath?: string;      // アイコンパス
}

// アクセス方法
const [slot0, slot1, slot2, slot3] = card.castSlots;
```

---

## PlotService API

```typescript
// src/core/services/PlotService.ts

// 全カード読み込み
await PlotService.loadPlots(): Promise<PlotCard[]>

// カード保存（新規 / 上書き）
await PlotService.savePlot(card: PlotCard): Promise<void>

// カード削除
await PlotService.deletePlot(id: string): Promise<void>
```

---

## Gemini AI 連携（GeminiService）

```typescript
// src/core/services/GeminiService.ts

// シーン生成プロンプト例
const prompt = `
  キャスト: ${castNames.join(', ')}
  エピソード: ${episodeName}
  シーンタグ: ${sceneTag}
  指示: 会話シーンを 5 行で生成してください。
`;

const generated = await GeminiService.generateScene(prompt);
// → PlotLine[] として parse して lines に追加
```

---

## キーボードショートカット

| キー | 動作 |
|-----|------|
| `Alt + A` | 表情差分 — 前へ（Chat モード） |
| `Alt + D` | 表情差分 — 次へ（Chat モード） |
| `Alt + 1` | キャストスロット 1 を現在行に挿入 |
| `Alt + 2` | キャストスロット 2 を現在行に挿入 |
| `Alt + 3` | キャストスロット 3 を現在行に挿入 |
| `Alt + 4` | キャストスロット 4 を現在行に挿入 |

---

## 自動保存

```typescript
// debounce 800ms で自動保存
useEffect(() => {
  const timer = setTimeout(() => {
    if (currentCard) PlotService.savePlot(currentCard);
  }, 800);
  return () => clearTimeout(timer);
}, [currentCard]);
```

---

## PlotNotebookShell — 使用例（Props のみ）

Firestore なしで動作するため、Storybook・テスト・デモに最適。

```tsx
import { PlotNotebookShell } from '@/parts/collection/story/PlotNotebookShell';

// モックデータ
const mockCards: PlotCard[] = [
  {
    id: 'card-001',
    title: 'オープニング',
    cardType: 'chat',
    lines: [
      { id: 'l1', speaker: 'アリア', text: 'こんにちは', icon: '/icons/aria.png', face: 'normal' },
      { id: 'l2', speaker: 'ユウ',   text: 'やあ',       icon: '/icons/yuu.png',  face: 'smile' },
    ],
    choiceData: undefined,
    stateData: undefined,
    castSlots: [
      { characterId: 'char-001', displayName: 'アリア', iconPath: '/icons/aria.png' },
      { characterId: 'char-002', displayName: 'ユウ',   iconPath: '/icons/yuu.png' },
      {},
      {},
    ],
    episodeId: 'ep-001',
    chapterId: 'ch-001',
    sceneTag: 'opening',
    status: 'draft',
    updatedAt: Date.now(),
  },
];

// 使用
<PlotNotebookShell
  initialCards={mockCards}
  characterData={mockCharacters}
  episodesData={mockEpisodes}
  onSave={async (card) => console.log('save', card)}
  onDelete={async (id) => console.log('delete', id)}
  onBack={() => console.log('back')}
/>
```

---

## Storybook Stories（予定）

| Story名 | 説明 |
|--------|------|
| `Log カード` | ナレーション・地の文の編集 |
| `Chat カード` | 表情差分付き会話編集 |
| `Choice カード` | 選択肢 + フラグ効果の編集 |
| `State カード` | フラグ / パラメータ管理 |
| `キャストスロット` | 4人キャスト割当と行挿入 |
| `Kanban 表示` | status ごとのカード整理 |
| `空状態` | カード 0 件の初期表示 |

---

## リファクタリング課題

| 課題 | 現状 | 改善案 |
|-----|------|--------|
| 型が PlotService.ts 内 | 型と CRUD が混在 | `core/types/plot.ts` に型を分離 |
| Firestore 直結 | PlotNotebook が PlotService を直接呼ぶ | Props で DI できる Shell パターンに統一 |
| AI 生成がハードコード | GeminiService 直呼び | `onAIGenerate?: (prompt) => Promise<string>` の Props に |
| キーボードショートカット | コンポーネント内で定義 | `useKeyboardShortcut` フックに切り出す |
