import { MAX_AGE } from './constants'
import type { GameState } from './types'
import { currentAge } from './time'
import { pushLog } from './state'
import { addToGauge } from './stats'

/** Guard used after any change: if the life must end, end it. */
export function gameOverFromState(state: GameState): void {
  if (state.gameOver) return
  if (state.player.stats.health <= 0) {
    state.player.stats.health = 0
    state.gameOver = true
    state.endingReason = 'health'
    pushLog(state, 'Your health gave out. This is the end of your life.', 'bad')
    return
  }
  const age = currentAge(state)
  if (age >= MAX_AGE) {
    state.gameOver = true
    state.endingReason = 'old-age'
    pushLog(state, `You reached ${MAX_AGE} years. A long, full life.`, 'good')
  }
}

export function canRetire(state: GameState): boolean {
  return currentAge(state) >= 65 && state.career.trackId !== null
}

export function retirePlayer(state: GameState): void {
  if (!canRetire(state)) return
  state.gameOver = true
  state.endingReason = 'retirement'
  addToGauge(state, 'happiness', 10)
  addToGauge(state, 'stress', -30)
  pushLog(state, 'You hand in notice, pack your desk, and start the next chapter.', 'good')
}