import { describe, expect, it } from 'vitest'
import { newGame } from '../state'
import { SaveError, readSaveFromJson, serializeForDownload } from '../save'
import { CURRENT_SAVE_VERSION } from '../constants'

function toJson(state: ReturnType<typeof newGame>): string {
  return serializeForDownload(state)
}

describe('save round-trip', () => {
  it('serializes with the current format version', () => {
    const s = newGame()
    const parsed = JSON.parse(toJson(s)) as { version: number; savedAt: string; gameState: unknown }
    expect(parsed.version).toBe(CURRENT_SAVE_VERSION)
    expect(typeof parsed.savedAt).toBe('string')
    expect(parsed.gameState).toEqual(expect.any(Object))
  })

  it('survives a save -> load cycle with equal state', () => {
    const s = newGame()
    s.player.cash = 123.45
    s.player.bank = 67.8
    s.time.day = 30
    const restored = readSaveFromJson(toJson(s))
    expect(restored.player.cash).toBe(123.45)
    expect(restored.player.bank).toBe(67.8)
    expect(restored.time.day).toBe(30)
  })

  it('returns a fresh, deep state each load (no shared references)', () => {
    const s = newGame()
    const a = readSaveFromJson(toJson(s))
    const b = readSaveFromJson(toJson(s))
    a.player.cash += 999
    expect(b.player.cash).not.toBe(a.player.cash)
    expect(a.activityLog).not.toBe(b.activityLog)
  })

  it('clamps runaway values into valid ranges on load', () => {
    const s = newGame()
    s.player.stats.health = 150
    s.player.cash = -20
    s.time.day = 0
    const restored = readSaveFromJson(toJson(s))
    expect(restored.player.stats.health).toBeLessThanOrEqual(100)
    expect(restored.player.cash).toBeGreaterThanOrEqual(0)
    expect(restored.time.day).toBeGreaterThanOrEqual(1)
  })
})

describe('load failures', () => {
  it('rejects non-JSON text', () => {
    expect(() => readSaveFromJson('not json at all')).toThrow(SaveError)
  })

  it('rejects a payload missing the gameState object', () => {
    expect(() => readSaveFromJson(JSON.stringify({ version: 1 }))).toThrow(SaveError)
  })

  it('rejects a save from a newer version of the game', () => {
    const payload = JSON.stringify({ version: CURRENT_SAVE_VERSION + 1, gameState: {} })
    expect(() => readSaveFromJson(payload)).toThrow(SaveError)
  })

  it('reports a clear message for a top-level non-object', () => {
    expect(() => readSaveFromJson('[]')).toThrow(SaveError)
    expect(() => readSaveFromJson('42')).toThrow(SaveError)
    expect(() => readSaveFromJson('"hi"')).toThrow(SaveError)
  })
})
