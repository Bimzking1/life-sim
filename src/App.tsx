import { useCallback, useMemo, useState } from 'react'
import { GameScreen } from './GameScreen'
import { EventModal } from './components/EventModal'
import { EndSummary } from './components/EndSummary'
import { ConfirmDialog } from './components/ConfirmDialog'
import { StartScreen } from './components/StartScreen'
import { Toasts, type ToastItem } from './components/Toasts'
import { PreviewControls } from './dev/PreviewControls'
import type { LocationId, LogEntryView, UiHandlers } from './ui/types'
import {
  mockCareer,
  mockClock,
  mockCourses,
  mockEvent,
  mockInventory,
  mockLocations,
  mockLog,
  mockMoney,
  mockNpcs,
  mockPlayer,
  mockProperties,
  mockStats,
  mockSummary,
} from './ui/mock'

/**
 * DEMO CONTAINER.
 * Everything here is placeholder wiring so the UI can be viewed and clicked.
 * During integration, replace this file's state and handlers with the real
 * game store (GameState -> view selectors, handlers -> game actions).
 */
export default function App() {
  const [currentLocationId, setCurrentLocationId] = useState<LocationId>('home')
  const [log, setLog] = useState<LogEntryView[]>(mockLog)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [showStart, setShowStart] = useState(false)
  const [showEvent, setShowEvent] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const toast = useCallback((tone: ToastItem['tone'], text: string) => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, tone, text }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])

  const say = useCallback((text: string) => {
    setLog((l) => [{ id: crypto.randomUUID(), stamp: 'Day 1, 08:00', text, tone: 'neutral' }, ...l])
  }, [])

  const handlers: UiHandlers = useMemo(
    () => ({
      onNewGame: () => setShowConfirm(true),
      onSaveGame: () => toast('info', 'Save Game is not connected yet. It should download life-sim-save.json.'),
      onLoadFile: (file) => toast('info', `Load Game is not connected yet. You picked ${file.name}.`),
      onContinueAutosave: () => setShowStart(false),
      onTravel: (id) => {
        setCurrentLocationId(id)
        say(`You traveled to ${mockLocations.find((l) => l.id === id)?.name ?? id}.`)
      },
      onAction: (loc, action) => say(`Action "${action}" at ${loc} is not connected yet.`),
      onBuy: (loc, item) => say(`Buying "${item}" at ${loc} is not connected yet.`),
      onNpcInteract: (npc, action) => say(`Interaction "${action}" with ${npc} is not connected yet.`),
      onEventChoice: () => setShowEvent(false),
      onCourseAction: (id) => say(`Course "${id}" is not connected yet.`),
      onUseItem: (id) => say(`Using "${id}" is not connected yet.`),
      onStartNewLife: () => setShowEnd(false),
    }),
    [say, toast],
  )

  return (
    <>
      <GameScreen
        handlers={handlers}
        player={mockPlayer}
        clock={mockClock}
        stats={mockStats}
        money={mockMoney}
        locations={mockLocations}
        currentLocationId={currentLocationId}
        npcs={mockNpcs}
        log={log}
        career={mockCareer}
        courses={mockCourses}
        inventory={mockInventory}
        properties={mockProperties}
      />

      {showStart && (
        <StartScreen
          autosave={{ label: 'Alex Rivera', detail: 'Age 34, autosaved 12 minutes ago' }}
          onContinue={() => setShowStart(false)}
          onNewGame={() => setShowStart(false)}
          onLoadFile={(f) => {
            setShowStart(false)
            handlers.onLoadFile(f)
          }}
        />
      )}
      {showEvent && <EventModal event={mockEvent} onChoose={(c) => handlers.onEventChoice(mockEvent.id, c)} />}
      {showConfirm && (
        <ConfirmDialog
          title="Start a new game?"
          body="Your current life will be lost unless you saved it with Save Game."
          confirmLabel="Start new game"
          danger
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false)
            toast('success', 'New game started.')
          }}
        />
      )}
      {showEnd && <EndSummary summary={mockSummary} onStartNewLife={handlers.onStartNewLife} />}

      <Toasts items={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <PreviewControls
        onShowStart={() => setShowStart(true)}
        onShowEvent={() => setShowEvent(true)}
        onShowEnd={() => setShowEnd(true)}
        onShowConfirm={() => setShowConfirm(true)}
        onToast={(tone) =>
          toast(tone, tone === 'success' ? 'Game loaded. Welcome back, Alex.' : 'That file is not a valid save. Choose a life-sim-save.json file.')
        }
      />
    </>
  )
}
