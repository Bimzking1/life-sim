import type { ActionsContext, GameState, LocationDef, LocationId } from '../game/types'
import { sleepUntilMorning, currentAge } from '../game/time'
import { addToGauge, addSkill } from '../game/stats'
import { spendCash, addCash, payAllRent, applyLoan, repayLoanFromCash } from '../game/economy'
import { consumeFood, hasFood, admitMeal } from '../game/meal'
import { markMet, partnerCandidate, socializeWithRandomFriend } from '../game/social'
import { buildJobListingEvent, buildPromotionEvent, checkPromotion, currentJob } from '../game/career'
import { PERFORMANCE_AFTER_80, PERFORMANCE_PER_SHIFT, RETIREMENT_AGE } from '../game/constants'
import { pushDecision } from '../game/state'
import { canRetire, retirePlayer } from '../game/lifecycle'

export function isLocationOpen(def: LocationDef, state: GameState): boolean {
  if (!def.hours) return true
  const h = Math.floor(state.time.minutes / 60)
  return h >= def.hours.open && h < def.hours.close
}

function formatHours(hours: { open: number; close: number }): string {
  return `${hours.open}:00–${hours.close}:00`
}

export function locationDisabled(state: GameState, def: LocationDef): string | null {
  return isLocationOpen(def, state) ? null : `Closed. ${def.name} is open ${formatHours(def.hours!)}.`
}

export function travelDuration(def: LocationDef, state: GameState): number {
  const mult = state.inventory.owned.includes('bike') ? 0.5 : 1
  return Math.max(10, Math.round(def.travelMin * mult))
}

export function gymMemberUntil(state: GameState): number {
  const v = state.events.flags['gym-until']
  return typeof v === 'number' ? v : 0
}

export function isGymMember(state: GameState): boolean {
  return gymMemberUntil(state) >= state.time.day
}

export function gymVisitCost(state: GameState): number {
  return isGymMember(state) ? 0 : 5
}

export function trainingGain(state: GameState, base: number): number {
  return state.inventory.owned.includes('dumbbells') ? base + Math.round(base / 2) : base
}

export function studyGain(state: GameState, base: number): number {
  return (state.inventory.owned.includes('laptop') ? base * 2 : base)
}

const sleepAction = {
  id: 'sleep',
  label: 'Sleep',
  description: 'Restore energy and start a new day.',
  durationText: 'Until morning',
  durationMin: 0,
  disabled: () => null,
  run: (s: GameState, ctx: ActionsContext) => {
    const before = s.time.day
    sleepUntilMorning(s)
    const sleptDays = s.time.day - before
    let energy = 100
    if (s.inventory.owned.includes('bed')) energy += 12
    s.player.stats.energy = Math.min(100, energy)
    s.player.stats.health = Math.min(100, s.player.stats.health + 5)
    s.player.stats.stress = Math.max(0, s.player.stats.stress - 20)
    s.player.stats.happiness = Math.min(100, s.player.stats.happiness + 3)
    ctx.log(`You slept through ${sleptDays} day${sleptDays === 1 ? '' : 's'} and woke up refreshed.`, 'good')
  },
}

const gymActions = [
  {
    id: 'lift-weights',
    label: 'Lift weights',
    description: 'Builds strength. Costs energy.',
    durationText: '1 h',
    durationMin: 60,
    cost: 5,
    disabled: (s: GameState) => {
      if (s.player.stats.energy < 15) return 'Too tired. Rest first.'
      const fee = gymVisitCost(s)
      if (fee > 0 && s.player.cash < fee) return 'Cannot afford the day pass.'
      return null
    },
    run: (s: GameState, ctx: ActionsContext) => {
      const fee = gymVisitCost(s)
      if (fee > 0) spendCash(s, fee)
      const gain = trainingGain(s, 2)
      addSkill(s, 'strength', gain)
      addToGauge(s, 'energy', -15)
      addToGauge(s, 'stress', -3)
      addToGauge(s, 'happiness', 1)
      ctx.log(`You lifted weights. Strength +${gain}.`, 'neutral')
      if (fee > 0) ctx.log(`Paid $${fee} for a day pass.`, 'neutral')
      markMet(s, 'tomas')
      ctx.checkEvents('gym')
    },
  },
  {
    id: 'cardio',
    label: 'Run on the treadmill',
    description: 'Improves health and lowers stress.',
    durationText: '1 h',
    durationMin: 60,
    cost: 5,
    disabled: (s: GameState) => {
      if (s.player.stats.energy < 10) return 'Too tired. Rest first.'
      const fee = gymVisitCost(s)
      if (fee > 0 && s.player.cash < fee) return 'Cannot afford the day pass.'
      return null
    },
    run: (s: GameState, ctx: ActionsContext) => {
      const fee = gymVisitCost(s)
      if (fee > 0) spendCash(s, fee)
      addToGauge(s, 'energy', -12)
      addToGauge(s, 'stress', -8)
      addToGauge(s, 'health', 2)
      addToGauge(s, 'happiness', 2)
      ctx.log('You ran a few kilometers. Health +2, stress -8.', 'good')
      if (fee > 0) ctx.log(`Paid $${fee} for a day pass.`, 'neutral')
      markMet(s, 'tomas')
      ctx.checkEvents('gym')
    },
  },
  {
    id: 'membership',
    label: 'Buy monthly pass',
    description: 'Free entry for 30 days.',
    durationText: '5 min',
    durationMin: 5,
    cost: 60,
    disabled: (s: GameState) => (isGymMember(s) ? 'You already have an active pass.' : null),
    run: (s: GameState, ctx: ActionsContext) => {
      if (!spendCash(s, 60)) {
        ctx.toast('error', 'Not enough cash.')
        return
      }
      s.events.flags['gym-until'] = s.time.day + 30
      ctx.log('Gym membership active for 30 days.', 'good')
      pushDecision(s, 'Bought a gym membership.')
    },
  },
]

