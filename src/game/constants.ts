export const GAME_NAME = 'Lifeline'
export const DEFAULT_PLAYER_NAME = 'Alex Rivera'

/** localStorage key storing the chosen theme ('dark' | 'light'). */
export const THEME_STORAGE_KEY = 'lifeline:theme'
/** Theme used when no preference is stored yet. */
export const DEFAULT_THEME = 'dark'

/** localStorage key storing whether sound effects are enabled. */
export const SFX_ENABLED_KEY = 'lifeline:sfx-enabled'
/** localStorage key storing whether background music is enabled. */
export const MUSIC_ENABLED_KEY = 'lifeline:music-enabled'

export const CURRENT_SAVE_VERSION = 1
export const AUTOSAVE_KEY = 'lifeline:autosave:v1'

/** Starting day of the life, 1-based. */
export const START_DAY = 1
/** In-game clock starts at this time. */
export const START_HOUR = 7
export const START_MINUTE = 0
export const START_AGE = 18
export const START_CASH = 100
export const START_BANK = 0

/** Stat lower/upper bounds. */
export const STAT_MIN = 0
export const STAT_MAX = 100

/** Baseline daily living expenses (food, transport, utilities). */
export const DAILY_EXPENSES = 18

/** Rent: amount and how often it comes due (in days). */
export const RENT_AMOUNT = 350
export const RENT_EVERY_DAYS = 7
export const RENT_LATE_PENALTY_DAYS = 7

/** Bank interest rate applied per day (0.05 %). */
export const BANK_INTEREST_RATE = 0.0005

/** Loan mechanics. */
export const LOAN_AMOUNT = 500
export const LOAN_DAILY_INTEREST = 0.002

/** Sleep target hour for the next morning. */
export const WAKE_HOUR = 7

/** Time the player is considered to have a "day job". */
export const SHIFT_HOURS = 8
export const OVERTIME_HOURS = 2
export const OVERTIME_MULTIPLIER = 1.5

/** Performance increments. */
export const PERFORMANCE_PER_SHIFT = 6
export const PERFORMANCE_AFTER_80 = 3

/** Max life length. */
export const MAX_AGE = 100
export const RETIREMENT_AGE = 65

/** How many in-game days make one year of age. */
export const DAYS_PER_YEAR = 4