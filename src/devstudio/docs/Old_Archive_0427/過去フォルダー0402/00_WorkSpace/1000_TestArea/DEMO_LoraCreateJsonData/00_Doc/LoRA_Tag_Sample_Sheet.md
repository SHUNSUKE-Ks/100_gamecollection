# LoRA最高精度タグ・実戦サンプルシート

このシートは、`LoRA精度最大化タグ語彙セット`のルールに基づき、実際の学習用タグ（.txtファイル）の構成を1枚にまとめたものです。

---

## 🏆 黄金のタグ順（Golden Order）
学習効率を最大化するため、以下の順序を**すべての画像で固定**してください。

1. **キャラ名** (charA)
2. **感情** (happy, sad...)
3. **目** (sparkling_eyes...)
4. **口** (open_mouth...)
5. **眉** (raised_eyebrows...)
6. **角度** (front_view...)
7. **構図** (upper_body...)
8. **光** (soft_lighting...)
9. **品質** (masterpiece...)
10. **背景** (simple_background)

---

## 📋 実戦タグリスト（サンプル）
1人のキャラクターを学習させる際の、各表情バリエーションの記述例です。

| 画像タイプ | 生成されるタグ（.txtの中身） |
| :--- | :--- |
| **基本（通常）** | `char_hero, neutral, dull_eyes, closed_mouth, flat_eyebrows, front_view, upper_body, soft_lighting, masterpiece, simple_background` |
| **笑顔** | `char_hero, happy, sparkling_eyes, small_smile, soft_eyebrows, front_view, upper_body, soft_lighting, masterpiece, simple_background` |
| **怒り** | `char_hero, angry, sharp_eyes, closed_mouth, angled_eyebrows, front_view, upper_body, soft_lighting, masterpiece, simple_background` |
| **驚き** | `char_hero, surprise, wide_open_eyes, open_mouth, raised_eyebrows, front_view, upper_body, soft_lighting, masterpiece, simple_background` |
| **悲しみ** | `char_hero, sad, droopy_eyes, frown_mouth, furrowed_brows, front_view, upper_body, soft_lighting, masterpiece, simple_background` |

---

## 🛠 自動化用データ構造例 (assets/tags.json)
システムで管理する場合、以下のような構造にすると「黄金の順序」をプログラムで自動生成できます。

```json
{
  "character": "char_hero",
  "base_tags": {
    "angle": "front_view",
    "composition": "upper_body",
    "lighting": "soft_lighting",
    "quality": "masterpiece",
    "background": "simple_background"
  },
  "emotions": {
    "happy": {
      "emotion_tag": "happy",
      "eye": "sparkling_eyes",
      "mouth": "small_smile",
      "eyebrow": "soft_eyebrows"
    },
    "angry": {
      "emotion_tag": "angry",
      "eye": "sharp_eyes",
      "mouth": "closed_mouth",
      "eyebrow": "angled_eyebrows"
    }
  }
}
```

---

## 💡 運用のコツ
- **タグ数を揃える**: 表情差分でもタグの総数を極力揃えると学習が安定します。
- **背景の統一**: 背景が白一様ならば `white_background` を固定タグに入れてください。
- **固有名詞**: `char_hero` の部分は、他のモデルと絶対にかぶらないユニークな名前（例：`NanoHeroV1`）にすると精度が上がります。
