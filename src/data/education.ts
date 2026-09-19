import type { StatRequirement } from '../game/types'

export interface CourseDef {
  id: string
  name: string
  description: string
  cost: number
  /** Number of class sessions needed to finish. */
  sessions: number
  prereqCourses: string[]
  requiresStats?: StatRequirement[]
  unlocksText: string
}

export const COURSES: CourseDef[] = [
  {
    id: 'office-skills',
    name: 'Office Skills Course',
    description: 'Spreadsheets, email, and basic admin.',
    cost: 80,
    sessions: 10,
    prereqCourses: [],
    unlocksText: 'Sales Assistant',
  },
  {
    id: 'intro-programming',
    name: 'Intro to Programming',
    description: 'Write your first real programs.',
    cost: 150,
    sessions: 20,
    prereqCourses: [],
    unlocksText: 'Tech Intern',
  },
  {
    id: 'first-aid',
    name: 'First Aid Certificate',
    description: 'A quick weekend certification.',
    cost: 40,
    sessions: 2,
    prereqCourses: [],
    unlocksText: 'Line Cook role',
  },
  {
    id: 'cs-bachelor',
    name: 'Bachelor of Computer Science',
    description: 'Four years of serious study.',
    cost: 20000,
    sessions: 8,
    prereqCourses: ['intro-programming'],
    requiresStats: [{ stat: 'intelligence', min: 10 }],
    unlocksText: 'Developer, Senior Developer, Tech Lead',
  },
  {
    id: 'business-diploma',
    name: 'Business Diploma',
    description: 'Budgets, people, and hard decisions.',
    cost: 12000,
    sessions: 6,
    prereqCourses: ['office-skills'],
    unlocksText: 'Sales Manager',
  },
]

export function findCourse(id: string): CourseDef | undefined {
  return COURSES.find((c) => c.id === id)
}