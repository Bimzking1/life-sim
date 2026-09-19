import type { LifeSummaryView } from '../ui/types'

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-1 text-sm font-bold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink2">None.</p>
      ) : (
        <ul className="list-disc space-y-0.5 pl-5 text-sm">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface Props {
  summary: LifeSummaryView
  onStartNewLife: () => void
}

export function EndSummary({ summary, onStartNewLife }: Props) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-fog p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="end-title" className="panel mx-auto my-6 max-w-3xl p-6 sm:p-8">
        <p className="text-sm text-ink2">Age {summary.finalAge}</p>
        <h2 id="end-title" className="text-4xl font-bold leading-tight">{summary.ending}</h2>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-fog p-3">
            <dt className="text-sm text-ink2">Career</dt>
            <dd className="font-display text-lg font-bold">{summary.career}</dd>
          </div>
          <div className="rounded-lg bg-fog p-3">
            <dt className="text-sm text-ink2">Money</dt>
            <dd className="font-display text-lg font-bold">{summary.money}</dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Block title="Education" items={summary.education} />
          <Block title="Relationships" items={summary.relationships} />
          <Block title="Achievements" items={summary.achievements} />
          <Block title="Important events" items={summary.events} />
          <Block title="Properties" items={summary.properties} />
          <Block title="Notable decisions" items={summary.decisions} />
        </div>

        <div className="mt-8">
          <button type="button" className="btn-primary" onClick={onStartNewLife} autoFocus>
            Start New Life
          </button>
        </div>
      </div>
    </div>
  )
}
