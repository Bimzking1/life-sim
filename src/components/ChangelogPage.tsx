import { ArrowLeft } from 'lucide-react'
import { Logo } from './Logo'
import { CHANGELOG, type ChangelogVersion } from '../data/changelog'

interface ChangelogPageProps {
  onBack: () => void
}

function VersionBlock({ entry }: { entry: ChangelogVersion }) {
  return (
    <section className="panel p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-bold">{entry.version}</h2>
        {entry.date && <span className="text-sm text-ink2">{entry.date}</span>}
      </div>
      {entry.sections.map((section) => (
        <div key={section.heading} className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-line-green">
            {section.heading}
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink2">
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export function ChangelogPage({ onBack }: ChangelogPageProps) {
  return (
    <div className="min-h-screen bg-fog">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <h1 className="text-xl font-bold">Lifeline · Changelog</h1>
          </div>
          <button type="button" onClick={onBack} data-sfx="back" className="btn-quiet">
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        {CHANGELOG.map((entry) => (
          <VersionBlock key={entry.version} entry={entry} />
        ))}
      </main>
    </div>
  )
}