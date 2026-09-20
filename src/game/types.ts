import type { LocationId, Tone } from '../ui/types'

export type { LocationId, Tone }

export type FlagValue = string | number | boolean

export interface StatRequirement {
  stat: 'strength' | 'intelligence' | 'charisma'
  min: number
}

export interface JobLevel {
  id: string
  title: string
  salaryPerDay: number
  description: string
  requiresStats?: StatRequirement[]
  requiresCourses?: string[]
  requiresPerformance?: number
  requiresTenureDays?: number
}

export interface JobTrack {
  id: string
  name: string
  levels: JobLevel[]
}

export interface PlayerStats {
  health: number
  energy: number
  happiness: number
  strength: number
  intelligence: number
  charisma: number
  stress: number
}

export interface LogEntry {
  id: string
  day: number
  minutes: number
  text: string
  tone: Tone
}

export interface TimeState {
  /** 1-based day counter. */
  day: number
  /** Minutes since midnight, 0..1439. */
  minutes: number
}

export interface PlayerState {
  name: string
  currentLocation: LocationId
  cash: number
  bank: number
  /** Outstanding loan principal. */
  loan: number
  stats: PlayerStats
  /** Day number of the last meal the player had. */
  lastMealDay: number
  /** Day number when rent is next due. */
  rentDueDay: number
  /** Unpaid rent that accumulated while overdue. */
  rentDebt: number
}

export interface CareerState {
  trackId: string | null
  /** Index into the job track's levels. */
  levelIndex: number
  /** 0..100 cumulative work performance. */
  performance: number
  /** Day the current level was started. */
  startedDay: number
  totalWorkDays: number
}

export interface EducationState {
  completed: string[]
  /** Course currently enrolled in, or null. */
  enrolled: string | null
  /** courseId -> sessions completed. */
  progress: Record<string, number>
  totalSpent: number
}

export interface PropertyState {
  id: string
  name: string
  detail: string
  type: 'rented' | 'owned'
}

export interface EventState {
  /** Event currently waiting for a choice, or null. */
  pending: PendingEvent | null
  /** Events whose choices were already committed (one-shot chains). */
  handled: string[]
  /** Narrative flags set by events and decisions. */
  flags: Record<string, FlagValue>
}

export interface PendingChoice {
  id: string
  label: string
  hint?: string
  disabledReason?: string
  /** Dynamic events: accept this job if chosen. */
  kind?: 'job'
  acceptJob?: { trackId: string; levelIndex: number }
}

export interface PendingEvent {
  id: string
  title: string
  description: string
  choices: PendingChoice[]
}

export interface ActionsContext {
  advance: (minutes: number) => void
  log: (text: string, tone?: Tone) => void
  toast: (tone: 'success' | 'error' | 'info', text: string) => void
  checkEvents: (locationId: LocationId) => void
  openEvent: (event: PendingEvent) => void
}

export interface ActionDef {
  id: string
  label: string
  description: string
  durationMin: number
  /** How the UI should display the duration. */
  durationText: string
  cost?: number
  disabled?: (s: GameState) => string | null
  run: (s: GameState, ctx: ActionsContext) => void
}

export interface LocationDef {
  id: LocationId
  name: string
  tagline: string
  /** Open/close hour (0-23). null = always open. */
  hours: { open: number; close: number } | null
  travelMin: number
  actions: ActionDef[]
  shop: string[]
}

export type StatKey = 'health' | 'energy' | 'happiness' | 'strength' | 'intelligence' | 'charisma' | 'stress'

export interface EffectDef {
  kind:
    | 'cash'
    | 'bank'
    | 'debt'
    | 'stat'
    | 'relationship'
    | 'addItem'
    | 'removeItem'
    | 'ownItem'
    | 'flag'
    | 'log'
    | 'time'
    | 'achievement'
    | 'followup'
    | 'decision'
    | 'meal'
    | 'course'
    | 'fire'
    | 'job'
    | 'promote'
    | 'endGame'
    | 'sleep'
    | 'rent'
  amount?: number
  stat?: StatKey
  npc?: string
  field?: 'friendship' | 'romance' | 'respect'
  item?: string
  qty?: number
  key?: string
  value?: FlagValue
  text?: string
  tone?: Tone
  courseId?: string
  jobTrack?: string
  endingId?: string
  /** Follow-up event to open after this choice. */
  eventId?: string
  /** Stable id for achievement effects. */
  id?: string
}

export interface EventChoiceDef {
  id: string
  label: string
  hint?: string
  disabledReason?: string
  disabled?: (s: GameState) => string | null
  effects: EffectDef[]
}

export interface EventDef {
  id: string
  title: string
  description: string
  condition: (s: GameState) => boolean
  weight: number
  /** Only triggerable on these locations; undefined = anywhere. */
  locations?: LocationId[]
  once?: boolean
  choices: EventChoiceDef[]
}

export interface InventoryState {
  /** Consumable itemId -> quantity. */
  qty: Record<string, number>
  /** Permanent owned item ids (phone, bike, jacket, ...). */
  owned: string[]
}

export interface RelationshipRecord {
  npcId: string
  friendship: number
  romance: number
  respect: number
  met: boolean
  flags: Record<string, FlagValue>
}

export interface AchievementRecord {
  id: string
  day: number
  text: string
}

export interface DecisionRecord {
  day: number
  minutes: number
  text: string
}

export interface GameState {
  /** Save data format version. */
  formatVersion: number
  savedAt: string
  player: PlayerState
  time: TimeState
  career: CareerState
  education: EducationState
  properties: PropertyState[]
  events: EventState
  inventory: InventoryState
  relationships: Record<string, RelationshipRecord>
  activityLog: LogEntry[]
  achievements: AchievementRecord[]
  decisions: DecisionRecord[]
  gameOver: boolean
  endingReason: 'old-age' | 'health' | 'retirement' | null
}