import type { GameState, PlayerStats } from './types'
import { STAT_MAX, STAT_MIN } from './constants'

export function clamp(value: number, min = STAT_MIN, max = STAT_MAX): number {
  return Math.min(max, Math.max(min, value))
}

export function addStat(stats: PlayerStats, key: keyof PlayerStats, amount: number): void {
  const next = clamp(stats[key] + amount)
  stats[key] = Math.round(next * 100) / 100
}

export function addToGauge(state: GameState, gauge: 'health' | 'energy' | 'happiness' | 'stress', amount: number): void {
  addStat(state.player.stats, gauge, amount)
}

export function addSkill(state: GameState, skill: 'strength' | 'intelligence' | 'charisma', amount: number): void {
  addStat(state.player.stats, skill, amount)
}

export function hasSkill(stats: PlayerStats, skill: keyof PlayerStats, min: number): boolean {
  return stats[skill] >= min
}