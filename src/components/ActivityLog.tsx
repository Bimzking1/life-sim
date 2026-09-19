import type { LogEntryView, Tone } from '../ui/types'

const DOT: Record<Tone, string> = {
  good: 'bg-line-green',
  bad: 'bg-signal',
  neutral: 'bg-ink2',
  info: 'bg-line-blue',
}

export function ActivityLog({ entries }: { entries: LogEntryView[] }) {
  return (
    <section className="panel p-4" aria-labelledby="log-h">
      <h2 id="log-h" className="mb-3 text-lg font-bold">Activity</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-ink2">Nothing has happened yet. Pick a place on the map to begin.</p>
      ) : (
        <ol className="max-h-72 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3 text-sm">
              <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[e.tone]}`} />
              <div>
                <p>{e.text}</p>
                <p className="text-xs text-ink2">{e.stamp}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
