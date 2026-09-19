import { findTrack, findLevel, JOB_TRACKS as JOB_TRACKS_LIST } from '../data/jobs'
import { findCourse } from '../data/education'
import type { GameState, JobLevel, JobTrack, PendingChoice, PendingEvent, StatRequirement } from './types'
import { pushLog, pushDecision, addAchievement } from './state'
import { currentAge } from './time'

export function trackName(state: GameState): string | null {
  if (!state.career.trackId) return null
  const t = findTrack(state.career.trackId)
  return t ? t.name : null
}

export function currentJob(state: GameState): JobLevel | null {
  if (!state.career.trackId || state.career.levelIndex < 0) return null
  return findLevel(state.career.trackId, state.career.levelIndex) ?? null
}

export function nextJob(state: GameState): JobLevel | null {
  if (!state.career.trackId || state.career.levelIndex < 0) return null
  const track = findTrack(state.career.trackId)
  if (!track) return null
  return track.levels[state.career.levelIndex + 1] ?? null
}

const STAT_LABEL: Record<string, string> = {
  strength: 'Strength',
  intelligence: 'Intelligence',
  charisma: 'Charisma',
}

export function statReqLabel(r: StatRequirement): string {
  return `${STAT_LABEL[r.stat] ?? r.stat} ${r.min}`
}

function courseTitle(courseId: string): string {
  return findCourse(courseId)?.name ?? courseId.replace(/-/g, ' ')
}

/** Reason a job level is out of reach, or null if reachable. */
export function jobUnreachableReason(state: GameState, track: JobTrack, levelIndex: number): string | null {
  const job = track.levels[levelIndex]
  if (!job) return 'Unknown position.'

  const reasons: string[] = []
  for (const r of job.requiresStats ?? []) {
    if (state.player.stats[r.stat] < r.min) reasons.push(statReqLabel(r))
  }
  for (const c of job.requiresCourses ?? []) {
    if (!state.education.completed.includes(c)) reasons.push(`"${courseTitle(c)}"`)
  }
  if (levelIndex > 0) {
    const prev = track.levels[levelIndex - 1]
    if (prev) {
      const tenure = state.career.startedDay > 0 ? state.time.day - state.career.startedDay : 0
      if ((job.requiresTenureDays ?? 0) > tenure) reasons.push(`${job.requiresTenureDays} days in current role`)
      if ((job.requiresPerformance ?? 0) > state.career.performance) reasons.push(`performance ${job.requiresPerformance}`)
    }
  }
  return reasons.length ? `Requires: ${reasons.join('; ')}.` : null
}

export function allTracks(): JobTrack[] {
  return JOB_TRACKS_LIST
}

/** Accept a job at the given track level. */
export function acceptJob(state: GameState, trackId: string, levelIndex: number): boolean {
  const track = findTrack(trackId)
  if (!track) return false
  const job = track.levels[levelIndex]
  if (!job) return false
  if (jobUnreachableReason(state, track, levelIndex)) {
    pushLog(state, 'You are not hired yet.', 'bad')
    return false
  }
  const wasUnemployed = state.career.trackId === null
  state.career.trackId = trackId
  state.career.levelIndex = levelIndex
  state.career.startedDay = state.time.day
  state.events.flags['hired-day'] = state.time.day
  pushLog(state, `You were hired as ${job.title} at the ${track.name}.`, 'good')
  if (wasUnemployed) {
    pushDecision(state, `Started a career as ${job.title}.`)
    addAchievement(state, 'first-job', 'Got a job')
  } else {
    pushLog(state, `You quit your old job to take ${job.title}.`, 'info')
    pushDecision(state, `Changed jobs: took ${job.title}.`)
  }
  if (currentAge(state) >= 25 && levelIndex === 0 && wasUnemployed) {
    pushLog(state, 'A fresh start later in life — make it count.', 'info')
  }
  return true
}

/** Check and apply a promotion after a shift. */
export function checkPromotion(state: GameState): boolean {
  const nxt = nextJob(state)
  if (!nxt || !state.career.trackId) return false
  const track = findTrack(state.career.trackId)
  if (!track) return false
  if (jobUnreachableReason(state, track, state.career.levelIndex + 1)) return false

  state.career.levelIndex += 1
  state.career.startedDay = state.time.day
  pushLog(state, `Promotion! You are now ${nxt.title}.`, 'good')
  pushDecision(state, `Promoted to ${nxt.title}.`)
  addAchievement(state, 'promotion', `Promoted to ${nxt.title}`)
  state.player.stats.happiness = Math.min(100, state.player.stats.happiness + 8)
  return true
}

/** Build the "Browse job listings" event shown at the workplace. */
export function buildJobListingEvent(state: GameState): PendingEvent {
  const tracks = allTracks()
  const current = currentJob(state)
  const choices: PendingChoice[] = []

  for (const track of tracks) {
    const job = track.levels[0]
    const reason = jobUnreachableReason(state, track, 0)
    choices.push({
      id: `job-${track.id}-0`,
      label: `${track.name} — ${job.title}`,
      hint: `$${job.salaryPerDay}/day. ${job.description}`,
      disabledReason: reason ?? undefined,
      kind: 'job',
      acceptJob: { trackId: track.id, levelIndex: 0 },
    })
  }

  choices.push({
    id: 'job-stay',
    label: current ? `Stay in your current role (${current.title})` : 'Keep looking around',
    hint: 'No changes to your career.',
  })

  return {
    id: 'job-listings',
    title: 'Job listings',
    description:
      'The notice board is pinned with openings. You spend an hour reading the fine print.',
    choices,
  }
}

export function buildPromotionEvent(state: GameState): PendingEvent {
  const nxt = nextJob(state)
  return {
    id: 'promotion-announcement',
    title: `Congratulations — ${nxt?.title ?? 'a step up'}!`,
    description:
      'The news hits the floor. Spontaneous toast in the break room, half a cake, and a lot of handshakes.',
    choices: [
      { id: 'promo-accept', label: 'Celebrate and get back to work', hint: 'Happiness +8' },
      { id: 'promo-modest', label: 'Stay humble, thank the team', hint: 'Happiness +4, respect with coworkers up' },
    ],
  }
}