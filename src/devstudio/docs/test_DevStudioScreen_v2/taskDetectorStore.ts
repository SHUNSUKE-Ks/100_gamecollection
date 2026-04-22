// src/devstudio/tasks/taskDetectorStore.ts
import { create } from 'zustand'

export type TaskCategory = 'event' | 'asset' | 'state'
export type TaskSeverity = 'error' | 'warning'

export interface DetectedTask {
  id: string
  category: TaskCategory
  severity: TaskSeverity
  title: string
  meta: string
  done: boolean
}

export interface DetectorStats {
  eventCount: number
  chatCount: number
  choiceCount: number
  assetCount: number
  errorCount: number
}

interface TaskDetectorState {
  tasks: DetectedTask[]
  stats: DetectorStats | null
  gameTitle: string
  lastAnalyzed: Date | null
  setTasks: (tasks: DetectedTask[], stats: DetectorStats, gameTitle: string) => void
  toggleDone: (id: string) => void
  clearAll: () => void
}

export const useTaskDetectorStore = create<TaskDetectorState>((set) => ({
  tasks: [],
  stats: null,
  gameTitle: '',
  lastAnalyzed: null,

  setTasks: (tasks, stats, gameTitle) =>
    set({ tasks, stats, gameTitle, lastAnalyzed: new Date() }),

  toggleDone: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })),

  clearAll: () =>
    set({ tasks: [], stats: null, gameTitle: '', lastAnalyzed: null }),
}))
