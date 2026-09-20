import { describe, expect, it } from 'vitest'
import { newGame } from '../state'
import {
  acceptJob,
  allTracks,
  buildJobListingEvent,
  buildPromotionEvent,
  checkPromotion,
  currentJob,
  nextJob,
  trackName,
} from '../career'

describe('career basics', () => {
  it('a fresh save is unemployed', () => {
    const s = newGame()
    expect(trackName(s)).toBeNull()
    expect(currentJob(s)).toBeNull()
    expect(nextJob(s)).toBeNull()
  })

  it('accepts the first level of the first track', () => {
    const s = newGame()
    const track = allTracks()[0]
    const job = track.levels[0]
    const ok = acceptJob(s, track.id, 0)
    expect(ok).toBe(true)
    expect(trackName(s)).toBe(track.name)
    expect(currentJob(s)).toBe(job)
    expect(s.career.trackId).toBe(track.id)
    expect(s.career.levelIndex).toBe(0)
    expect(s.career.startedDay).toBe(1)
  })

  it('moving to the next level is reported by nextJob', () => {
    const s = newGame()
    const track = allTracks()[0]
    acceptJob(s, track.id, 0)
    expect(nextJob(s)).toBe(track.levels[1])
  })

  it('rejects a job level whose requirements are unmet', () => {
    const s = newGame()
    const track = allTracks()[0]
    const d = s
    const before = d.career.trackId
    // Level 2+ demands stats/tenure; force an impossible one by nudging tenure.
    const ok = acceptJob(s, track.id, 2)
    expect(ok).toBe(false)
    expect(d.career.trackId).toBe(before)
  })
})

describe('checkPromotion', () => {
  it('does not promote on day one', () => {
    const s = newGame()
    const track = allTracks()[0]
    acceptJob(s, track.id, 0)
    expect(checkPromotion(s)).toBe(false)
    expect(s.career.levelIndex).toBe(0)
  })
})

describe('listings / promotion events', () => {
  it('buildJobListingEvent offers a stay choice', () => {
    const s = newGame()
    const ev = buildJobListingEvent(s)
    expect(ev.title).toBeTruthy()
    expect(ev.choices.length).toBeGreaterThan(0)
    expect(ev.choices.some((c) => c.id === 'job-stay')).toBe(true)
  })

  it('buildPromotionEvent is shaped for a decision', () => {
    const s = newGame()
    const ev = buildPromotionEvent(s)
    expect(ev.id).toBe('promotion-announcement')
    expect(ev.choices.length).toBeGreaterThan(0)
  })
})
