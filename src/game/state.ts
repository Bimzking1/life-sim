import {
  START_BANK,
  START_CASH,
  START_DAY,
  START_HOUR,
  START_MINUTE,
  CURRENT_SAVE_VERSION,
  DEFAULT_PLAYER_NAME,
  DEFAULT_THEME,
} from './constants'
import type {
  AchievementRecord,
  GameState,
  LogEntry,
  PlayerState,
  Tone,
} from './types'

export type { GameState }

/** Random id (crypto.randomUUID when available). */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

export function makeFreshPlayer(name: string = DEFAULT_PLAYER_NAME): PlayerState {
  return {
    name,
    currentLocation: 'home',
    cash: START_CASH,
    bank: START_BANK,
    loan: 0,
    stats: {
      health: 100,
      energy: 100,
      happiness: 60,
      strength: 50,
      intelligence: 50,
      charisma: 50,
      stress: 10,
    },
    lastMealDay: START_DAY - 1,
    rentDueDay: 7,
    rentDebt: 0,
  }
}

/** Create a fresh default GameState (single life). */
export function newGame(name?: string): GameState {
  return {
    formatVersion: CURRENT_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    player: makeFreshPlayer(name),
    time: { day: START_DAY, minutes: START_HOUR * 60 + START_MINUTE },
    career: { trackId: null, levelIndex: -1, performance: 0, startedDay: START_DAY, totalWorkDays: 0 },
    education: { completed: [], enrolled: null, progress: {}, totalSpent: 0 },
    properties: [{ id: 'room', name: 'Rented room', detail: 'A small room above a laundromat.', type: 'rented' }],
    events: { pending: null, handled: [], flags: {} },
    inventory: { qty: {}, owned: [] },
    relationships: {},
    activityLog: [],
    decisions: [],
    achievements: [],
    gameOver: false,
    endingReason: null,
  }
}

export function pushLog(state: GameState, text: string, tone: Tone = 'neutral'): LogEntry {
  const entry: LogEntry = { id: newId(), day: state.time.day, minutes: state.time.minutes, text, tone }
  state.activityLog.push(entry)
  if (state.activityLog.length > 200) {
    state.activityLog = state.activityLog.slice(-200)
  }
  return entry
}

export function pushDecision(state: GameState, text: string): void {
  state.decisions.push({ day: state.time.day, minutes: state.time.minutes, text })
}

export function addAchievement(state: GameState, id: string, text: string): void {
  if (state.achievements.some((a) => a.id === id)) return
  const rec: AchievementRecord = { id, day: state.time.day, text }
  state.achievements.push(rec)
  pushLog(state, `Achievement: ${text}`, 'good')
}

/** True if the theme is the default (dark) — used to decide re-paint. */
export function isDefaultTheme(theme: 'dark' | 'light'): boolean {
  return theme === DEFAULT_THEME
}

export function renamePlayer(state: GameState, name: string): void {
  state.player.name = name
  state.savedAt = new Date().toISOString()
}