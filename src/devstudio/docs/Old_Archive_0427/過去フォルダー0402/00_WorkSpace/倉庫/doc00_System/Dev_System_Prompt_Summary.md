# NanoNovel AI開発ガイドライン (要約版)

本ドキュメントは、プロジェクトの重要ルールを1500文字以内に集約したものです。

## 1. 技術スタック & 環境
*   **Core**: React 19 + Vite (TSX)
*   **Platform**: Android / PWA (Mobile-first)
*   **Hosting**: Vercel
*   **CSS**: Vanilla CSS (CSS Modules推奨。グローバルは `src/GameStyles/`)
*   **Root Alias**: `@` = `src`

## 2. 設計方針
*   **Flow**: Title -> Tutorial -> Novel -> Result
*   **Component**: 宣言的UI。JSDocに役割・引数・CSSクラスの意味を明記。
*   **Scaffold**: 新規時は `create_project_structure.js` を使用。

## 3. 素材管理 (Notion連携)
マスター: `src/assets/tags/tags_for_notion.csv`
列構成: `description, tag_key, category, path`
**命名規則**: `{category}_{name}_{width}x{height}`
(例: `bg_cave_mysterious_1280x1080`)

## 4. シナリオデータ規則 (JSON)
### 鉄の掟
1.  **ID重複禁止**: `storyID` は全編通してユニークであること。形式: `[TYPE]_[EP]_[CH]_[TXT]` (例: `M_01_01_01`)
2.  **リンク整合性**: `nextStoryID` はロード範囲内に実在すること。
3.  **可読性**: 1テキストは3行（40-50文字）以内。

### 推奨モデル
```json
{
  "storyID": "M_01_01_01",
  "speaker": "主人公",
  "text": "テキスト本文...",
  "tags": [],
  "event": {
    "type": "CHOICE",
    "payload": {
      "choices": [
        { "label": "選択肢A", "nextStoryID": "M_01_01_02" }
      ]
    }
  },
  "flags": { "flag_key": true },
  "effects": ["effect_key"]
}
```

## 5. ロードマップ (Live2D/SVG)
*   **Adapter設計**: 静止画/Live2Dの表示ロジックを仲介するアダプターを導入予定。
*   **感情マッピング**: `mood` タグ等からモーションを呼び出す変換テーブルを設計する。
*   **納品フロー**: シナリオ納品時は必ず `storyID` を含めること。
