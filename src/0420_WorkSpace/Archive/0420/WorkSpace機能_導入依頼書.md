# WorkSpace 機能 — 他プロジェクト導入依頼書

> 作成日: 2026-04-18  
> 対象: Vite + React + TypeScript + Zustand で構成されたプロジェクト  
> 目的: プロジェクトルートの `.md` ファイルをアプリ内でブラウザ表示する WorkSpace 機能を導入する

---

## この機能でできること

- プロジェクトルートの指定フォルダ内の `.md` ファイルを、アプリを開いたままブラウザで読める
- PM ダッシュボード・発注書・仕様書・チェックリストなどをゲーム内から参照できる
- `[progress:75]` と書くだけで進捗バーが表示される
- Markdown のテーブル・チェックボックス・見出しを自動レンダリング
- `PM_` から始まるファイルはサイドバー先頭にピン留め表示される

---

## 前提条件

| 項目 | 必須バージョン |
|---|---|
| Vite | 5.x 以上（`import.meta.glob` が必須） |
| React | 18.x 以上 |
| TypeScript | 5.x 以上 |
| Zustand | 4.x 以上（画面遷移ストアに使用） |
| lucide-react | 任意（アイコン。なければ文字で代替可） |

---

## 完成後のファイル構成

```
プロジェクトルート/
├── docs_workspace/          ← MDファイルを置くフォルダ（名前は変更可）
│   ├── PM_2026-04-18.md     ← PM_プレフィックスで先頭ピン
│   ├── 仕様書.md
│   └── チェックリスト.md
│
└── src/
    ├── core/types/
    │   └── screen.ts        ← ScreenType に 'WORKSPACE' を追加
    │
    ├── screens/
    │   └── workspace/
    │       └── WorkSpaceScreen.tsx   ← フルページビューア（新規作成）
    │
    └── App.tsx              ← case 'WORKSPACE' を追加
```

---

## 実装手順

### Step 1 — MDファイル用フォルダを作成

プロジェクトルートに MDファイルを置くフォルダを作成します。

```
mkdir docs_workspace
```

> フォルダ名は何でも構いません。後述の `import.meta.glob` パスと合わせてください。

---

### Step 2 — ScreenType に `WORKSPACE` を追加

画面遷移の型定義に `'WORKSPACE'` を追加します。

**変更前:**
```typescript
// src/core/types/screen.ts（または同等ファイル）
export type ScreenType = 'TITLE' | 'HOME' | 'COLLECTION' | ... ;
```

**変更後:**
```typescript
export type ScreenType = 'TITLE' | 'HOME' | 'COLLECTION' | ... | 'WORKSPACE';
```

---

### Step 3 — WorkSpaceScreen.tsx を作成

`src/screens/workspace/WorkSpaceScreen.tsx` を新規作成します。  
以下のコードをそのままコピーし、**2箇所だけカスタマイズ**してください。

