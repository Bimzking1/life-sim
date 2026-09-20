import { Briefcase, Building2, Dumbbell, GraduationCap, Home, Landmark, ShoppingBasket, UtensilsCrossed } from 'lucide-react'
import type { LocationId, LocationView } from '../ui/types'

interface StopLayout {
  x: number
  y: number
  icon: React.ReactNode
  labelSide: 'top' | 'bottom'
}

const ICON = 18
const LAYOUT: Record<LocationId, StopLayout> = {
  home: { x: 10, y: 74, icon: <Home size={ICON} aria-hidden />, labelSide: 'bottom' },
  grocery: { x: 32, y: 74, icon: <ShoppingBasket size={ICON} aria-hidden />, labelSide: 'bottom' },
  restaurant: { x: 54, y: 74, icon: <UtensilsCrossed size={ICON} aria-hidden />, labelSide: 'bottom' },
  downtown: { x: 54, y: 48, icon: <Building2 size={ICON} aria-hidden />, labelSide: 'top' },
  bank: { x: 80, y: 48, icon: <Landmark size={ICON} aria-hidden />, labelSide: 'bottom' },
  gym: { x: 12, y: 22, icon: <Dumbbell size={ICON} aria-hidden />, labelSide: 'top' },
  university: { x: 36, y: 22, icon: <GraduationCap size={ICON} aria-hidden />, labelSide: 'top' },
  workplace: { x: 80, y: 22, icon: <Briefcase size={ICON} aria-hidden />, labelSide: 'top' },
}

/** Lines are drawn in a 100x100 space; the SVG stretches to the container. */
const LINES: { color: string; points: string }[] = [
  { color: '#2D5FB5', points: '10,74 32,74 54,74 54,48' },
  { color: '#2A8A6B', points: '12,22 36,22 80,22 80,48' },
  { color: '#E9B02C', points: '54,48 80,48' },
]

interface CityMapProps {
  locations: LocationView[]
  currentId: LocationId
  selectedId: LocationId
  onSelect: (id: LocationId) => void
}

export function CityMap({ locations, currentId, selectedId, onSelect }: CityMapProps) {
  return (
    <section className="panel overflow-hidden" aria-labelledby="map-h">
      <div className="flex items-baseline justify-between px-4 pt-4">
        <h2 id="map-h" className="text-lg font-bold">City</h2>
        <p className="text-sm text-ink2">Select a stop to see what you can do there.</p>
      </div>

      <div className="relative mx-2 mb-2 mt-1 aspect-[16/9] min-h-[260px] rounded-lg bg-fog">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {LINES.map((l) => (
            <polyline
              key={l.color}
              points={l.points}
              fill="none"
              stroke={l.color}
              strokeWidth={7}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity={0.9}
            />
          ))}
        </svg>

        {locations.map((loc) => {
          const l = LAYOUT[loc.id]
          const isCurrent = loc.id === currentId
          const isSelected = loc.id === selectedId
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelect(loc.id)}
              data-sfx="select"
              aria-pressed={isSelected}
              aria-label={`${loc.name}${isCurrent ? ', you are here' : ''}${loc.isOpen ? '' : ', closed'}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
            >
              <span
                className={[
                  'relative grid h-11 w-11 place-items-center rounded-full border-[3px] bg-paper text-ink shadow-sm transition-transform group-hover:scale-105',
                  isSelected ? 'border-ink' : 'border-ink/70',
                  loc.isOpen ? '' : 'opacity-60',
                ].join(' ')}
              >
                {l.icon}
                {isCurrent && (
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-paper bg-signal" aria-hidden />
                )}
              </span>
              <span
                className={[
                  'pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-semibold',
                  l.labelSide === 'top' ? '-top-6' : 'top-12',
                  isSelected ? 'bg-ink text-paper' : 'bg-paper/90 text-ink',
                ].join(' ')}
              >
                {loc.name}
              </span>
            </button>
          )
        })}
      </div>

      <p className="flex items-center gap-2 px-4 pb-3 text-xs text-ink2">
        <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-signal" /> Your current location
      </p>
    </section>
  )
}
