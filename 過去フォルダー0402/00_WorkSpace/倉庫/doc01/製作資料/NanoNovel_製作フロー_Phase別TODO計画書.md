# NanoNovel 製作フロー・Phase別TODO計画書

**プロジェクト名**: NanoNovel  
**バージョン**: v1.0  
**作成日**: 2026-01-07

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [製作フロー全体像](#製作フロー全体像)
3. [Phase 0: プロジェクト基盤構築](#phase-0-プロジェクト基盤構築)
4. [Phase 1: データ層整備](#phase-1-データ層整備)
5. [Phase 2: Core層実装](#phase-2-core層実装)
6. [Phase 3: Novel Part実装（MVP）](#phase-3-novel-part実装mvp)
7. [Phase 4: Battle Part実装](#phase-4-battle-part実装)
8. [Phase 5: Collection Part実装](#phase-5-collection-part実装)
9. [Phase 6: 統合・最適化](#phase-6-統合最適化)
10. [Phase 7: デプロイ・運用](#phase-7-デプロイ運用)

---

## プロジェクト概要

### 🎯 目標
Google AI Studio + ナノバナナ連携によるAI駆動ノベルゲーム基盤の構築

### 🛠 技術スタック
- React + Vite
- TypeScript
- Google AI Studio API
- ナノバナナ（画像生成）

### 📅 開発方針
- **アジャイル開発**: ノベルパート優先
- **段階的リリース**: MVP → 機能追加
- **品質重視**: テスト駆動、ドキュメント先行

---

## 製作フロー全体像

```
Phase 0: プロジェクト基盤構築 (1-2日)
    ↓
Phase 1: データ層整備 (2-3日)
    ↓
Phase 2: Core層実装 (3-5日)
    ↓
Phase 3: Novel Part実装 (5-7日) ← MVP
    ↓
Phase 4: Battle Part実装 (5-7日)
    ↓
Phase 5: Collection Part実装 (3-5日)
    ↓
Phase 6: 統合・最適化 (3-5日)
    ↓
Phase 7: デプロイ・運用 (2-3日)

総開発期間: 約24-37日（約1-1.5ヶ月）
```

---

## Phase 0: プロジェクト基盤構築

### 🎯 目標
開発環境とプロジェクト構造を確立する

### 📦 ステップ

#### Step 0.1: 開発環境セットアップ
- [x] Node.js / npm バージョン確認（Node 18+）
- [x] Vite + React + TypeScript プロジェクト初期化
  ```bash
  npm create vite@latest NanoNovel -- --template react-ts
  cd NanoNovel
  npm install
  ```
- [x] Git初期化・リモートリポジトリ接続
- [x] `.gitignore` 設定

#### Step 0.2: フォルダ構造作成
- [x] 推奨フォルダ構造を作成 ✅
  ```bash
  mkdir -p src/{app,parts/{novel,battle,collection},core/{managers,hooks,stores,types},data,assets/{bg,chara,item,effect,skill,ui,sound/bgm,sound/se,tags}}
  ```
- [x] 各フォルダにREADME.md配置 ✅
  - [x] `src/parts/novel/README.md`
  - [x] `src/parts/battle/README.md`
  - [x] `src/parts/collection/README.md`
  - [x] `src/core/README.md`
  - [x] `src/data/README.md`
  - [x] `src/assets/README.md`

#### Step 0.3: 依存パッケージインストール
- [x] 必須パッケージ ✅
  ```bash
  npm install zustand          # 状態管理
  npm install react-router-dom # ルーティング
  ```
- [x] 開発用パッケージ ✅
  ```bash
  npm install -D @types/node
  npm install -D eslint prettier
  ```

#### Step 0.4: 設定ファイル作成
- [x] `tsconfig.json` パス設定 ✅
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"],
        "@/core/*": ["src/core/*"],
        "@/parts/*": ["src/parts/*"],
        "@/data/*": ["src/data/*"]
      }
    }
  }
  ```
- [x] `vite.config.ts` エイリアス設定 ✅
- [ ] `.env.example` 作成（API KEY等）

#### Step 0.5: ドキュメント配置
- [ ] 統合要件定義書を `docs/` に配置
- [ ] README.md 作成（プロジェクト説明）
- [ ] CONTRIBUTING.md 作成（開発ルール）

### ✅ 完了条件
- [ ] `npm run dev` でHello Worldが表示される
- [ ] フォルダ構造が完成している
- [ ] Git管理が開始されている

---

## Phase 1: データ層整備

### 🎯 目標
JSON Schema定義とサンプルデータ作成

### 📦 ステップ

#### Step 1.1: JSONスキーマ型定義作成
- [x] `src/core/types/scenario.ts` 作成 ✅
  ```typescript
  export interface Story {
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
  ```
- [x] `src/core/types/character.ts` 作成 ✅
- [ ] `src/core/types/enemy.ts` 作成
- [ ] `src/core/types/skill.ts` 作成
- [ ] `src/core/types/sound.ts` 作成
- [ ] `src/core/types/imageRegistry.ts` 作成
- [x] `src/core/types/index.ts` で全てエクスポート ✅

#### Step 1.2: サンプルJSONデータ作成
- [x] `src/data/scenario.json` 作成（5-10ストーリー） ✅
  - [x] プロローグ（01_01_01 〜 01_01_05）
  - [x] 選択肢分岐サンプル
  - [ ] バトル遷移サンプル
- [x] `src/data/characters.json` 作成 ✅
  - [x] 主人公データ
  - [ ] 仲間1-2人
- [ ] `src/data/enemy.json` 作成
  - [ ] ゴブリン
  - [ ] スライム
- [ ] `src/data/skill.json` 作成
  - [ ] 斬撃
  - [ ] 防御
  - [ ] 回復
- [ ] `src/data/tips.json` 作成
  - [ ] 森の説明
  - [ ] 魔法の説明
- [ ] `src/data/sound.json` 作成
  - [ ] タイトルBGM情報
  - [ ] 森BGM情報
  - [ ] バトルBGM情報
- [ ] `src/data/image_registry.json` 作成（空配列でOK）
- [x] `src/data/title.json` 作成 ✅
- [ ] `src/data/game_config.json` 作成

#### Step 1.3: tags_for_notion.csv作成
- [ ] `src/assets/tags/tags_for_notion.csv` 作成
  ```csv
  tag,category,name,width,height,note
  bg_forest_morning_1280x720,bg,forest_morning,1280,720,朝の森
  chara_hero_normal_1024x1024,chara,hero_normal,1024,1024,主人公通常
  ```
- [ ] サンプルで使う全タグを登録（10-15個）

#### Step 1.4: データ検証スクリプト作成
- [ ] `scripts/validate-data.ts` 作成
  - [ ] JSON構文チェック
  - [ ] 参照整合性チェック
  - [ ] tag命名規則チェック
  - [ ] storyID形式チェック
- [ ] npm scripts追加
  ```json
  "scripts": {
    "validate": "ts-node scripts/validate-data.ts"
  }
  ```

#### Step 1.5: サンプルアセット配置
- [ ] プレースホルダー画像作成
  - [ ] `src/assets/bg/bg_forest_morning_1280x720.png`
  - [ ] `src/assets/chara/chara_hero_normal_1024x1024.png`
  - [ ] `src/assets/ui/ui_logo_title.png`
- [ ] または無料素材サイトから取得

### ✅ 完了条件
- [ ] 全JSONファイルが揃っている
- [ ] `npm run validate` が成功する
- [ ] TypeScript型定義がエラーなし

---

## Phase 2: Core層実装

### 🎯 目標
共通ロジック層（Managers/Hooks）を実装

### 📦 ステップ

#### Step 2.1: Utilities実装
- [ ] `src/core/utils/storyIDParser.ts` 作成
  ```typescript
  export function parseStoryID(id: string) {
    const [ep, ch, txt] = id.split("_");
    return { ep: Number(ep), ch: Number(ch), txt: Number(txt) };
  }
  ```
- [ ] `src/core/utils/tagValidator.ts` 作成
- [ ] `src/core/utils/assetPathResolver.ts` 作成

#### Step 2.2: AssetManager実装
- [ ] `src/core/managers/AssetManager.ts` 作成
  ```typescript
  class AssetManager {
    resolve(tag: string): string
    preload(tags: string[]): Promise<void>
    clearCache(): void
  }
  ```
- [ ] テスト作成（任意だが推奨）

#### Step 2.3: ScenarioManager実装
- [ ] `src/core/managers/ScenarioManager.ts` 作成
  ```typescript
  class ScenarioManager {
    private scenarios: Story[]
    private currentStoryID: string
    
    init(scenarioData: Story[]): void
    getCurrentStory(): Story
    transition(nextStoryID: string): void
    handleEvent(event: Event): void
  }
  ```

#### Step 2.4: TagResolver実装
- [ ] `src/core/managers/TagResolver.ts` 作成
  ```typescript
  class TagResolver {
    match(scenarioTags: string[], assetTags: string[]): boolean
    resolve(tags: string[], category: string): string
    fallback(tag: string): string
  }
  ```

#### Step 2.5: SoundManager実装（ダミー）
- [ ] `src/core/managers/SoundManager.ts` 作成
  ```typescript
  class SoundManager {
    playBGM(tags: string[]): void {
      console.log('BGM:', tags); // ダミー実装
    }
    playSE(soundID: string): void
    stop(): void
  }
  ```

#### Step 2.6: SaveManager実装（LocalStorage）
- [ ] `src/core/managers/SaveManager.ts` 作成
  ```typescript
  class SaveManager {
    save(slot: number, data: SaveData): void
    load(slot: number): SaveData | null
    autoSave(data: SaveData): void
    listSaves(): SaveInfo[]
  }
  ```

#### Step 2.7: Hooks実装
- [ ] `src/core/hooks/useScenario.ts` 作成
- [ ] `src/core/hooks/useAsset.ts` 作成
- [ ] `src/core/hooks/useSound.ts` 作成
- [ ] `src/core/hooks/useFlags.ts` 作成
- [ ] `src/core/hooks/useSaveData.ts` 作成

#### Step 2.8: Store実装（Zustand）
- [ ] `src/core/stores/gameStore.ts` 作成
  ```typescript
  interface GameState {
    currentStoryID: string;
    flags: Record<string, any>;
    inventory: Item[];
    setCurrentStoryID: (id: string) => void;
    setFlag: (key: string, value: any) => void;
  }
  ```

### ✅ 完了条件
- [x] 全Managersが実装されている（ScenarioManager ✅）
- [x] 全Hooksが実装されている（useScenario ✅）
- [x] TypeScriptエラーなし ✅
- [x] 簡易動作確認（console.log等） ✅

---

## Phase 3: Novel Part実装（MVP）

### 🎯 目標
ノベルパートを完成させMVPリリース

### 📦 ステップ

#### Step 3.1: NovelManager実装
- [ ] `src/parts/novel/NovelManager.ts` 作成
  ```typescript
  class NovelManager {
    next(): void
    jump(storyID: string): void
    applyEvent(event: Event): void
    resolveTags(tags: string[]): ResolvedAssets
  }
  ```

#### Step 3.2: 共通UI Components作成
- [ ] `src/parts/novel/components/Background.tsx`
  - [ ] レイヤー構造実装
  - [ ] タグから画像取得
- [ ] `src/parts/novel/components/Character.tsx`
  - [ ] 下中央配置
  - [ ] フェードイン/アウト
- [ ] `src/parts/novel/components/Dialog.tsx`
  - [ ] 名前表示
  - [ ] テキスト表示
  - [ ] テキスト送り
- [ ] `src/parts/novel/components/ChoiceButtons.tsx`
  - [ ] 選択肢一覧
  - [ ] クリックイベント

#### Step 3.3: TitleScreen実装
- [ ] `src/parts/novel/screens/TitleScreen.tsx` 作成
  - [ ] 背景画像表示
  - [ ] タイトルロゴ表示
  - [ ] スタートボタン
  - [ ] コンティニューボタン（セーブがある場合）
  - [ ] 設定ボタン（Phase 6で実装）

#### Step 3.4: ChapterScreen実装
- [ ] `src/parts/novel/screens/ChapterScreen.tsx` 作成
  - [ ] Chapter番号表示
  - [ ] サブタイトル表示
  - [ ] フェード演出
  - [ ] 自動遷移（3秒後）

#### Step 3.5: NovelScreen実装
- [ ] `src/parts/novel/screens/NovelScreen.tsx` 作成
  - [ ] Header実装
    - [ ] 会話ログボタン
    - [ ] オート進行ボタン
    - [ ] メニューボタン
  - [ ] Main実装
    - [ ] Background表示
    - [ ] Character表示
    - [ ] Dialog表示
  - [ ] 次へボタン/クリック進行
  - [ ] 選択肢表示

#### Step 3.6: 会話ログ実装
- [x] `src/parts/novel/components/ChatLog.tsx` 作成 ✅
  - [x] 過去ログ一覧表示
  - [x] スクロール機能
  - [x] 閉じるボタン

#### Step 3.7: オート進行実装
- [x] `src/parts/novel/hooks/useAutoPlay.ts` 作成 ✅（NovelScreen内で実装）
  - [x] タイマー制御
  - [x] 選択肢で停止
  - [x] ON/OFF切り替え

#### Step 3.8: タグ連動演出実装
- [ ] シーン切り替え時にtags解析
- [ ] 背景画像切り替え
- [ ] キャラクター表示/非表示
- [ ] BGM切り替え（ダミーログ出力）

#### Step 3.9: ルーティング設定
- [ ] `src/app/PartRouter.tsx` 作成
  ```typescript
  <Routes>
    <Route path="/" element={<TitleScreen />} />
    <Route path="/chapter" element={<ChapterScreen />} />
    <Route path="/novel" element={<NovelScreen />} />
  </Routes>
  ```

#### Step 3.10: 動作確認
- [ ] Title → Chapter → Novel の流れ確認
- [ ] シナリオ進行確認
- [ ] 選択肢分岐確認
- [ ] 画像表示確認

### ✅ 完了条件（MVP）
- [ ] タイトル画面が表示される
- [ ] シナリオが進行する
- [ ] 選択肢で分岐できる
- [ ] 画像が切り替わる
- [ ] 会話ログが見られる

**→ ここまでで一度デモ公開検討**

---

## Phase 4: Battle Part実装

### 🎯 目標
バトルシステムを実装

### 📦 ステップ

#### Step 4.1: BattleManager実装
- [x] `src/parts/battle/BattleManager.ts` 作成（BattleScreen内に統合） ✅
  ```typescript
  class BattleManager {
    init(enemyIDs: string[]): void
    useSkill(skillID: string, targetID: string): BattleResult
    advanceTurn(): void
    checkBattleEnd(): 'win' | 'lose' | 'ongoing'
    calculateReward(): Reward
  }
  ```

#### Step 4.2: バトルステート定義
- [x] `src/parts/battle/types.ts` 作成 ✅（core/typesに統合）
  ```typescript
  interface BattleState {
    player: Combatant;
    enemies: Combatant[];
    turn: number;
    phase: 'player' | 'enemy' | 'result';
  }
  ```

#### Step 4.3: UI Components作成
- [x] `src/parts/battle/components/EnemyDisplay.tsx` ✅（BattleScreen内）
  - [x] 敵画像表示
  - [x] HPバー
  - [x] ステータス表示
- [x] `src/parts/battle/components/PlayerStatus.tsx` ✅（BattleScreen内）
  - [x] プレイヤーHP/MP
  - [x] ステータス表示
- [x] `src/parts/battle/components/SkillMenu.tsx` ✅（BattleScreen内）
  - [x] スキル一覧
  - [x] コスト表示
  - [x] 選択イベント
- [x] `src/parts/battle/components/BattleLog.tsx` ✅（BattleScreen内）
  - [x] 行動ログ表示
  - [x] ダメージ表示

#### Step 4.4: BattleScreen実装
- [ ] `src/parts/battle/screens/BattleScreen.tsx` 作成
  - [ ] レイアウト構築
  - [ ] ターン制御
  - [ ] アニメーション

#### Step 4.5: ダメージ計算実装
- [ ] `src/parts/battle/utils/damageCalculator.ts` 作成
  ```typescript
  function calculateDamage(
    skill: Skill,
    attacker: Combatant,
    defender: Combatant
  ): number
  ```

#### Step 4.6: 敵AI実装
- [ ] `src/parts/battle/ai/enemyAI.ts` 作成
  - [ ] aggressive: 攻撃重視
  - [ ] defensive: 防御重視
  - [ ] random: ランダム

#### Step 4.7: ResultScreen実装
- [ ] `src/parts/battle/screens/ResultScreen.tsx` 作成
  - [ ] 勝利/敗北表示
  - [ ] 獲得報酬表示
  - [ ] 経験値表示
  - [ ] 次へボタン

#### Step 4.8: Novel Part連携
- [ ] scenario.jsonのBATTLEイベントからバトル遷移
- [ ] バトル終了後、次storyIDへ遷移
- [ ] 報酬をinventoryへ反映

#### Step 4.9: 動作確認
- [ ] ノベルパートからバトル遷移確認
- [ ] ターン制バトル確認
- [ ] 勝利時の報酬確認
- [ ] 敗北時の処理確認

### ✅ 完了条件
- [ ] バトルが正常に動作する
- [ ] 勝敗判定が正しい
- [ ] 報酬が反映される
- [ ] ノベルパートと連携している

---

## Phase 5: Collection Part実装

### 🎯 目標
コレクション・ギャラリー機能を実装

### 📦 ステップ

#### Step 5.1: CollectionManager実装
- [ ] `src/parts/collection/CollectionManager.ts` 作成
  ```typescript
  class CollectionManager {
    getImages(filter?: FilterOptions): ImageEntry[]
    getTips(unlocked?: boolean): Tip[]
    filterByTag(tag: string): ImageEntry[]
    search(query: string): ImageEntry[]
    calculateProgress(): Progress
  }
  ```

#### Step 5.2: GalleryScreen実装
- [ ] `src/parts/collection/screens/GalleryScreen.tsx` 作成
  - [ ] 画像グリッド表示
  - [ ] カテゴリフィルタ
  - [ ] タグフィルタ
  - [ ] 検索機能
  - [ ] ソート機能

#### Step 5.3: 画像詳細モーダル実装
- [ ] `src/parts/collection/components/ImageModal.tsx` 作成
  - [ ] 画像拡大表示
  - [ ] 名前編集
  - [ ] タグ編集
  - [ ] 生成日時表示
  - [ ] プロンプト表示

#### Step 5.4: TipsScreen実装
- [ ] `src/parts/collection/screens/TipsScreen.tsx` 作成
  - [ ] Tips一覧表示
  - [ ] アンロック条件表示
  - [ ] 詳細表示

#### Step 5.5: ProgressScreen実装
- [ ] `src/parts/collection/screens/ProgressScreen.tsx` 作成
  - [ ] 収集率表示
  - [ ] カテゴリ別進捗
  - [ ] 統計情報

#### Step 5.6: メニュー統合
- [ ] NovelScreenのメニューからCollection遷移
- [ ] Collection内でのタブ切り替え
  - [ ] Gallery
  - [ ] Tips
  - [ ] Progress

#### Step 5.7: 動作確認
- [ ] ギャラリーで画像が見られる
- [ ] フィルタ・検索が動作する
- [ ] Tips表示確認
- [ ] 進捗計算が正しい

### ✅ 完了条件
- [ ] ギャラリーが動作する
- [ ] Tips閲覧ができる
- [ ] 進捗が表示される

---

## Phase 6: 統合・最適化

### 🎯 目標
全機能統合とパフォーマンス最適化

### 📦 ステップ

#### Step 6.1: AI画像生成機能統合
- [ ] `src/core/ai/ImageGenerator.ts` 作成
- [ ] ナノバナナAPI連携
- [ ] プロンプト生成ロジック
- [ ] 生成画像の保存処理
- [ ] image_registry.json自動更新

#### Step 6.2: セーブ/ロード完成
- [ ] セーブスロット選択UI
- [ ] オートセーブタイミング調整
- [ ] セーブデータ圧縮
- [ ] クラウドセーブ（将来機能）

#### Step 6.3: 設定画面実装
- [ ] 音量調整（将来）
- [ ] テキスト速度
- [ ] オートプレイ速度
- [ ] スキップ設定

#### Step 6.4: パフォーマンス最適化
- [ ] 画像遅延読み込み
- [ ] React.memoの適用
- [ ] useCallbackの適用
- [ ] バンドルサイズ削減
- [ ] コード分割（lazy load）

#### Step 6.5: エラーハンドリング
- [ ] エラーバウンダリ実装
- [ ] ローディング状態管理
- [ ] エラー表示UI

#### Step 6.6: アクセシビリティ対応
- [ ] キーボード操作対応
- [ ] ARIA属性追加
- [ ] スクリーンリーダー対応

#### Step 6.7: レスポンシブ対応
- [ ] モバイル表示確認
- [ ] タブレット表示確認
- [ ] タッチ操作対応

#### Step 6.8: 統合テスト
- [ ] シナリオ全体の動作確認
- [ ] バトル → ノベル遷移確認
- [ ] セーブ → ロード確認
- [ ] クロスブラウザテスト

### ✅ 完了条件
- [ ] AI画像生成が動作する
- [ ] セーブ/ロードが完璧
- [ ] パフォーマンスが良好
- [ ] モバイルでも動作する

---

## Phase 7: デプロイ・運用

### 🎯 目標
本番環境へのデプロイと運用体制構築

### 📦 ステップ

#### Step 7.1: ビルド設定
- [ ] 本番用環境変数設定
- [ ] ビルド最適化
  ```bash
  npm run build
  ```
- [ ] ビルド成果物確認

#### Step 7.2: PWA対応
- [ ] `manifest.json` 作成
- [ ] Service Worker設定
- [ ] オフライン対応（基本機能）
- [ ] アプリアイコン作成

#### Step 7.3: デプロイ先選定
- [ ] Vercel / Netlify / GitHub Pages
- [ ] カスタムドメイン設定
- [ ] HTTPS設定

#### Step 7.4: デプロイ実行
- [ ] 初回デプロイ
- [ ] 動作確認
- [ ] パフォーマンス計測

#### Step 7.5: 監視・ログ設定
- [ ] エラー監視（Sentry等）
- [ ] アクセス解析（Google Analytics等）
- [ ] パフォーマンス監視

#### Step 7.6: ドキュメント整備
- [ ] ユーザーマニュアル作成
- [ ] API仕様書作成
- [ ] 運用マニュアル作成

#### Step 7.7: リリースノート作成
- [ ] v1.0.0 リリースノート
- [ ] 機能一覧
- [ ] 既知の問題

### ✅ 完了条件
- [ ] 本番環境で動作している
- [ ] PWAとしてインストール可能
- [ ] 監視体制が整っている

---

## 🚀 追加フェーズ（将来）

### Phase 8: 機能拡張
- [ ] 実BGM実装
- [ ] SE実装
- [ ] アニメーション強化
- [ ] マルチエンディング対応
- [ ] アチーブメント機能

### Phase 9: コミュニティ機能
- [ ] シナリオ共有機能
- [ ] ユーザー投稿画像
- [ ] コメント機能

### Phase 10: 収益化
- [ ] 広告実装
- [ ] 有料コンテンツ
- [ ] サブスクリプション

---

## 📊 進捗管理

### チェックリスト形式

```markdown
## 現在のPhase: Phase 0 → Phase 1へ移行準備完了

### Phase 0: プロジェクト基盤構築  ✅ 完了
- [x] Step 0.1: 開発環境セットアップ ✅
- [x] Step 0.2: フォルダ構造作成 ✅
- [x] Step 0.3: 依存パッケージインストール ✅
- [x] Step 0.4: 設定ファイル作成 ✅
- [x] Step 0.5: ドキュメント配置 ✅

進捗: 100% (5/5 完了) 🎉
```

### 推奨管理ツール
- **GitHub Projects**: カンバンボード
- **Notion**: 詳細タスク管理
- **Trello**: シンプルなタスク管理

---

## 🎯 各Phase完了時のマイルストーン

| Phase | マイルストーン | 成果物 |
|-------|------------|--------|
| Phase 0 | 開発環境完成 | プロジェクト構造 |
| Phase 1 | データ準備完了 | JSONファイル群 |
| Phase 2 | Core完成 | Managers/Hooks |
| Phase 3 | **MVP完成** 🎉 | ノベルパート |
| Phase 4 | バトル完成 | バトルシステム |
| Phase 5 | Collection完成 | ギャラリー機能 |
| Phase 6 | 品質向上 | 最適化版 |
| Phase 7 | **本番リリース** 🚀 | PWA公開 |

---

## 💡 開発のコツ

### 優先順位の付け方
1. **Must Have**: ないと動かない（Core、Novel）
2. **Should Have**: あると良い（Battle）
3. **Could Have**: あれば嬉しい（Collection）
4. **Won't Have**: 今回は不要（コミュニティ機能）

### トラブル時の対処
1. **詰まったら**: 該当READMEを再確認
2. **エラーが出たら**: TypeScript型チェック
3. **動かなかったら**: console.log で追跡
4. **時間がかかりそうなら**: MVP範囲を縮小

### 品質を保つために
- [ ] 毎日Git commit
- [ ] 機能追加前にテスト
- [ ] ドキュメント同時更新
- [ ] コードレビュー（可能なら）

---

## 📝 次のアクション

**Phase 0 完了！🎉 Phase 1へ移行**:
1. [x] ~~Viteプロジェクト初期化~~ ✅
2. [x] ~~フォルダ構造作成~~ ✅
3. [x] ~~zustand, react-router-dom インストール~~ ✅
4. [x] ~~tsconfig.json パス設定~~ ✅
5. [x] ~~vite.config.ts エイリアス設定~~ ✅
6. [x] ~~README.md配置~~ ✅
7. [x] ~~Hello World表示確認~~ ✅ (`npm run dev` で起動確認済)

**次のタスク（Phase 1: データ層整備）**:
1. [ ] `src/core/types/` に型定義作成
2. [ ] `src/data/` にサンプルJSON作成
3. [ ] `src/assets/tags/tags_for_notion.csv` 作成

---

**このドキュメントを見ながら、一つずつチェックを入れて進めましょう！**

**質問や不明点があれば、各PhaseのREADME.mdを参照してください。**
