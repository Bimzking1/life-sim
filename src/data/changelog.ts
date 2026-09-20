export interface ChangelogSection {
  heading: string
  bullets: string[]
}

export interface ChangelogVersion {
  version: string
  date?: string
  summary: string
  sections: ChangelogSection[]
}

export const CHANGELOG: ChangelogVersion[] = [
  {
    version: 'Unreleased',
    summary: 'Sound design, ambient music, audio settings, theme toggle, and a splash screen with changelog page.',
    sections: [
      {
        heading: 'Added',
        bullets: [
          'Test suite (src/game/__tests__) covering the pure game logic: time, economy, career, and save handling.',
          'Vitest setup with a test: vitest run npm script.',
          'Sci-fi UI sound effects on every button and key game action, synthesized locally via uisfx (no audio assets needed).',
          'Procedural ambient background music generated live with the Web Audio API (a focus-style pad loop, no copyrighted tracks).',
          'A sound settings popover to toggle sound effects and background music independently; preferences persist on the device.',
          'Dark/light theme toggle on the splash screen and in the in-game top bar.',
          'A landing splash screen that fades in the Lifeline brand, plus a dedicated changelog page with routing and a back button.',
          'Autosave/load screens and modals now play context-aware cues (open, close, warning, checkpoint, reward, notification).',
        ],
      },
      {
        heading: 'Fixed',
        bullets: [
          'Run-time BOM crash on test startup breaking the PostCSS/Tailwind config load.',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-09-19',
    summary: 'Initial release: the life simulation, economy, careers, and the full in-game UI.',
    sections: [
      {
        heading: 'Added',
        bullets: [
          'Initial project scaffold: React 18 + TypeScript + Vite 5 + Tailwind CSS.',
          'Core simulation: a player with cash, bank, loan, rent debt, and health/energy/happiness/stress gauges plus strength/intelligence/charisma stats.',
          'A day-based clock with aging — one year per DAYS_PER_YEAR days from age 18 up to MAX_AGE.',
          'Four career tracks (Warehouse, Technology, Sales, Hospitality) with promotion ladders gated by stats, courses, tenure, and performance.',
          'Courses (Office Skills, Intro to Programming, First Aid Certificate, Bachelor of Computer Science, Business Diploma, …) that unlock job levels.',
          'Economy: daily expenses, weekly rent, bank interest, and an optional loan.',
          'Decisions, achievements, activity and decision logs, autosave, and versioned save serialization.',
          'UI rendering the clock, career and status panels, event choices, and an activity feed.',
        ],
      },
      {
        heading: 'Notes',
        bullets: [
          'Save files are versioned with a savedAt stamp; loading accepts older versions and rejects newer ones.',
        ],
      },
    ],
  },
]

export const latestVersion = (): ChangelogVersion => CHANGELOG[0]