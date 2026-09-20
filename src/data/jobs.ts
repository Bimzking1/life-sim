import type { JobLevel, JobTrack } from '../game/types'

export const JOB_TRACKS: JobTrack[] = [
  {
    id: 'warehouse',
    name: 'Warehouse',
    levels: [
      {
        id: 'warehouse-worker',
        title: 'Warehouse Worker',
        salaryPerDay: 62,
        description: 'Buckle boots, lift boxes, repeat.',
      },
      {
        id: 'senior-worker',
        title: 'Senior Worker',
        salaryPerDay: 78,
        description: 'Loads are bigger, the lunch row is closer.',
        requiresPerformance: 40,
        requiresTenureDays: 7,
      },
      {
        id: 'supervisor',
        title: 'Supervisor',
        salaryPerDay: 105,
        description: 'They let you near the clipboard.',
        requiresPerformance: 70,
        requiresTenureDays: 21,
        requiresStats: [{ stat: 'strength', min: 12 }],
      },
      {
        id: 'operations-manager',
        title: 'Operations Manager',
        salaryPerDay: 140,
        description: 'The whole floor answers to you.',
        requiresPerformance: 90,
        requiresTenureDays: 45,
        requiresStats: [{ stat: 'strength', min: 15 }, { stat: 'intelligence', min: 18 }],
      },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    levels: [
      {
        id: 'tech-intern',
        title: 'Tech Intern',
        salaryPerDay: 45,
        description: 'Fetches coffee, pushes tiny branches.',
        requiresCourses: ['intro-programming'],
      },
      {
        id: 'junior-developer',
        title: 'Junior Developer',
        salaryPerDay: 95,
        description: 'Ships small features with big confidence.',
        requiresPerformance: 50,
        requiresTenureDays: 14,
        requiresCourses: ['intro-programming'],
        requiresStats: [{ stat: 'intelligence', min: 8 }],
      },
      {
        id: 'developer',
        title: 'Developer',
        salaryPerDay: 130,
        description: 'Owns whole modules now.',
        requiresPerformance: 70,
        requiresTenureDays: 42,
        requiresStats: [{ stat: 'intelligence', min: 14 }],
        requiresCourses: ['cs-bachelor'],
      },
      {
        id: 'senior-developer',
        title: 'Senior Developer',
        salaryPerDay: 175,
        description: 'Reviews everyone else. Nobody reviews you.',
        requiresPerformance: 85,
        requiresTenureDays: 84,
        requiresCourses: ['cs-bachelor'],
        requiresStats: [{ stat: 'intelligence', min: 22 }],
      },
      {
        id: 'tech-lead',
        title: 'Tech Lead',
        salaryPerDay: 230,
        description: 'Architecture dreams, roadmap reality.',
        requiresPerformance: 95,
        requiresTenureDays: 140,
        requiresCourses: ['cs-bachelor'],
        requiresStats: [{ stat: 'intelligence', min: 30 }],
      },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    levels: [
      {
        id: 'sales-assistant',
        title: 'Sales Assistant',
        salaryPerDay: 55,
        description: 'Stocks shelves, smiles at strangers.',
        requiresCourses: ['office-skills'],
      },
      {
        id: 'salesperson',
        title: 'Salesperson',
        salaryPerDay: 80,
        description: 'You now pitch, not just stock.',
        requiresPerformance: 45,
        requiresTenureDays: 10,
        requiresStats: [{ stat: 'charisma', min: 8 }],
      },
      {
        id: 'senior-salesperson',
        title: 'Senior Salesperson',
        salaryPerDay: 115,
        description: 'Steals the floor from veterans.',
        requiresPerformance: 70,
        requiresTenureDays: 28,
        requiresStats: [{ stat: 'charisma', min: 12 }],
      },
      {
        id: 'sales-manager',
        title: 'Sales Manager',
        salaryPerDay: 160,
        description: 'Your team numbers, your head on the block.',
        requiresPerformance: 90,
        requiresTenureDays: 60,
        requiresCourses: ['business-diploma'],
        requiresStats: [{ stat: 'charisma', min: 16 }],
      },
    ],
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    levels: [
      {
        id: 'prep-cook',
        title: 'Prep Cook',
        salaryPerDay: 50,
        description: 'Chop, peel, repeat.',
      },
      {
        id: 'line-cook',
        title: 'Line Cook',
        salaryPerDay: 75,
        description: 'The grill is yours when the rush hits.',
        requiresPerformance: 45,
        requiresTenureDays: 8,
        requiresCourses: ['first-aid'],
      },
      {
        id: 'sous-chef',
        title: 'Sous Chef',
        salaryPerDay: 105,
        description: 'The chef\'s right hand and night shift.',
        requiresPerformance: 70,
        requiresTenureDays: 24,
        requiresStats: [{ stat: 'intelligence', min: 10 }],
      },
      {
        id: 'head-chef',
        title: 'Head Chef',
        salaryPerDay: 150,
        description: 'Your name on the menu, your call on the pass.',
        requiresPerformance: 90,
        requiresTenureDays: 48,
        requiresStats: [{ stat: 'intelligence', min: 16 }, { stat: 'charisma', min: 12 }],
      },
    ],
  },
]

export function findTrack(trackId: string): JobTrack | undefined {
  return JOB_TRACKS.find((t) => t.id === trackId)
}

export function findLevel(trackId: string, levelIndex: number): JobLevel | undefined {
  const track = findTrack(trackId)
  if (!track) return undefined
  return track.levels[levelIndex]
}