import { useEffect, useRef, useState } from 'react'
import { Music, Volume2 } from 'lucide-react'
import { playCue, setMusicEnabled, setSfxEnabled, useAudioSettings } from '../audio/audio'

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-sfx="none"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-line-green' : 'bg-fog'
      }`}
    >
      <span
        aria-hidden
        className={`block h-5 w-5 rounded-full bg-paper shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

/** Popover with Sound Effects and Music on/off toggles. */
export function SoundSettings() {
  const { sfx, music } = useAudioSettings()
  const [open, setOpen] = useState(false)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onToggleSfx = (v: boolean) => {
    playCue(v ? 'toggle-on' : 'toggle-off')
    setSfxEnabled(v)
  }

  const onToggleMusic = (v: boolean) => {
    playCue('volume-change')
    setMusicEnabled(v)
  }

  return (
    <div ref={popRef} className="relative">
      <button
        type="button"
        onClick={() => {
          playCue(open ? 'close' : 'open')
          setOpen((o) => !o)
        }}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rule bg-paper text-ink2 transition-colors hover:bg-fog hover:text-ink ${
          open ? 'bg-fog text-ink' : ''
        }`}
        aria-label="Sound settings"
        title="Sound settings"
        aria-expanded={open}
      >
        <Volume2 size={16} aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-panel border border-rule bg-paper p-3 shadow-xl">
          <div className="flex items-center justify-between gap-3 px-1 py-1.5">
            <span className="flex items-center gap-2 text-sm">
              <Volume2 size={15} aria-hidden className="text-ink2" /> Sound effects
            </span>
            <Switch checked={sfx} onChange={onToggleSfx} label="Sound effects" />
          </div>
          <div className="flex items-center justify-between gap-3 px-1 py-1.5">
            <span className="flex items-center gap-2 text-sm">
              <Music size={15} aria-hidden className="text-ink2" /> Background music
            </span>
            <Switch checked={music} onChange={onToggleMusic} label="Background music" />
          </div>
          <p className="mt-2 px-1 text-xs text-ink2">Settings are saved on this device.</p>
        </div>
      )}
    </div>
  )
}