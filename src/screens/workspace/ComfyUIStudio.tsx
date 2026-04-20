// ============================================================
// ComfyUIStudio — 工房: 発注書管理 + ComfyUI バッチ生成
// CSV + JSON テンプレート方式 Ver1.1
// ============================================================

import { useState, useRef } from 'react';
import { StudioScreen } from '@/screens/12_Studio/StudioScreen';

// ─── Types ───────────────────────────────────────────────────

type StudioTab = 'orders' | 'gemini';

interface LoraConfig { name: string; weight: number; }

interface BatchTemplate {
  _comment?: string;
  _model_type?: string;
  VERSION: string;
  CHECKPOINT: string;
  LORA: LoraConfig[];
  STYLE_BASE: string;
  NEGATIVE_BASE: string;
  STEPS: number;
  CFG: number;
  SAMPLER: string;
  SCHEDULER: string;
  DENOISE: number;
  WIDTH: number;
  HEIGHT: number;
  OUTPUT_DIR: string;
  COMFYUI_URL: string;
}

interface PromptRow {
  id: string;
  character?: string;
  scene?: string;
  object?: string;
  variant: string;
  positive_extra: string;
  negative_extra: string;
  seed: string;
  filename_prefix: string;
  width?: string;
  height?: string;
  selected: boolean;
}

// ─── Default Templates ────────────────────────────────────────

const DEFAULT_TEMPLATES: Record<string, BatchTemplate> = {
  granblue_chara: {
    _model_type: 'granblue_chara',
    VERSION: '1.1',
    CHECKPOINT: 'novaOrangeXL_v140.safetensors',
    LORA: [{ name: 'granblue-klein9b.safetensors', weight: 0.7 }],
    STYLE_BASE: 'granblue fantasy style, anime illustration, official art, highly detailed character, vivid colors, clean lineart, flat shading, soft shadows, game cg, 1girl, standing',
    NEGATIVE_BASE: 'lowres, bad anatomy, bad hands, worst quality, blurry, realistic, 3d render, western style, sketch, rough, unfinished, watermark, multiple characters, nsfw',
    STEPS: 28, CFG: 7.0, SAMPLER: 'dpmpp_2m', SCHEDULER: 'karras', DENOISE: 1.0,
    WIDTH: 512, HEIGHT: 768,
    OUTPUT_DIR: 'D:/ai/ComfyUI/output/batch',
    COMFYUI_URL: 'http://127.0.0.1:8188',
  },
  granblue_background: {
    _model_type: 'granblue_background',
    VERSION: '1.1',
    CHECKPOINT: 'novaOrangeXL_v140.safetensors',
    LORA: [],
    STYLE_BASE: 'granblue fantasy style, anime illustration, official art, detailed background, vivid colors, game cg, environment, no humans',
    NEGATIVE_BASE: 'lowres, worst quality, blurry, realistic, 3d render, watermark, characters, people',
    STEPS: 30, CFG: 7.0, SAMPLER: 'dpmpp_2m', SCHEDULER: 'karras', DENOISE: 1.0,
    WIDTH: 1920, HEIGHT: 1080,
    OUTPUT_DIR: 'D:/ai/ComfyUI/output/batch',
    COMFYUI_URL: 'http://127.0.0.1:8188',
  },
  pixel_sprite: {
    _model_type: 'pixel_sprite',
    VERSION: '1.1',
    CHECKPOINT: 'pixelArtSpriteDiffusion.safetensors',
    LORA: [],
    STYLE_BASE: 'pixel art, pixel sprite, retro game style, 16bit, clean pixels, limited color palette, game asset',
    NEGATIVE_BASE: 'blurry, smooth, anti-aliasing, realistic, high resolution, detailed texture, 3d, photo, painting, sketch',
    STEPS: 20, CFG: 7.0, SAMPLER: 'dpmpp_2m', SCHEDULER: 'karras', DENOISE: 1.0,
    WIDTH: 64, HEIGHT: 64,
    OUTPUT_DIR: 'D:/ai/ComfyUI/output/batch',
    COMFYUI_URL: 'http://127.0.0.1:8188',
  },
};

const TEMPLATE_LABELS: Record<string, string> = {
  granblue_chara: 'グラブル キャラ立ち絵',
  granblue_background: 'グラブル 背景',
  pixel_sprite: 'ピクセルスプライト',
};

// ─── CSV Utils ───────────────────────────────────────────────

