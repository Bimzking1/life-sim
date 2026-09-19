import type {
  CareerView,
  ClockView,
  CourseView,
  EventView,
  InventoryItemView,
  LifeSummaryView,
  LocationView,
  LogEntryView,
  MoneyView,
  NpcView,
  PlayerView,
  PropertyView,
  StatView,
} from '../ui/types'
import type { GameState } from './types'
import { currentAge, formatClock } from './time'
import { LOCATIONS, travelDuration, locationDisabled, gymVisitCost, isLocationOpen } from '../data/locations'
import { ITEMS } from '../data/items'
import { NPCS, findNpc } from '../data/npcs'
import { allCourses, courseStatus } from './courses'
import { currentJob, nextJob, trackName, jobUnreachableReason, allTracks } from './career'
import { expensesPerDay, incomePerDay } from './economy'
import { buyDisabledReason } from './shop'
import { npcInteractionDisabled } from './interact'

const STAT_LABEL: Record<string, string> = {
  health: 'Health',
  energy: 'Energy',
  happiness: 'Happiness',
  strength: 'Strength',
  intelligence: 'Intelligence',
  charisma: 'Charisma',
  stress: 'Stress',
}

export function moneyStr(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function selectPlayer(state: GameState): PlayerView {
  const job = currentJob(state)
  let title = 'Unemployed'
  if (job) title = job.title
  else if (state.education.enrolled) title = 'Student'
  return { name: state.player.name, age: currentAge(state), title }
}

export function selectClock(state: GameState): ClockView {
  const c = formatClock(state)
  return { dayNumber: c.day, weekday: c.weekday, time: c.time, phase: c.phase, age: currentAge(state) }
}

export function selectStats(state: GameState): StatView[] {
  const s = state.player.stats
  const passiveCharisma = state.inventory.owned.includes('jacket') ? 2 : 0
  const rows: [keyof typeof s, StatView][] = [
    ['health', { id: 'health', label: 'Health', value: Math.round(s.health), max: 100 }],
    ['energy', { id: 'energy', label: 'Energy', value: Math.round(s.energy), max: 100 }],
    ['happiness', { id: 'happiness', label: 'Happiness', value: Math.round(s.happiness), max: 100 }],
    ['strength', { id: 'strength', label: 'Strength', value: Math.round(s.strength), max: 100 }],
    ['intelligence', { id: 'intelligence', label: 'Intelligence', value: Math.round(s.intelligence), max: 100 }],
    ['charisma', { id: 'charisma', label: 'Charisma', value: Math.round(s.charisma + passiveCharisma), max: 100 }],
    ['stress', { id: 'stress', label: 'Stress', value: Math.round(s.stress), max: 100 }],
  ]
  return rows.map(([, view]) => view)
}

export function selectMoney(state: GameState): MoneyView {
  const salary = incomePerDay(state)
  const bonus = state.events.flags['salary-bonus'] === true ? 15 : 0
  const hasRent = state.properties.some((p) => p.type === 'rented') && state.events.flags['evicted'] !== true
  const rentDay = hasRent ? Math.max(0, state.player.rentDueDay - state.time.day) : 0
  return {
    cash: moneyStr(state.player.cash),
    bank: moneyStr(state.player.bank),
    incomePerDay: moneyStr(salary + bonus),
    expensesPerDay: moneyStr(expensesPerDay(state)),
    rentDue: hasRent ? `Day ${state.player.rentDueDay} (in ${rentDay} day${rentDay === 1 ? '' : 's'})` : undefined,
  }
}

export function selectLocations(state: GameState): LocationView[] {
  return LOCATIONS.map((def) => {
    const closedReason = locationDisabled(state, def)
    const actions = def.actions.map((a) => {
      const disabledReason = closedReason ?? (a.disabled ? a.disabled(state) : null)
      let cost: string | undefined
      if (def.id === 'gym' && (a.id === 'lift-weights' || a.id === 'cardio')) {
        const fee = gymVisitCost(state)
        cost = fee > 0 ? `$${fee}` : undefined
      } else if (a.cost) {
        cost = `$${a.cost}`
      }
      return {
        id: a.id,
        label: a.label,
        description: a.description,
        duration: a.durationText,
        cost,
        disabledReason: disabledReason ?? undefined,
      }
    })
    const shop = def.shop.map((itemId) => {
      const item = ITEMS[itemId]
      if (!item) return null
      const owned =
        item.permanent && state.inventory.owned.includes(itemId) ? 1 : (state.inventory.qty[itemId] ?? 0)
      const disabledReason = closedReason ?? buyDisabledReason(state, def.id, itemId)
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: `$${item.price}`,
        description: item.description,
        effects: item.effectsText,
        owned,
        disabledReason: disabledReason ?? undefined,
      }
    }).filter((x): x is NonNullable<typeof x> => x !== null)

    const travelMinutes = travelDuration(def, state)
    return {
      id: def.id,
      name: def.name,
      tagline: def.tagline,
      hours: def.hours ? `${def.hours.open}:00 to ${def.hours.close}:00` : 'Always open',
      isOpen: isLocationOpen(def, state),
      travel: { duration: def.id === 'home' ? '—' : `${travelMinutes} min` },
      actions,
      shop: shop.length ? shop : undefined,
    }
  })
}

