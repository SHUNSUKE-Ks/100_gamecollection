# AIコード実装・移行記録

作成日時: 2026/02/03

## 📦 現在の状況 (Status)
`_temp_ai_import` から `src/screens/00_Home` へのファイルコピーまで完了しました。
まだコード内のパス修正や `HomeScreen.tsx` との統合が完全ではありません。

## ✅ 完了したタスク
- [x] `_temp_ai_import` フォルダの作成とAIコードの保全
- [x] プロジェクト構造の分析 (`src/screens/00_Home` をターゲットに決定)
- [x] タイトル画面への「Home (Standby)」ボタン追加
- [x] ファイルの移行 (Copy)
    - `components/` -> `src/screens/00_Home/components/`
    - `store/` -> `src/screens/00_Home/store/`
    - `data/` -> `src/screens/00_Home/data/`
    - `types.ts` -> `src/screens/00_Home/types.ts`
- [x] 依存ライブラリの確認 (`lucide-react` 等の互換性確認)

## 🚧 作業中のタスク (In Progress)
- [ ] **importパスの修正**: 移行したファイルの `import` 文が元の構成のままなので、新しいフォルダ構成に合わせて書き換える必要があります。
    - 例: `import ... from './components/...'` が正しいか確認
- [ ] **Google GenAI APIのフォールバック実装**: APIキーがない場合やエラ―時にクラッシュせず、オフラインモードで動くように `useInteractionStore` 等を改修します。

## 📝 今後のTODO (Next Steps)
- [ ] `HomeScreen.tsx` の本格実装
    - コピーした `App.tsx` のロジックを `HomeScreen.tsx` に移植
    - タイトル画面に戻るボタンの実装（AIコードには存在しないため追加が必要）
- [ ] 動作確認 (Debug)
    - コンパイルエラーの解消
    - ブラウザでの表示確認
    - インタラクション（なでる、会話など）の動作確認
