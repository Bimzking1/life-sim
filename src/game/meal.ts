import type { GameState, PlayerStats } from './types'
import { ITEMS } from '../data/items'
import { addStat, addToGauge } from './stats'
import { pushLog } from './state'

const FOOD_CATEGORY = 'Food'

/** Any consumable food in the bag right now. */
export function hasFood(state: GameState): boolean {
  return countFood(state) > 0
}

export function countFood(state: GameState): number {
  let total = 0
  for (const [itemId, qty] of Object.entries(state.inventory.qty)) {
    const def = ITEMS[itemId]
    if (def?.category === FOOD_CATEGORY) total += qty
  }
  return total
}

/** Consume one food item from inventory and apply its effects. */
export function consumeFood(state: GameState): boolean {
  for (const [itemId, qty] of Object.entries(state.inventory.qty)) {
    const def = ITEMS[itemId]
    if (def?.category === FOOD_CATEGORY && qty > 0) {
      applyItemEffects(state, itemId)
      state.inventory.qty[itemId] = qty - 1
      if (state.inventory.qty[itemId] <= 0) delete state.inventory.qty[itemId]
      return true
    }
  }
  return false
}

/** Record that the player ate a meal on the current day. */
export function admitMeal(state: GameState): void {
  state.player.lastMealDay = state.time.day
  state.events.flags['starving'] = false
}

export function applyItemEffects(state: GameState, itemId: string): void {
  const def = ITEMS[itemId]
  if (!def?.statEffects) return
  for (const [key, amount] of Object.entries(def.statEffects) as [keyof PlayerStats, number][]) {
    addStat(state.player.stats, key, amount)
  }
}

/** Use a consumable item (concert ticket etc.). */
export function useConsumable(state: GameState, itemId: string): boolean {
  const def = ITEMS[itemId]
  if (!def?.consumable) return false
  if ((state.inventory.qty[itemId] ?? 0) <= 0) return false
  applyItemEffects(state, itemId)
  if (def.isMeal) admitMeal(state)
  state.inventory.qty[itemId] -= 1
  if (state.inventory.qty[itemId] <= 0) delete state.inventory.qty[itemId]
  pushLog(state, `You used ${def.name}.`, 'neutral')
  return true
}

/** Partial stat change used elsewhere. */
export function tinyEnergyGain(state: GameState, amount: number): void {
  addToGauge(state, 'energy', amount)
}