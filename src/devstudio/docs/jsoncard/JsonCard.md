# JsonCard システム構想

> ステータス: **アイデア段階**（未実装）
> 対象: ノベルゲーム制作ツール / PlotNotebook の拡張

---

## 概要

キャラクターの立ち絵・表情・好感度・フラグ状況などを「装備品」のように管理するシステム。  
複雑な分岐や状態変化を「カードの組み合わせ」という視覚的な作業に変える。

**Core-Decal 構造**が基本概念：
- **BaseCard (Core)** = キャラクター・シーン・シナリオチャンクの「核」
- **Decal (JSONモジュール)** = Core に装備して状態を拡張するパーツ
- **Socket** = Core が持つ Decal の接続口（スロット）

---

## 型定義（構想）

```typescript
// Core（核）
interface BaseCard {
  id: string;
  name: string;
  type: 'character' | 'scene' | 'scenario_chunk';
  baseAssets: {
    portrait?: string;    // 立ち絵ベース画像パス
    bgm?: string;         // シーン BGM
    background?: string;  // 背景画像
  };
  sockets: Record<SocketKey, Socket>;
  mergedData: Record<string, unknown>;  // アタッチ後のマージ済みJSON
}

// Socket（接続口）
type SocketKey =
  | 'Face_Socket'       // 表情差分
  | 'State_Socket'      // フラグ / 状態
  | 'Dialogue_Socket'   // セリフセット
  | 'Costume_Socket'    // 衣装差分
  | 'Timeline_Socket'   // 進行ポイント
  | 'Effect_Socket';    // 演出エフェクト

interface Socket {
  key: SocketKey;
  label: string;
  accepts: DecalType[];           // アタッチ可能な Decal 種別
  attachedDecal?: Decal;
  condition?: ConditionSlot;      // アタッチ可否条件
  conflictPriority?: number;      // 競合時の優先度（高いほど優先）
}

// Decal（装備パーツ）
interface Decal {
  id: string;
  name: string;
  type: DecalType;
  data: Record<string, unknown>;  // Socket にマージされるJSONデータ
  assetLinks?: AssetLink[];       // 画像・音源との紐付け
  conflictGroup?: string;         // 競合グループ名（同グループは1つのみ装備可）
}

type DecalType =
  | 'face'        // 表情（例：怒り、泣き、照れ）
  | 'flag'        // フラグ（例：ルート確定、好感度閾値到達）
  | 'costume'     // 衣装
  | 'timeline'    // 進行ポイント（例：第3章 放課後ルート）
  | 'effect'      // 演出エフェクト（例：雨エフェクト ON）
  | 'dialogue';   // セリフセット差し替え
```

---

## 3.1 カード・アタッチ・システム（Core-Decal 構造）

### BaseCard（Core）の展開

- キャラクター / シーン / シナリオチャンクを「核」として定義
- ID・名称・基本リソース（立ち絵ベース等）を保持
- アタッチされた全 Decal のデータをリアルタイムマージして `mergedData` を更新

### Socket（接続口）管理

Core が持つ拡張スロットを可視化する。

| Socket 名 | 役割 | 受け入れる Decal |
|----------|------|---------------|
| `Face_Socket` | 表情差分 | `face` |
| `State_Socket` | フラグ / 状態管理 | `flag` |
| `Dialogue_Socket` | セリフセット差し替え | `dialogue` |
| `Costume_Socket` | 衣装差分 | `costume` |
| `Timeline_Socket` | シナリオ進行ポイント | `timeline` |
| `Effect_Socket` | 演出エフェクト | `effect` |

### Decal（JSON モジュール）のアタッチ

- 「怒り表情」「ルート確定フラグ」「特殊衣装」などの Decal カードを Socket に装備
- ドラッグ＆ドロップで状態を動的に変更
- アタッチした瞬間に Core の `mergedData` を更新

### 動的 JSON マージ

```typescript
function mergeDecals(core: BaseCard): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...core.baseAssets };
  for (const socket of Object.values(core.sockets)) {
    if (socket.attachedDecal) {
      Object.assign(merged, socket.attachedDecal.data);
    }
  }
  return merged;
}
// プログラム側は core.mergedData を参照するだけ → 複雑な条件分岐が消える
```

