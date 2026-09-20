import { CURRENT_SAVE_VERSION } from './constants'
import type { GameState } from './types'
import { pushLog } from './state'

export interface SaveFile {
  version: number
  savedAt: string
  gameState: GameState
}

export function serializeSave(state: GameState): SaveFile {
  const fresh = structuredClone(state)
  fresh.savedAt = new Date().toISOString()
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: fresh.savedAt,
    gameState: fresh,
  }
}

export function serializeForDownload(state: GameState): string {
  return JSON.stringify(serializeSave(state), null, 2)
}

export class SaveError extends Error {}

/**
 * Validate and normalise a parsed save payload.
 * Throws SaveError with a human-readable message when malformed.
 * Returns a fresh, safe GameState.
 */
export function parseSaveFile(data: unknown): GameState {
  if (typeof data !== 'object' || data === null) {
    throw new SaveError('The file did not contain a JSON object.')
  }
  const file = data as { version?: unknown; savedAt?: unknown; gameState?: unknown }
  if (typeof file.version !== 'number') {
    throw new SaveError('The save file has no version number.')
  }
  if (typeof file.gameState !== 'object' || file.gameState === null) {
    throw new SaveError('The save file has no game state.')
  }
  if (file.version > CURRENT_SAVE_VERSION) {
    throw new SaveError(`This save was made by a newer game (v${file.version}). Please update the game.`)
  }

  let state = file.gameState as GameState
  let version = file.version
  while (version < CURRENT_SAVE_VERSION) {
    const migrated = MIGRATIONS[version]
    if (!migrated) break
    state = migrated(state)
    version += 1
  }

  if (!isValidGameState(state)) {
    throw new SaveError('The game state is missing required fields or is corrupted.')
  }

  const safe = normalise(state)
  safe.formatVersion = CURRENT_SAVE_VERSION
  safe.savedAt = typeof file.savedAt === 'string' ? file.savedAt : new Date().toISOString()
  pushLog(safe, 'Save loaded successfully. Welcome back.', 'good')
  return safe
}

function isValidGameState(s: unknown): s is GameState {
  if (typeof s !== 'object' || s === null) return false
  const g = s as GameState
  return (
    typeof g.player === 'object' && g.player !== null &&
    typeof g.player.stats === 'object' &&
    typeof g.time === 'object' &&
    typeof g.career === 'object' &&
    typeof g.education === 'object' &&
    typeof g.events === 'object' &&
    typeof g.inventory === 'object' &&
    typeof g.relationships === 'object' &&
    Array.isArray(g.activityLog) &&
    Array.isArray(g.properties) &&
    typeof g.player.cash === 'number' &&
    typeof g.player.bank === 'number'
  )
}

/** Clamp and repair values so the loaded state can never have invalid numbers. */
function normalise(state: GameState): GameState {
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
  const stats = state.player.stats
  for (const key of ['health', 'energy', 'happiness', 'strength', 'intelligence', 'charisma', 'stress'] as const) {
    const cur = Number(stats[key])
    stats[key] = Math.round(clamp(Number.isFinite(cur) ? cur : 0, 0, 100) * 100) / 100
  }
  state.player.cash = Math.max(0, Number.isFinite(state.player.cash) ? state.player.cash : 0)
  state.player.bank = Math.max(0, Number.isFinite(state.player.bank) ? state.player.bank : 0)
  state.player.loan = Math.max(0, Number.isFinite(state.player.loan) ? state.player.loan : 0)
  state.player.rentDebt = Math.max(0, Number.isFinite(state.player.rentDebt) ? state.player.rentDebt : 0)
  if (!Number.isFinite(state.time.day) || state.time.day < 1) state.time.day = 1
  if (!Number.isFinite(state.time.minutes)) state.time.minutes = 0
  state.time.minutes = Math.min(1439, Math.max(0, state.time.minutes))
  state.career.performance = clamp(state.career.performance, 0, 100)
  if (typeof state.career.levelIndex !== 'number' || state.career.levelIndex < -1) state.career.levelIndex = -1
  state.achievements = Array.isArray(state.achievements) ? state.achievements : []
  state.decisions = Array.isArray(state.decisions) ? state.decisions : []
  state.activityLog = Array.isArray(state.activityLog) ? state.activityLog.slice(-200) : []
  state.properties = Array.isArray(state.properties) && state.properties.length ? state.properties : []
  state.inventory.qty = state.inventory.qty ?? {}
  state.inventory.owned = Array.isArray(state.inventory.owned) ? state.inventory.owned : []
  state.events.flags = state.events.flags ?? {}
  state.events.handled = Array.isArray(state.events.handled) ? state.events.handled : []
  state.events.pending = null
  return state
}

export const MIGRATIONS: Record<number, (s: GameState) => GameState> = {
  // Reserved for future versions. v1 is current.
}

export function readSaveFromJson(text: string): GameState {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new SaveError('The file is not valid JSON.')
  }
  return parseSaveFile(parsed)
}