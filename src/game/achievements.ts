import type { GameState } from './types'
import { addAchievement } from './state'
import { currentAge } from './time'

/** Idempotent achievement sweep; safe to call after any state change. */
export function checkAchievements(state: GameState): void {
  const netWorth = state.player.cash + state.player.bank
  const hasHome = state.properties.some((p) => p.type === 'owned')

  if (state.career.totalWorkDays >= 1) addAchievement(state, 'first-shift', 'Worked a first shift')
  if (state.career.totalWorkDays >= 100) addAchievement(state, 'century-worker', 'Worked 100 shifts')

  if (netWorth >= 1000) addAchievement(state, 'saved-1k', 'Net worth $1,000')
  if (netWorth >= 10000) addAchievement(state, 'saved-10k', 'Net worth $10,000')
  if (netWorth >= 50000) addAchievement(state, 'saved-50k', 'Net worth $50,000')

  if (hasHome) addAchievement(state, 'homeowner', 'Bought a home')

  if (currentAge(state) >= 30) addAchievement(state, 'age-30', 'Reached 30')
  if (currentAge(state) >= 40) addAchievement(state, 'age-40', 'Reached 40')
  if (currentAge(state) >= 50) addAchievement(state, 'age-50', 'Reached 50')

  if (state.player.stats.strength >= 50) addAchievement(state, 'strong', 'Grew strong (Strength 50)')
  if (state.player.stats.intelligence >= 50) addAchievement(state, 'scholar', 'Grew sharp (Intelligence 50)')
  if (state.player.stats.charisma >= 50) addAchievement(state, 'charming', 'Grew magnetic (Charisma 50)')

  const metCount = Object.values(state.relationships).filter((r) => r.met).length
  if (metCount >= 3) addAchievement(state, 'friend-circle', 'Built a circle of friends')

  if (state.events.flags['married'] === true) addAchievement(state, 'married', 'Got married')
  if (state.events.flags['pet'] === true) addAchievement(state, 'pet-owner', 'Adopted a dog')
  if (state.inventory.owned.includes('bed')) addAchievement(state, 'comfy-bed', 'Owned a real bed')
  if (state.inventory.owned.includes('phone')) addAchievement(state, 'phoned-in', 'Owned a phone')

  if (state.education.completed.includes('cs-bachelor')) addAchievement(state, 'cs-degree', 'Earned a Computer Science degree')
  if (state.education.completed.length >= 2) addAchievement(state, 'life-long-learner', 'Finished two courses')

  if (state.properties.length >= 3) addAchievement(state, 'property-tycoon', 'Owned three properties')
}

/** Property upgrades unlocked by savings; called from the store when rich enough. */
export function applyPropertyUpgrade(state: GameState): void {
  const netWorth = state.player.cash + state.player.bank
  const owned = state.properties.filter((p) => p.type === 'owned')

  if (netWorth >= 50000 && !owned.some((p) => p.id === 'apartment')) {
    state.properties.push({ id: 'apartment', name: 'Apartment', detail: 'Two rooms, a real kitchen, and a lock that works.', type: 'owned' })
    addAchievement(state, 'first-own', 'Bought your first home')
  }
  if (netWorth >= 150000 && !owned.some((p) => p.id === 'house')) {
    state.properties.push({ id: 'house', name: 'House', detail: 'A yard, a driveway, and room for a family.', type: 'owned' })
    addAchievement(state, 'house', 'Bought a house')
  }
  if (netWorth >= 500000 && !owned.some((p) => p.id === 'estate')) {
    state.properties.push({ id: 'estate', name: 'Estate', detail: 'The kind of address you can retire on.', type: 'owned' })
    addAchievement(state, 'estate', 'Bought an estate')
  }
}

/** Rent paid on time achievement hook. */
export function checkRentStreak(state: GameState): void {
  if (state.player.rentDebt <= 0 && state.player.rentDueDay >= state.time.day && (state.events.flags['rent-paid'] === true || state.time.day >= 7)) {
    // (Rent streak is tracked through normal play; nothing extra needed here.)
  }
}