---

## 3.2 マルチビュー・インスペクター

### プロパティ・ビュー

UI 上で直接編集可能な項目：

| 項目 | 型 | 例 |
|-----|---|---|
| 好感度 | `number` (0〜100) | `affection: 72` |
| 現在フラグ状況 | `Record<string, boolean>` | `{ route_a_confirmed: true }` |
| 適用中のバフ（物語上の状態） | `string[]` | `['injured', 'happy']` |
| アタッチ中 Decal 一覧 | `Decal[]` | Face=怒り, Costume=制服 |

### RAW JSON ビュー

マージ済み最終 JSON をリアルタイム確認。セーブデータ形式と一致させることでデバッグが容易になる。

```json
{
  "characterId": "char-001",
  "name": "アリア",
  "portrait": "/sprites/aria_base.png",
  "face": "angry",
  "faceSprite": "/sprites/aria_angry.png",
  "affection": 72,
  "flags": {
    "route_a_confirmed": true
  },
  "timeline": "ch3_afterschool",
  "costume": "uniform"
}
```

---

## 3.3 Timeline / Sequence Decal（進行管理）

ノベルゲームは「時間軸」が重要なため専用の Decal 種別として定義する。

```typescript
// Timeline Decal の data 例
{
  timeline: 'ch3_afterschool',   // 第3章・放課後ルート
  chapter: 3,
  route: 'route_a',
  checkpoint: 'step_07'
}
```

- `Timeline_Socket` に差し込むだけで「このキャラが今どのシナリオポイントにいるか」を管理
- シナリオ分岐を「カード1枚差し替え」で表現できる

---

## 3.4 Conflict Resolver（競合解決ルール）

複数の Decal が同じプロパティを上書きしようとした場合の優先順位定義。

```typescript
interface ConflictRule {
  group: string;            // 競合グループ名（例：'facial_expression'）
  priority: 'latest' | 'highest_value' | 'explicit';
  // latest: 後からアタッチしたものが勝つ
  // highest_value: 数値が高いものが勝つ
  // explicit: conflictPriority 数値で決定
}
```

### 具体例

| Decal A | Decal B | 競合プロパティ | 解決ルール |
|--------|--------|-------------|----------|
| 怪我（`face: injured`） | 包帯（`face: bandaged`） | `face` | `latest`（後勝ち）|
| 好感度+10 | 好感度+20 | `affection_bonus` | `highest_value` |
| 衣装A（priority: 1） | 衣装B（priority: 2） | `costume` | `explicit`（衣装B勝ち）|

---

## 3.5 Condition Slot（発火条件）

Decal をアタッチできる条件を定義する。「いつ有効になるか」の制御。

```typescript
interface ConditionSlot {
  type: 'flag' | 'param_threshold' | 'timeline' | 'always';
  flagKey?: string;           // type === 'flag'
  flagValue?: boolean;
  paramKey?: string;          // type === 'param_threshold'
  threshold?: number;
  operator?: '>=' | '<=' | '==' | '>';
  timelinePoint?: string;     // type === 'timeline'
}

// 使用例：好感度 50 以上の時だけアタッチ可能
const condition: ConditionSlot = {
  type: 'param_threshold',
  paramKey: 'affection',
  operator: '>=',
  threshold: 50,
};
```

---

## 3.6 Assets Linker（アセット紐付け）

JSON 内のパスと実際のスプライト / 音源データを明示的に紐付け管理する。

```typescript
interface AssetLink {
  jsonKey: string;       // JSON 内のキー名
  assetPath: string;     // 実際のファイルパス
  assetType: 'sprite' | 'bgm' | 'sfx' | 'background';
  preload?: boolean;     // シーン開始時にプリロードするか
}

// Decal 例：表情 Decal のアセット紐付け
const angryFaceDecal: Decal = {
  id: 'decal-face-angry',
  name: '怒り表情',
  type: 'face',
  data: {
    face: 'angry',
    faceSprite: '/sprites/aria_angry.png',
  },
  assetLinks: [
    {
      jsonKey: 'faceSprite',
      assetPath: '/sprites/aria_angry.png',
      assetType: 'sprite',
      preload: true,
    },
  ],
};
```

---

## 3.7 Variable Injection（変数流し込み）

