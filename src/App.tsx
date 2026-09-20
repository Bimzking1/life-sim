import { useEffect, useState } from 'react'
import { GameScreen } from './GameScreen'
import { EventModal } from './components/EventModal'
import { EndSummary } from './components/EndSummary'
import { ConfirmDialog } from './components/ConfirmDialog'
import { StartScreen } from './components/StartScreen'
import { SplashScreen } from './components/SplashScreen'
import { ChangelogPage } from './components/ChangelogPage'
import { Toasts } from './components/Toasts'
import { useGame } from './game/store'
import { bindGlobalSfx } from './audio/audio'

type Route = 'splash' | 'game' | 'changelog'

export default function App() {
  const { view, handlers, startFreshLife, dismissConfirm, dismissToast } = useGame()

  useEffect(() => bindGlobalSfx(), [])
  const [route, setRoute] = useState<Route>('splash')
  const [returnTo, setReturnTo] = useState<Route>('splash')

  const openChangelog = () => {
    setReturnTo(route)
    setRoute('changelog')
  }

  if (route === 'changelog') return <ChangelogPage onBack={() => setRoute(returnTo)} />
  if (route === 'splash')
    return <SplashScreen onPlay={() => setRoute('game')} />

  return (
    <>
      <GameScreen
        handlers={handlers}
        player={view.player}
        clock={view.clock}
        stats={view.stats}
        money={view.money}
        locations={view.locations}
        currentLocationId={view.currentLocationId}
        npcs={view.npcs}
        log={view.log}
        career={view.career}
        courses={view.courses}
        inventory={view.inventory}
        properties={view.properties}
      />

      {view.showStart && (
        <StartScreen
          autosave={view.autosaveLabel ? { label: view.autosaveLabel, detail: view.autosaveDetail ?? '' } : null}
          onContinue={handlers.onContinueAutosave}
          onNewGame={handlers.onNewGame}
          onLoadFile={handlers.onLoadFile}
          onOpenChangelog={openChangelog}
        />
      )}
      {view.event && (
        <EventModal event={view.event} onChoose={(choiceId) => handlers.onEventChoice(view.event!.id, choiceId)} />
      )}
      {view.showConfirm && (
        <ConfirmDialog
          title="Start a new game?"
          body="Your current life will be lost unless you saved it with Save Game."
          confirmLabel="Start new game"
          danger
          onCancel={dismissConfirm}
          onConfirm={startFreshLife}
        />
      )}
      {view.showEnd && view.summary && <EndSummary summary={view.summary} onStartNewLife={handlers.onStartNewLife} />}

      <Toasts items={view.toasts} onDismiss={dismissToast} />
    </>
  )
}