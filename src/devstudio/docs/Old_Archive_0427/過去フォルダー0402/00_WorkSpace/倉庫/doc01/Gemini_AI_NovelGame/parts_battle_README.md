# Battle Part

## 概要
戦闘ロジック・敵AI・スキル処理を担当。

---

## 責務

- バトル進行制御
- enemy / skill の解釈
- ダメージ計算
- 勝敗判定
- 報酬反映

---

## 禁止事項

- ❌ UI状態とロジックの混在禁止
- ❌ JSON直接参照禁止（Manager経由）
- ❌ グローバル状態直接操作禁止

---

## 構成

```
battle/
├── screens/
│   ├── BattleScreen.tsx
│   └── ResultScreen.tsx
├── components/
│   ├── EnemyDisplay.tsx
│   ├── SkillMenu.tsx
│   └── DamageEffect.tsx
├── hooks/
│   ├── useBattleState.ts
│   └── useTurnSystem.ts
├── BattleManager.ts
├── README.md
└── index.ts
```

---

## External Dependencies Checklist

### Managers (core/managers)
- [ ] BattleManager
- [ ] AssetManager
- [ ] SoundManager
- [ ] SaveManager

### Hooks (core/hooks)
- [ ] useBattleState
- [ ] useSound
- [ ] useAsset

### Data (data/)
- [ ] enemy.json
- [ ] skill.json
- [ ] sound.json

### Utilities
- [ ] damage calculator
- [ ] turn scheduler

---

## BattleManager API

```typescript
class BattleManager {
  // バトル初期化
  init(enemyIDs: string[]): void
  
  // スキル使用
  useSkill(skillID: string, targetID: string): BattleResult
  
  // ターン進行
  advanceTurn(): void
  
  // 勝敗判定
  checkBattleEnd(): 'win' | 'lose' | 'ongoing'
  
  // 報酬計算
  calculateReward(): Reward
}
```

---

## 戦闘フロー

```
1. init() - 敵とプレイヤー初期化
2. ターンループ:
   a. プレイヤーアクション選択
   b. useSkill() - ダメージ計算・適用
   c. 敵AIアクション
   d. advanceTurn()
   e. checkBattleEnd()
3. 結果表示 + calculateReward()
```

---

## ダメージ計算式

```typescript
// 基本ダメージ = スキル威力 + (ステータス × スケール)
damage = skill.power.base + (character.status[skill.power.scale] * 1.5)

// ランダム補正 (90% ~ 110%)
damage = damage * (0.9 + Math.random() * 0.2)
```

---

## 使用例

```typescript
import { BattleManager } from './BattleManager';
import { useBattleState, useSound } from '@/core/hooks';

function BattleScreen() {
  const { player, enemies } = useBattleState();
  const { playSE } = useSound();
  const manager = new BattleManager();
  
  const handleAttack = (skillID: string, targetID: string) => {
    const result = manager.useSkill(skillID, targetID);
    playSE('hit');
    
    if (manager.checkBattleEnd() === 'win') {
      const reward = manager.calculateReward();
      showReward(reward);
    }
  };
  
  return (
    <div>
      <EnemyDisplay enemies={enemies} />
      <SkillMenu onSelect={handleAttack} />
    </div>
  );
}
```

---

## 備考

バトルは将来別プロジェクトに切り出し可能。
ターン制・リアルタイム制の切り替えも考慮した設計。