```typescript
// ============================================================
// WorkSpaceScreen — フルページ MDビューア
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/core/stores/gameStore'; // ★ プロジェクトに合わせて変更

// ─── ★ カスタマイズ箇所 1: MDファイルのフォルダパス ─────────
// '/docs_workspace/' の部分を実際のフォルダ名に変更してください
const rawModules = import.meta.glob('/docs_workspace/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// ─── Types ─────────────────────────────────────────────────

interface MdFile {
  key: string;
  name: string;
  date: string;
  content: string;
  isPM: boolean;
}

// ─── Helpers ───────────────────────────────────────────────

function parseFiles(): MdFile[] {
  return Object.entries(rawModules)
    .map(([key, content]) => {
      const filename  = key.split('/').pop() ?? key;
      const name      = filename.replace(/\.md$/, '');
      const dateMatch = name.match(/(\d{4}-\d{2}-\d{2})/);
      const isPM      = name.startsWith('PM_');
      return { key, name, date: dateMatch?.[1] ?? '', content, isPM };
    })
    .sort((a, b) => {
      if (a.isPM !== b.isPM) return a.isPM ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
}

function prettifyName(name: string): string {
  return name
    .replace(/^PM_/, '')
    .replace(/_(\d{4}-\d{2}-\d{2})$/, '')
    .replace(/_/g, ' ');
}

function renderMd(src: string): string {
  let out = src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // テーブル
  out = out.replace(/((?:\|[^\n]+\|\n?)+)/g, (block) => {
    const rows   = block.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return block;
    const isSep  = (r: string) => /^\|[-| :]+\|$/.test(r.trim());
    const sepIdx = rows.findIndex(isSep);
    const hasH   = sepIdx === 1;
    const thS    = 'padding:7px 14px;text-align:left;font-size:0.73rem;font-weight:700;color:#9ca3af;border-bottom:2px solid #374151;background:#0d0d14;white-space:nowrap';
    const tdS    = 'padding:7px 14px;font-size:0.8rem;color:#d1d5db;border-bottom:1px solid #1f2937;vertical-align:top';
    const parse  = (row: string, tag: 'th' | 'td') =>
      `<tr>${row.split('|').slice(1, -1).map(c => `<${tag} style="${tag==='th'?thS:tdS}">${c.trim()}</${tag}>`).join('')}</tr>`;
    const trs = rows.filter((_, i) => !isSep(rows[i])).map((r, i) => parse(r, hasH && i === 0 ? 'th' : 'td')).join('');
    return `<div style="overflow-x:auto;margin:0.75em 0"><table style="width:100%;border-collapse:collapse;border:1px solid #1f2937;border-radius:8px;overflow:hidden">${trs}</table></div>`;
  });

  // プログレスバー: [progress:75]
  out = out.replace(/\[progress:(\d+)\]/g, (_, pct) => {
    const n     = Math.min(100, Math.max(0, parseInt(pct)));
    const color = n >= 80 ? '#34d399' : n >= 60 ? '#c9a227' : n >= 35 ? '#f59e0b' : '#ef4444';
    const bg    = n >= 80 ? 'rgba(52,211,153,0.12)' : n >= 60 ? 'rgba(201,162,39,0.1)' : n >= 35 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
    return `<div style="display:flex;align-items:center;gap:10px;margin:6px 0;padding:8px 12px;background:${bg};border-radius:8px;border:1px solid ${color}33"><div style="flex:1;height:10px;background:#1f2937;border-radius:5px;overflow:hidden"><div style="height:100%;width:${n}%;background:${color};border-radius:5px"></div></div><span style="font-size:0.82rem;font-weight:700;color:${color};min-width:40px;text-align:right">${n}%</span></div>`;
  });

  // 見出し
  out = out
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.88rem;color:#c9a227;margin:1.2em 0 0.35em;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1rem;color:#e5e7eb;margin:1.6em 0 0.5em;font-weight:700;border-bottom:1px solid #1f2937;padding-bottom:0.3em">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.25rem;color:#f3f4f6;margin:0 0 0.2em;font-weight:700">$1</h1>');

  // インライン装飾
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e5e7eb;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em style="color:#9ca3af">$1</em>')
    .replace(/`([^`]+)`/g,     '<code style="background:#1f2937;padding:2px 6px;border-radius:3px;font-size:0.82em;color:#60a5fa;font-family:monospace">$1</code>');

  // チェックリスト・リスト
  out = out
    .replace(/^- \[x\] (.+)$/gim, '<div style="display:flex;gap:8px;align-items:flex-start;color:#34d399;padding:2px 0"><span style="flex-shrink:0">✓</span><span>$1</span></div>')
    .replace(/^- \[ \] (.+)$/gim, '<div style="display:flex;gap:8px;align-items:flex-start;color:#6b7280;padding:2px 0"><span style="flex-shrink:0">☐</span><span>$1</span></div>')
    .replace(/^- (.+)$/gm,        '<div style="display:flex;gap:8px;align-items:flex-start;padding:1px 0"><span style="color:#c9a227;flex-shrink:0">•</span><span>$1</span></div>');

  // blockquote / 区切り線
  out = out
    .replace(/^&gt; (.+)$/gm, '<div style="border-left:3px solid #374151;padding:4px 12px;color:#6b7280;font-style:italic;margin:4px 0">$1</div>')
    .replace(/^---+$/gm,      '<hr style="border:none;border-top:1px solid #1f2937;margin:1.2em 0">');

  // 改行
  out = out.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return out;
}

// ─── Component ─────────────────────────────────────────────

