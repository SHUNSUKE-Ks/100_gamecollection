# Collection レイアウト & タグ一覧
## 新PJ移植用リファレンス

---

## 1. ライブラリ別レイアウト定義

各サブカテゴリの推奨レイアウト構成です。

### 1.1 Character & NPC (List + Detail)
**構成**: 左右分割（2ペイン）
- **左パネル（30%）**: リスト表示
  - 検索ボックス
  - 縦スクロールリスト（名前を表示）
  - 選択状態でハイライト
- **右パネル（70%）**: 詳細表示
  - キャラクター立ち絵（中央配置）
  - 名前・肩書き（上部）
  - プロフィールテキスト（下部・透過背景）
  - バリエーション切替ボタン（表情差分等）

### 1.2 Enemy & Background & Gallery (Grid / Gallery)
**構成**: グリッド表示
- **アイテム**: カード型コンポーネントをタイル状に配置
- **レスポンシブ**: 画面幅に応じて列数を自動調整（min-width: 250px程度）
- **カード要素**:
  - **Enemy**: 画像、名前、種族ラベル、レアリティ枠色
  - **Background**: サムネイル画像（16:9）、地名、カテゴリバッジ
  - **Gallery**: サムネイル画像、タイトル、種別バッジ

### 1.3 Item & Tips (Table)
**構成**: テーブル表示
- **ヘッダー**: ソート機能付き
- **行**: ホバーでハイライト
- **カラム構成**:
  - **Item**: アイコン, 名前, カテゴリ, レアリティ(★), 価格, 効果, 説明
  - **Tips(Tags)**: ID, 名前, カテゴリ, 説明

---

## 2. タグ・カテゴリ一覧 (tags.json)

全タグ定義のポートフォリオです。移植時のマスタデータとして利用してください。

### 2.1 Affiliation (所属)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `ALLY` | 味方 | <span style="color:#22c55e">■</span> #22c55e | 主人公と共に戦う仲間。 |
| `ENEMY` | 敵 | <span style="color:#ef4444">■</span> #ef4444 | 敵対する存在。 |

### 2.2 Class (クラス)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `ADVENTURER` | 冒険者 | <span style="color:#3b82f6">■</span> #3b82f6 | 未知を求めて旅する者。 |
| `WARRIOR` | 戦士 | <span style="color:#f59e0b">■</span> #f59e0b | 前線で戦う戦士。 |
| `KNIGHT` | 騎士 | <span style="color:#8b5cf6">■</span> #8b5cf6 | タフで守りに優れた騎士。 |

### 2.3 Role (役割)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `TACTICIAN` | 軍師 | <span style="color:#06b6d4">■</span> #06b6d4 | パーティーを導く軍師。 |

### 2.4 Type (タイプ - 敵)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `MONSTER` | 魔物 | <span style="color:#dc2626">■</span> #dc2626 | ダンジョンや野外に生息する魔物。 |

### 2.5 Species (種族 - 敵)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `SLIME` | スライム | <span style="color:#10b981">■</span> #10b981 | 粘液状の体を持つ魔物。 |

### 2.6 Appearance (外見)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `GOTHIC_LOLI` | ゴスロリ | <span style="color:#ec4899">■</span> #ec4899 | ゴシック＆ロリータ様式の服装。 |
| `WHITE_HAIR` | 白髪 | <span style="color:#e5e7eb">■</span> #e5e7eb | 白銀の髪を持つキャラクター。 |

### 2.7 Trait (特性)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `MYSTERIOUS` | 謎 | <span style="color:#7c3aed">■</span> #7c3aed | 出身や目的が謎に包まれている。 |

### 2.8 Location (場所)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `STARTING_VILLAGE` | 始まりの村 | <span style="color:#22c55e">■</span> #22c55e | 主人公の冒険が始まる小さな村。 |
| `CAPITAL_CITY` | 王都 | <span style="color:#f59e0b">■</span> #f59e0b | 王国の中心地。 |
| `FOREST_ENTRANCE` | 森の入り口 | <span style="color:#10b981">■</span> #10b981 | 深い森への入り口。 |
| `MINING_TOWN` | 鉱山街 | <span style="color:#6b7280">■</span> #6b7280 | 鉱石の採掘で栄える街。 |
| `MAGIC_TOWER` | 魔法塔 | <span style="color:#8b5cf6">■</span> #8b5cf6 | 古代より存在する魔法研究の塔。 |

### 2.9 NPCRole (NPC役割)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `MERCHANT` | 商人 | <span style="color:#eab308">■</span> #eab308 | 物品の売買を行うNPC。 |
| `BLACKSMITH` | 鍛冶屋 | <span style="color:#78716c">■</span> #78716c | 武器・防具の製造・修理を行うNPC。 |
| `INNKEEPER` | 宿屋 | <span style="color:#f97316">■</span> #f97316 | 宿泊施設を運営するNPC。 |
| `MAGE` | 魔法使い | <span style="color:#a855f7">■</span> #a855f7 | 魔法を研究・使用するNPC。 |
| `GUARD` | 衛兵 | <span style="color:#64748b">■</span> #64748b | 治安維持を担当するNPC。 |

### 2.10 Tag Categories (System)
| ID | Name | Color | Description |
|----|------|-------|-------------|
| `PROTAGONIST` | 主人公 | <span style="color:#eab308">■</span> #eab308 | 物語の中心となるキャラクター。 |
| `MAIN_CAST` | 主要人物 | <span style="color:#f97316">■</span> #f97316 | ストーリーに深く関わるキャラクター。 |
| `NATURE` | 自然 | <span style="color:#22c55e">■</span> #22c55e | 森や草原などの自然の風景。 |
| `INDOOR` | 屋内 | <span style="color:#a855f7">■</span> #a855f7 | 建物の中の風景。 |
| `BATTLE_BGM` | 戦闘曲 | <span style="color:#dc2626">■</span> #dc2626 | 戦闘シーンで使用される音楽。 |
| `SAD_BGM` | 悲しい曲 | <span style="color:#3b82f6">■</span> #3b82f6 | 悲しいシーンで使用される音楽。 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16
