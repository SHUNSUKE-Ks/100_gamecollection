# Skill / Agent / Hook 評価ログ

> 目的：使用頻度・効果・変更履歴を記録し、定期レビューの判断材料にする

---

## 📊 使用カウンター

### Skills

| Skill名 | 説明 | 使用回数 | 最終使用日 | 評価 |
|---|---|---|---|---|
| validate_scenario_json | シナリオJSONのスキーマ検証 | 0 | - | 未評価 |
| generate_delivery_list | アセット配信リスト自動生成 | 0 | - | 未評価 |
| test_api_battle | バトルAPIテスト自動実行 | 0 | - | 未評価 |
| run_type_check | TypeScript構文チェック | 0 | - | 未評価 |

### Agents

| Agent名 | 担当範囲 | 使用回数 | 最終使用日 | 評価 |
|---|---|---|---|---|
| ProgrammerAgent | src/ フロントエンド全般 | 0 | - | 未評価 |
| ScenarioWriterAgent | シナリオJSON管理 | 0 | - | 未評価 |
| AssetManagerAgent | 画像・音楽リソース管理 | 0 | - | 未評価 |
| PlannerAgent | 仕様・バランス調整 | 0 | - | 未評価 |

### Hooks

| Hook名 | タイミング | 発動回数 | 誤発動回数 | 評価 |
|---|---|---|---|---|
| JSON書き込みバリデーション | PreToolUse (write_to_file) | 0 | 0 | 未評価 |
| package-lock確認 | PostToolUse (run_command) | 0 | 0 | 未評価 |
| TestServerリスタート確認 | PostToolUse (write_to_file) | 0 | 0 | 未評価 |

---

## 📈 評価基準

| 評価 | 基準 |
|---|---|
| ✅ 継続 | 週1回以上使用 / 明確に作業を助けた |
| 🔧 改善 | 使っているが発動条件・内容を調整したい |
| ⏸ 保留 | 月1回未満だが削除はしない |
| ❌ 削除 | 2週間以上未使用 / 邪魔になっている |

---

## 🔄 変更ログ

### 2025-XX-XX（初期作成）
- 全Skill / Agent / Hook を初期登録

---
<!-- 以下にレビューのたびに追記していく -->

### テンプレート（コピーして使う）
```
### YYYY-MM-DD（レビュー）
**変更内容**
- [追加] Skill名: 理由
- [修正] Agent名: 変更内容
- [削除] Hook名: 理由

**所感**
（使ってみた感想・気づき）
```

---

## 📅 レビュースケジュール

- [ ] 2週間後：未使用Agentの削除判断
- [ ] 1ヶ月後：Hooksの誤発動チェック
- [ ] 3ヶ月後：全体見直し・新規追加の検討
