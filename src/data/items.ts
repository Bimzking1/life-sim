import type { FlagValue } from '../game/types'

export interface ItemDef {
  id: string
  name: string
  category: string
  price: number
  description: string
  effectsText: string
  /** Stored in inventory bag and can be used later. */
  consumable?: boolean
  /** Permanent owned item (not consumed). */
  permanent?: boolean
  /** Eaten immediately on purchase (restaurant meals). */
  immediate?: boolean
  /** Counts as a meal when consumed. */
  isMeal?: boolean
  /** Stat changes applied on use. */
  statEffects?: Partial<{ health: number; energy: number; happiness: number; strength: number; intelligence: number; charisma: number; stress: number }>
  /** Passive stat bonus while owned (e.g. jacket charisma). */
  passive?: Partial<{ strength: number; intelligence: number; charisma: number }>
  /** Flags set when owned/used. */
  flags?: Record<string, FlagValue>
  /** Extra energy restored when sleeping while owned. */
  sleepBonus?: number
  /** Travel time multiplier while owned (0.5 = half). */
  travelMultiplier?: number
  /** Boosts training gains while owned. */
  trainingBoost?: boolean
}

export const ITEMS: Record<string, ItemDef> = {
  // Grocery - food
  bread: {
    id: 'bread',
    name: 'Bread loaf',
    category: 'Food',
    price: 3,
    description: 'Plain, filling, lasts a few days.',
    effectsText: 'Energy +10, Happiness +2',
    consumable: true,
    isMeal: true,
    statEffects: { energy: 10, happiness: 2 },
  },
  ramen: {
    id: 'ramen',
    name: 'Instant ramen',
    category: 'Food',
    price: 2,
    description: 'Fast, salty, and not great for you.',
    effectsText: 'Energy +12, Health -2',
    consumable: true,
    isMeal: true,
    statEffects: { energy: 12, health: -2 },
  },
  produce: {
    id: 'produce',
    name: 'Fresh produce',
    category: 'Food',
    price: 9,
    description: 'A week of vegetables.',
    effectsText: 'Energy +8, Health +3, Happiness +1',
    consumable: true,
    isMeal: true,
    statEffects: { energy: 8, health: 3, happiness: 1 },
  },
  rice: {
    id: 'rice',
    name: 'Rice and beans',
    category: 'Food',
    price: 5,
    description: 'Cheap in bulk, endlessly reheated.',
    effectsText: 'Energy +14, Health +1',
    consumable: true,
    isMeal: true,
    statEffects: { energy: 14, health: 1 },
  },
  soup: {
    id: 'soup',
    name: 'Canned soup',
    category: 'Food',
    price: 4,
    description: 'Salty comfort in a tin.',
    effectsText: 'Energy +9, Health +1',
    consumable: true,
    isMeal: true,
    statEffects: { energy: 9, health: 1 },
  },

  // Restaurant - immediate meals
  burger: {
    id: 'burger',
    name: 'Burger and fries',
    category: 'Meal',
    price: 12,
    description: 'Hot, quick, and satisfying.',
    effectsText: 'Energy +25, Happiness +4',
    immediate: true,
    isMeal: true,
    statEffects: { energy: 25, happiness: 4 },
  },
  salad: {
    id: 'salad',
    name: 'Chef salad',
    category: 'Meal',
    price: 14,
    description: 'Light and good for you.',
    effectsText: 'Energy +15, Health +3',
    immediate: true,
    isMeal: true,
    statEffects: { energy: 15, health: 3 },
  },
  steak: {
    id: 'steak',
    name: 'Steak dinner',
    category: 'Meal',
    price: 38,
    description: 'A treat worth saving for.',
    effectsText: 'Energy +35, Health +2, Happiness +10',
    immediate: true,
    isMeal: true,
    statEffects: { energy: 35, health: 2, happiness: 10 },
  },

  // Downtown
  jacket: {
    id: 'jacket',
    name: 'Work jacket',
    category: 'Clothes',
    price: 45,
    description: 'Looks sharp at interviews.',
    effectsText: 'Charisma +2 while worn',
    permanent: true,
    passive: { charisma: 2 },
  },
  phone: {
    id: 'phone',
    name: 'Used smartphone',
    category: 'Electronics',
    price: 120,
    description: 'Keeps you in touch with everyone.',
    effectsText: 'Unlocks phone calls and events',
    permanent: true,
    flags: { 'has-phone': true },
  },
  bed: {
    id: 'bed',
    name: 'Comfortable mattress',
    category: 'Furniture',
    price: 220,
    description: 'Sleep restores more energy.',
    effectsText: 'Sleep +12 energy',
    permanent: true,
    sleepBonus: 12,
  },
  bike: {
    id: 'bike',
    name: 'Second-hand bicycle',
    category: 'Transport',
    price: 90,
    description: 'Cuts travel time in half.',
    effectsText: 'Travel time -50%',
    permanent: true,
    travelMultiplier: 0.5,
  },
  laptop: {
    id: 'laptop',
    name: 'Used laptop',
    category: 'Electronics',
    price: 280,
    description: 'Study harder without library queues.',
    effectsText: 'Study gains +100%',
    permanent: true,
    flags: { 'has-laptop': true },
  },
  cookware: {
    id: 'cookware',
    name: 'Real cookware set',
    category: 'Furniture',
    price: 55,
    description: 'Cooking at home feels less like survival.',
    effectsText: 'Cooking gives +2 happiness',
    permanent: true,
    flags: { 'has-cookware': true },
  },
  concert: {
    id: 'concert',
    name: 'Concert ticket',
    category: 'Lifestyle',
    price: 60,
    description: 'A night to remember.',
    effectsText: 'Happiness +20, Stress -12',
    consumable: true,
    statEffects: { happiness: 20, stress: -12 },
  },
  dumbbells: {
    id: 'dumbbells',
    name: 'Home dumbbells',
    category: 'Furniture',
    price: 70,
    description: 'Train without the membership.',
    effectsText: 'Training gains +50%',
    permanent: true,
    trainingBoost: true,
  },
}