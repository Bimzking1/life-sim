/**
 * UI view-model types.
 *
 * These describe what the UI components RENDER. They are intentionally
 * separate from the real GameState (to be created during integration).
 * Integration = write a selector layer that maps GameState -> these views,
 * and wire the UiHandlers to real game actions.
 */

export type LocationId =
  | 'home'
  | 'grocery'
  | 'bank'
  | 'gym'
  | 'university'
  | 'workplace'
  | 'restaurant'
  | 'downtown'

export type StatId =
  | 'health'
  | 'energy'
  | 'happiness'
  | 'strength'
  | 'intelligence'
  | 'charisma'
  | 'stress'

export type Tone = 'good' | 'bad' | 'neutral' | 'info'

export interface StatView {
  id: StatId
  label: string
  value: number
  max: number
}

export interface ActionView {
  id: string
  label: string
  description: string
  /** Pre-formatted, e.g. "8 h", "30 min" */
  duration: string
  /** Pre-formatted, e.g. "$12" */
  cost?: string
  /** If set, the action is disabled and this explains why */
  disabledReason?: string
}

export interface ShopItemView {
  id: string
  name: string
  category: string
  price: string
  description: string
  /** e.g. "Energy +15, Happiness +3" */
  effects: string
  owned?: number
  disabledReason?: string
}

export interface LocationView {
  id: LocationId
  name: string
  tagline: string
  hours: string
  isOpen: boolean
  /** Pre-formatted travel info from the player's current location */
  travel: { duration: string; cost?: string }
  actions: ActionView[]
  shop?: ShopItemView[]
}

export interface ClockView {
  dayNumber: number
  weekday: string
  /** "14:30" */
  time: string
  phase: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  age: number
}

export interface PlayerView {
  name: string
  age: number
  title: string
}

export interface MoneyView {
  cash: string
  bank: string
  incomePerDay: string
  expensesPerDay: string
  rentDue?: string
}

export interface NpcView {
  id: string
  name: string
  role: string
  personality: string
  friendship: number
  romance: number
  respect: number
  interactions: ActionView[]
}

export interface LogEntryView {
  id: string
  stamp: string
  text: string
  tone: Tone
}

export interface EventChoiceView {
  id: string
  label: string
  /** Optional preview of consequences, e.g. "Lose 1 hour" */
  hint?: string
  disabledReason?: string
}

export interface EventView {
  id: string
  title: string
  description: string
  choices: EventChoiceView[]
}

export interface CareerView {
  track: string | null
  title: string | null
  salary: string
  hours: string
  performance: number
  nextTitle?: string
  requirements: { label: string; met: boolean }[]
}

export type CourseStatus = 'available' | 'in-progress' | 'completed' | 'locked'

export interface CourseView {
  id: string
  name: string
  description: string
  status: CourseStatus
  progress: number
  cost: string
  duration: string
  unlocks: string
  lockedReason?: string
}

export interface InventoryItemView {
  id: string
  name: string
  category: string
  quantity: number
  description: string
  usable?: boolean
}

export interface PropertyView {
  id: string
  name: string
  detail: string
}

export interface LifeSummaryView {
  ending: string
  finalAge: number
  career: string
  money: string
  education: string[]
  relationships: string[]
  achievements: string[]
  events: string[]
  properties: string[]
  decisions: string[]
}

export interface SaveSlotInfo {
  label: string
  detail: string
}

/** Everything the UI can ask the game to do. Integration wires these up. */
export interface UiHandlers {
  onNewGame: () => void
  onSaveGame: () => void
  onLoadFile: (file: File) => void
  onContinueAutosave: () => void
  onTravel: (id: LocationId) => void
  onAction: (locationId: LocationId, actionId: string) => void
  onBuy: (locationId: LocationId, itemId: string) => void
  onNpcInteract: (npcId: string, actionId: string) => void
  onEventChoice: (eventId: string, choiceId: string) => void
  onCourseAction: (courseId: string) => void
  onUseItem: (itemId: string) => void
  onStartNewLife: () => void
}
