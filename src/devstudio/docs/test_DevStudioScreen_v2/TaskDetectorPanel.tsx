// src/devstudio/tasks/TaskDetectorPanel.tsx
import { useState, useCallback } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Package, FileCode2, Layers, Music } from 'lucide-react'
import { useTaskDetectorStore } from './taskDetectorStore'
import type { DetectedTask, TaskCategory } from './taskDetectorStore'
import { analyzeGamePackage } from './useTaskDetector'

// ---- サブコンポーネント ----

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  event: 'EVENT',
  asset: 'ASSET',
  state: 'STATE',
}

const CATEGORY_COLOR: Record<TaskCategory, string> = {
  event: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  asset: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  state: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

interface TaskItemProps {
  task: DetectedTask
  onToggle: (id: string) => void
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 transition-opacity ${
        task.done ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors ${
          task.done
            ? 'bg-emerald-500 border-emerald-500'
            : task.severity === 'error'
            ? 'border-red-400/50 hover:border-red-400'
            : 'border-amber-400/50 hover:border-amber-400'
        }`}
        aria-label={task.done ? '未完了に戻す' : '完了にする'}
      >
        {task.done && (
          <svg viewBox="0 0 16 16" className="w-full h-full text-white" fill="none">
            <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {task.severity === 'error' ? (
            <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
          ) : (
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
          )}
          <span
            className={`text-xs px-1.5 py-0.5 rounded border font-mono ${CATEGORY_COLOR[task.category]}`}
          >
            {CATEGORY_LABEL[task.category]}
          </span>
          <span
            className={`text-sm font-medium ${
              task.done ? 'line-through text-white/30' : 'text-white/90'
            }`}
          >
            {task.title}
          </span>
        </div>
        <p className="text-xs text-white/40 mt-1 pl-0.5">{task.meta}</p>
      </div>
    </div>
  )
}

// ---- メインコンポーネント ----

export function TaskDetectorPanel() {
  const { tasks, stats, gameTitle, lastAnalyzed, setTasks, toggleDone, clearAll } =
    useTaskDetectorStore()

  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [showInput, setShowInput] = useState(true)

  const handleAnalyze = useCallback(() => {
    setError('')
    const raw = input.trim()
    if (!raw) {
      setError('JSONを貼り付けてください')
      return
    }
    try {
      const result = analyzeGamePackage(raw)
      setTasks(result.tasks, result.stats, result.gameTitle)
      setShowInput(false)
    } catch (e) {
      setError(`解析エラー: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [input, setTasks])

  const handleClear = () => {
    clearAll()
    setInput('')
    setError('')
    setShowInput(true)
  }

  const errors = tasks.filter((t) => t.severity === 'error')
  const warnings = tasks.filter((t) => t.severity === 'warning')
  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-white/80">Daily Task Detector</h2>
          {gameTitle && (
            <p className="text-xs text-white/40 mt-0.5">
              {gameTitle}
              {lastAnalyzed && (
                <span className="ml-2">
                  — {lastAnalyzed.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!showInput && (
            <button
              onClick={() => setShowInput((v) => !v)}
              className="text-xs px-3 py-1.5 rounded border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
            >
              再入力
            </button>
          )}
          {tasks.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* JSON入力エリア */}
      {showInput && (
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'{\n  "package_version": "1.0",\n  "gameTitle": "...",\n  "events": { ... }\n}'}
            className="w-full h-36 resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={12} />
              {error}
            </p>
          )}
          <button
            onClick={handleAnalyze}
            className="self-start text-sm px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-colors font-medium"
          >
            解析する
          </button>
          <button
            onClick={() => console.log('テストボタンがクリックされました！')}
            className="self-start text-sm px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-colors font-medium ml-2"
          >
            テストボタン
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <FileCode2 size={13} />, label: 'EVENT', value: stats.eventCount, color: 'text-blue-400' },
            { icon: <Layers size={13} />, label: 'CHAT', value: stats.chatCount, color: 'text-purple-400' },
            { icon: <Package size={13} />, label: 'ASSET', value: stats.assetCount, color: 'text-amber-400' },
            {
              icon: stats.errorCount === 0
                ? <CheckCircle2 size={13} />
                : <AlertCircle size={13} />,
              label: '未実装',
              value: stats.errorCount,
              color: stats.errorCount === 0 ? 'text-emerald-400' : 'text-red-400',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-lg border border-white/5 bg-white/3 py-2.5"
            >
              <span className={s.color}>{s.icon}</span>
              <span className={`text-lg font-semibold leading-none ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-white/30 font-mono">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* タスクリスト */}
      {tasks.length > 0 && (
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
          {/* 進捗バー */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-white/30 font-mono">
              {doneCount}/{tasks.length}
            </span>
          </div>

          {/* エラー */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-400/15 bg-red-400/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-red-400/10">
                <span className="text-xs font-medium text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  未実装 · エラー ({errors.length}件)
                </span>
              </div>
              {errors.map((t) => (
                <TaskItem key={t.id} task={t} onToggle={toggleDone} />
              ))}
            </div>
          )}

          {/* 警告 */}
          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-400/15 bg-amber-400/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-amber-400/10">
                <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  確認推奨 · 警告 ({warnings.length}件)
                </span>
              </div>
              {warnings.map((t) => (
                <TaskItem key={t.id} task={t} onToggle={toggleDone} />
              ))}
            </div>
          )}

          {/* 全完了 */}
          {errors.length === 0 && warnings.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-emerald-400">
              <CheckCircle2 size={24} />
              <span className="text-sm">未実装項目はありません</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
