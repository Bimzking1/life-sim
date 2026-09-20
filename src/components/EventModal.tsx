import type { EventView } from '../ui/types'
import { Modal } from './Modal'

interface Props {
  event: EventView
  onChoose: (choiceId: string) => void
}

export function EventModal({ event, onChoose }: Props) {
  return (
    <Modal labelledBy="event-title">
      <h2 id="event-title" className="text-2xl font-bold">{event.title}</h2>
      <p className="mt-2 max-w-prose text-ink2">{event.description}</p>
      <ul className="mt-5 space-y-2">
        {event.choices.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              disabled={Boolean(c.disabledReason)}
              onClick={() => onChoose(c.id)}
              data-sfx="select"
              className="w-full rounded-lg border border-rule bg-paper p-3 text-left transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-rule"
            >
              <span className="block font-semibold">{c.label}</span>
              <span className="block text-sm text-ink2">{c.disabledReason ?? c.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
