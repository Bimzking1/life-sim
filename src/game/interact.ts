import type { ActionsContext, GameState, LocationId } from './types'
import { findNpc } from '../data/npcs'
import { findLocation } from '../data/locations'
import { ensureRelationship, applyNpcInteraction } from './social'
import type { NpcInteractionEffects } from './social'
import { spendCash } from './economy'
import { pushLog, pushDecision } from './state'
import { addToGauge } from './stats'

export interface InteractionCheck {
  error: string | null
}

export function npcInteractionDisabled(state: GameState, npcId: string, actionId: string): string | null {
  const npc = findNpc(npcId)
  if (!npc) return 'Unknown person.'
  const rec = state.relationships[npcId]
  if (!rec?.met) return `You have not met ${npc.name} yet.`
  const action = npc.interactions.find((i) => i.id === actionId)
  if (!action) return 'Unknown interaction.'
  if (state.player.currentLocation !== npc.location) {
    const loc = locName(npc.location)
    return `${npc.name} is at the ${loc}. Go there.`
  }
  if (action.requiresFriendship && rec.friendship < action.requiresFriendship) {
    return `Needs more friendship with ${npc.name}.`
  }
  if (action.requiresRomance && rec.romance < action.requiresRomance) {
    return `Needs more romance with ${npc.name}.`
  }
  if (action.cost && state.player.cash < action.cost) return 'You cannot afford this.'
  return null
}

export function runNpcInteraction(state: GameState, npcId: string, actionId: string, ctx: ActionsContext): string | null {
  const npc = findNpc(npcId)
  if (!npc) return 'Unknown person.'
  const rec = ensureRelationship(state, npcId)
  const action = npc.interactions.find((i) => i.id === actionId)
  if (!action) return 'Unknown interaction.'

  const blocked = npcInteractionDisabled(state, npcId, actionId)
  if (blocked) return blocked

  if (action.cost) spendCash(state, action.cost)
  ctx.advance(action.durationMin)

  applyNpcInteraction(state, rec, sanitizeEffects(action.effects))

  if (action.setFlags) {
    for (const [k, v] of Object.entries(action.setFlags)) state.events.flags[k] = v
    if (action.setFlags.partner) {
      state.events.flags.partner = action.setFlags.partner
      pushDecision(state, `You and ${npc.name} started dating.`)
      addToGauge(state, 'happiness', 12)
    }
  }

  const desc = action.setFlags?.partner
    ? `You told ${npc.name} how you feel. They said yes.`
    : `You spent time with ${npc.name}: ${action.label}.`
  pushLog(state, desc, 'good')
  ctx.checkEvents(npc.location)
  return null
}

function sanitizeEffects(effects: NpcInteractionEffects): NpcInteractionEffects {
  return Object.fromEntries(
    Object.entries(effects).filter(([, v]) => typeof v === 'number'),
  ) as NpcInteractionEffects
}

function locName(id: LocationId): string {
  return findLocation(id)?.name ?? id
}