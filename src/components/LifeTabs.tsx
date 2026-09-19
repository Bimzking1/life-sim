import { useState } from 'react'
import { BookOpen, Briefcase, Home, Package } from 'lucide-react'
import type { CareerView, CourseView, InventoryItemView, PropertyView } from '../ui/types'
import { ProgressBar } from './ProgressBar'

type TabId = 'career' | 'education' | 'inventory' | 'assets'

interface LifeTabsProps {
  career: CareerView
  courses: CourseView[]
  inventory: InventoryItemView[]
  properties: PropertyView[]
  onCourseAction: (courseId: string) => void
  onUseItem: (itemId: string) => void
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'career', label: 'Career', icon: <Briefcase size={16} aria-hidden /> },
  { id: 'education', label: 'Education', icon: <BookOpen size={16} aria-hidden /> },
  { id: 'inventory', label: 'Inventory', icon: <Package size={16} aria-hidden /> },
  { id: 'assets', label: 'Properties', icon: <Home size={16} aria-hidden /> },
]

const COURSE_CTA: Record<CourseView['status'], string> = {
  available: 'Enroll',
  'in-progress': 'Continue',
  completed: 'Completed',
  locked: 'Locked',
}

export function LifeTabs({ career, courses, inventory, properties, onCourseAction, onUseItem }: LifeTabsProps) {
  const [tab, setTab] = useState<TabId>('career')

  return (
    <section className="panel" aria-label="Life overview">
      <div role="tablist" aria-label="Life overview sections" className="flex gap-1 border-b border-rule px-2 pt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-2 rounded-t-lg border border-b-0 px-3.5 py-2 text-sm font-semibold ${
              tab === t.id ? 'border-rule bg-paper' : 'border-transparent text-ink2 hover:text-ink'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-4">
        {tab === 'career' && (
          <div className="space-y-4">
            {career.title ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-fog p-3">
                  <p className="text-sm text-ink2">{career.track}</p>
                  <p className="font-display text-lg font-bold">{career.title}</p>
                </div>
                <div className="rounded-lg bg-fog p-3">
                  <p className="text-sm text-ink2">Pay</p>
                  <p className="font-display text-lg font-bold">{career.salary}</p>
                  <p className="text-xs text-ink2">{career.hours}</p>
                </div>
                <div className="rounded-lg bg-fog p-3">
                  <ProgressBar label="Performance" value={career.performance} barClass="bg-line-green" />
                  {career.nextTitle && <p className="mt-2 text-xs text-ink2">Next: {career.nextTitle}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink2">You are not employed. Visit the workplace to see open positions.</p>
            )}
            <div>
              <h3 className="mb-2 text-sm font-bold">{career.title ? 'Promotion requirements' : 'Jobs you can aim for'}</h3>
              <ul className="space-y-1.5 text-sm">
                {career.requirements.map((r) => (
                  <li key={r.label} className="flex items-center gap-2">
                    <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${r.met ? 'bg-line-green' : 'bg-rule'}`} />
                    <span>{r.label}</span>
                    <span className="sr-only">{r.met ? 'requirement met' : 'requirement not met'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'education' && (
          <ul className="grid gap-3 md:grid-cols-2">
            {courses.map((c) => (
              <li key={c.id} className="flex flex-col justify-between rounded-lg border border-rule bg-paper p-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-ink2">{c.lockedReason && c.status === 'locked' ? c.lockedReason : c.description}</p>
                  <p className="mt-1 text-xs text-ink2">
                    {c.cost}, {c.duration}. Unlocks {c.unlocks}.
                  </p>
                  {(c.status === 'in-progress' || c.status === 'completed') && (
                    <div className="mt-2">
                      <ProgressBar label="Progress" value={c.progress} barClass="bg-line-blue" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-primary mt-3 self-start"
                  disabled={c.status === 'completed' || c.status === 'locked'}
                  onClick={() => onCourseAction(c.id)}
                >
                  {COURSE_CTA[c.status]}
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === 'inventory' &&
          (inventory.length === 0 ? (
            <p className="text-sm text-ink2">Your bag is empty. Buy something at the grocery or downtown.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-rule bg-paper p-3">
                  <div>
                    <p className="font-semibold">
                      {i.name} <span className="text-ink2">x{i.quantity}</span>
                    </p>
                    <p className="text-xs text-ink2">
                      {i.category}. {i.description}
                    </p>
                  </div>
                  {i.usable && (
                    <button type="button" className="btn-quiet" onClick={() => onUseItem(i.id)}>
                      Use
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ))}

        {tab === 'assets' &&
          (properties.length === 0 ? (
            <p className="text-sm text-ink2">You do not own or rent anything yet.</p>
          ) : (
            <ul className="space-y-2">
              {properties.map((p) => (
                <li key={p.id} className="rounded-lg border border-rule bg-paper p-3">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-ink2">{p.detail}</p>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </section>
  )
}
