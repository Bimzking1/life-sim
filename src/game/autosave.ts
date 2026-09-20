import { AUTOSAVE_KEY } from './constants'
import type { GameState } from './types'
import { serializeSave } from './save'
import { newGame } from './state'

export interface AutosaveInfo {
  label: string
  detail: string
  gameState: GameState
}

export function saveAutosave(state: GameState): void {
  try {
    const file = serializeSave(state)
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(file))
  } catch {
    // Storage full or unavailable; non-fatal.
  }
}

export function clearAutosave(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY)
  } catch {
    // ignore
  }
}

export function loadAutosave(): AutosaveInfo | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt?: string; gameState?: GameState }
    if (!parsed.gameState || typeof parsed.gameState !== 'object') return null
    return {
      label: parsed.gameState.player?.name ?? 'Alex Rivera',
      detail: describeAutosave(parsed.gameState, parsed.savedAt),
      gameState: parsed.gameState,
    }
  } catch {
    return null
  }
}

function describeAutosave(state: GameState, savedAt?: string): string {
  const age = 18 + Math.floor((state.time.day - 1) / 4)
  const day = state.time.day
  const when = savedAt ? timeAgo(savedAt) : 'recently'
  return `Age ${age}, day ${day}. Autosaved ${when}.`
}

function timeAgo(iso: string): string {
  const past = new Date(iso).getTime()
  if (!Number.isFinite(past)) return 'recently'
  const mins = Math.max(0, Math.round((Date.now() - past) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function freshStartData(): GameState {
  return newGame()
}