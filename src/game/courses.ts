import { COURSES, findCourse } from '../data/education'
import type { GameState } from './types'
import { spendCash } from './economy'
import { pushLog, pushDecision, addAchievement } from './state'
import { addToGauge, addSkill } from './stats'

export type CourseGate =
  | { status: 'available' }
  | { status: 'locked'; reason: string }

export function courseStatus(state: GameState, courseId: string): { status: 'available' | 'in-progress' | 'completed' | 'locked'; reason?: string } {
  if (state.education.completed.includes(courseId)) return { status: 'completed' }
  if (state.education.enrolled === courseId) return { status: 'in-progress' }
  if ((state.education.progress[courseId] ?? 0) > 0) return { status: 'in-progress' }
  const def = findCourse(courseId)
  if (!def) return { status: 'locked', reason: 'Unknown course.' }
  for (const prereq of def.prereqCourses) {
    if (!state.education.completed.includes(prereq)) {
      const p = findCourse(prereq)
      return { status: 'locked', reason: `Finish ${p?.name ?? prereq} first.` }
    }
  }
  if (def.requiresStats) {
    for (const r of def.requiresStats) {
      if (state.player.stats[r.stat] < r.min) {
        return { status: 'locked', reason: `Requires ${r.stat} ${r.min}.` }
      }
    }
  }
  return { status: 'available' }
}

/** Enroll or continue a course. Returns error string on failure, or null on success. */
export function courseAction(state: GameState, courseId: string): string | null {
  const def = findCourse(courseId)
  if (!def) return 'Unknown course.'
  const status = courseStatus(state, courseId)

  if (status.status === 'completed') return 'You already finished this course.'
  if (status.status === 'locked') return status.reason ?? 'Course is locked.'

  if (status.status === 'available') {
    if (!spendCash(state, def.cost)) return 'You cannot afford the course fees.'
    state.education.enrolled = courseId
    state.education.progress[courseId] = 0
    state.education.totalSpent += def.cost
    pushLog(state, `You enrolled in ${def.name}.`, 'info')
    pushDecision(state, `Enrolled in ${def.name} for $${def.cost}.`)
    return null
  }

  // in-progress
  const done = state.education.progress[courseId] ?? 0
  state.education.progress[courseId] = done + 1
  addSkill(state, 'intelligence', 1)
  addToGauge(state, 'energy', -15)
  addToGauge(state, 'stress', 3)
  const nowDone = done + 1
  if (nowDone >= def.sessions) {
    if (!state.education.completed.includes(courseId)) {
      state.education.completed.push(courseId)
      state.education.totalSpent += 0
      pushLog(state, `You completed ${def.name}. ${def.unlocksText} career doors open.`, 'good')
      pushDecision(state, `Completed ${def.name}.`)
      addAchievement(state, `course-${courseId}`, `Completed ${def.name}`)
    }
    if (state.education.enrolled === courseId) state.education.enrolled = null
  } else {
    pushLog(state, `You made progress in ${def.name} (${nowDone}/${def.sessions} sessions).`, 'neutral')
  }
  return null
}

export function allCourses() {
  return COURSES
}