import type { LocationId } from '../ui/types'

export interface NpcInteractionDef {
  id: string
  label: string
  description: string
  durationMin: number
  cost?: number
  /** Interaction becomes available once the NPC met flag is set. */
  requiresMet?: true
  /** Rough gates to keep progression meaningful. */
  requiresFriendship?: number
  requiresRomance?: number
  effects: {
    friendship?: number
    romance?: number
    respect?: number
    happiness?: number
    stress?: number
    health?: number
    energy?: number
    intelligence?: number
    charisma?: number
    strength?: number
  }
  /** Flags pushed after success. */
  setFlags?: Record<string, string | number | boolean>
}

export interface NpcDef {
  id: string
  name: string
  role: string
  personality: string
  location: LocationId
  /** Context shown once the NPC is met. */
  intro: string
  interactions: NpcInteractionDef[]
}

export const NPCS: NpcDef[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    role: 'Neighbor',
    personality: 'Warm, curious',
    location: 'home',
    intro: 'Your neighbor through the thin wall. Always has a spare smile and a pot of tea.',
    interactions: [
      {
        id: 'maya-chat',
        label: 'Chat',
        description: 'Catch up over the fence.',
        durationMin: 30,
        effects: { friendship: 3, romance: 1, happiness: 2 },
      },
      {
        id: 'maya-dinner',
        label: 'Invite to dinner',
        description: 'A little effort goes a long way.',
        durationMin: 120,
        cost: 25,
        effects: { friendship: 6, happiness: 3 },
        requiresFriendship: 10,
      },
      {
        id: 'maya-movie',
        label: 'Watch a movie together',
        description: 'Blankets, snacks, one screen.',
        durationMin: 120,
        cost: 10,
        effects: { friendship: 4, romance: 4, happiness: 4 },
        requiresFriendship: 20,
        requiresRomance: 15,
      },
      {
        id: 'maya-advice',
        label: 'Ask for advice',
        description: 'She has seen a lot of life.',
        durationMin: 30,
        effects: { respect: 3, stress: -3, friendship: 1 },
        requiresFriendship: 10,
      },
      {
        id: 'maya-confess',
        label: 'Tell her how you feel',
        description: 'Say the hard thing.',
        durationMin: 30,
        effects: { romance: 10, stress: 5 },
        requiresFriendship: 40,
        requiresRomance: 50,
        setFlags: { 'dating-maya': true, partner: 'maya' },
      },
    ],
  },
  {
    id: 'tomas',
    name: 'Tomas Weber',
    role: 'Gym regular',
    personality: 'Blunt, driven',
    location: 'gym',
    intro: 'A fixture on the squat rack. Blunt, but he respects effort.',
    interactions: [
      {
        id: 'tomas-spot',
        label: 'Ask for a spot',
        description: 'Train together for a better session.',
        durationMin: 60,
        effects: { friendship: 3, respect: 2, strength: 1 },
      },
      {
        id: 'tomas-advice',
        label: 'Ask for advice',
        description: 'He knows every shortcut.',
        durationMin: 30,
        effects: { friendship: 1, respect: 3, stress: -2 },
        requiresFriendship: 5,
      },
      {
        id: 'tomas-challenge',
        label: 'Challenge a bet',
        description: 'Whoever squats more buys smoothies.',
        durationMin: 60,
        cost: 8,
        effects: { friendship: 4, respect: 5, happiness: 3, strength: 1 },
        requiresFriendship: 20,
      },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'Classmate',
    personality: 'Sharp, ambitious',
    location: 'university',
    intro: 'She sits two rows ahead and reads three books faster than you finish one.',
    interactions: [
      {
        id: 'priya-study',
        label: 'Study together',
        description: 'Both of you learn faster.',
        durationMin: 120,
        effects: { friendship: 3, respect: 2, intelligence: 1 },
      },
      {
        id: 'priya-coffee',
        label: 'Grab coffee',
        description: 'A friendly break.',
        durationMin: 60,
        cost: 6,
        effects: { friendship: 3, romance: 2, happiness: 2 },
        requiresFriendship: 5,
      },
      {
        id: 'priya-project',
        label: 'Join her project',
        description: 'Stand out by standing near her.',
        durationMin: 180,
        effects: { friendship: 4, respect: 4, intelligence: 1 },
        requiresFriendship: 15,
      },
      {
        id: 'priya-confess',
        label: 'Tell her how you feel',
        description: 'Say the hard thing.',
        durationMin: 30,
        effects: { romance: 10, stress: 5 },
        requiresFriendship: 40,
        requiresRomance: 50,
        setFlags: { 'dating-priya': true, partner: 'priya' },
      },
    ],
  },
  {
    id: 'dana',
    name: 'Dana Okonkwo',
    role: 'Coworker',
    personality: 'Pragmatic, kind',
    location: 'workplace',
    intro: 'Two desks over, always buried in the same pile of orders as you.',
    interactions: [
      {
        id: 'dana-chat',
        label: 'Small talk',
        description: 'Lunch-break gossip and politics.',
        durationMin: 30,
        effects: { friendship: 2, happiness: 1 },
      },
      {
        id: 'dana-help',
        label: 'Help with her work',
        description: 'An extra pair of hands.',
        durationMin: 60,
        effects: { friendship: 4, respect: 4, stress: 2 },
        requiresFriendship: 5,
      },
      {
        id: 'dana-lunch',
        label: 'Lunch together',
        description: 'Food fixes most days.',
        durationMin: 60,
        cost: 12,
        effects: { friendship: 5, romance: 1, happiness: 3 },
        requiresFriendship: 10,
      },
    ],
  },
  {
    id: 'lenny',
    name: 'Lenny Rivers',
    role: 'Downtown regular',
    personality: 'Streetwise, generous',
    location: 'downtown',
    intro: 'He has lived on this corner long enough to know everyone and everything.',
    interactions: [
      {
        id: 'lenny-chat',
        label: 'Talk shop',
        description: 'He always has a story.',
        durationMin: 30,
        effects: { friendship: 2, respect: 1, happiness: 2 },
      },
      {
        id: 'lenny-favors',
        label: 'Ask for favors',
        description: 'He owes half the city.',
        durationMin: 30,
        cost: 5,
        effects: { friendship: 1, respect: 2, stress: -3 },
        requiresFriendship: 10,
      },
      {
        id: 'lenny-meal',
        label: 'Share a meal',
        description: 'Soup kitchen rules: nobody eats alone.',
        durationMin: 60,
        cost: 8,
        effects: { friendship: 4, respect: 3, happiness: 3 },
        requiresFriendship: 10,
      },
    ],
  },
]

export function findNpc(id: string): NpcDef | undefined {
  return NPCS.find((n) => n.id === id)
}