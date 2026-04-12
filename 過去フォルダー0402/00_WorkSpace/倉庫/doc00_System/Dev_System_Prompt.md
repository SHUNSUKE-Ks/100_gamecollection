# AI Development Guidelines & Custom Prompt

本ドキュメントは、本プロジェクト（NanoNovel）におけるAIアシスタントへの指示書（Custom Prompt）および開発ルールをまとめたものです。

## 1. Technology Stack & Environment

*   **Core**: React 19 + Vite (TSX)
*   **Platform**: Android / PWA mobile-first
*   **Hosting**: Vercel
*   **Styling**:
    *   Vanilla CSS (CSS Modules推奨だが、現状は `GameStyles/` での分離運用も可)
    *   `src/GameStyles/` : グローバルまた共通コンポーネントのスタイル
*   **Build**: `npm run dev` (Local), `npm run build` (Production)

## 2. Project Architecture

### 2.1 Directory Structure Rules
*   **Root Alias**: `@` = `src`
*   **Scaffolding**: 新規プロジェクト作成時は `create_project_structure.js` の使用を検討。
*   **Component Design**:
    *   **Declarative**: 宣言的UIを徹底する。
    *   **Functions**: 役割を一言でJSDocに記載。引数・CSSクラスの意味も明記する。

### 2.2 Game Flow
`Title` -> `Tutorial` -> `Novel (Main)` -> `Result`

---

## 3. Asset & Tag Management (Notion Integration)

Notion連携を見据え、タグ管理をCSVで統一します。

*   **Master File**: `src/assets/tags/tags_for_notion.csv` (Single Source of Truth)
*   **CSV Format**:
    ```csv
    description,tag_key,category,path
    ```
    *   `description`: 表示名（Notionでのタイトル）
    *   `tag_key`: システムで使用する識別子
    *   `category`: `bg` | `chara` | `item` | `bgm` | `se` | `effect`
    *   `path`: 実ファイルパス (例: `src/assets/tags/...`)

*   **Naming Convention**:
    `{category}_{name}_{width}x{height}`
    *   Example: `bg_cave_mysterious_1280x1080`

---

## 4. Scenario Data Specification (JSON)

シナリオデータは以下のJSONスキーマと運用ルールに厳密に従います。

### 4.1 "Iron Rules" of Scenario Data
1.  **Unique ID**: `storyID` は全ファイルを通じて（あるいはロード単位内で）**絶対重複禁止**。
    *   Format: `EP(2桁)+CH(2桁)` など識別しやすい形式 (例: `1101`)
2.  **Internal Consistency**: `nextStoryID` などのリンク先は、同一ロード範囲内に実在すること。
3.  **Readability**: スマホ閲覧を前提とし、1テキストは **3行（40-50文字）以内** とする。

### 4.2 Standard JSON Model

```json
{
  "storyID": "M_01_01_01",           // EP=11(EP1), CH=01, TXT=01 の意
  "speaker": "主人公",            
  "text": "この剣は...まさか伝説の！",
  "tags": [],                     // Character/BG tags if needed dynamically
  "event": {                      // Interaction logic
    "type": "CHOICE",
    "payload": {
      "choices": [
        { "label": "左の森を進む", "nextStoryID": "M_01_01_02" },
        { "label": "右の谷を下る", "nextStoryID": "M_01_01_03" }
      ]
    }
  },
  "flags": {                      // Flag updates
    "got_legend_sword": true
  },
  "effects": ["cutin_spark"],     // Visual effect queue
  "note": "剣取得直後の分岐"      // Dev note (Not visible in game)
}
```

---

## 5. Development Roadmap & Future Integration

### 5.1 Live2D / SVG Integration (In Planning)
将来的な `Live2D` 本格導入および `SVG` デモ実装に向け、以下の設計を考慮に入れること。

*   **Adapter Schema**: 既存の静止画表示ロジックとLive2D表示ロジックを仲介するアダプター設計。
*   **Prompt-to-Motion**: 感情タグ（`mood`）からLive2Dモーションへの変換テーブル設計。
*   **Performance**: モバイルPWAでの動作を最優先とし、軽量化を意識する。

### 5.2 Scenario Delivery Workflow
*   シナリオライター納品物（Excel/JSON）は、必ず `storyID` をキーとしてマージ可能な状態にする。
