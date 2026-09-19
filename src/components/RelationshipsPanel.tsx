import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { NpcView } from '../ui/types'

function Meter({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 text-ink2">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-rule/60"
      >
        <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="w-7 text-right tabular-nums">{value}</span>
    </div>
  )
}

interface Props {
  npcs: NpcView[]
  onInteract: (npcId: string, actionId: string) => void
}

export function RelationshipsPanel({ npcs, onInteract }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="panel p-4" aria-labelledby="people-h">
      <h2 id="people-h" className="mb-3 text-lg font-bold">People</h2>
      {npcs.length === 0 ? (
        <p className="text-sm text-ink2">You have not met anyone yet. Visit the gym, university, or downtown.</p>
      ) : (
        <ul className="space-y-2">
          {npcs.map((npc) => {
            const open = openId === npc.id
            return (
              <li key={npc.id} className="rounded-lg border border-rule bg-paper">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 p-3 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : npc.id)}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-line-green font-display text-sm font-bold text-white" aria-hidden>
                    {npc.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight">{npc.name}</span>
                    <span className="block text-xs text-ink2">{npc.role}, {npc.personality}</span>
                  </span>
                  <ChevronDown size={16} aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                <div className="space-y-1 px-3 pb-3">
                  <Meter label="Friend" value={npc.friendship} className="bg-line-green" />
                  <Meter label="Romance" value={npc.romance} className="bg-signal" />
                  <Meter label="Respect" value={npc.respect} className="bg-line-blue" />
                </div>

                {open && (
                  <ul className="space-y-2 border-t border-rule p-3">
                    {npc.interactions.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{a.label}</p>
                          <p className="text-xs text-ink2">
                            {a.disabledReason ?? a.description} {a.duration}
                            {a.cost ? `, ${a.cost}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-quiet shrink-0"
                          disabled={Boolean(a.disabledReason)}
                          onClick={() => onInteract(npc.id, a.id)}
                        >
                          Go
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
