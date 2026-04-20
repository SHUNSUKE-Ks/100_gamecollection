// ============================================================
// WorkSpaceDashboard — 5パネル PM ダッシュボード
// SVG レイアウト仕様に基づく実装
// ============================================================

import { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────

type Priority  = 'P0' | 'P1' | 'P2';
type LogLevel  = 'ERROR' | 'WARN' | 'OK';
type AgentKey  = 'code' | 'review' | 'doc' | 'test';
type AgentStatus = 'Active' | 'Planned' | 'Idea';
type SkillStatus = 'Live' | 'Planned' | 'Idea';

interface PhaseProgress { label: string; pct: number; }
interface TodayTask    { priority: Priority; text: string; agent: AgentKey; }
interface LogEntry     { level: LogLevel; time: string; file: string; message: string; }
interface KanbanCard   { priority: Priority; text: string; }
interface AgentRoster  { key: AgentKey; initial: string; name: string; role: string; status: AgentStatus; }
interface SkillRow     { name: string; status: SkillStatus; use: string; owner: string; }

// ─── Color helpers ─────────────────────────────────────────

const PRIORITY_COLOR: Record<Priority, { bg: string; text: string; border: string }> = {
  P0: { bg: 'rgba(226,75,74,0.15)',   text: '#f87171', border: '#f87171' },
  P1: { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', border: '#fbbf24' },
  P2: { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa', border: '#60a5fa' },
};

const LOG_COLOR: Record<LogLevel, { accent: string; bg: string; badge: string; badgeText: string }> = {
  ERROR: { accent: '#ef4444', bg: 'rgba(239,68,68,0.08)',   badge: 'rgba(239,68,68,0.15)',   badgeText: '#f87171' },
  WARN:  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  badge: 'rgba(245,158,11,0.15)',  badgeText: '#fbbf24' },
  OK:    { accent: '#10b981', bg: 'rgba(16,185,129,0.08)',  badge: 'rgba(16,185,129,0.15)',  badgeText: '#34d399' },
};

const AGENT_COLOR: Record<AgentKey, { bg: string; text: string; initial: string }> = {
  code:   { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa',  initial: '#93c5fd' },
  review: { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa',  initial: '#c4b5fd' },
  doc:    { bg: 'rgba(52,211,153,0.15)',  text: '#34d399',  initial: '#6ee7b7' },
  test:   { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24',  initial: '#fde68a' },
};

const STATUS_COLOR: Record<AgentStatus | SkillStatus, { bg: string; text: string }> = {
  Active:  { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  Live:    { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  Planned: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  Idea:    { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
};

// ─── Static data (PM_*.md から将来的に自動取得予定) ─────────

const SPRINT_PCT    = 48;
const OPEN_ISSUES   = 14;
const PENDING_COUNT = 5;

const PHASES: PhaseProgress[] = [
  { label: 'Collection UI',   pct: 75 },
  { label: 'Novel Engine',    pct: 60 },
  { label: 'Battle System',   pct: 30 },
  { label: 'Android Layout',  pct: 72 },
  { label: 'Asset / 素材',    pct: 18 },
];

const TODAY_TASKS: TodayTask[] = [
  { priority: 'P0', text: 'WorkSpace Dashboard 実装',  agent: 'code'   },
  { priority: 'P1', text: '発注書スキーマ確認・修正',    agent: 'doc'    },
  { priority: 'P2', text: 'PM_2026-04-18.md 更新',    agent: 'doc'    },
];

const LOG_ENTRIES: LogEntry[] = [
  { level: 'ERROR', time: '14:32', file: 'WorkSpaceScreen.tsx:46', message: 'Table regex: unexpected block match on empty row' },
  { level: 'WARN',  time: '13:15', file: 'AndroidLayout.tsx:202',  message: 'schema field mismatch — episodes[] expected' },
  { level: 'OK',    time: '12:00', file: 'vite build',             message: 'Build v0.8.4 completed — 0 errors, 1 warning' },
];

const KANBAN: Record<string, KanbanCard[]> = {
  Inbox:         [{ priority: 'P0', text: 'Dashboard 実装' }, { priority: 'P1', text: '発注書確認' }],
  'Code Agent':  [{ priority: 'P0', text: 'WorkSpaceScreen' }],
  'Review Agent':[{ priority: 'P1', text: 'PR #schema-split' }],
  'Doc Agent':   [],
};

const AGENTS: AgentRoster[] = [
  { key: 'code',   initial: 'C', name: 'Code Agent',   role: '実装・バグ修正・リファクタ', status: 'Active'  },
  { key: 'review', initial: 'R', name: 'Review Agent', role: 'PRレビュー・品質チェック',    status: 'Active'  },
  { key: 'doc',    initial: 'D', name: 'Doc Agent',    role: '仕様書・MD更新・発注書',      status: 'Planned' },
  { key: 'test',   initial: 'T', name: 'Test Agent',   role: 'テスト生成・実行',             status: 'Idea'    },
];

const SKILLS: SkillRow[] = [
  { name: 'notion-inbox',         status: 'Live',    use: 'タスク保存',       owner: 'PM'           },
  { name: 'layout-anatomy-game',  status: 'Live',    use: '設計書生成',       owner: 'Doc Agent'    },
  { name: 'pptx / pdf 出力',      status: 'Live',    use: 'ドキュメント出力', owner: 'Doc Agent'    },
  { name: 'dev-log-parser',       status: 'Planned', use: 'ログ→優先度変換',  owner: 'Orchestrator' },
  { name: 'revision-request-gen', status: 'Planned', use: '依頼書自動生成',   owner: 'Orchestrator' },
  { name: 'test-gen',             status: 'Idea',    use: 'テスト自動生成',   owner: 'Test Agent'   },
];

// ─── Sub-components ────────────────────────────────────────

const panelHeader = (label: string, color: string) => (
  <div style={{
    padding: '0.55rem 0.875rem',
    background: color,
    borderRadius: '8px 8px 0 0',
    fontSize: '0.78rem', fontWeight: 700,
    color: '#f3f4f6', letterSpacing: '0.03em',
  }}>
    {label}
  </div>
);

const panel = (header: React.ReactElement, border: string, children: React.ReactNode) => (
  <div style={{
    border: `1px solid ${border}`,
    borderRadius: 10, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    background: 'var(--color-bg-medium)',
  }}>
    {header}
    <div style={{ padding: '0.875rem', flex: 1, overflowY: 'auto' }}>
      {children}
    </div>
  </div>
);

// ① PM Overview
function PmOverview() {
  const pctColor = (p: number) => p >= 70 ? '#34d399' : p >= 45 ? '#c9a227' : '#ef4444';
  return panel(
    panelHeader('① PM Overview', '#4c3d9e'),
    '#6d5cd4',
    <>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Sprint', value: `${SPRINT_PCT}%`, color: pctColor(SPRINT_PCT) },
          { label: 'Open Issues', value: String(OPEN_ISSUES), color: '#f87171' },
          { label: 'Pending', value: String(PENDING_COUNT), color: '#fbbf24' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 6,
            padding: '0.5rem 0.625rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '0.62rem', color: '#6b7280', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Phase progress */}
      <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Phase progress
      </div>
      {PHASES.map(ph => (
        <div key={ph.label} style={{ marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{ph.label}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: pctColor(ph.pct) }}>{ph.pct}%</span>
          </div>
          <div style={{ height: 4, background: '#1f2937', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${ph.pct}%`, background: pctColor(ph.pct), borderRadius: 2 }} />
          </div>
        </div>
      ))}

      {/* Today's tasks */}
      <div style={{ fontSize: '0.65rem', color: '#6b7280', margin: '0.75rem 0 0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Today's tasks
      </div>
      {TODAY_TASKS.map((t, i) => {
        const pc = PRIORITY_COLOR[t.priority];
        const ac = AGENT_COLOR[t.agent];
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px',
              borderRadius: 10, background: pc.bg, color: pc.text, border: `1px solid ${pc.border}44`,
              flexShrink: 0,
            }}>{t.priority}</span>
            <span style={{ flex: 1, fontSize: '0.75rem', color: '#d1d5db' }}>{t.text}</span>
            <span style={{
              fontSize: '0.6rem', padding: '1px 6px', borderRadius: 8,
              background: ac.bg, color: ac.text, flexShrink: 0,
            }}>{AGENTS.find(a => a.key === t.agent)?.name}</span>
          </div>
        );
      })}
    </>
  );
}

// ② Dev Log Viewer
function DevLogViewer() {
  const [filter, setFilter] = useState<'ALL' | LogLevel>('ALL');
  const [creating, setCreating] = useState<number | null>(null);
  const filtered = LOG_ENTRIES.filter(e => filter === 'ALL' || e.level === filter);

  return panel(
    panelHeader('② Dev Log Viewer', '#1a6b54'),
    '#2a9e7d',
    <>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.625rem' }}>
        {(['ALL', 'ERROR', 'WARN', 'OK'] as const).map(lv => (
          <button key={lv} onClick={() => setFilter(lv)} style={{
            padding: '2px 8px', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.65rem', fontWeight: filter === lv ? 700 : 400, border: 'none',
            background: filter === lv
              ? lv === 'ALL' ? '#374151' : LOG_COLOR[lv as LogLevel].badge
              : 'rgba(255,255,255,0.05)',
            color: filter === lv
              ? lv === 'ALL' ? '#e5e7eb' : LOG_COLOR[lv as LogLevel].badgeText
              : '#6b7280',
          }}>{lv}</button>
        ))}
      </div>

      {/* Log entries */}
      {filtered.map((entry, i) => {
        const lc = LOG_COLOR[entry.level];
        return (
          <div key={i} style={{
            marginBottom: '0.5rem', borderRadius: 6, overflow: 'hidden',
            border: `1px solid ${lc.accent}33`,
            background: lc.bg,
          }}>
            <div style={{ display: 'flex', borderLeft: `2px solid ${lc.accent}` }}>
              <div style={{ flex: 1, padding: '0.4rem 0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 2 }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 8,
                    background: lc.badge, color: lc.badgeText,
                  }}>{entry.level}</span>
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{entry.time}</span>
                  <code style={{ fontSize: '0.62rem', color: '#60a5fa' }}>{entry.file}</code>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#d1d5db' }}>{entry.message}</div>
              </div>
            </div>
            {entry.level !== 'OK' && (
              <div style={{ padding: '0 0.6rem 0.4rem' }}>
                <button
                  onClick={() => setCreating(creating === i ? null : i)}
                  style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: 5, cursor: 'pointer',
                    background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                    color: '#34d399',
                  }}
                >
                  修正依頼を作成 ↗
                </button>
                {creating === i && (
                  <div style={{
                    marginTop: '0.4rem', padding: '0.4rem', borderRadius: 4,
                    background: 'rgba(255,255,255,0.03)', fontSize: '0.68rem', color: '#9ca3af',
                  }}>
                    📋 <code style={{ color: '#60a5fa' }}>{entry.file}</code> の修正依頼書を生成中…
                    <br /><span style={{ color: '#34d399' }}>→ ④ Revision Composer に転送しました</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ③ Agent Dispatch Board
function AgentDispatchBoard() {
  const cols = Object.keys(KANBAN);
  return panel(
    panelHeader('③ Agent Dispatch Board', '#1a4a7a'),
    '#2a6fba',
    <>
      {/* Kanban columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
        gap: '0.625rem',
        marginBottom: '1rem',
      }}>
        {cols.map(col => (
          <div key={col} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 6, padding: '0.5rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.4rem' }}>
              {col}
            </div>
            {KANBAN[col].length === 0
              ? <div style={{ fontSize: '0.65rem', color: '#374151', textAlign: 'center', padding: '0.5rem 0' }}>空き</div>
              : KANBAN[col].map((card, i) => {
                  const pc = PRIORITY_COLOR[card.priority];
                  return (
                    <div key={i} style={{
                      marginBottom: '0.35rem', padding: '0.35rem 0.5rem',
                      background: 'rgba(255,255,255,0.06)', borderRadius: 4,
                      border: `1px solid rgba(255,255,255,0.08)`,
                    }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 700, padding: '1px 4px', borderRadius: 8,
                        background: pc.bg, color: pc.text, marginRight: 5,
                      }}>{card.priority}</span>
                      <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>{card.text}</span>
                    </div>
                  );
                })
            }
          </div>
        ))}
      </div>

      {/* Agent roster */}
      <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Agent roster
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
        {AGENTS.map(ag => {
          const ac = AGENT_COLOR[ag.key];
          const sc = STATUS_COLOR[ag.status];
          return (
            <div key={ag.key} style={{
              padding: '0.5rem', borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: ac.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: ac.initial, flexShrink: 0,
                }}>{ag.initial}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#d1d5db' }}>{ag.name}</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: '#6b7280', marginBottom: 4 }}>{ag.role}</div>
              <span style={{
                fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                background: sc.bg, color: sc.text,
              }}>{ag.status}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ④ Revision Request Composer
function RevisionComposer() {
  const [file, setFile]   = useState('');
  const [prio, setPrio]   = useState<Priority>('P1');
  const [desc, setDesc]   = useState('');
  const [agent, setAgent] = useState<AgentKey>('code');
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    if (!file.trim() || !desc.trim()) return;
    setGenerated(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(250,199,117,0.3)',
    borderRadius: 5, padding: '0.4rem 0.5rem',
    color: '#d1d5db', fontSize: '0.78rem', outline: 'none',
  };

  return panel(
    panelHeader('④ Revision Request Composer', '#7a5010'),
    '#ba7517',
    <>
      {generated ? (
        <div style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 6, padding: '0.75rem',
        }}>
          <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, marginBottom: '0.4rem' }}>
            ✓ 修正依頼書を生成しました
          </div>
          <code style={{ fontSize: '0.65rem', color: '#60a5fa', display: 'block', marginBottom: '0.5rem' }}>
            docs_workspace/修正依頼_{file.replace(/\.tsx$/, '')}_[{prio}].md
          </code>
          <pre style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 4, padding: '0.5rem',
            fontSize: '0.65rem', color: '#9ca3af', overflowX: 'auto',
            margin: 0, whiteSpace: 'pre-wrap',
          }}>{`# 修正依頼 — ${file} [${prio}]
> 担当: ${AGENTS.find(a=>a.key===agent)?.name}

## 問題
${desc}

## 完了の定義
- [ ] 問題を修正
- [ ] ビルドエラーなし確認`}</pre>
          <button onClick={() => setGenerated(false)} style={{
            marginTop: '0.5rem', fontSize: '0.68rem', padding: '3px 10px',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5, cursor: 'pointer', color: '#9ca3af',
          }}>新規作成</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block', marginBottom: 3 }}>対象ファイル</label>
              <input
                value={file} onChange={e => setFile(e.target.value)}
                placeholder="BattleScreen.tsx"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block', marginBottom: 3 }}>優先度</label>
              <select value={prio} onChange={e => setPrio(e.target.value as Priority)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="P0">P0 — Critical</option>
                <option value="P1">P1 — High</option>
                <option value="P2">P2 — Normal</option>
              </select>
            </div>
          </div>

          <label style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block', marginBottom: 3 }}>問題の説明</label>
          <textarea
            value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="問題の詳細を入力…"
            rows={3}
            style={{ ...inputStyle, resize: 'none', fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: '0.5rem' }}
          />

          <label style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block', marginBottom: '0.35rem' }}>振り分け先 Agent</label>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {AGENTS.filter(a => a.status !== 'Idea').map(ag => {
              const ac = AGENT_COLOR[ag.key];
              const sel = agent === ag.key;
              return (
                <label key={ag.key} style={{
                  display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                  fontSize: '0.72rem',
                  color: sel ? ac.text : '#6b7280',
                }}>
                  <input type="radio" name="agent" value={ag.key} checked={sel}
                    onChange={() => setAgent(ag.key)}
                    style={{ accentColor: ac.text }}
                  />
                  {ag.name}
                </label>
              );
            })}
          </div>

          <button
            onClick={generate}
            disabled={!file.trim() || !desc.trim()}
            style={{
              width: '100%', padding: '0.5rem',
              background: file.trim() && desc.trim() ? '#c9a227' : '#1f2937',
              border: 'none', borderRadius: 6, cursor: file.trim() && desc.trim() ? 'pointer' : 'not-allowed',
              color: file.trim() && desc.trim() ? '#0d0d12' : '#4b5563',
              fontSize: '0.8rem', fontWeight: 700,
            }}
          >
            修正依頼書を生成 ↗
          </button>
        </>
      )}
    </>
  );
}

// ⑤ Skill & Agent Registry
function SkillRegistry() {
  return panel(
    panelHeader('⑤ Skill & Agent Registry', '#3a3830'),
    '#605e58',
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Skill', '状態', '用途', 'Owner'].map(h => (
              <th key={h} style={{
                padding: '0.3rem 0.5rem', textAlign: 'left',
                fontSize: '0.62rem', fontWeight: 700, color: '#6b7280',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SKILLS.map((s, i) => {
            const sc = STATUS_COLOR[s.status];
            return (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '0.35rem 0.5rem' }}>
                  <code style={{ fontSize: '0.68rem', color: '#60a5fa' }}>{s.name}</code>
                </td>
                <td style={{ padding: '0.35rem 0.5rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                    background: sc.bg, color: sc.text,
                  }}>{s.status}</span>
                </td>
                <td style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}>{s.use}</td>
                <td style={{ padding: '0.35rem 0.5rem', fontSize: '0.68rem', color: '#6b7280' }}>{s.owner}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Dashboard Component ───────────────────────────────

export function WorkSpaceDashboard() {
  return (
    <div style={{
      padding: '1rem 1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.875rem',
      maxWidth: 1100, margin: '0 auto',
    }}>
      {/* Row 1: ① PM Overview | ② Dev Log Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <PmOverview />
        <DevLogViewer />
      </div>

      {/* Row 2: ③ Agent Dispatch Board (フル幅) */}
      <AgentDispatchBoard />

      {/* Row 3: ④ Revision Request | ⑤ Skill Registry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <RevisionComposer />
        <SkillRegistry />
      </div>
    </div>
  );
}
