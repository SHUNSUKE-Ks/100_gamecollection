// ============================================================
// WorkspacePanel — CollectionHeader から開くオーバーレイパネル
// タブ: REPORTS / KNOWLEDGE / DOCUMENTS / SCHEMAS / LOGS / VERSIONS
// KNOWLEDGE タブ: ラジオボタンで「見やすいUI / 素のJSONC」切替
// SCHEMAS タブ: 実データ紐づきの delivery JSON をツリー/Raw表示
// ============================================================

import { useState } from 'react';
import {
  X, FileText, BookOpen, ScrollText,
  GitBranch, FolderOpen, Database, Eye, Code2,
} from 'lucide-react';

type WsTab = 'REPORTS' | 'KNOWLEDGE' | 'DOCUMENTS' | 'SCHEMAS' | 'LOGS' | 'VERSIONS';
type KView  = 'pretty' | 'raw';

// ── Vite glob imports (static strings required) ───────────────

const reportMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/reports/*.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const knowledgeMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/knowledge/*.jsonc',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const documentMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/documents/*.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const schemaMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/schemas/*.json',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

// ルート直下の flat ファイル（既存の dev-log など）
const logRootMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/*.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const logSubMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/logs/*.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const versionMods = import.meta.glob(
  '/src/0420_WorkSpace/00_Report/versions/*.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

// ── Types ─────────────────────────────────────────────────────

type FileExt = 'md' | 'jsonc' | 'json';

interface WsFile {
  key:     string;
  name:    string;
  date:    string;
  content: string;
  ext:     FileExt;
}

// ── Module-level computed file lists ─────────────────────────

function modsToFiles(mods: Record<string, string>, ext: FileExt): WsFile[] {
  return Object.entries(mods)
    .map(([key, content]) => {
      const filename = key.split('/').pop() ?? key;
      const name     = filename.replace(/\.(md|jsonc|json)$/, '');
      const date     = name.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
      return { key, name, date, content, ext };
    })
    .sort((a, b) => (b.date || 'zzz').localeCompare(a.date || 'zzz') || a.name.localeCompare(b.name));
}

const reportFiles   = modsToFiles(reportMods,   'md');
const knowledgeFiles = modsToFiles(knowledgeMods, 'jsonc');
const documentFiles = modsToFiles(documentMods, 'md');
const schemaFiles   = modsToFiles(schemaMods,   'json');
const logFiles      = modsToFiles({ ...logRootMods, ...logSubMods }, 'md');
const versionFiles  = modsToFiles(versionMods,  'md');

// ── Markdown renderer (XSS-safe: local files only) ───────────

function renderMd(src: string): string {
  return src
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm,   '<h3 style="font-size:.88rem;color:#c9a227;margin:.8em 0 .25em;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm,    '<h2 style="font-size:.95rem;color:#e5e7eb;margin:1em 0 .35em;font-weight:700;border-bottom:1px solid #1f2937;padding-bottom:.2em">$1</h2>')
    .replace(/^# (.+)$/gm,     '<h1 style="font-size:1rem;color:#e5e7eb;margin:0 0 .6em;font-weight:800">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#d1d5db;font-weight:600">$1</strong>')
    .replace(/`([^`]+)`/g,     '<code style="background:#1f2937;padding:1px 5px;border-radius:3px;font-size:.78em;color:#60a5fa;font-family:monospace">$1</code>')
    .replace(/^- \[x\] (.+)$/gim, '<div style="color:#34d399;padding:1px 0">✓ $1</div>')
    .replace(/^- \[ \] (.+)$/gim, '<div style="color:#6b7280;padding:1px 0">☐ $1</div>')
    .replace(/^- (.+)$/gm,    '<div style="display:flex;gap:5px;padding:1px 0"><span style="color:#c9a227">•</span><span>$1</span></div>')
    .replace(/^---+$/gm,      '<hr style="border:none;border-top:1px solid #1f2937;margin:.6em 0">')
    .replace(/^>\s(.+)$/gm,   '<blockquote style="border-left:3px solid #374151;padding-left:.6rem;color:#6b7280;margin:.3em 0;font-size:.9em">$1</blockquote>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ── JSONC / JSON parser ───────────────────────────────────────

function parseJsonOrJsonc(text: string, ext: FileExt): any {
  try {
    const stripped = ext === 'jsonc'
      ? text.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
      : text;
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

// ── JsonPrettyView — recursive JSON tree renderer ─────────────

function JsonVal({ v, depth = 0 }: { v: unknown; depth?: number }) {
  if (v === null || v === undefined) {
    return <span style={{ color: '#6b7280' }}>null</span>;
  }
  if (typeof v === 'boolean') {
    return <span style={{ color: '#fbbf24' }}>{String(v)}</span>;
  }
  if (typeof v === 'number') {
    return <span style={{ color: '#34d399' }}>{v}</span>;
  }
  if (typeof v === 'string') {
    return <span style={{ color: '#60a5fa', wordBreak: 'break-all' }}>"{v}"</span>;
  }
  if (Array.isArray(v)) {
    if (v.every(x => typeof x === 'string' || typeof x === 'number')) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
          {(v as (string | number)[]).map((x, i) => (
            <span key={i} style={{
              background: '#1f2937', border: '1px solid #374151',
              borderRadius: 3, padding: '0 5px',
              fontSize: '.68rem', color: '#9ca3af',
            }}>{x}</span>
          ))}
        </div>
      );
    }
    return (
      <div style={{ paddingLeft: '.75rem', borderLeft: '1px solid #374151', marginTop: 2 }}>
        {(v as unknown[]).map((x, i) => (
          <div key={i} style={{ marginBottom: 5 }}>
            <JsonVal v={x} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === 'object') {
    if (depth >= 3) {
      return <span style={{ color: '#4b5563', fontSize: '.68rem' }}>{'{…}'}</span>;
    }
    return (
      <div style={{
        paddingLeft: depth > 0 ? '.75rem' : 0,
        borderLeft:  depth > 0 ? '1px solid #1f2937' : 'none',
      }}>
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => {
          // _readme / _rules / _comment はグレーで小さく表示
          const isMeta = k.startsWith('_');
          return (
            <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 3 }}>
              <span style={{
                color: isMeta ? '#4b5563' : '#c9a227',
                fontWeight: isMeta ? 400 : 700,
                fontSize: isMeta ? '.65rem' : '.72rem',
                flexShrink: 0, minWidth: 72,
                fontStyle: isMeta ? 'italic' : 'normal',
              }}>{k}</span>
              {isMeta
                ? <span style={{ color: '#4b5563', fontSize: '.65rem', fontStyle: 'italic', wordBreak: 'break-all' }}>
                    {typeof val === 'string' ? val : JSON.stringify(val)}
                  </span>
                : <JsonVal v={val} depth={depth + 1} />
              }
            </div>
          );
        })}
      </div>
    );
  }
  return <span style={{ color: '#9ca3af' }}>{String(v)}</span>;
}

function JsonPrettyView({ content, ext }: { content: string; ext: FileExt }) {
  const data = parseJsonOrJsonc(content, ext);
  if (!data) {
    return (
      <div style={{ color: '#ef4444', fontSize: '.8rem', padding: '0.5rem' }}>
        {ext === 'jsonc' ? 'JSONC' : 'JSON'} のパースに失敗しました。
      </div>
    );
  }
  return (
    <div style={{ fontSize: '.78rem', lineHeight: 1.75 }}>
      {Object.entries(data as Record<string, unknown>).map(([section, val]) => {
        const isMeta = section.startsWith('_');
        return (
          <div key={section} style={{ marginBottom: isMeta ? '.5rem' : '1.25rem' }}>
            <div style={{
              fontSize: isMeta ? '.65rem' : '.68rem',
              fontWeight: isMeta ? 400 : 800,
              letterSpacing: isMeta ? '0' : '.08em',
              color: isMeta ? '#4b5563' : '#c9a227',
              textTransform: isMeta ? 'none' : 'uppercase',
              fontStyle: isMeta ? 'italic' : 'normal',
              borderBottom: isMeta ? 'none' : '1px solid rgba(201,162,39,.25)',
              paddingBottom: isMeta ? 0 : '.2rem',
              marginBottom: isMeta ? '.2rem' : '.5rem',
            }}>
              {section}
            </div>
            <JsonVal v={val} depth={0} />
          </div>
        );
      })}
    </div>
  );
}

// ── FileListSidebar ───────────────────────────────────────────

function FileListSidebar({
  files, selectedKey, onSelect,
}: {
  files: WsFile[];
  selectedKey: string | null;
  onSelect: (f: WsFile) => void;
}) {
  if (files.length === 0) {
    return (
      <div style={{ color: '#4b5563', fontSize: '.72rem', padding: '.75rem .5rem', textAlign: 'center' }}>
        ファイルなし
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {files.map(f => {
        const active = f.key === selectedKey;
        return (
          <button
            key={f.key}
            onClick={() => onSelect(f)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '.4rem .6rem',
              background: active ? 'rgba(201,162,39,.12)' : 'transparent',
              border: 'none',
              borderLeft: `3px solid ${active ? '#c9a227' : 'transparent'}`,
              borderRadius: '0 4px 4px 0',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{
              fontSize: '.68rem', fontWeight: active ? 700 : 400,
              color: active ? '#c9a227' : '#9ca3af',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 108,
            }}>
              {f.name}
            </span>
            {f.date && (
              <span style={{ fontSize: '.58rem', color: '#4b5563' }}>{f.date}</span>
            )}
            <span style={{
              fontSize: '.55rem', color: '#374151', marginTop: 1,
              background: '#1f2937', borderRadius: 2, padding: '0 3px',
            }}>
              .{f.ext}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Content Header badge ──────────────────────────────────────

function ContentHeader({ file, accent }: { file: WsFile; accent: string }) {
  const iconMap: Record<FileExt, React.ReactNode> = {
    md:    <FileText size={11} color={accent} />,
    jsonc: <Code2    size={11} color={accent} />,
    json:  <Database size={11} color={accent} />,
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '.4rem',
      marginBottom: '.75rem',
      padding: '.35rem .6rem',
      background: `${accent}10`,
      border: `1px solid ${accent}30`,
      borderRadius: 5,
    }}>
      {iconMap[file.ext]}
      <span style={{ fontSize: '.68rem', color: accent, fontWeight: 600 }}>
        {file.name}.{file.ext}
      </span>
      {file.date && (
        <span style={{ fontSize: '.62rem', color: '#6b7280', marginLeft: 'auto' }}>
          {file.date}
        </span>
      )}
    </div>
  );
}

// ── WorkspacePanel (main export) ─────────────────────────────

interface WorkspacePanelProps {
  onClose: () => void;
}

export function WorkspacePanel({ onClose }: WorkspacePanelProps) {
  const [wsTab, setWsTab] = useState<WsTab>('REPORTS');
  const [kView, setKView] = useState<KView>('pretty');

  const allFiles: Record<WsTab, WsFile[]> = {
    REPORTS:   reportFiles,
    KNOWLEDGE: knowledgeFiles,
    DOCUMENTS: documentFiles,
    SCHEMAS:   schemaFiles,
    LOGS:      logFiles,
    VERSIONS:  versionFiles,
  };

  const [selectedKeys, setSelectedKeys] = useState<Record<WsTab, string | null>>({
    REPORTS:   reportFiles[0]?.key    ?? null,
    KNOWLEDGE: knowledgeFiles[0]?.key ?? null,
    DOCUMENTS: documentFiles[0]?.key  ?? null,
    SCHEMAS:   schemaFiles[0]?.key    ?? null,
    LOGS:      logFiles[0]?.key       ?? null,
    VERSIONS:  versionFiles[0]?.key   ?? null,
  });

  const files       = allFiles[wsTab];
  const selKey      = selectedKeys[wsTab];
  const currentFile = files.find(f => f.key === selKey) ?? files[0] ?? null;

  function selectFile(f: WsFile) {
    setSelectedKeys(prev => ({ ...prev, [wsTab]: f.key }));
  }

  // JSON/JSONC タブで Pretty/Raw を使えるかどうか
  const showViewToggle = wsTab === 'KNOWLEDGE' || wsTab === 'SCHEMAS';

  const tabs: { id: WsTab; Icon: React.ElementType; label: string }[] = [
    { id: 'REPORTS',   Icon: FileText,   label: 'REPORTS' },
    { id: 'KNOWLEDGE', Icon: BookOpen,   label: 'KNOWLEDGE' },
    { id: 'DOCUMENTS', Icon: FolderOpen, label: 'DOCUMENTS' },
    { id: 'SCHEMAS',   Icon: Database,   label: 'SCHEMAS' },
    { id: 'LOGS',      Icon: ScrollText, label: 'LOGS' },
    { id: 'VERSIONS',  Icon: GitBranch,  label: 'VERSIONS' },
  ];

  // タブ色
  const tabAccent: Record<WsTab, string> = {
    REPORTS:   '#c9a227',
    KNOWLEDGE: '#34d399',
    DOCUMENTS: '#60a5fa',
    SCHEMAS:   '#a78bfa',
    LOGS:      '#9ca3af',
    VERSIONS:  '#f97316',
  };
  const accent = tabAccent[wsTab];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.35)',
          zIndex: 299,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(460px, 94vw)',
        background: 'var(--color-bg-dark, #111827)',
        borderLeft: '1px solid var(--color-border, #1f2937)',
        display: 'flex', flexDirection: 'column',
        zIndex: 300,
        boxShadow: '-4px 0 32px rgba(0,0,0,.55)',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.5rem',
          padding: '.6rem .875rem',
          borderBottom: '1px solid var(--color-border, #1f2937)',
          background: 'var(--color-bg-medium, #1f2937)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '.9rem' }}>🗂</span>
          <span style={{
            fontWeight: 800, fontSize: '.82rem',
            color: '#e5e7eb', flex: 1, letterSpacing: '.06em',
          }}>
            WorkSpace
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: '#6b7280',
              display: 'flex', alignItems: 'center', borderRadius: 4,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Tab Bar (scroll if needed) ── */}
        <div style={{
          display: 'flex', overflowX: 'auto',
          borderBottom: '1px solid var(--color-border, #1f2937)',
          background: 'var(--color-bg-medium, #1f2937)',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {tabs.map(({ id, Icon, label }) => {
            const active = wsTab === id;
            const color  = tabAccent[id];
            return (
              <button
                key={id}
                onClick={() => setWsTab(id)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  padding: '.4rem .65rem',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${active ? color : 'transparent'}`,
                  color: active ? color : '#6b7280',
                  fontSize: '.6rem', fontWeight: active ? 700 : 400,
                  cursor: 'pointer', letterSpacing: '.04em',
                  transition: 'color .15s, border-color .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={10} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── View-mode radio (KNOWLEDGE / SCHEMAS) ── */}
        {showViewToggle && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '.32rem .875rem',
            borderBottom: '1px solid var(--color-border, #1f2937)',
            background: `${accent}08`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '.64rem', color: '#6b7280' }}>表示:</span>
            {([
              ['pretty', Eye,   '見やすいUI'],
              ['raw',    Code2, '素のテキスト'],
            ] as const).map(([val, IconComp, labelText]) => (
              <label
                key={val}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  cursor: 'pointer', fontSize: '.68rem',
                  color: kView === val ? accent : '#6b7280',
                  fontWeight: kView === val ? 700 : 400,
                }}
              >
                <input
                  type="radio"
                  name="kview"
                  value={val}
                  checked={kView === val}
                  onChange={() => setKView(val)}
                  style={{ accentColor: accent, cursor: 'pointer' }}
                />
                <IconComp size={11} />
                {labelText}
              </label>
            ))}
          </div>
        )}

        {/* ── Body: Sidebar + Content ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* File list sidebar */}
          <div style={{
            width: 130, flexShrink: 0,
            borderRight: '1px solid var(--color-border, #1f2937)',
            overflowY: 'auto',
            padding: '.5rem 0',
            background: 'rgba(0,0,0,.18)',
          }}>
            <FileListSidebar
              files={files}
              selectedKey={currentFile?.key ?? null}
              onSelect={selectFile}
            />
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '.875rem 1rem' }}>
            {!currentFile ? (
              <div style={{
                color: '#4b5563', fontSize: '.8rem',
                textAlign: 'center', marginTop: '3rem',
              }}>
                {files.length === 0
                  ? `${wsTab} にファイルがありません`
                  : 'ファイルを選択してください'}
              </div>

            ) : currentFile.ext === 'md' ? (
              /* ── Markdown viewer ── */
              <>
                <ContentHeader file={currentFile} accent={accent} />
                <div
                  style={{ fontSize: '.8rem', color: '#9ca3af', lineHeight: 1.85, letterSpacing: '.01em' }}
                  dangerouslySetInnerHTML={{ __html: renderMd(currentFile.content) }}
                />
              </>

            ) : showViewToggle && kView === 'raw' ? (
              /* ── Raw text viewer (JSONC / JSON) ── */
              <>
                <ContentHeader file={currentFile} accent={accent} />
                <pre style={{
                  fontFamily: 'monospace', fontSize: '.68rem', color: '#9ca3af',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.7,
                  background: '#0f172a', padding: '.75rem', borderRadius: 6,
                  border: '1px solid #1f2937', margin: 0,
                }}>
                  {currentFile.content}
                </pre>
              </>

            ) : (
              /* ── Pretty viewer (JSONC / JSON) ── */
              <>
                <ContentHeader file={currentFile} accent={accent} />
                <JsonPrettyView content={currentFile.content} ext={currentFile.ext} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
