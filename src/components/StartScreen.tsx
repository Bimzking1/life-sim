import { useEffect, useRef } from 'react'
import { FolderOpen, Play, Plus, ScrollText } from 'lucide-react'
import type { SaveSlotInfo } from '../ui/types'
import { playCue } from '../audio/audio'

interface Props {
  autosave: SaveSlotInfo | null
  onContinue: () => void
  onNewGame: () => void
  onLoadFile: (file: File) => void
  onOpenChangelog: () => void
}

export function StartScreen({ autosave, onContinue, onNewGame, onLoadFile, onOpenChangelog }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    playCue('open')
  }, [])

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-fog p-4">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold leading-none">Lifeline</h1>
        <p className="mt-3 text-ink2">Eighteen years old, $100, and a whole city to figure out. Make it count.</p>

        <div className="mt-8 space-y-3">
          {autosave && (
            <button type="button" onClick={onContinue} data-sfx="select" className="panel flex w-full items-center gap-3 p-4 text-left hover:border-ink">
              <Play size={20} aria-hidden className="text-line-blue" />
              <span>
                <span className="block font-semibold">Continue {autosave.label}</span>
                <span className="block text-sm text-ink2">{autosave.detail}</span>
              </span>
            </button>
          )}
          <button type="button" onClick={onNewGame} data-sfx="start" className="panel flex w-full items-center gap-3 p-4 text-left hover:border-ink">
            <Plus size={20} aria-hidden className="text-line-green" />
            <span>
              <span className="block font-semibold">Start a new life</span>
              <span className="block text-sm text-ink2">Begin at age 18.</span>
            </span>
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} data-sfx="open" className="panel flex w-full items-center gap-3 p-4 text-left hover:border-ink">
            <FolderOpen size={20} aria-hidden className="text-line-yellow" />
            <span>
              <span className="block font-semibold">Load a save file</span>
              <span className="block text-sm text-ink2">Pick a life-sim-save.json from your computer.</span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Choose a save file"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onLoadFile(f)
              e.target.value = ''
            }}
          />
          <div className="pt-2">
            <button type="button" onClick={onOpenChangelog} data-sfx="open" className="btn-quiet w-full justify-center gap-2 rounded-lg py-2.5 text-sm text-ink2 hover:text-ink">
              <ScrollText size={16} aria-hidden /> Changelog
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