export function WorkSpaceScreen() {
  // ★ カスタマイズ箇所 2: 戻り先の画面名
  const setScreen = useGameStore((s) => s.setScreen);
  const files     = parseFiles();
  const [selected, setSelected] = useState<MdFile | null>(files[0] ?? null);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100vw',
      background: '#0d0d14', color: '#e5e7eb',
      fontFamily: 'sans-serif', overflow: 'hidden',
    }}>
      {/* ── ヘッダー ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0 1.25rem', height: 52, flexShrink: 0,
        background: '#111118', borderBottom: '1px solid #1f2937',
      }}>
        <button
          onClick={() => setScreen('TITLE')}  // ★ 戻り先を変更
          style={{ display:'flex', alignItems:'center', gap:'0.4rem',
            background:'none', border:'none', cursor:'pointer',
            color:'#6b7280', fontSize:'0.82rem', padding:'4px 6px', borderRadius:6 }}
        >
          ← 戻る
        </button>
        <div style={{ width:1, height:20, background:'#1f2937' }} />
        <span style={{ fontSize:'0.95rem', fontWeight:700, color:'#c9a227', letterSpacing:'0.05em' }}>
          📂 WorkSpace
        </span>
        {selected?.date && (
          <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'#4b5563' }}>
            {selected.date}
          </span>
        )}
      </header>

      {/* ── 2カラム ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* サイドバー */}
        <aside style={{
          width:240, flexShrink:0, overflowY:'auto',
          background:'#111118', borderRight:'1px solid #1f2937',
          display:'flex', flexDirection:'column',
        }}>
          <div style={{ padding:'0.6rem 0.875rem', fontSize:'0.65rem', fontWeight:700,
            color:'#4b5563', letterSpacing:'0.08em', textTransform:'uppercase',
            borderBottom:'1px solid #1f2937' }}>
            docs_workspace  {/* ★ フォルダ名に合わせて変更 */}
          </div>
          {files.map(f => {
            const active = selected?.key === f.key;
            return (
              <button key={f.key} onClick={() => setSelected(f)} style={{
                display:'flex', alignItems:'flex-start', gap:'0.5rem',
                width:'100%', padding:'0.6rem 0.875rem', background:'none', border:'none',
                borderLeft:`3px solid ${active ? (f.isPM ? '#a78bfa' : '#c9a227') : 'transparent'}`,
                background: active ? (f.isPM ? 'rgba(167,139,250,0.1)' : 'rgba(201,162,39,0.1)') : 'none',
                cursor:'pointer', textAlign:'left',
              }}>
                <div style={{ minWidth:0 }}>
                  <div style={{
                    fontSize:'0.78rem', fontWeight: active ? 600 : 400,
                    color: active ? (f.isPM ? '#a78bfa' : '#c9a227') : (f.isPM ? '#c4b5fd' : '#e5e7eb'),
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  }}>
                    {f.isPM && <span style={{ fontSize:'0.6rem', color:'#a78bfa', marginRight:4 }}>PM</span>}
                    {prettifyName(f.name)}
                  </div>
                  {f.date && <div style={{ fontSize:'0.63rem', color:'#4b5563', marginTop:1 }}>{f.date}</div>}
                </div>
              </button>
            );
          })}
        </aside>

        {/* コンテンツ */}
        <main style={{ flex:1, overflowY:'auto', padding:'1.75rem 2.5rem' }}>
          {selected ? (
            <div style={{ maxWidth:860, margin:'0 auto', fontSize:'0.875rem',
              color:'#9ca3af', lineHeight:1.9 }}
              dangerouslySetInnerHTML={{ __html: renderMd(selected.content) }}
            />
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
              height:'60vh', color:'#4b5563', fontSize:'0.875rem' }}>
              📂 ファイルを選択してください
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

### Step 4 — App.tsx にルートを追加

```typescript
// App.tsx

import { WorkSpaceScreen } from '@/screens/workspace/WorkSpaceScreen'; // 追加

// renderScreen() の switch 内に追加
case 'WORKSPACE':
  return <WorkSpaceScreen />;
```

---

### Step 5 — 任意の画面に遷移ボタンを追加

```typescript
// 例: タイトル画面などに追加
<button onClick={() => setScreen('WORKSPACE')}>
  📂 WorkSpace
</button>
```

---

## カスタマイズポイント一覧

