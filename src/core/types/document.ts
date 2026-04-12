// ============================================================
// document.ts — シナリオライター向け 発注書・納品スキーマ 型定義
// ============================================================

// ── ドキュメント種別 ──────────────────────────────────────
export type DocumentType =
  | 'order'       // 発注書
  | 'rule'        // ルール・規約
  | 'schema'      // 納品スキーマ定義
  | 'template'    // テンプレート
  | 'reference';  // 参考資料

// ── ドキュメントカテゴリ ──────────────────────────────────
export type DocumentCategory =
  | 'scenario'    // シナリオ本文
  | 'character'   // キャラクター設定
  | 'dialogue'    // セリフ・台詞
  | 'event'       // イベント・演出
  | 'world'       // 世界観・設定資料
  | 'battle'      // バトル演出シナリオ
  | 'general';    // 共通・汎用

// ── ロール（担当職種） ────────────────────────────────────
// 将来的にエージェントへのルーティングキーとして使用する
export type DocumentRole =
  // ── シナリオ系 ──
  | 'scenario'          // シナリオライター（汎用）
  | 'scenario_main'     // メインシナリオ担当
  | 'scenario_sub'      // サブ・クエストシナリオ担当
  | 'scenario_battle'   // バトル演出シナリオ担当
  // ── デザイナー系 ──
  | 'designer'          // デザイナー（汎用）
  | 'designer_char'     // キャラクターデザイン担当
  | 'designer_bg'       // 背景・ロケーションデザイン担当
  | 'designer_ui'       // UIデザイン担当
  // ── サウンド系 ──
  | 'sound'             // サウンド（汎用）
  | 'sound_bgm'         // BGM作曲担当
  | 'sound_se'          // SE・効果音担当
  | 'sound_voice'       // ボイス演出担当
  // ── その他 ──
  | 'general';          // 未割当・共通

// ── ステータス ────────────────────────────────────────────
export type DocumentStatus =
  | 'draft'             // 草稿中
  | 'issued'            // 発注済み（ライター作業待ち）
  | 'in_progress'       // 作業中
  | 'delivered'         // 納品済み（レビュー待ち）
  | 'approved'          // 承認済み
  | 'revision';         // 修正依頼中

export type DeliveryStatus =
  | 'pending_review'        // レビュー待ち
  | 'approved'              // 承認
  | 'revision_requested';   // 修正依頼

// ── 優先度 ────────────────────────────────────────────────
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// ── フォーマット ──────────────────────────────────────────
export type OutputFormat = 'json' | 'markdown' | 'csv';

// ── 納品データ出力種別 ────────────────────────────────────
export type OutputType =
  | 'story_lines'     // Story[] — NovelScreen で直接使用
  | 'event_node'      // ScenarioEvent 単体
  | 'character_data'  // キャラクター定義
  | 'enemy_data'      // エネミー定義
  | 'item_data'       // アイテム定義
  | 'world_lore'      // 世界観テキスト
  | 'dialogue_set'    // セリフセット
  | 'full_chapter';   // チャプター全体

// ─────────────────────────────────────────────────────────
// Schema Field — 納品フィールド仕様
// ─────────────────────────────────────────────────────────
export interface SchemaField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
  label: string;
  description: string;
  required: boolean;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    pattern?: string;          // 正規表現
    enum?: string[];           // 許可値リスト
    format?: string;           // 例: "YYYY-MM-DD"
  };
  example?: unknown;
}

// ─────────────────────────────────────────────────────────
// ValidationRule — バリデーションルール
// ─────────────────────────────────────────────────────────
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  errorMessage: string;
}

// ─────────────────────────────────────────────────────────
// WritingRule — 執筆ルール（全発注共通）
// ─────────────────────────────────────────────────────────
export interface WritingRule {
  id: string;
  category: 'tone' | 'format' | 'content' | 'technical';
  title: string;
  body: string;
  isRequired: boolean;   // true = 必須, false = 推奨
}

// ─────────────────────────────────────────────────────────
// DeliverySchema — 納品スキーマ定義
// ─────────────────────────────────────────────────────────
export interface DeliverySchema {
  format: OutputFormat;
  outputType: OutputType;
  description: string;
  requiredFields: SchemaField[];
  optionalFields: SchemaField[];
  validationRules: ValidationRule[];
  /** 納品物の具体例（JSON文字列 or Markdown文字列） */
  exampleOutput: string;
}

// ─────────────────────────────────────────────────────────
// OrderBrief — 発注内容
// ─────────────────────────────────────────────────────────
export interface OrderBrief {
  overview: string;         // 概要（1〜3文）
  background: string;       // 背景・文脈（なぜこのシナリオが必要か）
  requirements: string[];   // 要件リスト
  constraints: string[];    // 制約条件（やってはいけないこと）
  references: string[];     // 参照ファイル・リソース
  toneKeywords: string[];   // トーン・雰囲気キーワード
  notes: string;            // 補足・自由記述
}

// ─────────────────────────────────────────────────────────
// ScenarioDeliverable — 納品物（ライターが提出したデータ）
// ─────────────────────────────────────────────────────────
export interface ScenarioDeliverable {
  documentId: string;
  submittedAt: string;      // ISO8601
  submittedBy: string;
  version: number;
  status: DeliveryStatus;
  /** スキーマに従ったJSONデータ（文字列化） */
  payload: string;
  reviewNotes?: string;
  approvedAt?: string;
}

// ─────────────────────────────────────────────────────────
// OrderDocument — 発注書（メインエンティティ）
// ─────────────────────────────────────────────────────────
export interface OrderDocument {
  id: string;                    // 例: "DOC_001"
  type: DocumentType;
  category: DocumentCategory;
  role: DocumentRole;            // 担当職種（agentルーティングキー）
  title: string;
  status: DocumentStatus;
  priority: Priority;
  assignedTo?: string;           // ライター名 or ID
  createdAt: string;             // ISO8601
  dueDate?: string;              // ISO8601
  updatedAt: string;             // ISO8601
  tags: string[];

  brief: OrderBrief;
  deliverySchema: DeliverySchema;
  deliverable?: ScenarioDeliverable;

  /** 関連するゲーム内IDへの参照 */
  linkedIds?: {
    episodeId?: string;
    chapterId?: string;
    sceneId?: string;
    characterIds?: string[];
    eventIds?: string[];
  };
}

// ─────────────────────────────────────────────────────────
// Document Inbox — インボックス集合
// ─────────────────────────────────────────────────────────
export interface DocumentInbox {
  version: string;
  writingRules: WritingRule[];
  documents: OrderDocument[];
}

// ─────────────────────────────────────────────────────────
// UI Helper Types
// ─────────────────────────────────────────────────────────
export type DocumentFilterStatus = DocumentStatus | 'all';
export type DocumentFilterCategory = DocumentCategory | 'all';
export type DocumentFilterRole = DocumentRole | 'all';
export type DocumentSortKey = 'createdAt' | 'dueDate' | 'priority' | 'status' | 'role';

export interface DocumentFilter {
  status: DocumentFilterStatus;
  category: DocumentFilterCategory;
  role: DocumentFilterRole;
  sortKey: DocumentSortKey;
  searchQuery: string;
}