export function selectNpcs(state: GameState): NpcView[] {
  return NPCS.filter((npc) => state.relationships[npc.id]?.met).map((npc) => {
    const rec = state.relationships[npc.id]
    return {
      id: npc.id,
      name: npc.name,
      role: npc.role,
      personality: npc.personality,
      friendship: Math.round(rec.friendship),
      romance: Math.round(rec.romance),
      respect: Math.round(rec.respect),
      interactions: npc.interactions.map((a) => ({
        id: a.id,
        label: a.label,
        description: a.description,
        duration: formatDuration(a.durationMin),
        cost: a.cost ? `$${a.cost}` : undefined,
        disabledReason: npcInteractionDisabled(state, npc.id, a.id) ?? undefined,
      })),
    }
  })
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h} h ${m} min` : `${h} h`
}

export function selectLog(state: GameState): LogEntryView[] {
  return [...state.activityLog]
    .reverse()
    .map((e) => ({
      id: e.id,
      stamp: `Day ${e.day}, ${fmtClock(e.minutes)}`,
      text: e.text,
      tone: e.tone,
    }))
    .slice(0, 60)
}

function fmtClock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function selectCareer(state: GameState): CareerView {
  const job = currentJob(state)
  if (!job) {
    const requirements = allTracks()
      .map((track) => ({ track, job: track.levels[0] }))
      .map(({ track, job }) => {
        const reason = jobUnreachableReason(state, track, 0)
        return {
          label: `${track.name}: ${job.title} ($${job.salaryPerDay}/day)`,
          met: !reason,
        }
      }).slice(0, 4)
    return {
      track: null,
      title: null,
      salary: '—',
      hours: '—',
      performance: state.career.performance,
      requirements,
    }
  }

  const track = trackName(state)
  const nxt = nextJob(state)
  const requirements = nxt
    ? reqList(state, nxt.requiresPerformance, nxt.requiresTenureDays, nxt.requiresStats, nxt.requiresCourses)
    : []
  return {
    track,
    title: job.title,
    salary: `$${job.salaryPerDay}/day`,
    hours: '8 h shifts',
    performance: Math.round(state.career.performance),
    nextTitle: nxt?.title,
    requirements,
  }
}

function reqList(
  state: GameState,
  perf?: number,
  tenure?: number,
  stats?: readonly { stat: 'strength' | 'intelligence' | 'charisma'; min: number }[],
  courses?: readonly string[],
): { label: string; met: boolean }[] {
  const tenureDays = state.career.startedDay > 0 ? state.time.day - state.career.startedDay : 0
  const out: { label: string; met: boolean }[] = []
  if (perf) out.push({ label: `Performance ${perf}`, met: state.career.performance >= perf })
  if (tenure) out.push({ label: `${tenure} days in current role`, met: tenureDays >= tenure })
  for (const r of stats ?? []) {
    out.push({ label: `${STAT_LABEL[r.stat]} ${r.min}`, met: state.player.stats[r.stat] >= r.min })
  }
  for (const c of courses ?? []) {
    const def = findNpcForCourse(c)
    out.push({ label: def, met: state.education.completed.includes(c) })
  }
  return out
}

function findNpcForCourse(courseId: string): string {
  const def = allCourses().find((c) => c.id === courseId)
  return def ? def.name : courseId
}

export function selectCourses(state: GameState): CourseView[] {
  return allCourses().map((c) => {
    const status = courseStatus(state, c.id)
    const progress = state.education.progress[c.id] ?? 0
    const pct = Math.min(100, Math.round((progress / c.sessions) * 100))
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      status: status.status,
      progress: pct,
      cost: `$${c.cost.toLocaleString('en-US')}`,
      duration: `${c.sessions} sessions`,
      unlocks: c.unlocksText,
      lockedReason: status.status === 'locked' ? status.reason : undefined,
    }
  })
}

export function selectInventory(state: GameState): InventoryItemView[] {
  const out: InventoryItemView[] = []
  for (const [itemId, qty] of Object.entries(state.inventory.qty)) {
    const def = ITEMS[itemId]
    if (!def) continue
    out.push({
      id: itemId,
      name: def.name,
      category: def.category,
      quantity: qty,
      description: def.effectsText,
      usable: true,
    })
  }
  for (const itemId of state.inventory.owned) {
    const def = ITEMS[itemId]
    if (!def) continue
    out.push({
      id: itemId,
      name: def.name,
      category: def.category,
      quantity: 1,
      description: def.effectsText,
    })
  }
  return out
}

export function selectProperties(state: GameState): PropertyView[] {
  return state.properties.map((p) => ({
    id: p.id,
    name: p.name,
    detail: p.detail,
  }))
}

export function selectEvent(state: GameState): EventView | null {
  const p = state.events.pending
  if (!p) return null
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    choices: p.choices.map((c) => ({
      id: c.id,
      label: c.label,
      hint: c.hint,
      disabledReason: c.disabledReason,
    })),
  }
}

export function selectSummary(state: GameState): LifeSummaryView {
  const job = currentJob(state)
  const careerText = job ? `${job.title}, ${trackName(state)}` : 'Unemployed'
  const age = currentAge(state)
  let ending = 'A life, fully lived'
  if (state.endingReason === 'health') ending = 'A life cut short'
  if (state.endingReason === 'retirement') ending = 'A long, earned retirement'

  const netWorth = state.player.cash + state.player.bank
  const relationships = Object.values(state.relationships)
    .filter((r) => r.met)
    .map((r) => {
      const def = findNpc(r.npcId)
      const label = [def?.name ?? r.npcId]
      if (r.romance >= 70) label.push('partner')
      else if (r.friendship >= 70) label.push('best friend')
      return label.join(': ')
    })

  return {
    ending,
    finalAge: age,
    career: careerText,
    money: `$${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })} in savings`,
    education: state.education.completed.map((id) => findNpcForCourse(id)),
    relationships,
    achievements: state.achievements.map((a) => a.text),
    events: state.decisions.slice(-8).map((d) => d.text),
    properties: state.properties.map((p) => `${p.name} — ${p.type}`),
    decisions: state.decisions.slice(-6).map((d) => d.text),
  }
}