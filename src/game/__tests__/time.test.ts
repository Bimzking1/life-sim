import { describe, expect, it } from 'vitest'
import { newGame } from '../state'
import { advanceMinutes, ageFromDay, currentAge, formatClock } from '../time'
import { DAYS_PER_YEAR, MAX_AGE, START_AGE } from '../constants'

describe('newGame', () => {
  it('starts with a healthy 18-year-old on day 1', () => {
    const s = newGame()
    expect(s.time.day).toBe(1)
    expect(s.gameOver).toBe(false)
    expect(ageFromDay(s.time.day)).toBe(START_AGE)
    expect(s.player.stats.health).toBeGreaterThan(50)
    expect(s.player.stats.energy).toBe(100)
  })

  it('produces an isolated state each call', () => {
    const a = newGame()
    const b = newGame()
    a.player.cash += 999
    expect(b.player.cash).not.toBe(a.player.cash)
    expect(a.activityLog).not.toBe(b.activityLog)
  })
})

describe('ageFromDay', () => {
  it('ages one year every DAYS_PER_YEAR days', () => {
    expect(ageFromDay(1)).toBe(START_AGE)
    expect(ageFromDay(1 + DAYS_PER_YEAR)).toBe(START_AGE + 1)
    expect(ageFromDay(1 + DAYS_PER_YEAR * 10)).toBe(START_AGE + 10)
  })

  it('keeps counting past MAX_AGE (end-of-life is handled elsewhere)', () => {
    const finalPart = (MAX_AGE - START_AGE) * DAYS_PER_YEAR
    expect(ageFromDay(1 + finalPart)).toBe(MAX_AGE)
    expect(ageFromDay(1 + finalPart + DAYS_PER_YEAR * 5)).toBe(MAX_AGE + 5)
  })
})

describe('advanceMinutes', () => {
  it('advances the clock within a day', () => {
    const s = newGame()
    const before = s.time.minutes
    advanceMinutes(s, 30)
    expect(s.time.minutes).toBe(before + 30)
    expect(s.time.day).toBe(1)
  })

  it('rolls over to the next day when crossing midnight', () => {
    const s = newGame()
    const minutesInDay = 24 * 60
    advanceMinutes(s, minutesInDay)
    expect(s.time.day).toBe(2)
  })
})

describe('currentAge / formatClock', () => {
  it('reports a readable clock', () => {
    const s = newGame()
    const c = formatClock(s)
    expect(typeof c.time).toBe('string')
    expect(typeof c.day).toBe('number')
    expect(typeof c.phase).toBe('string')
  })

  it('keeps currentAge consistent with ageFromDay', () => {
    const s = newGame()
    expect(currentAge(s)).toBe(ageFromDay(s.time.day))
  })
})
