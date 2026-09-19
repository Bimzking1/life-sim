import { findLocation } from '../data/locations'
import { ITEMS } from '../data/items'
import type { GameState, LocationId } from './types'
import { spendCash } from './economy'
import { applyItemEffects, admitMeal } from './meal'
import { pushLog } from './state'

/** Buy an item from a location's shop. Returns error string on failure, or null on success. */
export function buyItem(state: GameState, locationId: LocationId, itemId: string): string | null {
  const loc = findLocation(locationId)
  if (!loc) return 'Unknown location.'
  if (!loc.shop.includes(itemId)) return 'This item is not sold here.'
  const def = ITEMS[itemId]
  if (!def) return 'Unknown item.'

  if (!spendCash(state, def.price)) {
    return 'You cannot afford this.'
  }

  if (def.permanent) {
    if (!state.inventory.owned.includes(itemId)) state.inventory.owned.push(itemId)
    if (def.flags) for (const [k, v] of Object.entries(def.flags)) state.events.flags[k] = v
    pushLog(state, `You bought ${def.name} for $${def.price}.`, 'good')
  } else if (def.immediate) {
    applyItemEffects(state, itemId)
    if (def.isMeal) admitMeal(state)
    pushLog(state, `You ordered ${def.name} for $${def.price}.`, 'good')
  } else {
    state.inventory.qty[itemId] = (state.inventory.qty[itemId] ?? 0) + 1
    pushLog(state, `You bought ${def.name} for $${def.price}.`, 'neutral')
  }
  return null
}

/** Use a consumable item from the bag. Returns error string or null. */
export function useInventoryItem(state: GameState, itemId: string): string | null {
  const def = ITEMS[itemId]
  if (!def) return 'Unknown item.'
  if (!def.consumable) return 'This item is not usable.'
  if ((state.inventory.qty[itemId] ?? 0) <= 0) return 'You do not have this item.'
  applyItemEffects(state, itemId)
  if (def.isMeal) admitMeal(state)
  state.inventory.qty[itemId] -= 1
  if (state.inventory.qty[itemId] <= 0) delete state.inventory.qty[itemId]
  pushLog(state, `You used ${def.name}.`, 'neutral')
  return null
}

/** Check if a location's item is purchasable & why not. */
export function buyDisabledReason(state: GameState, locationId: LocationId, itemId: string): string | null {
  const loc = findLocation(locationId)
  if (!loc || !loc.shop.includes(itemId)) return 'Not sold here.'
  const def = ITEMS[itemId]
  if (!def) return 'Unknown item.'
  if (state.player.cash < def.price) return 'You cannot afford this.'
  if (def.permanent && state.inventory.owned.includes(itemId)) return 'You already own this.'
  return null
}