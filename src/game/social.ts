import type { GameState, RelationshipRecord } from './types'
import { findNpc, NPCS } from '../data/npcs'
import { addAchievement, pushLog } from './state'
import { addToGauge, addSkill } from './stats'

export function ensureRelationship(state: GameState, npcId: string): RelationshipRecord {
  let rec = state.relationships[npcId]
  if (!rec) {
    rec = { npcId, friendship: 0, romance: 0, respect: 0, met: false, flags: {} }
    state.relationships[npcId] = rec
  }
  return rec
}

/** Mark an NPC as met, adding them to the relationship panel. */
export function markMet(state: GameState, npcId: string): boolean {
  const def = findNpc(npcId)
  if (!def) return false
  const rec = ensureRelationship(state, npcId)
  if (rec.met) return false
  rec.met = true
  pushLog(state, `You met ${def.name}, ${def.role}. ${def.intro}`, 'info')
  addAchievement(state, `met-${npcId}`, `Met ${def.name}`)
  return true
}

export function metCount(state: GameState): number {
  return Object.values(state.relationships).filter((r) => r.met).length
}

/** Any met NPC the player could realistically date. */
export function partnerCandidate(state: GameState): RelationshipRecord | null {
  const candidates = Object.values(state.relationships).filter(
    (r) => r.met && (r.romance >= 40 || r.friendship >= 40),
  )
  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.romance - a.romance || b.friendship - a.friendship)
  return candidates[0]
}

/** Add friendship to a random (met) friend. */
export function socializeWithRandomFriend(state: GameState, amount: number): void {
  const met = Object.values(state.relationships).filter((r) => r.met)
  if (met.length === 0) return
  const pick = met[Math.floor(Math.random() * met.length)]
  pick.friendship = Math.min(100, pick.friendship + amount)
}

/** Apply an interaction's generic effects to a relationship. */
export function applyNpcInteraction(state: GameState, rec: RelationshipRecord, effects: NpcInteractionEffects): void {
  const map = {
    friendship: effects.friendship,
    romance: effects.romance,
    respect: effects.respect,
  } as const
  for (const k of ['friendship', 'romance', 'respect'] as const) {
    const amt = map[k]
    if (amt) rec[k] = Math.min(100, Math.max(0, rec[k] + amt))
  }
  if (effects.happiness) addToGauge(state, 'happiness', effects.happiness)
  if (effects.stress) addToGauge(state, 'stress', effects.stress * -1)
  if (effects.health) addToGauge(state, 'health', effects.health)
  if (effects.energy) addToGauge(state, 'energy', effects.energy)
  if (effects.intelligence) addSkill(state, 'intelligence', effects.intelligence)
  if (effects.charisma) addSkill(state, 'charisma', effects.charisma)
  if (effects.strength) addSkill(state, 'strength', effects.strength)
}

export interface NpcInteractionEffects {
  friendship?: number
  romance?: number
  respect?: number
  happiness?: number
  stress?: number
  health?: number
  energy?: number
  intelligence?: number
  charisma?: number
  strength?: number
}

export function mapEffects(effects: NpcInteractionEffects): NpcInteractionEffects {
  return Object.fromEntries(
    Object.entries(effects).filter(([, v]) => typeof v === 'number'),
  ) as NpcInteractionEffects
}

/** True once the player has any romantic partner. */
export function hasPartner(state: GameState): boolean {
  return typeof state.events.flags.partner === 'string'
}

export function allNpcs() {
  return NPCS
}