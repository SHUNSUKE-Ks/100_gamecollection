// ============================================================
// RecordCardModal — 全DB共通 新規レコード追加カード
// ・DB種別ごとに専用フォームフィールドを持つ
// ・Firestore に addDoc 保存（CollectionService 経由）
// ・1ファイル完結 / 子Component新規作成なし
// ============================================================

import { useState, useEffect } from 'react';
import { X, Plus, Check, AlertCircle, Loader } from 'lucide-react';
import { addRecord, fetchCollection } from '@/core/services/CollectionService';

// ─── Field 定義 ───────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'tags' | 'title-select';

interface FieldDef {
  key:          string;
  label:        string;
  type:         FieldType;
  required?:    boolean;
  placeholder?: string;
  options?:     string[];     // select 用
  tagOptions?:  string[];     // tags 用候補
}

// ─── DB ごとの Record Card 設定 ──────────────────────────

export type DbKey =
  | 'titles' | 'characters' | 'npcs' | 'enemies'
  | 'locations' | 'items' | 'events' | 'sounds' | 'tags';

interface RecordConfig {
  label:          string;   // 「キャラクター追加」
  collectionName: string;   // Firestore コレクション名
  fields:         FieldDef[];
}

const TITLE_OPTIONS   = ['ファンタジー','SF','現代','ホラー','ミステリー','ロマンス','アクション','その他'];
const STATUS_OPTIONS  = ['dev','release','archived'];
const CAT_LOC_OPTIONS = ['village','dungeon','room','field','city','other'];
const CAT_ITEM_OPTIONS= ['consumable','equipment','key','material','other'];
const CAT_EVT_OPTIONS = ['STORY','BATTLE','CHOICE','SCENE','SHOP','OTHER'];
const CAT_TAG_OPTIONS = ['theme','beat','trope','emotion','relation','other'];

