# NANOBANANAPRO - Character Asset Generator

このプロジェクトは、Google Gemini APIを活用して、1枚の参照画像からゲーム開発に必要な一貫性のあるキャラクターアセット（立ち絵、表情差分、イベントCG）を自動生成する次世代のアセット制作ツールです。

## 🚀 プロジェクトの概要

「NANOBANANAPRO」は、単なる画像生成ツールではありません。AIを「アートディレクター」として機能させ、キャラクターのデザインを解析した上で、指定されたリスト（JSON）に基づいたアセット群を生成します。

### 主な機能
- **キャラクター解析**: 参照画像から髪型、目の色、服装、スタイルを自動抽出。
- **一貫性の維持**: 同一のキャラクター特性を保持したまま、ポーズや表情のみを変更。
- **JSON駆動型生成**: 制作指示書（Order List）をJSONで流し込むだけで一括生成。
- **ゲームデータ出力**: 生成された画像とメタデータ（`data.json`）をZIPにパッケージ化して即座に開発へ。

---

## 🛠 開発者向け：APIの導入とロジックの移植

本アプリの核となる知能は `services/gemini.ts` に集約されています。このロジックを他のプロジェクト（別のReactアプリ、Node.js、Pythonなど）に移植することで、外部から直接アセット生成機能を呼び出すことが可能です。

### 1. ロジックの移植方法
他のJavaScript/TypeScriptプロジェクトで利用する場合、以下の手順で「NANOBANANAPRO」の能力を移植できます。

1.  **ファイルのコピー**: `services/gemini.ts` と `types.ts` を移植先プロジェクトに配置します。
2.  **SDKのインストール**:
    ```bash
    npm install @google/genai
    ```
3.  **APIキーの設定**: 
    Google AI Studioで取得したAPIキーを環境変数 `process.env.API_KEY` として設定してください。

### 2. Gemini APIの直接利用
`services/gemini.ts` 内の `SYSTEM_INSTRUCTION` 変数には、NANOBANANAの「魂」である高度なプロンプトが含まれています。

- **役割（Role）**: ゲーム開発のエキスパートディレクター。
- **制約（Constraints）**: 参照画像の物理的特徴を厳守すること。
- **出力形式**: 常に構造化されたJSON、または画像。

このプロンプトをGeminiに渡すことで、どの環境からでも一貫したキャラクター生成が実現します。

---

## 🔑 セットアップ

### APIキーの取得
1. [Google AI Studio](https://aistudio.google.com/) にアクセス。
2. 「Get API key」をクリックし、新しいAPIキーを作成。

### 料金についての注意
- **Gemini Advanced等のサブスク**: これはチャットUI用の課金であり、API利用料とは別物です。
- **無料枠**: Google AI Studioには非常に寛大な無料枠があり、開発やテスト目的であれば無料で利用可能です。
- **有料プラン**: 大量生成やプライバシー保護が必要な場合は、Google Cloudコンソールから「Pay-as-you-go」プランを設定してください。

---

## 📂 生成パッケージの構成

エクスポートされたZIPファイルは、そのままゲームエンジンで読み込める構成になっています。

```text
remi_unant_package/
├── data.json          # キャラクター情報、タグ、アセットの紐付け
├── standing_01.png    # 立ち絵
├── face_smile.png     # 表情差分：笑顔
├── face_angry.png     # 表情差分：怒り
└── cg_event_01.png    # イベントCG
```

---

## ⚖️ 免責事項
生成された画像の著作権および利用規約については、Google Gemini APIの利用規約（Generative AI Additional Terms of Service）に従ってください。

---
**Developed with ✨ by Senior Frontend Engineer using Gemini 2.5 Flash / 3 Pro.**
