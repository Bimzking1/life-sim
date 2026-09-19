import { addToGauge, clamp } from './stats'
import {
  BANK_INTEREST_RATE,
  DAYS_PER_YEAR,
  DAILY_EXPENSES,
  LOAN_DAILY_INTEREST,
  MAX_AGE,
  RENT_AMOUNT,
  RENT_EVERY_DAYS,
  START_AGE,
  WAKE_HOUR,
} from './constants'
import type { GameState } from './types'
import { pushLog } from './state'

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function ageFromDay(day: number): number {
  return START_AGE + Math.floor((day - 1) / DAYS_PER_YEAR)
}

export function currentAge(state: GameState): number {
  return ageFromDay(state.time.day)
}

/** Advance the clock by `minutes`, crossing day boundaries. Returns days that passed. */
export function advanceMinutes(state: GameState, minutes: number): number {
  if (minutes <= 0) return 0
  let remaining = minutes
  let daysPassed = 0
  while (remaining > 0) {
    const untilMidnight = 24 * 60 - state.time.minutes
    if (remaining < untilMidnight) {
      state.time.minutes += remaining
      remaining = 0
    } else {
      remaining -= untilMidnight
      state.time.day += 1
      state.time.minutes = 0
      daysPassed += 1
      endOfDay(state)
    }
  }
  return daysPassed
}

/** Advance the clock directly to the next morning at WAKE_HOUR. */
export function sleepUntilMorning(state: GameState): void {
  const target = WAKE_HOUR * 60
  const todayLeft = 24 * 60 - state.time.minutes
  advanceMinutes(state, todayLeft + target)
}

/**
 * Everything that happens when a new day rolls in.
 * Deterministic: daily expenses, interest, loan accrual, rent checks,
 * aging, hunger decay and death/end-of-life handling.
 */
export function endOfDay(state: GameState): void {
  const s = state
  const oldAge = ageFromDay(s.time.day - 1)
  const newAge = ageFromDay(s.time.day)

  // Daily living expenses.
  s.player.cash -= DAILY_EXPENSES

  // Bank interest on savings.
  if (s.player.bank > 0) {
    s.player.bank = clamp(s.player.bank * (1 + BANK_INTEREST_RATE), 0, Number.MAX_SAFE_INTEGER)
  }

  // Loan interest.
  if (s.player.loan > 0) {
    s.player.loan = Math.round(s.player.loan * (1 + LOAN_DAILY_INTEREST) * 100) / 100
  }

  // Rent bookkeeping (the paid balance lives as property detail; see payRent).
  if (s.time.day > s.player.rentDueDay && !s.events.flags['evicted']) {
    s.player.rentDebt += RENT_AMOUNT / RENT_EVERY_DAYS
    addToGauge(s, 'stress', 2)
    addToGauge(s, 'happiness', -1)
    if (s.time.day - s.player.rentDueDay === 1) {
      pushLog(s, `Rent was due on day ${s.player.rentDueDay} and remains unpaid.`, 'bad')
    }
  }

  // Food: did the player eat yesterday?
  if (s.player.lastMealDay < s.time.day - 1) {
    addToGauge(s, 'happiness', -2)
    if (s.time.day - s.player.lastMealDay >= 3) {
      addToGauge(s, 'health', -5)
      pushLog(s, 'You are starving. Your health is dropping fast.', 'bad')
      s.events.flags['starving'] = true
    } else {
      s.events.flags['starving'] = false
    }
  } else {
    s.events.flags['starving'] = false
  }

  // Aging.
  if (newAge > oldAge) {
    pushLog(s, `You turned ${newAge}.`, 'info')
    s.events.flags['last-birthday-age'] = newAge
  }

  // Health decay in very old age.
  if (newAge >= 85) {
    addToGauge(s, 'health', -(1 + Math.floor((newAge - 85) / 5)))
  }

  // End-of-life.
  if (s.player.stats.health <= 0) {
    s.player.stats.health = 0
    s.gameOver = true
    s.endingReason = 'health'
    pushLog(s, 'Your health gave out. This is the end of your life.', 'bad')
  } else if (newAge >= MAX_AGE) {
    s.gameOver = true
    s.endingReason = 'old-age'
    pushLog(s, `You reached ${MAX_AGE} years. A long, full life.`, 'good')
  }
}

export function formatClock(state: GameState): { day: number; weekday: string; time: string; phase: 'Morning' | 'Afternoon' | 'Evening' | 'Night' } {
  const day = state.time.day
  const weekday = WEEKDAYS[(day - 1) % WEEKDAYS.length]
  const time = `${String(Math.floor(state.time.minutes / 60)).padStart(2, '0')}:${String(state.time.minutes % 60).padStart(2, '0')}`
  const phase = phaseOfDay(state.time.minutes)
  return { day, weekday, time, phase }
}

export function phaseOfDay(minutes: number): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  const h = Math.floor(minutes / 60)
  if (h >= 5 && h < 12) return 'Morning'
  if (h >= 12 && h < 17) return 'Afternoon'
  if (h >= 17 && h < 21) return 'Evening'
  return 'Night'
}