import { DAILY_EXPENSES, LOAN_AMOUNT, RENT_AMOUNT, RENT_EVERY_DAYS } from './constants'
import type { GameState, JobLevel } from './types'
import { pushLog, pushDecision, addAchievement } from './state'
import { JOB_TRACKS } from '../data/jobs'

export function canAfford(state: GameState, cost: number): boolean {
  return state.player.cash >= cost
}

/** Deduct cash; returns true if it was affordable. Never leaves cash negative. */
export function spendCash(state: GameState, cost: number): boolean {
  if (cost <= 0) return true
  if (state.player.cash < cost) return false
  state.player.cash = Math.round((state.player.cash - cost) * 100) / 100
  return true
}

export function addCash(state: GameState, amount: number): void {
  state.player.cash = Math.round((state.player.cash + amount) * 100) / 100
}

export function depositAll(state: GameState): void {
  state.player.bank += state.player.cash
  state.player.cash = 0
}

export function withdrawAll(state: GameState): void {
  state.player.cash += state.player.bank
  state.player.bank = 0
}

/** Pay the whole rent debt (accumulated daily) from cash if possible. */
export function payAllRent(state: GameState): boolean {
  let remaining = state.player.rentDebt
  if (state.properties.some((p) => p.type === 'rented')) {
    const period = RENT_AMOUNT / RENT_EVERY_DAYS
    if (state.time.day > state.player.rentDueDay) {
      remaining += period
    } else {
      // Rent for the upcoming period.
      remaining += period
    }
  } else {
    return remaining <= 0
  }
  if (state.player.cash < remaining) return false
  state.player.cash = Math.round((state.player.cash - remaining) * 100) / 100
  state.player.rentDebt = 0
  state.player.rentDueDay = state.time.day + RENT_EVERY_DAYS
  pushLog(state, `You paid rent. Next due on day ${state.player.rentDueDay}.`, 'neutral')
  return true
}

export function applyLoan(state: GameState): boolean {
  if (state.player.loan > 0) return false
  if (!state.career.trackId) return false
  state.player.loan = LOAN_AMOUNT
  state.player.bank += LOAN_AMOUNT
  pushLog(state, `Bank loan approved: $${LOAN_AMOUNT} added to your account.`, 'info')
  pushDecision(state, 'Took out a bank loan.')
  return true
}

export function repayLoanFromCash(state: GameState): boolean {
  if (state.player.loan <= 0) return false
  const amount = Math.min(state.player.cash, state.player.loan)
  if (amount <= 0) return false
  state.player.cash = Math.round((state.player.cash - amount) * 100) / 100
  state.player.loan = Math.round((state.player.loan - amount) * 100) / 100
  if (state.player.loan === 0) {
    pushLog(state, 'You paid off your loan completely.', 'good')
    addAchievement(state, 'debt-free', 'Debt free')
  }
  return true
}

export function dailyExpenses(): number {
  return DAILY_EXPENSES
}

export function incomePerDay(state: GameState): number {
  if (state.career.trackId === null) return 0
  const job = currentJob(state)
  return job ? job.salaryPerDay : 0
}

export function currentJob(state: GameState): JobLevel | null {
  if (state.career.trackId === null || state.career.levelIndex < 0) return null
  const track = JOB_TRACKS.find((t) => t.id === state.career.trackId)
  if (!track) return null
  return track.levels[state.career.levelIndex] ?? null
}

export function expensesPerDay(state: GameState): number {
  let total = DAILY_EXPENSES
  if (state.properties.some((p) => p.type === 'rented') && !state.events.flags['evicted']) {
    total += RENT_AMOUNT / RENT_EVERY_DAYS
  }
  if (state.events.flags['pet'] === true) {
    total += 4
  }
  return Math.round(total * 100) / 100
}