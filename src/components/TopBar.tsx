import { useRef } from 'react'
import { Download, FolderOpen, RotateCcw } from 'lucide-react'
import type { ClockView } from '../ui/types'

interface TopBarProps {
  clock: ClockView
  onNewGame: () => void
  onSaveGame: () => void
  onLoadFile: (file: File) => void
}

export function TopBar({ clock, onNewGame, onSaveGame, onLoadFile }: TopBarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-line-blue">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="6" cy="18" r="2.4" />
              <circle cx="18" cy="6" r="2.4" />
              <path d="M8 16 L16 8" />
            </svg>
          </span>
          <h1 className="text-xl font-bold">Lifeline</h1>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg border border-rule bg-fog px-4 py-1.5 text-sm"
          aria-label="Current date and time"
        >
          <span className="font-semibold">
            Day {clock.dayNumber}, {clock.weekday}
          </span>
          <span className="font-display text-lg font-bold tabular-nums">{clock.time}</span>
          <span className="text-ink2">{clock.phase}</span>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-paper">Age {clock.age}</span>
        </div>

        <nav className="flex items-center gap-2" aria-label="Game menu">
          <button type="button" className="btn-quiet" onClick={onNewGame}>
            <RotateCcw size={16} aria-hidden /> New Game
          </button>
          <button type="button" className="btn-quiet" onClick={onSaveGame}>
            <Download size={16} aria-hidden /> Save Game
          </button>
          <button type="button" className="btn-quiet" onClick={() => fileRef.current?.click()}>
            <FolderOpen size={16} aria-hidden /> Load Game
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Choose a save file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onLoadFile(file)
              e.target.value = ''
            }}
          />
        </nav>
      </div>
    </header>
  )
}
