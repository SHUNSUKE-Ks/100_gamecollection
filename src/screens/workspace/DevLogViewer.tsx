// ============================================================
// DevLogViewer — 開発ログビューア Ver1.1
// Notion風テーブル + フィルター + MDレポート出力
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Check, X, Plus, ChevronUp, ChevronDown, ChevronsUpDown, FileText } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────

export type LogType = 'code_comment' | 'claude_report';
type ViewTab = 'unchecked' | 'all' | 'checked';
type SortDir = 'asc' | 'desc' | null;

export interface DevLog {
  id: string;
  timestamp: string;       // ISO 8601
  message: string;         // 1行ログ
  files: string[];         // 変更ファイル名
  logType: LogType;        // ログ種別
  comment: string;         // コメント（書き込み用）
  checked: boolean;        // 確認済み
}

// フィルター条件
type FilterField = 'message' | 'files' | 'logType' | 'comment' | 'timestamp';
type FilterOp = 'contains' | 'not_contains' | 'is' | 'is_not';

interface FilterCondition {
  id: string;
  field: FilterField;
  op: FilterOp;
  value: string;
}

// ─── Sample Data ──────────────────────────────────────────────

const INITIAL_LOGS: DevLog[] = [
  {
    id: '1', timestamp: '2026-04-19T14:32:00', checked: false, logType: 'claude_report',
    message: 'CollectionScreen から report/document/studio タブを削除',
    files: ['src/screens/11_Collection/CollectionScreen.tsx'],
    comment: '',
  },
  {
    id: '2', timestamp: '2026-04-19T14:35:00', checked: false, logType: 'claude_report',
    message: 'WorkSpaceScreen に工房タブ追加・ComfyUIStudio 新規作成',
    files: ['src/screens/workspace/WorkSpaceScreen.tsx', 'src/screens/workspace/ComfyUIStudio.tsx'],
    comment: '',
  },
  {
    id: '3', timestamp: '2026-04-19T12:00:00', checked: false, logType: 'claude_report',
    message: 'WorkSpaceDashboard: PM5パネル実装（PmOverview/DevLog/AgentDispatch/RevisionComposer/SkillRegistry）',
    files: ['src/screens/workspace/WorkSpaceDashboard.tsx'],
    comment: '',
  },
  {
    id: '4', timestamp: '2026-04-18T16:00:00', checked: false, logType: 'claude_report',
    message: 'batch_order_v1.1 エージェント一式作成（template.json / prompts.csv / send_batch.py）',
    files: ['04_WorkSpace/ComfyUI用agent資料/batch_order_v1.1/send_batch.py'],
    comment: '',
  },
  {
    id: '5', timestamp: '2026-04-18T10:15:00', checked: false, logType: 'code_comment',
    message: 'PlotNotebook: サイドバーを常時オーバーレイ化（縦型レイアウト対応）',
    files: ['src/parts/collection/story/PlotNotebook.tsx'],
    comment: '',
  },
  {
    id: '6', timestamp: '2026-04-17T15:30:00', checked: false, logType: 'code_comment',
    message: 'AndroidLayout: 縦型固定・ギャラリーカード修正',
    files: ['src/screens/android/AndroidLayout.tsx'],
    comment: '',
  },
  {
    id: '7', timestamp: '2026-04-17T09:00:00', checked: true, logType: 'claude_report',
    message: 'WorkSpaceScreen フルページ追加・発注書スキーマ作成',
    files: ['src/screens/workspace/WorkSpaceScreen.tsx', 'src/0420_WorkSpace/'],
    comment: '完了確認済み',
  },
];

// ─── Constants ───────────────────────────────────────────────

const LOG_TYPE_LABEL: Record<LogType, string> = {
  code_comment: 'コード内コメント',
  claude_report: 'Claudeからの報告',
};

