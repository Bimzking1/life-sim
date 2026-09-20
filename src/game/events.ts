import { findEvent, EVENTS } from '../data/events'
import { ITEMS } from '../data/items'
import { findNpc } from '../data/npcs'
import type { ActionsContext, EffectDef, EventDef, GameState, PendingEvent, LocationId } from './types'
import { pushLog, pushDecision, addAchievement, newId } from './state'
import { addToGauge, addSkill } from './stats'
import { spendCash, addCash } from './economy'
import { admitMeal } from './meal'
import { sleepUntilMorning, advanceMinutes } from './time'
import { acceptJob, checkPromotion, currentJob } from './career'
import { mulberry32 } from './rng'
import { findCourse } from '../data/education'

/** Open a data event as the pending modal event. */
export function openDataEvent(state: GameState, eventId: string): boolean {
  const def = findEvent(eventId)
  if (!def) return false
  if (!def.condition(state)) return false
  state.events.pending = toPending(def, state)
  return true
}

function toPending(def: EventDef, s: GameState): PendingEvent {
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    choices: def.choices.map((c) => ({
      id: c.id,
      label: c.label,
      hint: c.hint,
      disabledReason: c.disabled ? c.disabled(s) ?? undefined : c.disabledReason,
    })),
  }
}

/** Fire a random eligible event with some probability. */
export function checkRandomEvent(state: GameState, locationId: LocationId, rand: () => number): boolean {
  if (state.events.pending) return false
  if (state.gameOver) return false
  const roll = rand()
  if (roll > 0.18) return false

  const eligible = EVENTS.filter((e) => {
    if (e.locations && !e.locations.includes(locationId)) return false
    if (!e.condition(state)) return false
    if (e.once && state.events.handled.includes(e.id)) return false
    return true
  })
  if (eligible.length === 0) return false

  const total = eligible.reduce((sum, e) => sum + e.weight, 0)
  let pick = rand() * total
  let def: EventDef | null = null
  for (const e of eligible) {
    pick -= e.weight
    if (pick <= 0) {
      def = e
      break
    }
  }
  if (!def) def = eligible[eligible.length - 1]
  if (def.once) state.events.handled.push(def.id)
  state.events.flags['last-event-day'] = state.time.day
  state.events.pending = toPending(def, state)
  return true
}

export function randomFactory(seed: number): () => number {
  return mulberry32(seed)
}

/** Apply the choice effects and close the pending event. */
export function resolveEventChoice(state: GameState, eventId: string, choiceId: string, ctx: ActionsContext): void {
  const pending = state.events.pending
  if (!pending || pending.id !== eventId) return
  state.events.pending = null

  // Dynamic events: job listings & promotion announcements.
  if (pending.id === 'job-listings') {
    const choice = pending.choices.find((c) => c.id === choiceId)
    if (choice?.kind === 'job' && choice.acceptJob) {
      acceptJob(state, choice.acceptJob.trackId, choice.acceptJob.levelIndex)
    } else {
      pushLog(state, 'You leave the notice board as it is.', 'neutral')
    }
    return
  }
  if (pending.id === 'promotion-announcement') {
    if (choiceId === 'promo-accept') {
      addToGauge(state, 'happiness', 8)
    } else {
      addToGauge(state, 'happiness', 4)
      bumpWorkplaceRespect(state)
    }
    pushLog(state, 'You get back to it, feeling the glow.', 'good')
    return
  }

  const def = findEvent(eventId)
  if (!def) return
  const choice = def.choices.find((c) => c.id === choiceId)
  if (!choice) {
    pushLog(state, 'You hesitate and the moment passes.', 'neutral')
    return
  }
  if (choice.disabled && choice.disabled(state)) return
  for (const effect of choice.effects) {
    applyEffect(state, effect, ctx)
  }
  if (def.once && !state.events.handled.includes(def.id)) {
    state.events.handled.push(def.id)
  }
}

function bumpWorkplaceRespect(state: GameState): void {
  for (const npcId of ['dana']) {
    const rec = state.relationships[npcId]
    if (rec?.met) rec.respect = Math.min(100, rec.respect + 4)
  }
}

