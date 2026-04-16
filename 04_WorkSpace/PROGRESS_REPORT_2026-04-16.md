# 作業進捗レポート
> 2026-04-16 更新（タイトル画面切り替えボタン追加後）

---

## ビルド状態 ✅ エラー 0件

```
npm run build → ✓ built in 6.51s
TypeScript エラー: 0件
警告: チャンクサイズのみ（機能に影響なし）
```

---

## 完了済み作業（Phase 1 全完了）

### 新規作成ファイル

| ファイル | 内容 |
|----------|------|
| `src/data/collection/titles.json` | タイトルDB（JSON）— NanoNovel Demo エントリ1件 |
| `src/screens/android/AndroidLayout.tsx` | Android縦型レイアウト 1ファイル完結 |

### 変更ファイル

| ファイル | 変更内容 |
|----------|---------|
| `src/core/types/scenario.ts` | `ANDROID_COLLECTION` を ScreenType に追加 |
| `src/App.tsx` | userAgent自動判定 + ANDROID_COLLECTION ルート追加 |
| `src/screens/01_Title/TitleScreen.tsx` | 🖥 PC / 📱 Android 切り替えボタンを追加 |

---

## 現在使える機能

### タイトル画面（右上）
```
✏ プロット手帳
📄 スキーマ ver1  📄 スキーマ ver2
🖥 PC Collection  📱 Android View   ← 今回追加
```
- PC Collection ボタン: 従来の CollectionScreen
- Android View ボタン: AndroidLayout（縦型）
- Android 実機でアクセスすると COLLECTION が自動で Android View に切り替わる

### Android Layout 実装済み
- ハンバーガーメニュー（左スライドイン）
- タイトル一覧 Gallery（2カラム・サムネ・ステータスバッジ）
- TestPlay ボタン → ポップアップ「〇〇に移動します。※開発ログ」
- 各タブ（ノベルライブラリ / プロット手帳 / レポート / 発注書 / スキーマー確認）
- ノベルライブラリ → 詳細画面遷移
- ヘッダーの「PC」ボタンで PC レイアウトに戻れる

---

## Phase 2 工数の詳細見積もり

### A. 素材 Import 機能

| タスク | 詳細 | 難度 | 工数 |
|--------|------|------|------|
| **タイトル Import モーダル** | titles.json に新エントリ追加。名前・サムネ画像・ステータス入力 UI | 中 | 2h |
| **画像アップロード** | ブラウザの File API で画像を読み込み → Base64 or Firestore Storage | 中 | 2h |
| **キャラ/素材 Import** | characters.json / items.json へのエントリ追加フォーム | 中 | 2h |
| **Firestore 書き込み** | CollectionService 経由で保存（既存の SeedService 参考） | 中 | 1h |
| **小計** | | | **7h** |

### B. 横画面背景 → 縦画面 範囲選択表示

| タスク | 詳細 | 難度 | 工数 |
|--------|------|------|------|
| **範囲選択 UI** | Canvas 上でドラッグして矩形を描く。座標を `{x,y,w,h}` で保存 | 高 | 3h |
| **縦型プレビュー** | 選択した範囲を `object-position` + `object-fit:cover` で縦表示 | 中 | 1h |
| **座標の保存** | titles.json の `thumbnailCrop: {x,y,w,h}` フィールドに書き込み | 小 | 0.5h |
| **Gallery カードに反映** | 保存した crop 座標でサムネを切り出して表示 | 小 | 0.5h |
| **小計** | | | **5h** |

### C. tagsDB 整備（JSON relation 化）

| タスク | 詳細 | 難度 | 工数 |
|--------|------|------|------|
| **タグ側に linkedIds 追加** | tags.json に `linkedCharacterIds[]` フィールドを追加 | 小 | 1h |
| **TagsView 改修** | タグ一覧 → タップでそのタグが付いたキャラ一覧を表示 | 中 | 2h |
| **小計** | | | **3h** |

---

## Phase 2 合計工数

| カテゴリ | 工数 |
|---------|------|
| A. 素材 Import | 7h |
| B. 画像クロップ | 5h |
| C. tagsDB 整備 | 3h |
| **Phase 2 合計** | **15h** |

優先順位の提案:
1. **B（画像クロップ）** → Gallery のビジュアルが一気に改善、効果が見えやすい
2. **A（Import）** → データ追加のループが回るようになる
3. **C（tagsDB）** → 後でいつでもできる、今は JSON で十分

---

## Phase 3 以降（参考）

| フェーズ | 内容 | 工数 |
|---------|------|------|
| Phase 3 | AndroidReport コメント / 新規ノートボタン / ページ復元 | 4〜6h |
| Phase 4 | TestPlay の実際の画面遷移（縦型ノベル再生） | 3〜5h |

**全体残工数: 22〜26h 相当**
