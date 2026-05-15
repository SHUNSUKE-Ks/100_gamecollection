# LoRA精度最大化タグ語彙セット（完全版）

---

## ■ ① キャラ識別タグ（必須）

最重要タグ。必ず先頭。

```
charA
charB
hero_girl
villain_boy
npc_mage
```

**ルール**

- 固有名詞化する
- 他モデルと被らない名前

---

## ■ ② 基本状態タグ（ベース固定）

キャラの基準状態を定義

```
base
default_face
standard_pose
front_view
neutral_expression
```

---

## ■ ③ 顔構造タグ（精度激変）

ここを入れると再現性が跳ね上がる

```
small_face
round_face
sharp_jaw
thin_face
wide_forehead
high_cheekbones
```

---

## ■ ④ 目タグ（最重要パーツ）

表情LoRAの核心

```
big_eyes
narrow_eyes
droopy_eyes
sharp_eyes
half_closed_eyes
wide_open_eyes
sparkling_eyes
dull_eyes
```

---

## ■ ⑤ 眉タグ（感情制御）

感情差分を安定させる

```
raised_eyebrows
angled_eyebrows
flat_eyebrows
furrowed_brows
soft_eyebrows
```

---

## ■ ⑥ 口タグ（感情決定要素）

```
closed_mouth
open_mouth
smile_mouth
frown_mouth
grin
clenched_teeth
open_smile
small_smile
```

---

## ■ ⑦ 感情タグ（表情切替用）

シナリオ連動用の中核タグ

```
neutral
happy
smile
joy
sad
cry
angry
rage
surprise
fearpanic
confused
serious
determined
calm
tired
sleepy
bored
disgust
smug
confident
shy
blush
cold
gentle
insane
sinister
```

---

## ■ ⑧ 頭部角度タグ（崩壊防止）

```
front_view
side_view
three_quarter_view
looking_up
looking_down
head_tilt
```

---

## ■ ⑨ カメラ距離タグ（構図安定）

```
close_up
portraitbust_shot
upper_body
full_body
```

---

## ■ ⑩ ポーズタグ（姿勢学習）

```
standing
sitting
leaning
hand_on_face
hand_on_chin
arms_crossed
hands_up
```

---

## ■ ⑪ 光源タグ（画風固定）

```
soft_lighting
hard_light
top_light
side_light
rim_light
studio_light
```

---

## ■ ⑫ 描画スタイル固定タグ（崩壊防止）

絵柄固定したい場合のみ

```
anime_style
semi_realistic
flat_color
soft_shading
cell_shading
lineart_clean
thick_lineart
```

---

## ■ ⑬ 品質タグ（学習安定剤）

学習画像すべてに付与推奨

```
high_quality
best_quality
masterpiece
clean_lines
sharp_focus
```

---

## ■ ⑭ ノイズ防止タグ（超重要）

LoRA暴走防止

```
simple_background
white_background
plain_background
centered
symmetrical_face
```

---

## ■ ⑮ パーツ単体タグ（精度ブースト）

```
eye_focus
mouth_focus
eyebrow_focus
nose_focus
```

---

## ■ ⑯ 禁止要素タグ（除外制御）

誤学習を防ぐ

```
no_glasses
no_hat
no_shadow
no_teeth
no_tongue
```

---

# ■ 最強タグ構成テンプレ（完成形）

txt例

```
charA, smile, open_mouth, raised_eyebrows, sparkling_eyes, front_view, portrait, soft_lighting, clean_lines, simple_background
```

この形式が

**最も学習効率が高い黄金構成**

---

# ■ 最重要ルール（プロ基準）

守らないと精度落ちます

```
① タグ順番固定
② タグ表記統一
③ 同義語禁止
④ 毎画像タグ数を揃える
```

---

# ■ 理想タグ順（推奨規格）

順番固定してください

```
キャラ名
↓
感情
↓
目
↓
口
↓
眉
↓
角度
↓
構図
↓
光
↓
品質
↓
背景
```

---

# ■ 完全自動化するなら辞書はこう作る

```
tag_dictionary.json
emotion_dictionary.json
pose_dictionary.json
```

役割分離すると

後から仕様変更しても学習済LoRAが壊れません。

---

# ■ 最重要結論（核心）

LoRA精度は

> 画像枚数ではなくタグ設計で決まる
> 

ここを極めると

少量画像でも高精度になります。

---

---

次に進むなら最適なのはどちらかです

- 「最強タグ自動生成アルゴリズム設計書」
- 「失敗LoRAを100％修正する診断フロー」

必要な方を選んでください。