# Debug & Implementation Log (デバッグ＆実装ログ)

## Phase 1: Basic Display & Routing (基本表示と遷移)
- [x] **1-1. Title Screen Integration**: タイトル画面に「Home」ボタンが表示されている。
- [x] **1-2. Routing**: ボタンを押すと `HomeScreen` に遷移する。
- [x] **1-3. Static Rendering**: API呼び出し無しで、背景とキャラクター（プレースホルダー）、ゲージが表示される。
- [ ] **1-4. Back Navigation**: 左上の戻るボタンでタイトル画面に戻れる。

## Phase 2: Component Isolation (コンポーネント分離)
- [ ] **2-1. Generator Isolation**: `CharacterGenerator` コンポーネントが作成され、`HomeScreen` から分離されている。
- [ ] **2-2. Safe Import**: `GoogleGenAI` のインポートが `CharacterGenerator` 内のみに限定され、メイン画面のクラッシュを防いでいる。
- [ ] **2-3. UI Separation**: 生成中のローディング画面が分離したコンポーネントで管理されている。

## Phase 3: Interaction & Logic (インタラクション)
- [ ] **3-1. Gauge Updates**: クリックや放置（Idle）でステータスゲージが変化する。
- [ ] **3-2. Quick Actions**: 右側のボタン（なでる等）が反応し、ダイアログが表示される。
- [ ] **3-3. Character Switch**: `CharacterBox` からキャラクター切り替えができる。

## Phase 4: API Integration (API連携)
- [ ] **4-1. Key Check**: APIキーがない場合、生成処理がスキップされ、エラーログが表示される（クラッシュしない）。
- [ ] **4-2. Generation**: APIキーがある場合、画像生成が実行され、キャラクター画像が更新される。
