# Lifeline: UI slice, ready for game integration

This project is the **UI only**. It runs with mock data and has no game logic.
The full task for the integrating agent is in `docs/opencode-task.md`.

## Run
```
npm install
npm run dev
npm run typecheck
```

## How the UI is sliced

```
src/
  ui/types.ts        View-model types (what the UI renders) + UiHandlers (what the UI can ask for)
  ui/mock.ts         Demo data. Delete once real state is connected.
  GameScreen.tsx     Main screen. Presentational: props in, handlers out. Owns only "selected map stop".
  App.tsx            DEMO container with fake handlers. REPLACE with the real game store wiring.
  components/        TopBar, StatsPanel, CityMap, LocationPanel (actions + shop), RelationshipsPanel,
                     ActivityLog, LifeTabs (career/education/inventory/properties),
                     EventModal, ConfirmDialog, StartScreen, EndSummary, Toasts, Modal, ProgressBar
  dev/PreviewControls.tsx  Floating "UI preview" button to open overlays. DELETE on integration.
```

## Integration plan

1. Create `src/game/` with `GameState`, reducer/store, time system, save/load/migrations, autosave.
2. Create `src/data/` (jobs, items, locations, npcs, events, education) as data files.
3. Write selectors: `GameState -> PlayerView, ClockView, StatView[], MoneyView, LocationView[], NpcView[],
   LogEntryView[], CareerView, CourseView[], InventoryItemView[], PropertyView[], EventView | null,
   LifeSummaryView | null`. Format money and durations in the selectors (views expect strings).
4. Implement every `UiHandlers` method against real game actions.
5. Replace `App.tsx` demo state with the store. Mount overlays from state:
   - pending event -> `EventModal`
   - `flags`/phase = ended -> `EndSummary`
   - startup with an autosave -> `StartScreen`
   - New Game with a current game -> `ConfirmDialog`
   - save/load results and errors -> `Toasts`
6. Wire the Save/Load buttons:
   - `onSaveGame`: Blob download of `life-sim-save.json` (`{ version, savedAt, gameState }`).
   - `onLoadFile(file)`: read, JSON.parse, validate, migrate, replace state, toast success or a specific error.
     The file inputs already accept `.json` in `TopBar` and `StartScreen`.
7. Remove `ui/mock.ts` and `dev/`.

## Notes for the integrator

- Disabled actions: set `disabledReason` on `ActionView`, `ShopItemView`, `EventChoiceView`, or `NpcView` interactions.
  The UI shows the reason in place of the description.
- The map layout (stop positions and line colors) lives in `components/CityMap.tsx`; the 8 location ids are fixed
  by `LocationId` in `ui/types.ts`. Add a location by adding an id there and a layout entry in `CityMap`.
- Stat bars use `max` from the view, so skills can scale beyond 10 without UI changes.
- Tailwind theme tokens (fog, paper, ink, line-blue/green/yellow, signal) are in `tailwind.config.js`.
- Tests are not set up yet. Add Vitest for the systems listed in section 20 of the task file.
