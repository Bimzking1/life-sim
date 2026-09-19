import { Brain, Dumbbell, Flame, Heart, Smile, Sparkles, Zap } from 'lucide-react'
import type { MoneyView, PlayerView, StatId, StatView } from '../ui/types'
import { ProgressBar } from './ProgressBar'

const STAT_STYLE: Record<StatId, { bar: string; icon: React.ReactNode }> = {
  health: { bar: 'bg-signal', icon: <Heart size={14} aria-hidden /> },
  energy: { bar: 'bg-line-yellow', icon: <Zap size={14} aria-hidden /> },
  happiness: { bar: 'bg-line-green', icon: <Smile size={14} aria-hidden /> },
  strength: { bar: 'bg-line-blue', icon: <Dumbbell size={14} aria-hidden /> },
  intelligence: { bar: 'bg-line-blue', icon: <Brain size={14} aria-hidden /> },
  charisma: { bar: 'bg-line-blue', icon: <Sparkles size={14} aria-hidden /> },
  stress: { bar: 'bg-ink', icon: <Flame size={14} aria-hidden /> },
}

interface StatsPanelProps {
  player: PlayerView
  stats: StatView[]
  money: MoneyView
}

export function StatsPanel({ player, stats, money }: StatsPanelProps) {
  const vitals = stats.filter((s) => ['health', 'energy', 'happiness', 'stress'].includes(s.id))
  const skills = stats.filter((s) => ['strength', 'intelligence', 'charisma'].includes(s.id))

  return (
    <aside className="panel flex flex-col gap-5 p-4" aria-label="Player">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-line-blue font-display text-lg font-bold text-white" aria-hidden>
          {player.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{player.name}</h2>
          <p className="text-sm text-ink2">
            Age {player.age}, {player.title}
          </p>
        </div>
      </div>

      <section aria-labelledby="vitals-h" className="space-y-3">
        <h3 id="vitals-h" className="text-sm font-bold">Condition</h3>
        {vitals.map((s) => (
          <ProgressBar key={s.id} label={s.label} value={s.value} max={s.max} barClass={STAT_STYLE[s.id].bar} icon={STAT_STYLE[s.id].icon} />
        ))}
      </section>

      <section aria-labelledby="skills-h" className="space-y-3">
        <h3 id="skills-h" className="text-sm font-bold">Skills</h3>
        {skills.map((s) => (
          <ProgressBar key={s.id} label={s.label} value={s.value} max={s.max} barClass={STAT_STYLE[s.id].bar} icon={STAT_STYLE[s.id].icon} />
        ))}
      </section>

      <section aria-labelledby="money-h">
        <h3 id="money-h" className="mb-2 text-sm font-bold">Money</h3>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div className="rounded-lg bg-fog p-2">
            <dt className="text-ink2">Cash</dt>
            <dd className="font-display text-lg font-bold tabular-nums">{money.cash}</dd>
          </div>
          <div className="rounded-lg bg-fog p-2">
            <dt className="text-ink2">Bank</dt>
            <dd className="font-display text-lg font-bold tabular-nums">{money.bank}</dd>
          </div>
          <div>
            <dt className="text-ink2">Income per day</dt>
            <dd className="font-semibold tabular-nums text-line-green">{money.incomePerDay}</dd>
          </div>
          <div>
            <dt className="text-ink2">Expenses per day</dt>
            <dd className="font-semibold tabular-nums text-signal">{money.expensesPerDay}</dd>
          </div>
          {money.rentDue && (
            <div className="col-span-2 text-ink2">
              Next rent due: <span className="font-semibold text-ink">{money.rentDue}</span>
            </div>
          )}
        </dl>
      </section>
    </aside>
  )
}