export const RECORD_CONFIGS: Record<DbKey, RecordConfig> = {

  titles: {
    label: 'タイトル追加',
    collectionName: 'titles',
    fields: [
      { key: 'name',            label: 'タイトル名 *',   type: 'text',    required: true,  placeholder: 'NanoNovel Demo' },
      { key: 'subtitle',        label: 'サブタイトル',    type: 'text',    placeholder: '運命の羅針盤' },
      { key: 'description',     label: 'あらすじ',        type: 'textarea' },
      { key: 'genre',           label: 'ジャンル',        type: 'tags',    tagOptions: TITLE_OPTIONS },
      { key: 'status',          label: 'ステータス',      type: 'select',  options: STATUS_OPTIONS },
      { key: 'hasPlayableNovel',label: 'TestPlay 可能',   type: 'boolean' },
    ],
  },

  characters: {
    label: 'キャラクター追加',
    collectionName: 'characters',
    fields: [
      { key: 'name',        label: '名前 *',      type: 'text',     required: true,  placeholder: 'レミ・ウナント' },
      { key: 'description', label: '説明',         type: 'textarea', placeholder: 'キャラクターの説明' },
      { key: 'titleId',     label: 'タイトル',     type: 'title-select' },
      { key: 'tags',        label: 'タグ',          type: 'tags',     tagOptions: ['MAIN','SUB','HEROINE','RIVAL','VILLAIN','NPC','UNKNOWN'] },
    ],
  },

  npcs: {
    label: 'NPC追加',
    collectionName: 'npcs',
    fields: [
      { key: 'name',     label: '名前 *',   type: 'text',     required: true,  placeholder: '行商人' },
      { key: 'role',     label: '役割',      type: 'text',     placeholder: 'MERCHANT / GUARD など' },
      { key: 'dict',     label: '説明',      type: 'textarea' },
      { key: 'location', label: '場所ID',    type: 'text',     placeholder: 'loc_starting_village' },
      { key: 'titleId',  label: 'タイトル',   type: 'title-select' },
      { key: 'tags',     label: 'タグ',       type: 'tags',    tagOptions: ['HUMAN','MONSTER','FRIENDLY','NEUTRAL','HOSTILE'] },
    ],
  },

  enemies: {
    label: 'エネミー追加',
    collectionName: 'enemies',
    fields: [
      { key: 'name',        label: '名前 *',  type: 'text',     required: true,  placeholder: 'スライム' },
      { key: 'description', label: '説明',     type: 'textarea' },
      { key: 'titleId',     label: 'タイトル',   type: 'title-select' },
      { key: 'stats.hp',    label: 'HP',       type: 'number',  placeholder: '100' },
      { key: 'stats.mp',    label: 'MP',       type: 'number',  placeholder: '0' },
      { key: 'stats.atk',   label: 'ATK',      type: 'number',  placeholder: '10' },
      { key: 'stats.def',   label: 'DEF',      type: 'number',  placeholder: '5' },
      { key: 'tags',        label: 'タグ',      type: 'tags',    tagOptions: ['SLIME','BEAST','UNDEAD','DRAGON','BOSS','HUMANOID'] },
    ],
  },

  locations: {
    label: '地名追加',
    collectionName: 'locations',
    fields: [
      { key: 'name',        label: '地名 *',   type: 'text',    required: true,  placeholder: '始まりの村' },
      { key: 'region',      label: '地域',      type: 'text',    placeholder: '東部平野' },
      { key: 'description', label: '説明',      type: 'textarea' },
      { key: 'category',    label: 'カテゴリ',  type: 'select',  options: CAT_LOC_OPTIONS },
      { key: 'titleId',     label: 'タイトル',   type: 'title-select' },
    ],
  },

  items: {
    label: 'アイテム追加',
    collectionName: 'items',
    fields: [
      { key: 'name',        label: 'アイテム名 *', type: 'text',   required: true,  placeholder: 'ポーション' },
      { key: 'category',    label: 'カテゴリ',      type: 'select', options: CAT_ITEM_OPTIONS },
      { key: 'price',       label: '価格 (G)',      type: 'number', placeholder: '100' },
      { key: 'description', label: '説明',           type: 'textarea' },
      { key: 'titleId',     label: 'タイトル',      type: 'title-select' },
    ],
  },

  events: {
    label: 'イベント追加',
    collectionName: 'events',
    fields: [
      { key: 'title',       label: 'イベント名 *', type: 'text',    required: true,  placeholder: '村の入口で謎の少女と出会う' },
      { key: 'description', label: '説明',          type: 'textarea' },
      { key: 'type',        label: '種別',          type: 'select',  options: CAT_EVT_OPTIONS },
      { key: 'location',    label: '場所ID',        type: 'text',    placeholder: 'loc_starting_village' },
      { key: 'titleId',     label: 'タイトル',      type: 'title-select' },
    ],
  },

  sounds: {
    label: 'サウンド追加',
    collectionName: 'sounds',
    fields: [
      { key: 'title',       label: 'タイトル *', type: 'text',    required: true,  placeholder: 'Battle Theme' },
      { key: 'type',        label: '種別',        type: 'select',  options: ['BGM', 'SE'] },
      { key: 'filename',    label: 'ファイル名',  type: 'text',    placeholder: 'battle_01.mp3' },
      { key: 'artist',      label: 'アーティスト', type: 'text',   placeholder: 'Unknown' },
      { key: 'description', label: '説明',        type: 'textarea' },
      { key: 'titleId',     label: 'タイトル',    type: 'title-select' },
    ],
  },

  tags: {
    label: 'タグ追加',
    collectionName: 'tags',
    fields: [
      { key: 'tag_key',     label: 'タグキー *',  type: 'text',    required: true,  placeholder: 'theme_fate (snake_case)' },
      { key: 'description', label: '説明',         type: 'text',    placeholder: '運命という避けられない流れ' },
      { key: 'category',    label: 'カテゴリ',     type: 'select',  options: CAT_TAG_OPTIONS },
    ],
  },
};

// ─── Props ────────────────────────────────────────────────

