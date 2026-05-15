# Google AI Studio コード統合ガイド

このプロジェクトにAI Studioで生成したコードを統合する際の設定です。

## 重要な設定ファイル

### 1. package.json の依存関係

AI Studioのコードを動かすために必要な依存関係：

```json
{
  "dependencies": {
    "@google/genai": "^1.37.0",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.x",
    "tailwindcss": "^4.x",
    "autoprefixer": "^10.x"
  }
}
```

### 2. postcss.config.js（Tailwind v4用）

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### 3. src/index.css（エントリーポイント）

```css
@import "tailwindcss";

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}
```

### 4. main.tsx で index.css をインポート

```tsx
import './index.css'
```

## AI Studio コード移行時の注意点

| 項目 | AI Studio | このプロジェクト |
|------|-----------|------------------|
| APIキー | `process.env.API_KEY` | `import.meta.env.VITE_GOOGLE_GENAI_KEY` |
| 型インポート | `import { Type }` | `import type { Type }` |
| エクスポート | `export default App` | `export function ComponentName()` |

## 環境変数 (.env)

```
VITE_GOOGLE_GENAI_KEY=your_api_key_here
```

## トラブルシューティング

- **スタイルが適用されない**: `@import "tailwindcss"` を確認
- **404エラー**: 削除したコンポーネントのimportが残っていないか確認
- **型エラー**: `import type` を使用しているか確認