const LOG_TYPE_COLOR: Record<LogType, { bg: string; text: string }> = {
  code_comment:  { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa' },
  claude_report: { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
};

const FIELD_LABEL: Record<FilterField, string> = {
  message: '開発ログ', files: '変更ファイル', logType: 'ログ種別',
  comment: 'コメント', timestamp: '日時',
};
const OP_LABEL: Record<FilterOp, string> = {
  contains: 'を含む', not_contains: 'を含まない', is: 'が', is_not: 'でない',
};

const STORAGE_KEY = 'devlogs_v1';

// ─── Storage ─────────────────────────────────────────────────

function loadLogs(): DevLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_LOGS;
  } catch { return INITIAL_LOGS; }
}

function saveLogs(logs: DevLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// ─── Filter Helpers ───────────────────────────────────────────

function applyFilter(log: DevLog, cond: FilterCondition): boolean {
  let haystack = '';
  if (cond.field === 'message')   haystack = log.message;
  if (cond.field === 'comment')   haystack = log.comment;
  if (cond.field === 'timestamp') haystack = log.timestamp;
  if (cond.field === 'logType')   haystack = LOG_TYPE_LABEL[log.logType];
  if (cond.field === 'files')     haystack = log.files.join(' ');

  const needle = cond.value.toLowerCase();
  const h = haystack.toLowerCase();
  if (cond.op === 'contains')     return h.includes(needle);
  if (cond.op === 'not_contains') return !h.includes(needle);
  if (cond.op === 'is')           return h === needle;
  if (cond.op === 'is_not')       return h !== needle;
  return true;
}

// ─── MD Generator ────────────────────────────────────────────

function generateMD(logs: DevLog[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const targets = logs.filter(l => l.comment.trim());
  if (targets.length === 0) return '# 修正依頼まとめ\n\nコメントのあるログがありません。';

  const entries = targets.map(l => {
    const dt = new Date(l.timestamp).toLocaleString('ja-JP');
    const files = l.files.map(f => `\`${f}\``).join(', ');
    return `## [${dt}] ${l.message}\n\n**ファイル**: ${files || '—'}\n**ログ種別**: ${LOG_TYPE_LABEL[l.logType]}\n**コメント**: ${l.comment}\n`;
  }).join('\n---\n\n');

  return `# 修正依頼まとめ — ${today}\n\n> 生成元: 開発ログビューア WorkSpace\n> 対象: ${targets.length} 件\n\n---\n\n${entries}`;
}

// ─── Sub-components ───────────────────────────────────────────

function CopyBtn({ text, size = 13 }: { text: string; size?: number }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} title="コピー" style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px',
      color: copied ? '#34d399' : '#4b5563', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center',
    }}>
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}