interface Props {
  dbKey:   DbKey;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export function RecordCardModal({ dbKey, onClose, onSaved }: Props) {
  const config = RECORD_CONFIGS[dbKey];

  // TitleDB から取得したタイトル一覧
  const [titleOptions, setTitleOptions] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const needsTitleSelect = config.fields.some(f => f.type === 'title-select');
    if (!needsTitleSelect) return;
    fetchCollection<{ id: string; name?: string }>('titles').then(result => {
      if (result) {
        setTitleOptions(result.map(t => ({ id: t.id, name: t.name ?? t.id })));
      }
    }).catch(() => {});
  }, [dbKey]);

  // フォーム値（key → value）
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    config.fields.forEach(f => {
      if (f.type === 'boolean') init[f.key] = false;
      else if (f.type === 'number')  init[f.key] = '';
      else if (f.type === 'tags')    init[f.key] = [] as string[];
      else if (f.type === 'select')  init[f.key] = f.options?.[0] ?? '';
      else                           init[f.key] = '';
    });
    return init;
  });

  type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg,   setErrorMsg]   = useState('');

  const set = (key: string, val: unknown) =>
    setValues(prev => ({ ...prev, [key]: val }));

  const toggleTag = (key: string, tag: string) =>
    setValues(prev => {
      const arr = (prev[key] as string[]) ?? [];
      return {
        ...prev,
        [key]: arr.includes(tag) ? arr.filter(t => t !== tag) : [...arr, tag],
      };
    });

  // バリデーション
  const isValid = config.fields
    .filter(f => f.required)
    .every(f => {
      const v = values[f.key];
      return typeof v === 'string' && v.trim().length > 0;
    });

  // 保存
  const handleSave = async () => {
    if (!isValid) return;
    setSaveStatus('saving');
    try {
      // ネストされたキー (stats.hp) を展開する
      const data = buildData(values, config.fields);
      const id   = await addRecord(config.collectionName, data);
      setSaveStatus('success');
      onSaved?.(id);
      setTimeout(onClose, 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '保存エラー';
      setErrorMsg(msg);
      setSaveStatus('error');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '5vh 1rem 1rem', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-medium)',
          border: '1px solid var(--color-border)',
          borderRadius: 14, padding: '1.25rem',
          width: '100%', maxWidth: 420,
          display: 'flex', flexDirection: 'column', gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.95rem',
          }}>
            <Plus size={17} />
            {config.label}
          </div>
          <button onClick={onClose} style={btnReset}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        {saveStatus === 'success' ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.5rem', padding: '1.5rem 0', color: '#34d399',
          }}>
            <Check size={36} />
            <span style={{ fontWeight: 600 }}>Firestore に保存しました</span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>閉じます…</span>
          </div>
        ) : (
          <>
            {/* フォームフィールド */}
            {config.fields.map(field => (
              <FieldRow
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(v) => set(field.key, v)}
                onToggleTag={(tag) => toggleTag(field.key, tag)}
                titleOptions={titleOptions}
              />
            ))}

            {/* エラー */}
            {saveStatus === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: '#f87171', fontSize: '0.78rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6,
              }}>
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={!isValid || saveStatus === 'saving'}
              style={{
                padding: '0.7rem',
                background: isValid ? 'var(--color-primary)' : '#374151',
                border: 'none',
                color: isValid ? '#0d0d12' : '#6b7280',
                borderRadius: 8,
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
            >
              {saveStatus === 'saving'
                ? <><Loader size={16} /> 保存中…</>
                : <><Check size={16} /> Firestore に保存</>
              }
            </button>

            <p style={{ fontSize: '0.68rem', color: '#4b5563', margin: 0, textAlign: 'center' }}>
              ※ 保存後、画面表示の反映にはリロードが必要です
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── FieldRow ─────────────────────────────────────────────

interface FieldRowProps {
  field:         FieldDef;
  value:         unknown;
  onChange:      (v: unknown) => void;
  onToggleTag:   (tag: string) => void;
  titleOptions:  { id: string; name: string }[];
}

function FieldRow({ field, value, onChange, onToggleTag, titleOptions }: FieldRowProps) {
  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--color-bg-dark)',
    border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '0.55rem 0.75rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.72rem', color: '#9ca3af', letterSpacing: '0.03em' }}>
        {field.label}
      </label>

      {field.type === 'text' && (
        <input
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={inputBase}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          style={{ ...inputBase, resize: 'vertical', fontFamily: 'sans-serif', lineHeight: 1.5 }}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={value as string}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.placeholder}
          style={inputBase}
        />
      )}

      {field.type === 'select' && (
        <select
          value={value as string}
          onChange={e => onChange(e.target.value)}
          style={{
            ...inputBase,
            appearance: 'none', WebkitAppearance: 'none',
            cursor: 'pointer',
          }}
        >
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'title-select' && (
        <select
          value={value as string}
          onChange={e => onChange(e.target.value)}
          style={{
            ...inputBase,
            appearance: 'none', WebkitAppearance: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">-- タイトルを選択 --</option>
          {titleOptions.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}

      {field.type === 'boolean' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={e => onChange(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
            {field.label.replace(' *', '')}
          </span>
        </label>
      )}

      {field.type === 'tags' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {field.tagOptions?.map(tag => {
            const selected = (value as string[]).includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                style={{
                  padding: '0.25rem 0.6rem', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selected ? 'rgba(201,162,39,0.18)' : 'none',
                  color: selected ? 'var(--color-primary)' : '#9ca3af',
                  fontSize: '0.72rem',
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── データ変換（ネストキー展開）─────────────────────────

function buildData(
  values: Record<string, unknown>,
  fields: FieldDef[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    const v = values[field.key];
    if (field.key.includes('.')) {
      // "stats.hp" → { stats: { hp: ... } }
      const [parent, child] = field.key.split('.');
      if (!result[parent]) result[parent] = {};
      (result[parent] as Record<string, unknown>)[child] = v === '' ? null : v;
    } else {
      if (v !== '' && v !== null && !(Array.isArray(v) && v.length === 0)) {
        result[field.key] = v;
      }
    }
  }

  return result;
}

// ─── Style ────────────────────────────────────────────────

const btnReset: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 6, borderRadius: 6, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
