// src/devstudio/tasks/useTaskDetector.ts
import type { DetectedTask, DetectorStats } from './taskDetectorStore'

// ---- スキーマ Ver5.1 型定義 ----
interface GameEvent {
  event_id: string
  type: 'CHAT' | 'CHOICE'
  ref_id: string
  next?: string
}

interface ChatLine {
  speaker: string
  text: string
  tags?: string[]
}

interface Chat {
  chat_id: string
  lines: ChatLine[]
}

interface ChoiceOption {
  label: string
  next: string
  effects?: {
    flags?: Record<string, boolean>
    params?: Record<string, number>
  }
}

interface Choice {
  choice_id: string
  options: ChoiceOption[]
}

interface GamePackage {
  gameTitle?: string
  events?: { events: GameEvent[] }
  chats?: { chats: Chat[] }
  choices?: { choices: Choice[] }
  state?: {
    flags?: Record<string, boolean>
    params?: Record<string, number>
  }
  assets?: {
    ASSET_ORDER?: {
      NOVEL?: Record<string, string>
    }
  }
}

export interface AnalyzeResult {
  tasks: DetectedTask[]
  stats: DetectorStats
  gameTitle: string
}

export function analyzeGamePackage(raw: string): AnalyzeResult {
  const pkg: GamePackage = JSON.parse(raw)

  const tasks: DetectedTask[] = []
  let uid = 0
  const id = (prefix: string) => `${prefix}_${++uid}`

  const events = pkg.events?.events ?? []
  const chats = pkg.chats?.chats ?? []
  const choices = pkg.choices?.choices ?? []
  const stateFlags = pkg.state?.flags ?? {}
  const stateParams = pkg.state?.params ?? {}
  const assetOrder = pkg.assets?.ASSET_ORDER?.NOVEL ?? {}

  const allEventIds = new Set(events.map((e) => e.event_id))
  const allChatIds = new Set(chats.map((c) => c.chat_id))
  const allChoiceIds = new Set(choices.map((c) => c.choice_id))
  const registeredAssets = new Set(Object.keys(assetOrder))

  // 1. eventsのref_id → chat/choice存在チェック
  for (const ev of events) {
    if (ev.type === 'CHAT' && !allChatIds.has(ev.ref_id)) {
      tasks.push({
        id: id('CHAT_MISSING'),
        category: 'event',
        severity: 'error',
        title: `CHAT未定義: ${ev.ref_id}`,
        meta: `${ev.event_id} が参照しているがchats.jsonに存在しない`,
        done: false,
      })
    }
    if (ev.type === 'CHOICE' && !allChoiceIds.has(ev.ref_id)) {
      tasks.push({
        id: id('CHOICE_MISSING'),
        category: 'event',
        severity: 'error',
        title: `CHOICE未定義: ${ev.ref_id}`,
        meta: `${ev.event_id} が参照しているがchoices.jsonに存在しない`,
        done: false,
      })
    }
    if (ev.next && !allEventIds.has(ev.next)) {
      tasks.push({
        id: id('NEXT_MISSING'),
        category: 'event',
        severity: 'error',
        title: `next未定義: ${ev.next}`,
        meta: `${ev.event_id} → ${ev.next} が存在しない`,
        done: false,
      })
    }
  }

  // 2. choicesのnext / effectsチェック
  for (const ch of choices) {
    for (const opt of ch.options) {
      if (opt.next && !allEventIds.has(opt.next)) {
        tasks.push({
          id: id('CHOICE_NEXT'),
          category: 'event',
          severity: 'error',
          title: `next未定義: ${opt.next}`,
          meta: `choice ${ch.choice_id} option "${opt.label}"`,
          done: false,
        })
      }
      for (const k of Object.keys(opt.effects?.flags ?? {})) {
        if (!(k in stateFlags)) {
          tasks.push({
            id: id('FLAG_UNDECL'),
            category: 'state',
            severity: 'error',
            title: `flag未宣言: ${k}`,
            meta: `choice ${ch.choice_id} effectsで使用 → state.jsonに未定義`,
            done: false,
          })
        }
      }
      for (const k of Object.keys(opt.effects?.params ?? {})) {
        if (!(k in stateParams)) {
          tasks.push({
            id: id('PARAM_UNDECL'),
            category: 'state',
            severity: 'error',
            title: `param未宣言: ${k}`,
            meta: `choice ${ch.choice_id} effectsで使用 → state.jsonに未定義`,
            done: false,
          })
        }
      }
    }
  }

  // 3. タグ参照アセットの収集
  const taggedAssets = new Set<string>()
  for (const chat of chats) {
    for (const line of chat.lines) {
      for (const tag of line.tags ?? []) {
        const [, assetId] = tag.split(':')
        if (assetId) taggedAssets.add(assetId)
      }
    }
  }

  // タグ参照あり → AssetOrderList未登録
  for (const assetId of taggedAssets) {
    if (!registeredAssets.has(assetId)) {
      tasks.push({
        id: id('ASSET_UNREG'),
        category: 'asset',
        severity: 'error',
        title: `アセット未登録: ${assetId}`,
        meta: `tagsで参照されているがAssetOrderListに未登録`,
        done: false,
      })
    }
  }

  // AssetOrderList登録済み → タグ未使用（warning）
  for (const assetId of registeredAssets) {
    if (!taggedAssets.has(assetId)) {
      const filename = assetOrder[assetId]
      const ext = filename.split('.').pop()?.toLowerCase() ?? ''
      const type = ['svg', 'png', 'jpg', 'webp'].includes(ext)
        ? '画像'
        : ['mp3', 'wav', 'm4a'].includes(ext)
        ? '音声'
        : 'ファイル'
      tasks.push({
        id: id('ASSET_UNUSED'),
        category: 'asset',
        severity: 'warning',
        title: `アセット未使用: ${assetId}`,
        meta: `${type} — ${filename}（tagsで未参照）`,
        done: false,
      })
    }
  }

  const stats: DetectorStats = {
    eventCount: events.length,
    chatCount: chats.length,
    choiceCount: choices.length,
    assetCount: registeredAssets.size,
    errorCount: tasks.filter((t) => t.severity === 'error').length,
  }

  return {
    tasks,
    stats,
    gameTitle: pkg.gameTitle ?? '無題',
  }
}
