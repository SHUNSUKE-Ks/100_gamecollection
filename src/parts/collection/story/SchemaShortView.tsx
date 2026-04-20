// ============================================================
// SchemaShortView — スキーマーショート
// Ver1.1 / Ver1.2 / Ver2.1 / Ver3.1
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Copy, Check, Upload, Download, X, ChevronRight, ChevronDown,
  FileJson, BookOpen, Image, User, Info, Flag, Sliders
} from 'lucide-react';
import characterData from '@/data/collection/characters.json';

// ─────────────────────────────────────────────────────────
// Schema Data
// ─────────────────────────────────────────────────────────

const SCHEMA_V11 = {
  version: "1.1",
  gameTitle: "ゲームタイトル",
  episodes: [
    {
      id: "ep_01",
      title: "第1章　始まりの塔",
      scenes: [
        {
          id: "scene_01",
          lines: [
            { speaker: "", text: "古びた塔の扉が、重い音を立てて開いた。" },
            { speaker: "レミ", text: "ここが…始まりの塔。" },
            { speaker: "", text: "彼女はその光景に、しばし言葉を失った。" },
            { speaker: "長老", text: "よく来た。待っておったぞ。" }
          ]
        }
      ]
    }
  ]
};

const SCHEMA_V12 = {
  version: "1.2",
  gameTitle: "ゲームタイトル",
  episodes: [
    {
      id: "ep_01",
      title: "第1章　始まりの塔",
      scenes: [
        {
          id: "scene_01",
          lines: [
            { id: "line_001", speaker: "", text: "古びた塔の扉が、重い音を立てて開いた。" },
            { id: "line_002", speaker: "レミ", text: "ここが…始まりの塔。どうする？" },
            {
              id: "line_003",
              speaker: "レミ",
              text: "奥に進む？",
              choice: {
                options: [
                  {
                    text: "奥へ進む",
                    nextSceneId: "scene_02",
                    result: "レミは意を決して足を踏み出した。"
                  },
                  {
                    text: "様子をうかがう",
                    nextSceneId: "scene_03",
                    result: "レミは慎重に周囲を観察した。"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "scene_02",
          returnTo: "scene_04",
          lines: [
            { id: "line_010", speaker: "", text: "薄暗い回廊が続いていた。" },
            { id: "line_011", speaker: "レミ", text: "…なんかある。" }
          ]
        },
        {
          id: "scene_03",
          returnTo: "scene_04",
          lines: [
            { id: "line_020", speaker: "", text: "レミはしばし入口で観察を続けた。" },
            { id: "line_021", speaker: "レミ", text: "大丈夫そうかな。行こう。" }
          ]
        },
        {
          id: "scene_04",
          lines: [
            { id: "line_030", speaker: "長老", text: "よく来た。待っておったぞ。" }
          ]
        }
      ]
    }
  ]
};

const SCHEMA_V21 = {
  version: "2.1",
  gameTitle: "ゲームタイトル",
  episodes: [
    {
      id: "ep_01",
      title: "第1章　始まりの塔",
      scenes: [
        {
          id: "scene_01",
          background: "BG_MAGIC_TOWER",
          lines: [
            {
              id: "line_001",
              speaker: "",
              text: "古びた塔の扉が、重い音を立てて開いた。",
              character: null,
              characterEmotion: null,
              changeBackground: null
            },
            {
              id: "line_002",
              speaker: "レミ",
              text: "ここが…始まりの塔。どうする？",
              character: "remi_unant",
              characterEmotion: "normal",
              changeBackground: null,
              choice: {
                options: [
                  { text: "奥へ進む", nextSceneId: "scene_02", result: "意を決して進む" },
                  { text: "様子をうかがう", nextSceneId: "scene_03", result: "慎重に観察する" }
                ]
              }
            }
          ]
        },
        {
          id: "scene_02",
          background: "BG_MAGIC_TOWER",
          returnTo: "scene_04",
          lines: [
            {
              id: "line_010",
              speaker: "レミ",
              text: "薄暗い…でも行く！",
              character: "remi_unant",
              characterEmotion: "smile",
              changeBackground: null
            }
          ]
        },
        {
          id: "scene_03",
          background: "BG_MAGIC_TOWER",
          returnTo: "scene_04",
          lines: [
            {
              id: "line_020",
              speaker: "レミ",
              text: "もう少し様子を見よう。",
              character: "remi_unant",
              characterEmotion: "normal",
              changeBackground: null
            }
          ]
        },
        {
          id: "scene_04",
          background: "BG_MAGIC_TOWER",
          lines: [
            {
              id: "line_030",
              speaker: "長老",
              text: "よく来た。待っておったぞ。",
              character: null,
              characterEmotion: null,
              changeBackground: null
            }
          ]
        }
      ]
    }
  ]
};

const SCHEMA_V31 = {
  version: "3.1",
  gameTitle: "ゲームタイトル",
  parameters: {
    flags: {
      "visited_tower": false,
      "got_sword": false
    },
    axes: {
      "courage": { initial: 0, min: 0, max: 100, label: "勇気" },
      "affection": { initial: 0, min: 0, max: 100, label: "好感度" }
    }
  },
  episodes: [
    {
      id: "ep_01",
      title: "第1章　始まりの塔",
      scenes: [
        {
          id: "scene_01",
          background: "BG_MAGIC_TOWER",
          condition: null,
          lines: [
            {
              id: "line_001",
              speaker: "",
              text: "古びた塔の扉が、重い音を立てて開いた。",
              character: null,
              characterEmotion: null,
              changeBackground: null,
              effects: null
            },
            {
              id: "line_002",
              speaker: "レミ",
              text: "どうする？",
              character: "remi_unant",
              characterEmotion: "normal",
              changeBackground: null,
              effects: null,
              choice: {
                options: [
                  {
                    text: "奥へ進む",
                    nextSceneId: "scene_02",
                    result: "勇敢に進む",
                    effects: {
                      flags: { "visited_tower": true },
                      axes: { "courage": 10 }
                    }
                  },
                  {
                    text: "様子をうかがう",
                    nextSceneId: "scene_03",
                    result: "慎重に観察する",
                    effects: {
                      flags: {},
                      axes: { "courage": 0 }
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          id: "scene_02",
          background: "BG_MAGIC_TOWER",
          condition: { flag: "visited_tower", value: true },
          returnTo: "scene_04",
          lines: [
            {
              id: "line_010",
              speaker: "レミ",
              text: "やっぱりここに来てよかった！",
              character: "remi_unant",
              characterEmotion: "smile",
              changeBackground: null,
              effects: { flags: {}, axes: { "affection": 5 } }
            }
          ]
        },
        {
          id: "scene_03",
          background: "BG_MAGIC_TOWER",
          condition: null,
          returnTo: "scene_04",
          lines: [
            {
              id: "line_020",
              speaker: "レミ",
              text: "もう少し様子を見よう。",
              character: "remi_unant",
              characterEmotion: "normal",
              changeBackground: null,
              effects: null
            }
          ]
        },
        {
          id: "scene_04",
          background: "BG_MAGIC_TOWER",
          condition: null,
          lines: [
            {
              id: "line_030",
              speaker: "長老",
              text: "よく来た。待っておったぞ。",
              character: null,
              characterEmotion: null,
              changeBackground: null,
              effects: null
            }
          ]
        }
      ]
    }
  ]
};

const SCHEMA_V41 = {
  version: "4.1",
  _note: "4ファイル分離構成 — events / chats / choices / state",
  events: {
    version: "2.1",
    start_event_id: "EV_001",
    events: [
      { event_id: "EV_001", type: "CHAT",   ref_id: "CHAT_001",   next: "EV_002" },
      { event_id: "EV_002", type: "CHAT",   ref_id: "CHAT_002",   next: "EV_003" },
      { event_id: "EV_003", type: "CHOICE", ref_id: "CHOICE_001" },
      { event_id: "EV_010", type: "CHAT",   ref_id: "CHAT_010",   next: "EV_030" },
      { event_id: "EV_020", type: "CHAT",   ref_id: "CHAT_020",   next: "EV_030" },
      { event_id: "EV_030", type: "CHAT",   ref_id: "CHAT_030" }
    ]
  },
  chats: {
    version: "2.1",
    chats: [
      { chat_id: "CHAT_001", lines: [
        { speaker: "", text: "古びた塔の扉が、重い音を立てて開いた。", tags: ["bg:tower_entrance", "se:door_open"] }
      ]},
      { chat_id: "CHAT_002", lines: [
        { speaker: "レミ", text: "ここが…始まりの塔。", icon: "remi_normal", face: "normal", tags: ["char:remi"] },
        { speaker: "レミ", text: "どうする？", icon: "remi_normal", face: "thinking" }
      ]},
      { chat_id: "CHAT_010", lines: [{ speaker: "", text: "薄暗い回廊が続いていた。" }]},
      { chat_id: "CHAT_020", lines: [{ speaker: "", text: "レミは入口で周囲を観察した。" }]},
      { chat_id: "CHAT_030", lines: [{ speaker: "長老", text: "よく来た。待っておったぞ。" }]}
    ]
  },
  choices: {
    version: "2.1",
    choices: [
      {
        choice_id: "CHOICE_001",
        question: { speaker: "レミ", text: "この先へ進む？" },
        options: [
          { label: "奥へ進む",   next: "EV_010", effects: { flags: { brave: true },   params: { courage: 2, exp: 5 } }, result: { speaker: "", text: "レミは意を決して進んだ。" } },
          { label: "様子を見る", next: "EV_020", effects: { flags: { careful: true }, params: { courage: -1 } },         result: { speaker: "", text: "レミは慎重に周囲を観察した。" } }
        ]
      }
    ]
  },
  state: {
    version: "2.1",
    flags:  { brave: false, careful: false },
    params: { courage: 0, exp: 0, money: 100 }
  }
};

// ─────────────────────────────────────────────────────────
// Field Spec
// ─────────────────────────────────────────────────────────
type FieldRow = { key: string; type: string; required: boolean; desc: string };

const SPEC_V11: FieldRow[] = [
  { key: 'version',        type: 'string', required: true,  desc: '固定値 "1.1"' },
  { key: 'gameTitle',      type: 'string', required: true,  desc: 'ゲームタイトル（タイトル画面・章ヘッダーで使用）' },
  { key: 'episodes[]',     type: 'array',  required: true,  desc: '章の配列。1つ以上必須' },
  { key: '  .id',          type: 'string', required: true,  desc: 'エピソードID。例: "ep_01"' },
  { key: '  .title',       type: 'string', required: true,  desc: '章タイトル。冒頭でタイトルコール表示される' },
  { key: '  .scenes[]',    type: 'array',  required: true,  desc: 'シーン配列' },
  { key: '    .id',        type: 'string', required: true,  desc: 'シーンID。例: "scene_01"' },
  { key: '    .lines[]',   type: 'array',  required: true,  desc: '会話行の配列' },
  { key: '      .speaker', type: 'string', required: true,  desc: '話者名。地の文は ""（空文字）' },
  { key: '      .text',    type: 'string', required: true,  desc: '表示テキスト。全角200文字以内' },
];

const SPEC_V12_EXTRA: FieldRow[] = [
  { key: 'version',             type: 'string', required: true,  desc: '固定値 "1.2"' },
  { key: '      .id',           type: 'string', required: false, desc: 'ライン固有ID。CHOICEの遷移先指定に使用' },
  { key: '      .choice',       type: 'object', required: false, desc: 'このlineで選択肢を表示。省略可' },
  { key: '        .options[]',  type: 'array',  required: true,  desc: '選択肢の配列（2〜4件推奨）' },
  { key: '          .text',     type: 'string', required: true,  desc: '選択肢ボタンのテキスト。全角20文字以内' },
  { key: '          .nextSceneId', type: 'string', required: true, desc: '選んだ後に遷移するシーンID' },
  { key: '          .result',   type: 'string', required: false, desc: '選択結果の短い説明テキスト（ログ等に使用）' },
  { key: '    .returnTo',       type: 'string', required: false, desc: 'このシーン終了後に戻るシーンID。分岐合流に使用' },
];

const SPEC_V21_EXTRA: FieldRow[] = [
  { key: 'version',                   type: 'string',      required: true,  desc: '固定値 "2.1"' },
  { key: '    .background',           type: 'string|null', required: false, desc: 'シーン開始時の背景ID（BG_XXX）' },
  { key: '      .character',          type: 'string|null', required: false, desc: 'キャラクターID（characters.jsonのid）' },
  { key: '      .characterEmotion',   type: 'string|null', required: false, desc: '"normal" | "smile" | "angry" | "sad" | "surprised" | null' },
  { key: '      .changeBackground',   type: 'string|null', required: false, desc: 'このlineで背景を切り替えるBG_ID。変更なしはnull' },
];

const SPEC_V31_EXTRA: FieldRow[] = [
  { key: 'version',                        type: 'string',      required: true,  desc: '固定値 "3.1"' },
  { key: 'parameters',                     type: 'object',      required: true,  desc: 'ゲーム全体のパラメーター初期定義' },
  { key: '  .flags',                       type: 'object',      required: true,  desc: 'Boolフラグのマップ。{ フラグ名: 初期値(false) }' },
  { key: '  .axes',                        type: 'object',      required: true,  desc: '数値軸のマップ。自由に追加・命名可能' },
  { key: '    {軸名}',                     type: 'object',      required: true,  desc: '軸の定義' },
  { key: '      .initial',                 type: 'number',      required: true,  desc: '初期値' },
  { key: '      .min / .max',              type: 'number',      required: true,  desc: '最小・最大値（クランプ処理に使用）' },
  { key: '      .label',                   type: 'string',      required: true,  desc: 'UI表示名。例: "勇気", "好感度"' },
  { key: '    .condition',                 type: 'object|null', required: false, desc: 'シーン表示条件。{ flag, value } flagがvalueと一致する場合のみ表示' },
  { key: '      .effects',                 type: 'object|null', required: false, desc: 'このlineを通過した時の効果' },
  { key: '        .flags',                 type: 'object',      required: false, desc: '変更するフラグ { フラグ名: true/false }' },
  { key: '        .axes',                  type: 'object',      required: false, desc: '加算する軸の量 { 軸名: 加算値 }（マイナス可）' },
  { key: '  choice.options[].effects',     type: 'object|null', required: false, desc: '選択肢を選んだ時の効果（flagsとaxesを指定）' },
];

const SPEC_V41: FieldRow[] = [
  { key: 'events',                   type: 'object',           required: true,  desc: 'events.json — 進行制御スロット。中身を持たず ref_id で他ファイルを参照' },
  { key: '  .start_event_id',        type: 'string',           required: true,  desc: 'シーン開始の最初のイベントID' },
  { key: '  .events[]',              type: 'array',            required: true,  desc: 'イベントスロットの配列' },
  { key: '    .event_id',            type: 'string',           required: true,  desc: 'イベントID。例: "EV_001"' },
  { key: '    .type',                type: '"CHAT"|"CHOICE"',  required: true,  desc: 'イベント種別' },
  { key: '    .ref_id',              type: 'string',           required: true,  desc: 'chats.chat_id または choices.choice_id を参照' },
  { key: '    .next',                type: 'string',           required: false, desc: '次のイベントID。省略でシーン終了' },
  { key: 'chats',                    type: 'object',           required: true,  desc: 'chats.json — 表示専用。副作用なし' },
  { key: '  .chats[].chat_id',       type: 'string',           required: true,  desc: '会話ブロックID。例: "CHAT_001"' },
  { key: '  .chats[].lines[]',       type: 'array',            required: true,  desc: 'セリフ行の配列' },
  { key: '    .speaker',             type: 'string',           required: true,  desc: '話者名。空文字列 = ナレーション' },
  { key: '    .text',                type: 'string',           required: true,  desc: '表示テキスト' },
  { key: '    .icon',                type: 'string',           required: false, desc: 'キャラアイコン画像パス' },
  { key: '    .face',                type: 'string',           required: false, desc: '表情差分パス。icon と組み合わせる' },
  { key: '    .tags',                type: 'string[]',         required: false, desc: '演出タグ。例: bg:tower_entrance / se:door_open' },
  { key: 'choices',                  type: 'object',           required: true,  desc: 'choices.json — 分岐＋state変更の唯一の責任ポイント' },
  { key: '  .choices[].choice_id',   type: 'string',           required: true,  desc: '選択肢イベントID。例: "CHOICE_001"' },
  { key: '  .choices[].question',    type: 'object',           required: true,  desc: '問いかけ表示。{ speaker, text }' },
  { key: '  .choices[].options[]',   type: 'array',            required: true,  desc: '選択肢リスト。1つ以上' },
  { key: '    .label',               type: 'string',           required: true,  desc: 'ボタン表示テキスト' },
  { key: '    .next',                type: 'string',           required: true,  desc: '選択後に遷移するevent_id' },
  { key: '    .effects',             type: 'object',           required: false, desc: 'state変更。{ flags, params }。省略可' },
  { key: '    .result',              type: 'object',           required: false, desc: '結果テキスト。{ speaker, text }。省略可' },
  { key: 'state',                    type: 'object',           required: true,  desc: 'state.json — Single Source of Truth' },
  { key: '  .flags',                 type: 'object',           required: true,  desc: 'Bool フラグ。{ key: boolean }。choices.effects で上書き更新' },
  { key: '  .params',                type: 'object',           required: true,  desc: '数値パラメーター。{ key: number }。choices.effects で加算更新' },
];

// ─────────────────────────────────────────────────────────
// Version Config
// ─────────────────────────────────────────────────────────
type VersionId = 'v11' | 'v12' | 'v21' | 'v31' | 'v41';

interface VersionDef {
  id: VersionId;
  label: string;
  sub: string;
  badge: string;
  badgeColor: string;
  schema: object;
  spec: FieldRow[];
  specExtra?: FieldRow[];
  icon: React.ReactNode;
}

const VERSIONS: VersionDef[] = [
  {
    id: 'v11', label: 'Ver 1.1', sub: 'テキストのみ',
    badge: '1.1', badgeColor: 'border-slate-600 text-slate-400 bg-slate-800/60',
    schema: SCHEMA_V11, spec: SPEC_V11,
    icon: <FileJson size={14} />,
  },
  {
    id: 'v12', label: 'Ver 1.2', sub: 'CHOICE・分岐・合流',
    badge: '1.2', badgeColor: 'border-indigo-500/60 text-indigo-300 bg-indigo-500/10',
    schema: SCHEMA_V12, spec: SPEC_V11, specExtra: SPEC_V12_EXTRA,
    icon: <ChevronRight size={14} />,
  },
  {
    id: 'v21', label: 'Ver 2.1', sub: '背景・キャラクター',
    badge: '2.1', badgeColor: 'border-pink-500/60 text-pink-300 bg-pink-500/10',
    schema: SCHEMA_V21, spec: SPEC_V11, specExtra: [...SPEC_V12_EXTRA, ...SPEC_V21_EXTRA],
    icon: <Image size={14} />,
  },
  {
    id: 'v31', label: 'Ver 3.1', sub: 'フラグ・軸パラメーター',
    badge: '3.1', badgeColor: 'border-yellow-500/60 text-yellow-300 bg-yellow-500/10',
    schema: SCHEMA_V31, spec: SPEC_V11, specExtra: [...SPEC_V12_EXTRA, ...SPEC_V21_EXTRA, ...SPEC_V31_EXTRA],
    icon: <Sliders size={14} />,
  },
  {
    id: 'v41', label: 'Ver 4.1', sub: '4ファイル分離構成',
    badge: '4.1', badgeColor: 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10',
    schema: SCHEMA_V41, spec: SPEC_V41,
    icon: <FileJson size={14} />,
  },
];

// Ver1.xグループのメンバー（最新優先）
const VER1_GROUP: VersionId[] = ['v12', 'v11'];
const VER1_LATEST: VersionId = 'v12';

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────
const BG_IDS = [
  { id: 'BG_MAGIC_TOWER',      label: '魔法の塔' },
  { id: 'BG_STARTING_VILLAGE', label: '始まりの村' },
  { id: 'BG_FOREST_RUINS',     label: '森の遺跡' },
  { id: 'BG_GUILD_HALL',       label: 'ギルドホール' },
  { id: 'BG_PLAINS',           label: '平原' },
  { id: 'BG_DUNGEON',          label: 'ダンジョン' },
];
const EMOTIONS = ['normal', 'smile', 'angry', 'sad', 'surprised'];

// ─────────────────────────────────────────────────────────
// CopyButton — 汎用コピーアイコン
// ─────────────────────────────────────────────────────────
const CopyButton: React.FC<{ text: string; keyId: string; className?: string }> = ({ text, keyId: _keyId, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <button
      onClick={onClick}
      title="コピー"
      className={`inline-flex items-center gap-1 transition-colors ${className}
        ${copied ? 'text-green-400' : 'text-slate-500 hover:text-slate-200'}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
};

// ─────────────────────────────────────────────────────────
// Ver1 Dropdown — ▽プルダウン（Ver1.1 / Ver1.2）
// ─────────────────────────────────────────────────────────
const Ver1Dropdown: React.FC<{
  activeVer: VersionId;
  onSelect: (v: VersionId) => void;
}> = ({ activeVer, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isVer1Active = VER1_GROUP.includes(activeVer);
  const displayVer = isVer1Active ? activeVer : VER1_LATEST;
  const displayDef = VERSIONS.find(v => v.id === displayVer)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!isVer1Active) onSelect(VER1_LATEST); }}
        className={`flex flex-col items-start px-3 py-1.5 rounded-lg text-xs transition-colors border
          ${isVer1Active
            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
            : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200'}`}
      >
        <span className="flex items-center gap-1 font-bold">
          {displayDef.label}
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
        <span className={`text-[10px] leading-none mt-0.5 ${isVer1Active ? 'text-yellow-500/70' : 'text-slate-600'}`}>
          {displayDef.sub}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden min-w-44">
          {VER1_GROUP.map(vid => {
            const def = VERSIONS.find(v => v.id === vid)!;
            return (
              <button
                key={vid}
                onClick={() => { onSelect(vid); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs text-left transition-colors
                  ${activeVer === vid ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-300 hover:bg-slate-700/60'}`}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${def.badgeColor}`}>
                  {def.badge}
                </span>
                <div>
                  <div className="font-medium">{def.label}</div>
                  <div className="text-slate-500 text-[10px]">{def.sub}</div>
                </div>
                {vid === VER1_LATEST && (
                  <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">最新</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
interface SchemaShortViewProps {
  initialVersion?: VersionId;
}

export const SchemaShortView: React.FC<SchemaShortViewProps> = ({ initialVersion }) => {
  const [version, setVersion] = useState<VersionId>(initialVersion ?? VER1_LATEST);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedJson, setImportedJson] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);

  const vDef = VERSIONS.find(v => v.id === version)!;
  const schemaStr = JSON.stringify(vDef.schema, null, 2);

  const handleExport = useCallback(() => {
    const content = importedJson ?? schemaStr;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novel_${version}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [importedJson, schemaStr, version]);

  return (
    <div className="flex flex-col h-full text-sm">
      {/* ── ツールバー ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 shrink-0 flex-wrap">

        {/* バージョン選択群 */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-xl p-1.5 border border-slate-700/50">

          {/* Ver 1.x — ▽プルダウン */}
          <Ver1Dropdown activeVer={version} onSelect={setVersion} />

          <div className="w-px h-7 bg-slate-700" />

          {/* Ver 2.x, 3.x — 個別ボタン */}
          {VERSIONS.filter(v => !VER1_GROUP.includes(v.id)).map(v => (
            <button
              key={v.id}
              onClick={() => setVersion(v.id)}
              className={`flex flex-col items-start px-3 py-1.5 rounded-lg text-xs transition-colors border
                ${version === v.id
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'}`}
            >
              <span className="font-bold">{v.label}</span>
              <span className={`text-[10px] leading-none mt-0.5 ${version === v.id ? 'text-yellow-500/70' : 'text-slate-600'}`}>
                {v.sub}
              </span>
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        <button
          onClick={() => { setShowImportModal(true); setImportError(null); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 transition-colors"
          title="JSONをインポート"
        >
          <Upload size={14} /> Import
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 transition-colors"
          title="JSONをエクスポート"
        >
          <Download size={14} /> Export
        </button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        <button
          onClick={() => setShowReference(!showReference)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-colors
            ${showReference
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:text-slate-200'}`}
          title="キャラ・背景リファレンス"
        >
          <BookOpen size={14} /> Ref
        </button>

        {importedJson && (
          <div className="ml-auto flex items-center gap-2 text-xs text-green-400">
            <FileJson size={14} />
            <span>インポート済み</span>
            <button onClick={() => setImportedJson(null)} className="text-slate-500 hover:text-slate-300">
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ── メインエリア ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-auto p-5 gap-6">

          {/* バージョンバナー + AllCopy */}
          <div className="flex items-start gap-3 p-4 rounded-xl border relative"
            style={{ borderColor: vDef.id === 'v11' ? '#475569' : vDef.id === 'v12' ? '#6366f1' : vDef.id === 'v21' ? '#ec4899' : vDef.id === 'v41' ? '#10b981' : '#eab308' }}
          >
            <div className="shrink-0 mt-0.5" style={{ color: vDef.id === 'v11' ? '#94a3b8' : vDef.id === 'v12' ? '#818cf8' : vDef.id === 'v21' ? '#f472b6' : vDef.id === 'v41' ? '#34d399' : '#facc15' }}>
              {vDef.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-1" style={{ color: vDef.id === 'v11' ? '#94a3b8' : vDef.id === 'v12' ? '#a5b4fc' : vDef.id === 'v21' ? '#f9a8d4' : vDef.id === 'v41' ? '#6ee7b7' : '#fde047' }}>
                {vDef.label} — {vDef.sub}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {vDef.id === 'v11' && 'テキスト・話者・章タイトルだけで構成する最小スキーマ。AIに渡して「この文章をVer1.1に変換して」と言えばゲームが作れます。'}
                {vDef.id === 'v12' && 'Ver1.1に選択肢（CHOICE）と分岐シーン遷移を追加。returnToで分岐後のシーンを合流させられます。'}
                {vDef.id === 'v21' && 'Ver1.2の拡張版。CollectionライブラリのキャラクターID・背景IDを参照して立ち絵・背景付きのビジュアルノベルが作れます。'}
                {vDef.id === 'v31' && 'Ver2.1の拡張版。Bool型フラグと数値軸パラメーター（勇気・好感度など）を管理。選択肢やセリフ通過でパラメーターが変化し、フラグでシーン表示を制御できます。axes配下は自由に追加・命名できます。'}
                {vDef.id === 'v41' && '進行(events) / 表示(chats) / 分岐(choices) / 状態(state) を4ファイルに完全分離したアーキテクチャ。EventはCHAT・CHOICEを差し込むスロット。chatsにはicon・face対応、choicesでのみstateを変更するという責務分離が設計の核心です。'}
              </p>
            </div>
            {/* AllCopy ボタン — 右寄せ */}
            <div className="shrink-0 ml-auto pl-3">
              <CopyButton
                text={schemaStr}
                keyId={`banner_${version}`}
                className="px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 hover:bg-slate-700"
              />
            </div>
          </div>

          {/* フィールド仕様テーブル */}
          <SpecTable rows={vDef.spec} title="基本フィールド仕様" />
          {vDef.specExtra && vDef.specExtra.length > 0 && (
            <SpecTable rows={vDef.specExtra} title="拡張フィールド仕様" accent />
          )}

          {/* スキーマサンプル */}
          <div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setSampleOpen(v => !v)}
                className="flex items-center gap-2 text-left outline-none flex-1"
              >
                <SectionTitle icon={<FileJson size={14} />} title="スキーマサンプル" />
                <ChevronDown size={14} className={`text-slate-500 transition-transform mb-2 ${sampleOpen ? 'rotate-180' : ''}`} />
              </button>
              <CopyButton text={schemaStr} keyId={`sample_${version}`} className="px-3 py-1.5 rounded-lg border border-slate-600/50 bg-slate-700/50 mb-2" />
            </div>
            {sampleOpen && (
              <pre className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                {schemaStr}
              </pre>
            )}
          </div>

          {/* インポートデータプレビュー */}
          {importedJson && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionTitle icon={<FileJson size={14} />} title="インポートデータ" />
                <CopyButton text={importedJson} keyId="import_copy" className="px-3 py-1.5 rounded-lg border border-slate-600/50 bg-slate-700/50" />
              </div>
              <JsonPreview jsonStr={importedJson} />
            </div>
          )}

          {/* AIプロンプトテンプレート */}
          <AiPromptBlock version={version} schemaStr={schemaStr} />
        </div>

        {/* 右: リファレンスパネル */}
        {showReference && <ReferencePanel />}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onImport={(json) => { setImportedJson(json); setShowImportModal(false); }}
          onClose={() => setShowImportModal(false)}
          error={importError}
          setError={setImportError}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// SpecTable
// ─────────────────────────────────────────────────────────
const SpecTable: React.FC<{ rows: FieldRow[]; title: string; accent?: boolean }> = ({ rows, title, accent }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 mb-2 w-full text-left group"
      >
        <span className="w-1 h-4 bg-yellow-500 rounded-full" />
        <span className="text-slate-400"><Info size={14} /></span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex-1">{title}</span>
        <ChevronDown size={13} className={`text-slate-500 transition-transform group-hover:text-slate-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80">
                <th className="text-left px-3 py-2 text-slate-400 font-medium border-b border-slate-700/50">フィールド</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium border-b border-slate-700/50 w-28">型</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium border-b border-slate-700/50 w-16">必須</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium border-b border-slate-700/50">説明</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f, i) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                  <td className={`px-3 py-2 font-mono whitespace-nowrap ${accent ? 'text-pink-300' : 'text-yellow-300'}`}>{f.key}</td>
                  <td className="px-3 py-2 text-cyan-400 whitespace-nowrap">{f.type}</td>
                  <td className="px-3 py-2">
                    {f.required
                      ? <span className="text-red-400 font-bold">必須</span>
                      : <span className="text-slate-600">任意</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-300">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// SectionTitle
// ─────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <span className="flex items-center gap-2 mb-2">
    <span className="inline-block w-1 h-4 bg-yellow-500 rounded-full" />
    <span className="text-slate-400">{icon}</span>
    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{title}</span>
  </span>
);

// ─────────────────────────────────────────────────────────
// JsonPreview
// ─────────────────────────────────────────────────────────
const JsonPreview: React.FC<{ jsonStr: string }> = ({ jsonStr }) => {
  let parsed: any = null;
  let err = '';
  try { parsed = JSON.parse(jsonStr); } catch (e: any) { err = e.message; }
  if (err) return (
    <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-xs text-red-300">{err}</div>
  );

  const ver    = parsed?.version ?? '?';
  const title  = parsed?.gameTitle ?? '(タイトルなし)';
  const epCnt  = parsed?.episodes?.length ?? 0;
  const lines  = parsed?.episodes?.flatMap((e: any) => e.scenes?.flatMap((s: any) => s.lines ?? []) ?? []) ?? [];
  const lineCnt = lines.length;
  const choiceCnt = lines.filter((l: any) => l.choice).length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'バージョン', value: `Ver ${ver}`, color: 'text-yellow-400' },
          { label: 'タイトル',   value: title,         color: 'text-slate-200' },
          { label: 'エピソード', value: `${epCnt}章`,  color: 'text-indigo-400' },
          { label: '会話行',     value: `${lineCnt}行 / CHOICE${choiceCnt}`, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className={`text-sm font-bold ${s.color} truncate`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <pre className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono max-h-60 overflow-y-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// AiPromptBlock
// ─────────────────────────────────────────────────────────
const AiPromptBlock: React.FC<{ version: VersionId; schemaStr: string }> = ({ version, schemaStr }) => {
  const [open, setOpen] = useState(false);

  const extra = version === 'v31'
    ? '\n※parametersのaxesは自由に追加・命名できます（例: "trust", "fear", "pride"など）。初期値・min・maxも自由に設定してください。'
    : version === 'v12' || version === 'v21'
    ? '\n※CHOICEがある場合は必ずnextSceneIdで遷移先シーンIDを指定し、分岐後のシーンにはreturnToで合流先シーンIDを入れてください。'
    : version === 'v41'
    ? '\n※4ファイル構成です。events / chats / choices / state それぞれを別ファイルとして出力してください。'
    : '';

  const prompt = `以下のJSONスキーマ（${VERSIONS.find(v => v.id === version)?.label}）に従って、私が書いた文章をノベルゲーム用JSONに変換してください。${extra}\n\nスキーマ:\n${schemaStr}\n\n変換する文章:\n（ここに文章を貼り付けてください）\n\n出力はJSONのみ、説明は不要です。`;

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 text-left outline-none flex-1"
        >
          <SectionTitle icon={<User size={14} />} title="AIへの指示テンプレート" />
          <ChevronDown size={14} className={`text-slate-500 transition-transform mb-2 ${open ? 'rotate-180' : ''}`} />
        </button>
        <CopyButton text={prompt} keyId={`prompt_${version}`} className="px-3 py-1.5 rounded-lg border border-slate-600/50 bg-slate-700/50 mb-2" />
      </div>
      {open && (
        <div className="mt-2">
          <p className="text-xs text-slate-500 mb-2">末尾の「変換する文章」部分に自分の文章を貼ってAIに渡してください。</p>
          <pre className="bg-slate-900/80 border border-yellow-500/20 rounded-xl p-4 text-xs text-yellow-100/80 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ReferencePanel
// ─────────────────────────────────────────────────────────
const ReferencePanel: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    });
  };
  const CopyBtn: React.FC<{ text: string; id: string }> = ({ text, id }) => (
    <button
      onClick={() => copy(text, id)}
      className={`shrink-0 transition-colors ${copied === id ? 'text-green-400' : 'text-slate-600 hover:text-slate-300'}`}
    >
      {copied === id ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );

  const AX_EXAMPLES = ['courage（勇気）', 'affection（好感度）', 'trust（信頼）', 'wisdom（知恵）', 'fear（恐怖）'];

  return (
    <div className="w-72 shrink-0 border-l border-slate-700 bg-slate-900/50 overflow-y-auto p-4 space-y-5">
      <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
        <BookOpen size={13} className="text-cyan-400" />リファレンス
      </p>

      <div>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><User size={11} />キャラクターID</p>
        {characterData.characters.map(c => (
          <button key={c.id} onClick={() => copy(c.id, `c_${c.id}`)}
            className={`w-full flex items-center justify-between px-2.5 py-2 mb-1.5 rounded-lg border text-xs transition-colors
              ${copied === `c_${c.id}` ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:border-slate-600'}`}>
            <span className="font-medium">{c.name}</span>
            <span className="font-mono text-slate-500 text-[10px]">{c.id}</span>
            {copied === `c_${c.id}` ? <Check size={10} className="text-green-400" /> : <Copy size={10} className="text-slate-600" />}
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">characterEmotion</p>
        <div className="flex flex-wrap gap-1.5">
          {[...EMOTIONS, 'null'].map(e => (
            <button key={e} onClick={() => copy(e, `em_${e}`)}
              className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors
                ${copied === `em_${e}` ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Image size={11} />背景ID</p>
        {BG_IDS.map(bg => (
          <button key={bg.id} onClick={() => copy(bg.id, `bg_${bg.id}`)}
            className={`w-full flex items-center justify-between px-2.5 py-2 mb-1.5 rounded-lg border text-xs transition-colors
              ${copied === `bg_${bg.id}` ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:border-slate-600'}`}>
            <span className="font-medium">{bg.label}</span>
            <span className="font-mono text-slate-500 text-[10px]">{bg.id}</span>
            {copied === `bg_${bg.id}` ? <Check size={10} className="text-green-400" /> : <Copy size={10} className="text-slate-600" />}
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Flag size={11} />フラグ名の例</p>
        <div className="space-y-1">
          {['visited_tower', 'got_sword', 'met_elder', 'cleared_dungeon'].map(f => (
            <div key={f} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
              <code className="text-[10px] text-indigo-300">{f}</code>
              <CopyBtn text={f} id={`flag_${f}`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Sliders size={11} />軸パラメーター例（自由命名）</p>
        <div className="space-y-1">
          {AX_EXAMPLES.map(ax => {
            const key = ax.split('（')[0];
            return (
              <div key={key} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                <span className="text-[10px] text-yellow-300">{ax}</span>
                <CopyBtn text={key} id={`ax_${key}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ImportModal
// ─────────────────────────────────────────────────────────
const ImportModal: React.FC<{
  onImport: (json: string) => void;
  onClose: () => void;
  error: string | null;
  setError: (e: string | null) => void;
}> = ({ onImport, onClose, error, setError }) => {
  const [text, setText] = useState('');

  const handleImport = () => {
    if (!text.trim()) { setError('JSONを貼り付けてください'); return; }
    try {
      const parsed = JSON.parse(text);
      onImport(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setError(`JSON構文エラー: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Upload size={16} className="text-yellow-400" /> JSON インポート
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">AIが出力したJSONをここに貼り付けてください</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(null); }}
            placeholder={'{\n  "version": "1.2",\n  "gameTitle": "タイトル",\n  "episodes": [...]\n}'}
            className="w-full h-full min-h-64 bg-slate-800/80 border border-slate-700 rounded-xl p-4
              text-xs text-green-300 font-mono placeholder-slate-600 outline-none resize-none
              focus:border-yellow-500/50"
            spellCheck={false}
            autoFocus
          />
          {error && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 shrink-0">
          <p className="text-xs text-slate-500">{text.trim() ? `${text.length.toLocaleString()} 文字` : '貼り付け待ち...'}</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:bg-slate-800">キャンセル</button>
            <button
              onClick={handleImport}
              disabled={!text.trim()}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors
                ${text.trim() ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              インポート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
