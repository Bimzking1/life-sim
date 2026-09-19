# Life Simulator — Complete the Game

You are taking over an existing React + TypeScript + Tailwind frontend created by another AI.

Your job is to turn the existing UI into a fully playable frontend-only life simulation game.

Do NOT redesign the UI unless something is genuinely broken.

Prioritize game logic, state management, simulation, persistence, content, balancing, validation, and testing.

## Core Rule

The entire game must work without a backend.

Technology:

* React
* TypeScript
* Vite
* Tailwind
* Browser APIs
* localStorage may be used for autosave
* File System / File Picker browser APIs where appropriate

No authentication.
No database.
No server.

---

# 1. Game State

Create a centralized typed game state.

At minimum:

```ts
GameState {
  version
  player
  time
  career
  education
  relationships
  inventory
  properties
  events
  activityLog
  flags
}
```

Do not use `any`.

Keep the state serializable to JSON.

---

# 2. Time System

Implement:

* Day
* Hour
* Minute
* Age

Actions consume time.

Example:

```text
Work → 8 hours
Study → 2 hours
Train → 1 hour
Eat → 30 minutes
Rest → 1-8 hours
Socialize → 2 hours
```

Handle:

* End of day
* Sleeping
* Aging
* Scheduled events
* Daily expenses

The time system should be deterministic where possible.

---

# 3. Player Stats

Implement:

* Health
* Energy
* Happiness
* Strength
* Intelligence
* Charisma
* Stress

Stats should influence gameplay.

Do not allow values to become invalid.

For example:

```text
Health: 0–100
Energy: 0–100
Happiness: 0–100
```

---

# 4. Economy

Implement:

* Cash
* Income
* Expenses
* Food
* Rent
* Purchases
* Bank balance

The player should have meaningful financial decisions.

---

# 5. Jobs

Implement multiple career paths.

Example:

```text
Warehouse
Warehouse Worker
→ Senior Worker
→ Supervisor
→ Operations Manager
```

```text
Technology
Intern
→ Junior Developer
→ Developer
→ Senior Developer
→ Tech Lead
```

```text
Sales
Sales Assistant
→ Salesperson
→ Senior Salesperson
→ Sales Manager
```

Jobs should have:

* Requirements
* Salary
* Working hours
* Performance
* Promotion requirements
* Possible events

---

# 6. Education

Implement:

* Courses
* University
* Training

Education should unlock career opportunities.

Balance time and money against long-term benefits.

---

# 7. City

Implement the locations created by the UI:

* Home
* Grocery
* Bank
* Gym
* University
* Workplace
* Restaurant
* Downtown

Each location should provide actual functionality.

---

# 8. Shopping

Implement a data-driven item system.

Items should have:

```ts
{
  id
  name
  category
  price
  description
  effects
}
```

Examples:

* Food
* Clothes
* Electronics
* Furniture
* Transportation
* Lifestyle items

Do not hardcode item behavior inside UI components.

---

# 9. Relationships

Implement NPC relationships.

Each NPC can have:

* Friendship
* Romance
* Respect
* Personality
* Available interactions
* Relationship events

Use the existing relationship UI.

---

# 10. Random Events

Create a data-driven event system.

Events should support:

```ts
{
  id
  title
  description
  conditions
  choices
}
```

Choices should be able to:

* Change money
* Change stats
* Change relationships
* Change career
* Change inventory
* Advance time
* Set flags
* Trigger another event

Create meaningful event chains rather than only isolated random messages.

---

# 11. Consequences

Player decisions should matter.

Example:

```text
Help coworker
→ Relationship +10
→ Work performance +5
→ Lose 1 hour
```

Later events should be able to reference previous choices.

Use flags where appropriate.

---

# 12. Save Game → JSON File

This is REQUIRED.

The player must be able to click:

```text
Save Game
```

and download a real JSON file.

Example filename:

```text
life-sim-save.json
```

Save format:

```json
{
  "version": 1,
  "savedAt": "2026-09-19T00:00:00.000Z",
  "gameState": {}
}
```

Use the browser's Blob/download APIs.

Do not upload anything to a server.

---

# 13. Load Game ← JSON File

This is REQUIRED.

The player clicks:

```text
Load Game
```

A file picker opens.

Accept `.json`.

Then:

1. Read the file
2. Parse JSON
3. Validate the save structure
4. Validate version
5. Migrate if necessary
6. Replace the current game state
7. Update the UI
8. Show success feedback

Malformed files must not crash the application.

Show a useful error message.

Do not blindly trust imported JSON.

---

# 14. Save Versioning

Implement save versioning from the beginning.

Example:

```ts
const CURRENT_SAVE_VERSION = 1
```

If the save format changes later:

```text
v1
 ↓ migration
v2
 ↓ migration
v3
```

Do not simply break old save files.

---

# 15. Autosave

Use localStorage for optional autosave.

Autosave should NOT replace the JSON save system.

The two systems are separate:

```text
Autosave
→ localStorage

Manual Save
→ downloaded .json
```

On startup, if an autosave exists, allow the player to continue it.

---

# 16. New Game

Implement:

```text
New Game
```

with confirmation if a current game exists.

Starting state should be reasonable:

```text
Age: 18
Money: $100
Health: 100
Energy: 100
Happiness: 50
Strength: 1
Intelligence: 1
Charisma: 1
```

Adjust values if needed for balancing.

---

# 17. Life Progression

The game should not be an endless stat-grinding screen.

Implement meaningful progression through life.

Example:

```text
18–25
Education / first jobs

25–35
Career / relationships / financial growth

35–50
Career / property / family / investments

50+
Retirement / legacy / major life decisions
```

Eventually the player should reach an ending.

---

# 18. End of Life / Final Summary

Create a final life summary.

Show:

* Age
* Career
* Money
* Education
* Relationships
* Major achievements
* Important events
* Properties
* Notable decisions

Then allow:

```text
Start New Life
```

The exact age range can be balanced during development.

---

# 19. Data-Driven Design

Prefer data files/configuration over hardcoded logic.

For example:

```text
data/
  jobs.ts
  items.ts
  locations.ts
  npcs.ts
  events.ts
  education.ts
```

This makes it easy to expand the game later.

---

# 20. Testing

Test important systems.

Especially:

* Time progression
* Money calculations
* Stat boundaries
* Job requirements
* Promotions
* Event conditions
* Relationship changes
* Save serialization
* Load validation
* Save version handling
* New game reset
* Autosave
* End-game state

Fix TypeScript errors and obvious runtime errors before considering the project complete.

---

# Final Goal

The finished project should feel like a complete small browser game.

The player should be able to:

1. Start a life
2. Explore the city
3. Work
4. Study
5. Exercise
6. Eat
7. Shop
8. Meet people
9. Build relationships
10. Earn and spend money
11. Make decisions
12. Experience random events
13. Progress through life
14. Save to `life-sim-save.json`
15. Close the browser
16. Return later
17. Load the JSON file
18. Continue exactly where they left off
19. Eventually reach an ending
20. Start another life

Keep the existing visual design intact unless changes are required for usability.

Focus on making the underlying game genuinely playable rather than adding unnecessary features.