| # | 変更箇所 | ファイル | 説明 |
|---|---|---|---|
| 1 | `import.meta.glob` のパス | WorkSpaceScreen.tsx | MDフォルダ名に合わせて変更 |
| 2 | `setScreen('TITLE')` の戻り先 | WorkSpaceScreen.tsx | プロジェクトの画面名に合わせて変更 |
| 3 | サイドバーの `docs_workspace` 表示名 | WorkSpaceScreen.tsx | フォルダ名ラベルの変更 |
| 4 | `useGameStore` のインポートパス | WorkSpaceScreen.tsx | Zustand ストアのパスに合わせて変更 |
| 5 | ScreenType の型定義ファイル | 各プロジェクトで異なる | 'WORKSPACE' を追加する型定義ファイルを特定して変更 |

---

## Markdown 記法リファレンス

WorkSpace レンダラーが対応している記法一覧です。

### 見出し
```
# 大見出し
## 中見出し
### 小見出し（金色）
```

### プログレスバー（独自記法）
```
[progress:75]   → 75% の進捗バー（色は自動変化）
```

| 達成度 | バーの色 |
|---|---|
| 80% 以上 | 緑 |
| 60〜79% | 金 |
| 35〜59% | 橙 |
| 34% 以下 | 赤 |

### チェックリスト
```
- [x] 完了したタスク  → 緑 ✓
- [ ] 未完了のタスク  → グレー ☐
```

### テーブル
```
| 列A | 列B | 列C |
|---|---|---|
| 値1 | 値2 | 値3 |
```

### その他
```
**太字**
*斜体*
`インラインコード`
> ブロッククオート（グレー左線）
---  区切り線
- リスト項目
```

---

## PM ファイルの命名規則

`PM_` から始まるファイルはサイドバーの**先頭に自動ピン留め**されます。

```
PM_2026-04-18.md   ← 先頭ピン + 紫バッジ
仕様書.md
チェックリスト.md
```

---

## PM ダッシュボードのテンプレート

以下を `PM_YYYY-MM-DD.md` として保存してください。

```markdown
# PM ダッシュボード — プロジェクト名

> 更新: YYYY-MM-DD | PM: 担当者名

---

## プロジェクト全体達成度

[progress:0]

| 領域 | 達成度 | 状態 |
|---|---|---|
| 機能A | 0% | 未着手 |
| 機能B | 0% | 未着手 |

---

## 成果物の定義

| # | 成果物 | 定義 | 優先度 |
|---|---|---|---|
| 1 | **成果物名** | 完了の定義 | A |

---

## DONE — 完了済み

- [x] 完了したもの

---

## 達成度詳細（要素分解）

### 機能A
[progress:0]

- [ ] タスク1
- [ ] タスク2

---

## 本日のタスク（YYYY-MM-DD）

- [ ] タスク
```

---

## よくある問題と対処

| 症状 | 原因 | 対処 |
|---|---|---|
| MDファイルが表示されない | `import.meta.glob` のパスが間違っている | フォルダパスを `/フォルダ名/*.md` の形式で指定 |
| テーブルが崩れる | セパレータ行 `|---|---|` が必要 | ヘッダー行の次に区切り行を入れる |
| ビルドエラー | ScreenType に 'WORKSPACE' がない | 型定義ファイルに追加 |
| `useGameStore` が見つからない | インポートパスが違う | プロジェクトの Zustand ストアパスに変更 |

---

## 動作確認チェックリスト

- [ ] `docs_workspace/` フォルダを作成し、テスト用 `.md` ファイルを1つ置いた
- [ ] `ScreenType` に `'WORKSPACE'` を追加した
- [ ] `WorkSpaceScreen.tsx` を作成し、フォルダパスを変更した
- [ ] `App.tsx` に `case 'WORKSPACE'` を追加した
- [ ] 任意の画面に遷移ボタンを追加した
- [ ] `npm run build` がエラーなく通る
- [ ] ブラウザでMDファイルが表示される
- [ ] プログレスバー・テーブルが正常に表示される

---

> このドキュメントひとつで完結する設計にしています。  
> 不明点はエンジニア担当まで。
```

---

**参照実装**: `100_gamecollection` プロジェクトの  
`src/screens/workspace/WorkSpaceScreen.tsx`（コミット `f5314c1`）
