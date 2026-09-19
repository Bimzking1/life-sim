import { useMemo, useState } from 'react'
import { Clock, MapPin } from 'lucide-react'
import type { ActionView, LocationView, ShopItemView } from '../ui/types'

interface LocationPanelProps {
  location: LocationView
  isHere: boolean
  onTravel: () => void
  onAction: (actionId: string) => void
  onBuy: (itemId: string) => void
}

function ActionRow({ action, onRun }: { action: ActionView; onRun: () => void }) {
  const disabled = Boolean(action.disabledReason)
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-rule bg-paper p-3">
      <div className="min-w-0">
        <p className="font-semibold">{action.label}</p>
        <p className="text-sm text-ink2">{disabled ? action.disabledReason : action.description}</p>
        <p className="mt-1 flex items-center gap-3 text-xs text-ink2">
          <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden /> {action.duration}</span>
          {action.cost && <span className="font-semibold text-ink">{action.cost}</span>}
        </p>
      </div>
      <button type="button" className="btn-primary shrink-0" disabled={disabled} onClick={onRun}>
        Do this
      </button>
    </li>
  )
}

function ShopList({ items, onBuy }: { items: ShopItemView[]; onBuy: (id: string) => void }) {
  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.category)))], [items])
  const [cat, setCat] = useState('All')
  const visible = cat === 'All' ? items : items.filter((i) => i.category === cat)

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter items by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${cat === c ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper hover:bg-fog'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {visible.map((item) => (
          <li key={item.id} className="flex flex-col justify-between rounded-lg border border-rule bg-paper p-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{item.name}</p>
                <p className="font-display font-bold tabular-nums">{item.price}</p>
              </div>
              <p className="text-sm text-ink2">{item.description}</p>
              <p className="mt-1 text-xs font-medium text-line-green">{item.effects}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-ink2">{item.owned ? `You own ${item.owned}` : item.category}</span>
              <button type="button" className="btn-primary" disabled={Boolean(item.disabledReason)} onClick={() => onBuy(item.id)}>
                Buy
              </button>
            </div>
            {item.disabledReason && <p className="mt-1 text-xs text-signal">{item.disabledReason}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LocationPanel({ location, isHere, onTravel, onAction, onBuy }: LocationPanelProps) {
  return (
    <section className="panel p-4" aria-labelledby="loc-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="loc-h" className="text-xl font-bold">{location.name}</h2>
          <p className="text-sm text-ink2">{location.tagline}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${location.isOpen ? 'bg-line-green/15 text-line-green' : 'bg-signal/15 text-signal'}`}
        >
          {location.isOpen ? 'Open' : 'Closed'}, {location.hours}
        </span>
      </div>

      {!isHere ? (
        <div className="mt-4 rounded-lg border border-dashed border-rule bg-fog p-4">
          <p className="mb-3 text-sm">You need to be here to use this place.</p>
          <button type="button" className="btn-primary" onClick={onTravel}>
            <MapPin size={16} aria-hidden /> Go to {location.name}
          </button>
          <span className="ml-3 text-sm text-ink2">
            {location.travel.duration}
            {location.travel.cost ? `, ${location.travel.cost}` : ''}
          </span>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {location.actions.length > 0 && (
            <ul className="space-y-2">
              {location.actions.map((a) => (
                <ActionRow key={a.id} action={a} onRun={() => onAction(a.id)} />
              ))}
            </ul>
          )}
          {location.shop && (
            <div>
              <h3 className="mb-2 text-sm font-bold">For sale</h3>
              <ShopList items={location.shop} onBuy={onBuy} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