シナリオテキスト内の変数プレースホルダーを `mergedData` から自動補完する。

```typescript
function injectVariables(text: string, data: Record<string, unknown>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? `{${key}}`));
}

// 使用例
const template = '{player_name}、あなたの好感度は{affection}です。';
const result   = injectVariables(template, { player_name: 'ユウ', affection: 72 });
// → "ユウ、あなたの好感度は72です。"
```

対応変数の例：

| プレースホルダー | ソース |
|--------------|-------|
| `{player_name}` | gameStore.playerName |
| `{affection}` | mergedData.affection |
| `{chapter}` | mergedData.timeline.chapter |
| `{route}` | mergedData.timeline.route |

---

## 3.8 Scene Snapshots（シーン保存）

特定のアタッチ状態（Core + Decals の組み合わせ）を1つの「シーン」として保存・再呼び出しする。

```typescript
interface SceneSnapshot {
  id: string;
  label: string;           // 例：「第3章・アリア 怒りシーン」
  coreId: string;
  attachedDecals: {
    socketKey: SocketKey;
    decalId: string;
  }[];
  mergedDataSnapshot: Record<string, unknown>;  // 保存時点のマージ済みJSON
  thumbnailPath?: string;  // Preview Render の結果画像
  createdAt: number;
}
```

**用途：**
- よく使うキャラ状態をテンプレートとして保存
- 別シーンで同じ状態を1クリックで復元
- バージョン比較（Snapshot A vs B）

---

## 3.9 Preview Render（簡易ビューア）

マージ済み JSON をもとに、立ち絵 + 背景 + 表情を合成してリアルタイムプレビューする。

```
[ キャンバス（中央） ]
  ├─ 背景: background（mergedData.background）
  ├─ 立ち絵: portrait + face sprite（mergedData.faceSprite）
  └─ テキストボックス: Variable Injection 適用後のセリフ
```

- プロパティを変更するたびに即時更新
- Scene Snapshot として PNG 保存可能

---

## 実装フェーズ（優先度）

| Phase | 機能 | 備考 |
|-------|-----|------|
| **P0** | 型定義（`BaseCard`, `Decal`, `Socket`） | `core/types/jsoncard.ts` に切り出す |
| **P1** | Core-Decal アタッチ・マージロジック | `core/services/JsonCardService.ts` |
| **P1** | プロパティビュー UI | PlotNotebookShell に統合 or 独立コンポーネント |
| **P1** | RAW JSON ビュー | JSON エディタ（Monaco Editor など） |
| **P2** | Conflict Resolver | ルール定義 UI |
| **P2** | Condition Slot | フラグ / パラメータ条件チェック |
| **P2** | Assets Linker | ファイルパス紐付け管理 |
| **P3** | Variable Injection | シナリオテキスト内補完 |
| **P3** | Scene Snapshots | 状態保存・復元 |
| **P3** | Preview Render | Canvas / CSS 合成ビューア |
| **P3** | Timeline / Sequence Decal | 進行管理専用 UI |

---

## 既存システムとの統合ポイント

| 既存機能 | 統合方法 |
|--------|---------|
| `PlotCard.castSlots` | CastSlot → BaseCard への移行 |
| `PlotCard.lines[].face` | Face_Socket の Decal で管理 |
| `PlotCard.stateData.flags` | State_Socket の flag Decal で管理 |
| `gameStore.flags` | Condition Slot の評価元 |
| `GeminiService` | Scene Snapshot をプロンプトに変換して AI に渡す |
| `KanbanView` | Decal カードをカンバン形式で整理 |

---

## まとめ：JsonCard が解決する問題

| 問題 | 現状 | JsonCard 後 |
|-----|------|------------|
| フラグ管理が複雑 | コード内に散在する条件分岐 | Decal の付け外しで可視化 |
| 表情管理が煩雑 | `face` 文字列を直打ち | Face_Socket に Decal をアタッチ |
| シーン再現が困難 | コード読み返しが必要 | Scene Snapshot で1クリック復元 |
| 競合状態の把握 | デバッグが大変 | Conflict Resolver で明示的に管理 |
| 条件分岐の見通し | if/else が深くなる | Condition Slot で宣言的に定義 |