function parseCSV(text: string): PromptRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line, i) => {
    const vals = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] ?? ''; });
    return {
      id: obj.id || String(i + 1),
      character: obj.character,
      scene: obj.scene,
      object: obj.object,
      variant: obj.variant || '',
      positive_extra: obj.positive_extra || '',
      negative_extra: obj.negative_extra || '',
      seed: obj.seed || '-1',
      filename_prefix: obj.filename_prefix || `batch_${String(i + 1).padStart(3, '0')}`,
      width: obj.width,
      height: obj.height,
      selected: true,
    };
  });
}

function rowsToCSV(rows: PromptRow[]): string {
  const header = 'id,character,variant,positive_extra,negative_extra,seed,filename_prefix,width,height';
  const lines = rows.map(r =>
    [r.id, r.character ?? '', r.variant, r.positive_extra, r.negative_extra, r.seed, r.filename_prefix, r.width ?? '', r.height ?? ''].join(',')
  );
  return [header, ...lines].join('\n');
}

function downloadFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Styles ──────────────────────────────────────────────────

const S = {
  tab: (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', border: 'none', cursor: 'pointer', fontSize: '0.78rem',
    fontWeight: active ? 700 : 400, borderRadius: 6,
    background: active ? 'rgba(201,162,39,0.18)' : 'transparent',
    color: active ? '#c9a227' : '#6b7280',
    borderBottom: active ? '2px solid #c9a227' : '2px solid transparent',
  }),
  btn: (variant: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties => ({
    padding: '5px 12px', cursor: 'pointer', borderRadius: 6,
    fontSize: '0.75rem', fontWeight: 600,
    background: variant === 'primary' ? '#c9a227' : variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)',
    color: variant === 'primary' ? '#0d0d12' : variant === 'danger' ? '#f87171' : '#9ca3af',
    border: variant === 'ghost' ? '1px solid rgba(255,255,255,0.1)' : variant === 'danger' ? '1px solid rgba(239,68,68,0.3)' : 'none',
  }),
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid #374151',
    borderRadius: 5, padding: '5px 8px', color: '#d1d5db',
    fontSize: '0.78rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  },
  label: { fontSize: '0.65rem', color: '#6b7280', display: 'block', marginBottom: 3 } as React.CSSProperties,
  section: {
    background: 'var(--color-bg-medium)', border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '0.875rem', marginBottom: '0.75rem',
  } as React.CSSProperties,
};

// ─── Template Panel ───────────────────────────────────────────

function TemplatePanel({ template, onUpdate }: {
  template: BatchTemplate;
  onUpdate: (t: BatchTemplate) => void;
}) {
  const [jsonText, setJsonText] = useState(JSON.stringify(template, null, 2));
  const [error, setError] = useState('');

  const apply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onUpdate(parsed);
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={S.section}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c9a227' }}>template.json</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={S.btn('ghost')} onClick={() => downloadFile(jsonText, 'template.json', 'application/json')}>
            ↓ Export
          </button>
          <button style={S.btn('primary')} onClick={apply}>適用</button>
        </div>
      </div>
      <textarea
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
        style={{ ...S.input, minHeight: 260, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.5 }}
      />
      {error && <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: 4 }}>⚠ {error}</div>}
    </div>
  );
}

// ─── Prompts Table ────────────────────────────────────────────