function LogTypeBadge({ type, onChange }: { type: LogType; onChange?: (t: LogType) => void }) {
  const [open, setOpen] = useState(false);
  const c = LOG_TYPE_COLOR[type];
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => onChange && setOpen(o => !o)} style={{
        background: c.bg, color: c.text, border: 'none', borderRadius: 10,
        padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700,
        cursor: onChange ? 'pointer' : 'default', whiteSpace: 'nowrap',
      }}>
        {LOG_TYPE_LABEL[type]}
      </button>
      {open && onChange && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 50,
          background: '#1f2937', border: '1px solid #374151', borderRadius: 6,
          padding: 4, minWidth: 140, marginTop: 2,
        }}>
          {(Object.keys(LOG_TYPE_LABEL) as LogType[]).map(t => (
            <button key={t} onClick={() => { onChange(t); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: t === type ? 'rgba(255,255,255,0.07)' : 'none',
              border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: 4,
              fontSize: '0.72rem', color: LOG_TYPE_COLOR[t].text,
            }}>
              {LOG_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MD Export Modal ─────────────────────────────────────────

function MdModal({ logs, onClose }: { logs: DevLog[]; onClose: () => void }) {
  const md = generateMD(logs);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#111827', border: '1px solid #374151', borderRadius: 10,
        width: 'min(760px, 92vw)', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', borderBottom: '1px solid #1f2937',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c9a227' }}>
            修正依頼まとめ（コメント付きログ）
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <CopyBtn text={md} size={15} />
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2,
            }}>
              <X size={16} />
            </button>
          </div>
        </div>
        {/* body */}
        <pre style={{
          flex: 1, overflowY: 'auto', margin: 0,
          padding: '1rem', fontFamily: 'monospace', fontSize: '0.75rem',
          color: '#d1d5db', lineHeight: 1.7, background: 'transparent',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {md}
        </pre>
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────

function FilterBar({ filters, onAdd, onRemove, onChange }: {
  filters: FilterCondition[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<FilterCondition>) => void;
}) {
  const sel: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid #374151',
    borderRadius: 4, padding: '3px 6px', color: '#d1d5db', fontSize: '0.7rem',
    outline: 'none', cursor: 'pointer',
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border)' }}>
      {filters.map(cond => (
        <div key={cond.id} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#1f2937', border: '1px solid #374151', borderRadius: 6, padding: '2px 6px',
        }}>
          <select value={cond.field} onChange={e => onChange(cond.id, { field: e.target.value as FilterField })} style={sel}>
            {(Object.keys(FIELD_LABEL) as FilterField[]).map(f => (
              <option key={f} value={f}>{FIELD_LABEL[f]}</option>
            ))}
          </select>
          <select value={cond.op} onChange={e => onChange(cond.id, { op: e.target.value as FilterOp })} style={sel}>
            {(Object.keys(OP_LABEL) as FilterOp[]).map(op => (
              <option key={op} value={op}>{OP_LABEL[op]}</option>
            ))}
          </select>
          <input
            value={cond.value}
            onChange={e => onChange(cond.id, { value: e.target.value })}
            style={{ ...sel, width: 100, cursor: 'text' }}
            placeholder="値を入力"
          />
          <button onClick={() => onRemove(cond.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0,
          }}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button onClick={onAdd} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'none', border: '1px dashed #374151', borderRadius: 6,
        padding: '3px 8px', color: '#6b7280', cursor: 'pointer', fontSize: '0.7rem',
      }}>
        <Plus size={11} /> フィルター追加
      </button>
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc')  return <ChevronUp size={11} />;
  if (dir === 'desc') return <ChevronDown size={11} />;
  return <ChevronsUpDown size={11} style={{ opacity: 0.3 }} />;
}

// ─── Main Component ───────────────────────────────────────────

export function DevLogViewer() {
  const [logs, setLogsState]     = useState<DevLog[]>(loadLogs);
  const [viewTab, setViewTab]    = useState<ViewTab>('unchecked');
  const [filters, setFilters]    = useState<FilterCondition[]>([]);
  const [sortCol, setSortCol]    = useState<keyof DevLog | null>('timestamp');
  const [sortDir, setSortDir]    = useState<SortDir>('desc');
  const [showMD, setShowMD]      = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const setLogs = useCallback((fn: (prev: DevLog[]) => DevLog[]) => {
    setLogsState(prev => {
      const next = fn(prev);
      saveLogs(next);
      return next;
    });
  }, []);

  // コメント欄フォーカス
  useEffect(() => {
    if (editingComment && commentRef.current) commentRef.current.focus();
  }, [editingComment]);

  // ── Actions ────────────────────────────────────────────────

  const toggleCheck = (id: string) =>
    setLogs(prev => prev.map(l => l.id === id ? { ...l, checked: !l.checked } : l));

  const updateComment = (id: string, comment: string) =>
    setLogs(prev => prev.map(l => l.id === id ? { ...l, comment } : l));

  const updateLogType = (id: string, logType: LogType) =>
    setLogs(prev => prev.map(l => l.id === id ? { ...l, logType } : l));

  const addLog = () => {
    const id = String(Date.now());
    setLogs(prev => [{
      id, timestamp: new Date().toISOString(),
      message: '新規ログ', files: [], logType: 'code_comment',
      comment: '', checked: false,
    }, ...prev]);
  };

  // ── Filter ─────────────────────────────────────────────────

  const addFilter = () =>
    setFilters(prev => [...prev, { id: String(Date.now()), field: 'message', op: 'contains', value: '' }]);

  const removeFilter = (id: string) =>
    setFilters(prev => prev.filter(f => f.id !== id));

  const updateFilter = (id: string, patch: Partial<FilterCondition>) =>
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  // ── Sort ───────────────────────────────────────────────────

  const handleSort = (col: keyof DevLog) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  // ── Derived list ───────────────────────────────────────────

  const visible = logs
    .filter(l => {
      if (viewTab === 'unchecked') return !l.checked;
      if (viewTab === 'checked')   return l.checked;
      return true;
    })
    .filter(l => filters.every(cond => applyFilter(l, cond)))
    .sort((a, b) => {
      if (!sortCol || !sortDir) return 0;
      const av = String((a as any)[sortCol] ?? '');
      const bv = String((b as any)[sortCol] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const commentedCount = logs.filter(l => l.comment.trim()).length;

  // ── Table header helper ────────────────────────────────────

  const TH = ({ col, label, width }: { col?: keyof DevLog; label: string; width?: number | string }) => (
    <th onClick={() => col && handleSort(col)} style={{
      padding: '6px 8px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700,
      color: sortCol === col ? '#c9a227' : '#6b7280',
      borderBottom: '2px solid #1f2937', background: '#0d0d14',
      whiteSpace: 'nowrap', userSelect: 'none',
      cursor: col ? 'pointer' : 'default',
      width: width ?? 'auto',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {label}
        {col && <SortIcon dir={sortCol === col ? sortDir : null} />}
      </span>
    </th>
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'sans-serif' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px', height: 44, flexShrink: 0,
        background: 'var(--color-bg-medium)', borderBottom: '1px solid var(--color-border)',
      }}>
        {/* View tabs */}
        {(['unchecked', 'all', 'checked'] as ViewTab[]).map(t => {
          const LABEL: Record<ViewTab, string> = { unchecked: '未確認', all: 'すべて', checked: '確認済み' };
          const active = viewTab === t;
          return (
            <button key={t} onClick={() => setViewTab(t)} style={{
              background: active ? 'rgba(201,162,39,0.15)' : 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: active ? 700 : 400,
              color: active ? '#c9a227' : '#6b7280',
              padding: '4px 10px', borderRadius: 6,
              borderBottom: active ? '2px solid #c9a227' : '2px solid transparent',
            }}>
              {LABEL[t]}
              {t === 'unchecked' && (
                <span style={{ marginLeft: 4, background: '#ef4444', color: '#fff', fontSize: '0.58rem', padding: '0 5px', borderRadius: 8, fontWeight: 700 }}>
                  {logs.filter(l => !l.checked).length}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ width: 1, height: 18, background: '#374151', margin: '0 2px' }} />

        <button onClick={addLog} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: '1px solid #374151', borderRadius: 6,
          padding: '3px 8px', color: '#9ca3af', cursor: 'pointer', fontSize: '0.72rem',
        }}>
          <Plus size={12} /> ログ追加
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* MD Export */}
        <button onClick={() => setShowMD(true)} disabled={commentedCount === 0} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: commentedCount > 0 ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${commentedCount > 0 ? 'rgba(201,162,39,0.4)' : '#374151'}`,
          borderRadius: 6, padding: '4px 10px', cursor: commentedCount > 0 ? 'pointer' : 'not-allowed',
          color: commentedCount > 0 ? '#c9a227' : '#4b5563', fontSize: '0.72rem', fontWeight: 600,
        }}>
          <FileText size={13} />
          修正依頼 MD生成
          {commentedCount > 0 && (
            <span style={{ background: '#c9a227', color: '#0d0d12', fontSize: '0.6rem', padding: '0 5px', borderRadius: 8 }}>
              {commentedCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar filters={filters} onAdd={addFilter} onRemove={removeFilter} onChange={updateFilter} />

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: '1fr' }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 220 }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <TH label="確認" />
              <TH col="timestamp" label="日付・時間" />
              <TH col="message" label="開発ログ" />
              <TH col="files" label="変更ファイル" />
              <TH col="logType" label="ログ種別" />
              <TH col="comment" label="コメント" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#4b5563', fontSize: '0.8rem' }}>
                  ログがありません
                </td>
              </tr>
            )}
            {visible.map((log, i) => {
              const isEditing = editingComment === log.id;
              const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)';
              const tdBase: React.CSSProperties = {
                padding: '7px 8px', fontSize: '0.75rem', color: '#d1d5db',
                borderBottom: '1px solid #1f2937', verticalAlign: 'top',
              };

              return (
                <tr key={log.id} style={{ background: rowBg }}>
                  {/* 確認済み */}
                  <td style={{ ...tdBase, textAlign: 'center', verticalAlign: 'middle' }}>
                    <input
                      type="checkbox" checked={log.checked}
                      onChange={() => toggleCheck(log.id)}
                      style={{ accentColor: '#c9a227', cursor: 'pointer', width: 14, height: 14 }}
                    />
                  </td>

                  {/* 日付・時間 */}
                  <td style={{ ...tdBase, color: '#6b7280', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('ja-JP', {
                      month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>

                  {/* 開発ログ */}
                  <td style={{ ...tdBase }}>
                    <span style={{
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: 1.5,
                    }}>
                      {log.message}
                    </span>
                  </td>

                  {/* 変更ファイル */}
                  <td style={{ ...tdBase }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {log.files.map((f, fi) => (
                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                          <code style={{
                            fontSize: '0.62rem', color: '#60a5fa',
                            background: '#1f2937', padding: '1px 4px', borderRadius: 3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1, minWidth: 0,
                          }}>
                            {f.split('/').pop() ?? f}
                          </code>
                          <CopyBtn text={f} size={11} />
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* ログ種別 */}
                  <td style={{ ...tdBase, verticalAlign: 'middle' }}>
                    <LogTypeBadge type={log.logType} onChange={t => updateLogType(log.id, t)} />
                  </td>

                  {/* コメント */}
                  <td style={{ ...tdBase }} onClick={() => !isEditing && setEditingComment(log.id)}>
                    {isEditing ? (
                      <textarea
                        ref={commentRef}
                        value={log.comment}
                        onChange={e => updateComment(log.id, e.target.value)}
                        onBlur={() => setEditingComment(null)}
                        rows={2}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: '#1f2937', border: '1px solid #c9a227',
                          borderRadius: 4, padding: '4px 6px',
                          color: '#d1d5db', fontSize: '0.75rem',
                          resize: 'vertical', outline: 'none', fontFamily: 'sans-serif',
                        }}
                      />
                    ) : (
                      <div style={{
                        minHeight: 28, borderRadius: 4, padding: '2px 4px',
                        cursor: 'text', color: log.comment ? '#d1d5db' : '#374151',
                        fontSize: '0.75rem', lineHeight: 1.5,
                        border: '1px solid transparent',
                        transition: 'border-color 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#374151')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        {log.comment || <span style={{ color: '#2d3748', userSelect: 'none' }}>クリックして記入…</span>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 14px', fontSize: '0.65rem', color: '#4b5563',
        background: 'var(--color-bg-medium)', borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <span>表示: {visible.length} 件 / 全 {logs.length} 件</span>
        <span>コメントあり: {commentedCount} 件</span>
      </div>

      {/* ── MD Modal ── */}
      {showMD && <MdModal logs={logs} onClose={() => setShowMD(false)} />}
    </div>
  );
}
