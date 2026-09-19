# Changelog

All notable changes to this project are documented in this file.

The format roughly follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Test suite** (`src/game/__tests__`) covering the pure game logic:
  - `time` — `newGame` baseline + state isolation, `ageFromDay` aging rules,
    `advanceMinutes` within-day and crossing-midnight rollover, `formatClock`
    day/weekday/time/phase output, `currentAge ≡ ageFromDay(day)`.
  - `economy` — cash helpers (`canAfford`/`spendCash`/`addCash` with 2-dp
    rounding), bank transfers (`depositAll`/`withdrawAll`), rent rollup into
    `expensesPerDay`, and loan helpers (`applyLoan` requires a career;
    `repayLoanFromCash` clears as much debt as cash allows).
  - `career` — unemployment baseline, hiring at a track's entry level, `nextJob`
    reporting, rejection of unmet level requirements, and the shapes of the
    job-listing and promotion events.
  - `save` — save/load round-trip, a fresh isolated state on each load, value
    sanitization on load (clamping/rounding), and `SaveError` handling for
    corrupt, unversioned, or newer-version save files.
- **Vitest setup** — `vitest.config.ts`, the `test: vitest run` npm script, and
  `vitest@^2` (compatible with the project's Vite 5).

### Fixed

- **Run-time BOM crash on test startup.** A UTF-8 byte order mark at the start of
  `package.json` broke Vite's JSON config loader, surfacing as
  `Failed to load PostCSS config … is not valid JSON`. The BOM was removed;
  PostCSS/Tailwind configs were verified BOM-free.

## [0.1.0] - 2026-09-19

### Added

- Initial project scaffold: React 18 + TypeScript + Vite 5 + Tailwind CSS.
- Core simulation (`src/game`):
  - A player with cash, bank, loan, rent debt, and the `health`/`energy`/
    `happiness`/`stress` gauges plus `strength`/`intelligence`/`charisma` stats.
  - A day-based clock (wake at 07:00, `DAY * 60` minute model) with aging:
    one year per `DAYS_PER_YEAR` days from age 18 up to `MAX_AGE`.
  - Four career tracks — Warehouse, Technology, Sales, Hospitality — each with
    an entry level and promotion ladder requiring stats, courses, tenure, and
    performance.
  - Named courses (Office Skills, Intro to Programming, First Aid Certificate,
    Bachelor of Computer Science, Business Diploma, …) that unlock job levels.
  - Economy: daily expenses, rent every 7 days, bank interest, and an optional
    loan.
  - Decisions, achievements, activity/decision logs, autosave and versioned
    save serialization (`CurrentVersion 1`, `lifeline:autosave:v1`).
- UI (`src/`) rendering the clock, career panel, economy/status panels, and
  event choices, with an activity feed.

---

## [0.1.0] notes

- Save format includes a `version` and `savedAt` stamp; loading accepts older
  versions and rejects newer ones.
- `package.json` BOM is fixed (see Unreleased → Fixed); it previously blocked
  `vitest run`.