export function applyEffect(state: GameState, effect: EffectDef, ctx: ActionsContext): void {
  switch (effect.kind) {
    case 'cash': {
      if ((effect.amount ?? 0) >= 0) addCash(state, effect.amount ?? 0)
      else spendCash(state, Math.abs(effect.amount ?? 0))
      break
    }
    case 'bank': {
      state.player.bank = Math.max(0, state.player.bank + (effect.amount ?? 0))
      break
    }
    case 'debt': {
      state.player.loan = Math.max(0, state.player.loan + (effect.amount ?? 0))
      break
    }
    case 'stat': {
      const key = effect.stat!
      if (key === 'strength' || key === 'intelligence' || key === 'charisma') addSkill(state, key, effect.amount ?? 0)
      else addToGauge(state, key as 'health' | 'energy' | 'happiness' | 'stress', effect.amount ?? 0)
      break
    }
    case 'relationship': {
      const npcId = effect.npc === '*' ? String(state.events.flags.partner ?? '') : effect.npc
      if (!npcId) break
      const rec = state.relationships[npcId]
      if (!rec) break
      const field = effect.field ?? 'friendship'
      rec[field] = Math.min(100, Math.max(0, rec[field] + (effect.amount ?? 0)))
      break
    }
    case 'addItem': {
      const item = effect.item!
      state.inventory.qty[item] = (state.inventory.qty[item] ?? 0) + (effect.qty ?? 1)
      break
    }
    case 'removeItem': {
      const item = effect.item!
      const cur = state.inventory.qty[item] ?? 0
      const next = cur - (effect.qty ?? 1)
      if (next <= 0) delete state.inventory.qty[item]
      else state.inventory.qty[item] = next
      break
    }
    case 'ownItem': {
      const item = effect.item!
      if (!state.inventory.owned.includes(item)) state.inventory.owned.push(item)
      const def = ITEMS[item]
      if (def?.flags) for (const [k, v] of Object.entries(def.flags)) state.events.flags[k] = v
      pushLog(state, `You now own ${def?.name ?? item}.`, 'good')
      break
    }
    case 'flag': {
      state.events.flags[effect.key!] = effect.value ?? true
      break
    }
    case 'log': {
      pushLog(state, effect.text ?? '', effect.tone ?? 'neutral')
      break
    }
    case 'time': {
      ctx.advance(effect.amount ?? 0)
      break
    }
    case 'achievement': {
      addAchievement(state, `evt:${effect.id ?? effect.text ?? newId()}`, effect.text ?? 'Achievement')
      break
    }
    case 'followup': {
      openDataEvent(state, effect.eventId!)
      break
    }
    case 'decision': {
      pushDecision(state, effect.text ?? '')
      break
    }
    case 'meal': {
      admitMeal(state)
      break
    }
    case 'course': {
      const courseId = effect.courseId
      const enrolled = state.education.enrolled
      if (courseId && courseId !== '*') {
        state.education.progress[courseId] = (state.education.progress[courseId] ?? 0) + (effect.amount ?? 1)
        finishCourseIfComplete(state, courseId)
      } else if (enrolled) {
        const def = findCourse(enrolled)
        if (def) {
          const refund = Math.round(def.cost * 0.5)
          addCash(state, refund)
          pushLog(state, `A scholarship refunded $${refund} toward ${def.name}.`, 'good')
        }
      }
      break
    }
    case 'fire': {
      if (state.career.trackId) {
        state.career.trackId = null
        state.career.levelIndex = -1
        pushLog(state, 'You were let go from your job.', 'bad')
      }
      break
    }
    case 'job': {
      if (effect.jobTrack) {
        acceptJob(state, effect.jobTrack, 0)
        checkPromotion(state)
      }
      break
    }
    case 'promote': {
      state.career.performance = Math.min(100, state.career.performance + (effect.amount ?? 0))
      break
    }
    case 'endGame': {
      state.gameOver = true
      state.endingReason = (effect.endingId as GameState['endingReason']) ?? 'old-age'
      break
    }
    case 'sleep': {
      sleepUntilMorning(state)
      state.player.stats.energy = 100
      break
    }
    case 'rent': {
      // Skip a rent period.
      state.player.rentDueDay = Math.max(state.time.day + 1, state.player.rentDueDay + 7)
      break
    }
  }
}

function finishCourseIfComplete(state: GameState, courseId: string): void {
  const def = findCourse(courseId)
  if (!def) return
  const done = state.education.progress[courseId] ?? 0
  if (done >= def.sessions) {
    if (!state.education.completed.includes(courseId)) {
      state.education.completed.push(courseId)
      if (state.education.enrolled === courseId) state.education.enrolled = null
      pushLog(state, `You finished ${def.name}. Careers open up.`, 'good')
      pushDecision(state, `Completed ${def.name}.`)
      addAchievement(state, `course-${courseId}`, `Completed ${def.name}`)
    }
  }
}

export function ensureMetNpc(state: GameState, npcId: string): void {
  const def = findNpc(npcId)
  if (!def) return
  const rec = state.relationships[npcId]
  if (!rec) {
    state.relationships[npcId] = { npcId, friendship: 0, romance: 0, respect: 0, met: false, flags: {} }
  }
}

export function currentJobTitle(state: GameState): string | null {
  return currentJob(state)?.title ?? null
}

export { advanceMinutes }