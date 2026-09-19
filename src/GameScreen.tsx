import { useState } from 'react'
import type {
  CareerView,
  ClockView,
  CourseView,
  InventoryItemView,
  LocationId,
  LocationView,
  LogEntryView,
  MoneyView,
  NpcView,
  PlayerView,
  PropertyView,
  StatView,
  UiHandlers,
} from './ui/types'
import { TopBar } from './components/TopBar'
import { StatsPanel } from './components/StatsPanel'
import { CityMap } from './components/CityMap'
import { LocationPanel } from './components/LocationPanel'
import { RelationshipsPanel } from './components/RelationshipsPanel'
import { ActivityLog } from './components/ActivityLog'
import { LifeTabs } from './components/LifeTabs'

export interface GameScreenProps {
  handlers: UiHandlers
  player: PlayerView
  clock: ClockView
  stats: StatView[]
  money: MoneyView
  locations: LocationView[]
  currentLocationId: LocationId
  npcs: NpcView[]
  log: LogEntryView[]
  career: CareerView
  courses: CourseView[]
  inventory: InventoryItemView[]
  properties: PropertyView[]
}

/**
 * Purely presentational main screen. It owns only UI state
 * (which map stop is selected). All game data arrives via props.
 */
export function GameScreen(p: GameScreenProps) {
  const [selectedId, setSelectedId] = useState<LocationId>(p.currentLocationId)
  const selected = p.locations.find((l) => l.id === selectedId) ?? p.locations[0]
  const h = p.handlers

  return (
    <div className="min-h-screen">
      <TopBar clock={p.clock} onNewGame={h.onNewGame} onSaveGame={h.onSaveGame} onLoadFile={h.onLoadFile} />

      <main className="mx-auto grid max-w-[1400px] gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <StatsPanel player={p.player} stats={p.stats} money={p.money} />

        <div className="space-y-4">
          <CityMap locations={p.locations} currentId={p.currentLocationId} selectedId={selectedId} onSelect={setSelectedId} />
          <LocationPanel
            location={selected}
            isHere={selected.id === p.currentLocationId}
            onTravel={() => h.onTravel(selected.id)}
            onAction={(actionId) => h.onAction(selected.id, actionId)}
            onBuy={(itemId) => h.onBuy(selected.id, itemId)}
          />
          <LifeTabs
            career={p.career}
            courses={p.courses}
            inventory={p.inventory}
            properties={p.properties}
            onCourseAction={h.onCourseAction}
            onUseItem={h.onUseItem}
          />
        </div>

        <div className="space-y-4">
          <RelationshipsPanel npcs={p.npcs} onInteract={h.onNpcInteract} />
          <ActivityLog entries={p.log} />
        </div>
      </main>
    </div>
  )
}