export const LOCATIONS: LocationDef[] = [
  {
    id: 'home',
    name: 'Home',
    tagline: 'A rented room above a laundromat.',
    hours: null,
    travelMin: 0,
    actions: [
      sleepAction,
      {
        id: 'rest',
        label: 'Rest',
        description: 'Lie down and take the edge off stress.',
        durationText: '1 h',
        durationMin: 60,
        disabled: () => null,
        run: (s: GameState, ctx: ActionsContext) => {
          addToGauge(s, 'energy', 15)
          addToGauge(s, 'stress', -8)
          addToGauge(s, 'happiness', 1)
          ctx.log('You rested. Energy +15, stress -8.', 'neutral')
        },
      },
      {
        id: 'cook',
        label: 'Cook a meal',
        description: 'Uses food from your inventory.',
        durationText: '30 min',
        durationMin: 30,
        disabled: (s: GameState) => (hasFood(s) ? null : 'You have no food at home.'),
        run: (s: GameState, ctx: ActionsContext) => {
          consumeFood(s)
          admitMeal(s)
          if (s.inventory.owned.includes('cookware')) addToGauge(s, 'happiness', 2)
          ctx.log('You cooked and ate. Hunger is satisfied.', 'good')
          markMet(s, 'maya')
          ctx.checkEvents('home')
        },
      },
      {
        id: 'pay-rent',
        label: 'Pay rent',
        description: 'Rent is due every 7 days.',
        durationText: '5 min',
        durationMin: 5,
        disabled: () => null,
        run: (s: GameState, ctx: ActionsContext) => {
          if (payAllRent(s)) {
            ctx.log(`Rent settled. Next due on day ${s.player.rentDueDay}.`, 'good')
          } else {
            ctx.toast('error', 'You cannot afford rent right now.')
          }
        },
      },
    ],
    shop: [],
  },
  {
    id: 'grocery',
    name: 'Grocery',
    tagline: 'Cheap food keeps the daily budget alive.',
    hours: { open: 7, close: 22 },
    travelMin: 15,
    actions: [],
    shop: ['bread', 'ramen', 'produce', 'rice', 'soup'],
  },
  {
    id: 'bank',
    name: 'Bank',
    tagline: 'Keep savings safe and borrow when you must.',
    hours: { open: 9, close: 17 },
    travelMin: 20,
    actions: [
      {
        id: 'deposit',
        label: 'Deposit cash',
        description: 'Move all your cash into your account.',
        durationText: '10 min',
        durationMin: 10,
        disabled: (s: GameState) => (s.player.cash > 0 ? null : 'You have no cash to deposit.'),
        run: (s: GameState, ctx: ActionsContext) => {
          const amount = s.player.cash
          s.player.bank += amount
          s.player.cash = 0
          ctx.log(`Deposited $${formatMoney(amount)} into your account.`, 'neutral')
        },
      },
      {
        id: 'withdraw',
        label: 'Withdraw cash',
        description: 'Move all your savings to your wallet.',
        durationText: '10 min',
        durationMin: 10,
        disabled: (s: GameState) => (s.player.bank > 0 ? null : 'Your account is empty.'),
        run: (s: GameState, ctx: ActionsContext) => {
          const amount = s.player.bank
          s.player.cash += amount
          s.player.bank = 0
          ctx.log(`Withdrew $${formatMoney(amount)} to your wallet.`, 'neutral')
        },
      },
      {
        id: 'apply-loan',
        label: 'Apply for a loan',
        description: 'Borrow $500. Needs a steady job.',
        durationText: '1 h',
        durationMin: 60,
        disabled: (s: GameState) => {
          if (!s.career.trackId) return 'Requires a job.'
          if (s.player.loan > 0) return 'You already have an outstanding loan.'
          return null
        },
        run: (s: GameState, ctx: ActionsContext) => {
          if (applyLoan(s)) {
            ctx.log('Loan approved: $500 added to your account.', 'info')
          } else {
            ctx.toast('error', 'Your loan was not approved.')
          }
        },
      },
      {
        id: 'repay-loan',
        label: 'Repay loan',
        description: 'Pay down your loan from cash.',
        durationText: '10 min',
        durationMin: 10,
        disabled: (s: GameState) => {
          if (s.player.loan <= 0) return 'You have no loan.'
          if (s.player.cash <= 0) return 'No cash on hand.'
          return null
        },
        run: (s: GameState, ctx: ActionsContext) => {
          repayLoanFromCash(s)
          ctx.log(`Loan balance: $${formatMoney(s.player.loan)}.`, 'neutral')
        },
      },
    ],
    shop: [],
  },
  {
    id: 'gym',
    name: 'Gym',
    tagline: 'Stronger body, calmer head.',
    hours: { open: 6, close: 23 },
    travelMin: 15,
    actions: gymActions,
    shop: [],
  },
  {
    id: 'university',
    name: 'University',
    tagline: 'Degrees and courses that open career doors.',
    hours: { open: 8, close: 20 },
    travelMin: 25,
    actions: [
      {
        id: 'study',
        label: 'Study in the library',
        description: 'Builds intelligence on your own.',
        durationText: '2 h',
        durationMin: 120,
        disabled: (s: GameState) => (s.player.stats.energy < 10 ? 'Too tired to focus.' : null),
        run: (s: GameState, ctx: ActionsContext) => {
          const gain = studyGain(s, 2)
          addSkill(s, 'intelligence', gain)
          addToGauge(s, 'energy', -10)
          addToGauge(s, 'stress', 2)
          ctx.log(`You studied. Intelligence +${gain}.`, 'neutral')
          markMet(s, 'priya')
          ctx.checkEvents('university')
        },
      },
      {
        id: 'attend-class',
        label: 'Attend your course',
        description: 'Progress your enrolled course.',
        durationText: '3 h',
        durationMin: 180,
        disabled: (s: GameState) => {
          if (!s.education.enrolled) return 'You are not enrolled in a course.'
          if (s.player.stats.energy < 20) return 'Too tired to attend.'
          return null
        },
        run: (s: GameState, ctx: ActionsContext) => {
          if (!s.education.enrolled) return
          s.education.progress[s.education.enrolled] = (s.education.progress[s.education.enrolled] ?? 0) + 1
          addSkill(s, 'intelligence', 1)
          addToGauge(s, 'energy', -15)
          addToGauge(s, 'stress', 3)
          ctx.log('You attended a class session.', 'neutral')
          markMet(s, 'priya')
          ctx.checkEvents('university')
        },
      },
    ],
    shop: [],
  },
  {
    id: 'workplace',
    name: 'Workplace',
    tagline: 'Where the paycheck comes from.',
    hours: { open: 8, close: 18 },
    travelMin: 30,
    actions: [
      {
        id: 'browse-jobs',
        label: 'Browse job listings',
        description: 'See what you qualify for.',
        durationText: '1 h',
        durationMin: 60,
        disabled: () => null,
        run: (s: GameState, ctx: ActionsContext) => {
          ctx.log('You read the job board for an hour.', 'neutral')
          ctx.openEvent(buildJobListingEvent(s))
        },
      },
      {
        id: 'work-shift',
        label: 'Work a shift',
        description: 'Earn pay and build performance.',
        durationText: '8 h',
        durationMin: 480,
        disabled: (s: GameState) => {
          if (!s.career.trackId) return 'You do not have a job yet.'
          if (s.player.stats.energy < 20) return 'Too exhausted to work a full shift.'
          return null
        },
        run: (s: GameState, ctx: ActionsContext) => {
          const job = currentJob(s)
          if (!job) return
          addCash(s, job.salaryPerDay)
          s.career.totalWorkDays += 1
          const perfGain = s.career.performance >= 80 ? PERFORMANCE_AFTER_80 : PERFORMANCE_PER_SHIFT
          s.career.performance = Math.min(100, s.career.performance + perfGain)
          addToGauge(s, 'energy', -25)
          addToGauge(s, 'stress', 8)
          addToGauge(s, 'health', -2)
          ctx.log(`You worked a shift as ${job.title}. Earned $${job.salaryPerDay}.`, 'info')
          markMet(s, 'dana')
          ctx.checkEvents('workplace')
          if (checkPromotion(s)) {
            ctx.openEvent(buildPromotionEvent(s))
          }
        },
      },
      {
        id: 'overtime',
        label: 'Ask for overtime',
        description: 'Extra pay, extra stress.',
        durationText: '2 h',
        durationMin: 120,
        disabled: (s: GameState) => {
          if (!s.career.trackId) return 'You do not have a job yet.'
          if (s.player.stats.energy < 15) return 'Too exhausted for overtime.'
          return null
        },
        run: (s: GameState, ctx: ActionsContext) => {
          const job = currentJob(s)
          if (!job) return
          const hourly = job.salaryPerDay / 8
          const pay = Math.round(hourly * 1.5 * 2)
          addCash(s, pay)
          s.career.performance = Math.min(100, s.career.performance + 2)
          addToGauge(s, 'energy', -15)
          addToGauge(s, 'stress', 10)
          ctx.log(`You pulled overtime. Earned an extra $${pay}.`, 'info')
          markMet(s, 'dana')
          ctx.checkEvents('workplace')
        },
      },
      {
        id: 'retire',
        label: 'Retire',
        description: `Call it a career at ${RETIREMENT_AGE}.`,
        durationText: '2 h',
        durationMin: 120,
        disabled: (s: GameState) => {
          if (currentAge(s) < RETIREMENT_AGE) return `Retirement opens at age ${RETIREMENT_AGE}.`
          if (!s.career.trackId) return 'You are not employed.'
          return null
        },
        run: (s: GameState, ctx: ActionsContext) => {
          if (canRetire(s)) {
            retirePlayer(s)
            ctx.log('The last badge clicks shut. Retirement begins.', 'good')
          }
        },
      },
    ],
    shop: [],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    tagline: 'A proper meal, and a place to meet people.',
    hours: { open: 11, close: 23 },
    travelMin: 15,
    actions: [
      {
        id: 'eat-out',
        label: 'Eat out',
        description: 'A hot meal and some company.',
        durationText: '1 h 30 min',
        durationMin: 90,
        cost: 12,
        disabled: (s: GameState) => (s.player.cash < 12 ? 'Cannot afford it.' : null),
        run: (s: GameState, ctx: ActionsContext) => {
          spendCash(s, 12)
          admitMeal(s)
          addToGauge(s, 'happiness', 6)
          addToGauge(s, 'energy', 10)
          socializeWithRandomFriend(s, 3)
          ctx.log('You ate out. Happiness +6.', 'good')
          markMet(s, 'lenny')
          ctx.checkEvents('restaurant')
        },
      },
      {
        id: 'date-night',
        label: 'Go on a date',
        description: 'Treat your partner or a close friend.',
        durationText: '2 h',
        durationMin: 120,
        cost: 40,
        disabled: (s: GameState) => {
          if (s.player.cash < 40) return 'Cannot afford it.'
          return partnerCandidate(s) ? null : 'You have no one close enough to date yet.'
        },
        run: (s: GameState, ctx: ActionsContext) => {
          spendCash(s, 40)
          admitMeal(s)
          addToGauge(s, 'happiness', 10)
          addToGauge(s, 'stress', -5)
          const partner = partnerCandidate(s)
          if (partner) {
            partner.romance = Math.min(100, partner.romance + 5)
            partner.friendship = Math.min(100, partner.friendship + 2)
          }
          ctx.log('The date went well.', 'good')
          ctx.checkEvents('restaurant')
        },
      },
    ],
    shop: ['burger', 'salad', 'steak'],
  },
  {
    id: 'downtown',
    name: 'Downtown',
    tagline: 'Shops, strangers, and street corners full of chances.',
    hours: null,
    travelMin: 20,
    actions: [
      {
        id: 'wander',
        label: 'Walk around',
        description: 'You might meet someone or find something.',
        durationText: '1 h',
        durationMin: 60,
        disabled: () => null,
        run: (s: GameState, ctx: ActionsContext) => {
          addToGauge(s, 'happiness', 2)
          ctx.log('You walked the downtown blocks.', 'neutral')
          markMet(s, 'lenny')
          ctx.checkEvents('downtown')
        },
      },
      {
        id: 'converse',
        label: 'Talk to strangers',
        description: 'Practice charisma with total strangers.',
        durationText: '1 h',
        durationMin: 60,
        disabled: () => null,
        run: (s: GameState, ctx: ActionsContext) => {
          addSkill(s, 'charisma', 2)
          addToGauge(s, 'stress', -2)
          ctx.log('You chatted with strangers. Charisma +2.', 'neutral')
          ctx.checkEvents('downtown')
        },
      },
    ],
    shop: ['jacket', 'phone', 'bed', 'bike', 'laptop', 'cookware', 'concert', 'dumbbells'],
  },
]

export function findLocation(id: LocationId): LocationDef | undefined {
  return LOCATIONS.find((l) => l.id === id)
}

export function formatMoney(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}