import { describe, expect, it } from 'vitest'
import { newGame } from '../state'
import {
  addCash,
  applyLoan,
  canAfford,
  currentJob,
  dailyExpenses,
  depositAll,
  expensesPerDay,
  incomePerDay,
  repayLoanFromCash,
  spendCash,
  withdrawAll,
} from '../economy'
import { DAILY_EXPENSES, LOAN_AMOUNT, RENT_AMOUNT, RENT_EVERY_DAYS, START_BANK, START_CASH } from '../constants'

describe('cash helpers', () => {
  it('reports affordability from cash', () => {
    const s = newGame()
    expect(canAfford(s, s.player.cash)).toBe(true)
    expect(canAfford(s, s.player.cash + 1)).toBe(false)
  })

  it('spendCash spends what is affordable and never goes negative', () => {
    const s = newGame()
    s.player.cash = 100
    expect(spendCash(s, 30)).toBe(true)
    expect(s.player.cash).toBe(70)
    expect(spendCash(s, 1000)).toBe(false)
    expect(s.player.cash).toBe(70)
    expect(spendCash(s, 0)).toBe(true)
    expect(s.player.cash).toBe(70)
  })

  it('addCash credits the player account', () => {
    const s = newGame()
    const before = s.player.cash
    addCash(s, 12.345)
    expect(s.player.cash).toBe(Math.round((before + 12.345) * 100) / 100)
  })
})

describe('bank transfers', () => {
  it('depositAll moves cash into the bank', () => {
    const s = newGame()
    s.player.cash = 50
    s.player.bank = START_BANK
    depositAll(s)
    expect(s.player.bank).toBe(START_BANK + 50)
    expect(s.player.cash).toBe(0)
  })

  it('withdrawAll moves the bank balance back to cash', () => {
    const s = newGame()
    s.player.bank = 123
    s.player.cash = 5
    withdrawAll(s)
    expect(s.player.cash).toBe(5 + 123)
    expect(s.player.bank).toBe(0)
  })
})

describe('rent', () => {
  it('factors rent into expensesPerDay for a rented home', () => {
    const s = newGame()
    const rentPerDay = RENT_AMOUNT / RENT_EVERY_DAYS
    expect(expensesPerDay(s)).toBe(Math.round((DAILY_EXPENSES + rentPerDay) * 100) / 100)
  })
})

describe('loans', () => {
  it('applyLoan needs an active career', () => {
    const s = newGame()
    expect(applyLoan(s)).toBe(false)
    expect(s.player.loan).toBe(0)
  })

  it('repayLoanFromCash clears as much debt as cash allows', () => {
    const s = newGame()
    s.player.loan = 300
    s.player.cash = 120
    expect(repayLoanFromCash(s)).toBe(true)
    expect(s.player.loan).toBe(180)
    expect(s.player.cash).toBe(0)
  })

  it('confirms repaying the whole loan triggers the debt-free achievement', () => {
    const s = newGame()
    s.player.loan = 100
    s.player.cash = 100
    repayLoanFromCash(s)
    expect(s.player.loan).toBe(0)
    expect(s.player.cash).toBe(0)
  })
})

describe('income', () => {
  it('dailyExpenses returns the flat living cost', () => {
    expect(dailyExpenses()).toBe(DAILY_EXPENSES)
  })

  it('incomePerDay is zero without a career', () => {
    const s = newGame()
    expect(incomePerDay(s)).toBe(0)
    expect(currentJob(s)).toBeNull()
  })

  it('keeps LOAN_AMOUNT well below flabernac START_CASH', () => {
    expect(LOAN_AMOUNT).toBeGreaterThan(START_CASH)
  })
})
