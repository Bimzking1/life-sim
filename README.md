# Lifeline

A sandbox life-simulation — every day you wake up, work your way up a career,
study, pay rent, make decisions, and try to live a long life as **Alex Rivera**.

> Plays right in the browser. No accounts, no telemetry, your save lives on
> your own machine as JSON.

Built with **React 18 + TypeScript + Vite 5 + Tailwind CSS**.

---

## Quick start

```bash
npm install
npm run dev        # start the dev server (Vite)
npm run build      # type-check + production build (tsc -b && vite build)
npm test           # run the Vitest test suite once
npm run typecheck  # type-check only (tsc -b --noEmit)
npm run preview    # serve the production build locally
```

Open the URL Vite prints (default `http://localhost:5173`).

---

## How the game works

The core engine lives in `src/game` as pure, unit-tested TypeScript — no UI
dependencies — so the simulation can be reasoned about and tested in isolation.

### Life & time

- Start the game at **age 18**, day 1, waking at **07:00**.
- Minutes tick forward; a full day crosses midnight and rolls to the next day.
- You age one year every `DAYS_PER_YEAR` (4) days, up to `MAX_AGE` (100).
- `formatClock` reports the day, weekday, and current phase
  (Morning / Afternoon / Evening / Night).

### Career

Four career tracks, each with an entry level and promotion ladder:

| Track | Entry job | Salary/day |
| ----- | --------- | ---------- |
| Warehouse | Warehouse Worker | $62 |
| Technology | Tech Intern | $45 |
| Sales | Sales Assistant | $55 |
| Hospitality | Prep Cook | — |

Levels require stats (Strength / Intelligence / Charisma), completed courses,
and — for later levels — tenure and performance. Promotions come with a
happiness bump and an event log entry.

### Education

Complete courses to unlock job levels, e.g.:

- **Office Skills Course** — boosts soft skills
- **Intro to Programming** — gateway to the tech track
- **First Aid Certificate**
- **Bachelor of Computer Science**
- **Business Diploma**

### Economy

- Daily expenses, plus rent every **7 days** (late payment accrues stress and
  rent debt).
- Bank account paying daily interest, and cash you can deposit / withdraw.
- An optional bank loan with daily interest, repayable from cash or the bank.

### Save / load

- The game **autosaves** to local storage (`lifeline:autosave:v1`).
- You can also download / upload your save as a JSON file.
- Save files carry a **format version**; the loader normalizes and sanitizes
  loaded state (clamps stats, repairs invalid numbers) and rejects corrupt or
  from-newer-version files with a friendly message.

---

## Project layout

```
src/
  game/          # pure simulation engine (time, career, education, economy, state, save)
    __tests__/   # Vitest suites for the engine
  data/          # static content: job tracks, courses, career tracks
  ui/            # React + Tailwind views wired to the engine
  App.tsx
```

---

## Testing

```bash
npm test
```

The engine is covered by Vitest suites in `src/game/__tests__`:

- **time** — `newGame` baseline + isolation, aging math, clock rollover, formatting
- **economy** — cash/bank helpers, rent, loans
- **career** — hiring, promotion eligibility, listings
- **save** — serialize/parse round-trips, versioning, and error handling

---

## Tech stack

[React](https://react.dev) · [TypeScript](https://www.typescriptlang.org) ·
[Vite](https://vitejs.dev) · [Tailwind CSS](https://tailwindcss.com) ·
[Vitest](https://vitest.dev)

---

## License

Private project. See the [change log](CHANGELOG.md) for release history.