function PromptsTable({ rows, onToggle, onEdit }: {
  rows: PromptRow[];
  onToggle: (id: string) => void;
  onEdit: (id: string, field: keyof PromptRow, value: string) => void;
}) {
  const selectedCount = rows.filter(r => r.selected).length;
  const thStyle: React.CSSProperties = {
    padding: '5px 8px', textAlign: 'left', fontSize: '0.62rem',
    fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #1f2937',
    whiteSpace: 'nowrap', background: '#0d0d14',
  };
  const tdStyle: React.CSSProperties = {
    padding: '4px 6px', fontSize: '0.72rem', borderBottom: '1px solid #1f2937', verticalAlign: 'top',
  };

  return (
    <div style={S.section}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c9a227' }}>prompts.csv</span>
        <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>選択: {selectedCount} / {rows.length} 件</span>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 6, border: '1px solid #1f2937' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              <th style={thStyle}>✓</th>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>キャラ/オブジェクト</th>
              <th style={thStyle}>variant</th>
              <th style={{ ...thStyle, minWidth: 200 }}>positive_extra</th>
              <th style={thStyle}>seed</th>
              <th style={thStyle}>filename_prefix</th>
              <th style={thStyle}>W</th>
              <th style={thStyle}>H</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} style={{ background: row.selected ? 'rgba(201,162,39,0.04)' : 'transparent' }}>
                <td style={tdStyle}>
                  <input type="checkbox" checked={row.selected} onChange={() => onToggle(row.id)}
                    style={{ accentColor: '#c9a227' }} />
                </td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.65rem' }}>{row.id}</td>
                <td style={tdStyle}>
                  <input
                    value={row.character ?? row.scene ?? row.object ?? ''}
                    onChange={e => onEdit(row.id, 'character', e.target.value)}
                    style={{ ...S.input, width: 90 }}
                  />
                </td>
                <td style={tdStyle}>
                  <input value={row.variant} onChange={e => onEdit(row.id, 'variant', e.target.value)}
                    style={{ ...S.input, width: 100 }} />
                </td>
                <td style={tdStyle}>
                  <input value={row.positive_extra} onChange={e => onEdit(row.id, 'positive_extra', e.target.value)}
                    style={{ ...S.input, width: 240 }} />
                </td>
                <td style={tdStyle}>
                  <input value={row.seed} onChange={e => onEdit(row.id, 'seed', e.target.value)}
                    style={{ ...S.input, width: 50 }} />
                </td>
                <td style={tdStyle}>
                  <input value={row.filename_prefix} onChange={e => onEdit(row.id, 'filename_prefix', e.target.value)}
                    style={{ ...S.input, width: 160 }} />
                </td>
                <td style={tdStyle}>
                  <input value={row.width ?? ''} onChange={e => onEdit(row.id, 'width', e.target.value)}
                    style={{ ...S.input, width: 48 }} placeholder="—" />
                </td>
                <td style={tdStyle}>
                  <input value={row.height ?? ''} onChange={e => onEdit(row.id, 'height', e.target.value)}
                    style={{ ...S.input, width: 48 }} placeholder="—" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Orders Tab (Main) ────────────────────────────────────────

function OrdersTab() {
  const [templateKey, setTemplateKey] = useState<string>('granblue_chara');
  const [template, setTemplate] = useState<BatchTemplate>(DEFAULT_TEMPLATES.granblue_chara);
  const [rows, setRows] = useState<PromptRow[]>([]);
  const [csvText, setCsvText] = useState('');
  const [batchDate, setBatchDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [projectSlug, setProjectSlug] = useState('batch-chara-v1.1');
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key);
    setTemplate({ ...DEFAULT_TEMPLATES[key] });
  };

  const handleCSVLoad = (text: string) => {
    setCsvText(text);
    setRows(parseCSV(text));
  };

  const toggleRow = (id: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));

  const editRow = (id: string, field: keyof PromptRow, value: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const addRow = () => {
    const newId = String(rows.length + 1).padStart(3, '0');
    setRows(prev => [...prev, {
      id: newId, character: '', variant: 'standing_front',
      positive_extra: '', negative_extra: '', seed: '-1',
      filename_prefix: `batch_${newId}`, selected: true,
    }]);
  };

  const exportCSV = () => {
    const csv = rowsToCSV(rows);
    downloadFile(csv, 'prompts.csv');
  };

  const exportTemplate = () => {
    downloadFile(JSON.stringify(template, null, 2), 'template.json', 'application/json');
  };

  const exportBatch = () => {
    const selected = rows.filter(r => r.selected);
    if (selected.length === 0) return;
    const folderName = `${batchDate}_${projectSlug}/${templateKey}`;
    const csv = rowsToCSV(selected);
    const templateJson = JSON.stringify(template, null, 2);
    const report = buildReport(folderName, selected, template);
    downloadFile(csv, `${folderName.replace(/\//g, '_')}_prompts.csv`);
    downloadFile(templateJson, `${folderName.replace(/\//g, '_')}_template.json`, 'application/json');
    downloadFile(report, `${folderName.replace(/\//g, '_')}_report.md`);
  };

  const buildReport = (folder: string, selected: PromptRow[], tpl: BatchTemplate) => {
    const date = new Date().toISOString().slice(0, 10);
    const rows = selected.map(r =>
      `| ${r.id} | ${r.character ?? r.scene ?? r.object ?? '—'} | ${r.variant} | ${r.filename_prefix} |`
    ).join('\n');
    return `# バッチ発注レポート — ${folder}
> 作成日: ${date}

## テンプレート設定
- Model: ${tpl.CHECKPOINT}
- LoRA: ${tpl.LORA.map(l => `${l.name} (${l.weight})`).join(', ') || 'なし'}
- Steps: ${tpl.STEPS} / CFG: ${tpl.CFG} / ${tpl.WIDTH}×${tpl.HEIGHT}

## 発注一覧（選択: ${selected.length} 件）

| ID | キャラ/オブジェクト | variant | filename_prefix |
|----|---------------------|---------|-----------------|
${rows}

## 実行コマンド
\`\`\`bash
python send_batch.py --template template.json --prompts prompts.csv
\`\`\`

## 完了チェックリスト
- [ ] ComfyUI output/ に生成を確認
- [ ] src/assets/ 以下に手動で移動
- [ ] パスを JSON/Firestore に反映
`;
  };

  const selectedCount = rows.filter(r => r.selected).length;

  return (
    <div style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Batch Settings ── */}
      <div style={{ ...S.section, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
        <div>
          <label style={S.label}>発注日</label>
          <input value={batchDate} onChange={e => setBatchDate(e.target.value)} style={S.input} placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <label style={S.label}>プロジェクト名</label>
          <input value={projectSlug} onChange={e => setProjectSlug(e.target.value)} style={S.input} placeholder="batch-chara-v1.1" />
        </div>
        <div>
          <label style={S.label}>テンプレートタイプ</label>
          <select
            value={templateKey}
            onChange={e => handleTemplateChange(e.target.value)}
            style={{ ...S.input, cursor: 'pointer' }}
          >
            {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={S.btn('ghost')} onClick={exportTemplate}>template ↓</button>
        </div>
      </div>

      {/* ── Template JSON Editor ── */}
      <TemplatePanel template={template} onUpdate={setTemplate} />

      {/* ── CSV Controls ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button style={S.btn('ghost')} onClick={() => csvInputRef.current?.click()}>
          📄 CSVを読み込む
        </button>
        <input ref={csvInputRef} type="file" accept=".csv,text/plain" style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = ev => handleCSVLoad(ev.target?.result as string ?? '');
            reader.readAsText(f, 'utf-8');
          }} />
        <button style={S.btn('ghost')} onClick={addRow}>+ 行追加</button>
        {rows.length > 0 && <>
          <button style={S.btn('ghost')} onClick={exportCSV}>prompts.csv ↓</button>
          <button
            style={S.btn(selectedCount > 0 ? 'primary' : 'ghost')}
            onClick={exportBatch}
            disabled={selectedCount === 0}
          >
            ↓ 選択した {selectedCount} 件をエクスポート
          </button>
        </>}
      </div>

      {/* ── CSV Paste Area ── */}
      {rows.length === 0 && (
        <div style={S.section}>
          <label style={S.label}>CSVを直接貼り付ける（またはファイルを読み込む）</label>
          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder={`id,character,variant,positive_extra,negative_extra,seed,filename_prefix,width,height\n001,勇者,standing_front,hero male short brown hair red armor,,-1,chara_hero_standing,,`}
            style={{ ...S.input, minHeight: 120, fontFamily: 'monospace', fontSize: '0.72rem', resize: 'vertical' }}
          />
          <button style={{ ...S.btn('ghost'), marginTop: 6 }} onClick={() => handleCSVLoad(csvText)}>
            CSVを解析
          </button>
        </div>
      )}

      {/* ── Prompts Table ── */}
      {rows.length > 0 && (
        <PromptsTable rows={rows} onToggle={toggleRow} onEdit={editRow} />
      )}

      {/* ── Info Box ── */}
      <div style={{
        background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)',
        borderRadius: 8, padding: '0.75rem', fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.7,
      }}>
        <strong style={{ color: '#60a5fa' }}>使い方</strong>：テンプレートタイプを選択 → prompts.csv に発注内容を記入 → 「エクスポート」で
        <code style={{ background: '#1f2937', padding: '1px 5px', borderRadius: 3, color: '#60a5fa' }}>template.json</code>・
        <code style={{ background: '#1f2937', padding: '1px 5px', borderRadius: 3, color: '#60a5fa' }}>prompts.csv</code>・
        <code style={{ background: '#1f2937', padding: '1px 5px', borderRadius: 3, color: '#60a5fa' }}>report.md</code> をダウンロード →
        ComfyUIが入ったPCで <code style={{ background: '#1f2937', padding: '1px 5px', borderRadius: 3, color: '#60a5fa' }}>send_batch.py</code> を実行
        <br />
        ⚠ <strong style={{ color: '#fbbf24' }}>モデルが異なる場合は必ず別のテンプレートタイプを選択して別エクスポートする</strong>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function ComfyUIStudio() {
  const [tab, setTab] = useState<StudioTab>('orders');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Sub-tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '0 1rem',
        borderBottom: '1px solid var(--color-border)', flexShrink: 0,
        height: 40, background: 'var(--color-bg-medium)',
      }}>
        <button style={S.tab(tab === 'orders')} onClick={() => setTab('orders')}>
          📋 発注管理
        </button>
        <button style={S.tab(tab === 'gemini')} onClick={() => setTab('gemini')}>
          🎨 AI解析
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#4b5563' }}>
          工房 Ver1.1 — CSV+JSON → ComfyUI
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'orders' && <OrdersTab />}
        {tab === 'gemini' && <StudioScreen />}
      </div>
    </div>
  );
}
