キャラクターの保存・読み込み（JSONファイル）に使用されているデータ構造（スキーマ）は、types.ts 内の CharacterProfile インターフェースで定義されています。
TypeScriptの定義 (types.ts)
code
TypeScript
// 1. キャラクターの基本設計
export interface CharacterDesign {
  name: string;            // キャラクター名
  base_prompt: string;     // 見た目のベースプロンプト (例: "Blue eyes, school uniform...")
  negative_prompt: string; // 生成したくない要素 (例: "low quality, bad anatomy...")
}

// 2. 各感情の定義
export interface EmotionPrompt {
  emotion: Emotion;        // 感情ID ('normal', 'surprised', etc.)
  prompt: string;          // その感情を表す追加プロンプト (例: "blushing, wide eyes")
  description: string;     // UIに表示する説明 (例: "驚き")
}

// 3. ルートオブジェクト (保存されるJSON全体)
export interface CharacterProfile {
  id: string;              // 一意のID
  design: CharacterDesign; // 見た目の設定
  emotion_prompts: EmotionPrompt[]; // 生成する表情のリスト
  images: Record<string, string>;   // 生成された画像データ (Key: 感情ID, Value: Base64文字列)
  dialogues?: Dialogue[];           // (オプション) このキャラ固有のセリフリスト
}
実際のJSONファイルの例
エクスポートされるJSONファイルは以下のようになります。images の中にBase64エンコードされた画像データが格納されるため、ファイルサイズは数MBになります。
code
JSON
{
  "id": "char_1708823456789",
  "design": {
    "name": "Asuka",
    "base_prompt": "Anime style, 1girl, red hair, twin tails, tsundere eyes, school uniform, green screen background",
    "negative_prompt": "realistic, 3d, low quality, bad anatomy, text, watermark"
  },
  "emotion_prompts": [
    {
      "emotion": "normal",
      "prompt": "arms crossed, smirk, looking at viewer",
      "description": "基本"
    },
    {
      "emotion": "surprised",
      "prompt": "surprised expression, wide eyes, blushing",
      "description": "驚き"
    }
    // ... 他の感情定義
  ],
  "images": {
    "normal": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAQA...", 
    "surprised": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAQA..."
  },
  "dialogues": [] 
}