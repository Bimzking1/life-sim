import { Play } from 'lucide-react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { SoundSettings } from './SoundSettings'

interface SplashScreenProps {
  onPlay: () => void
}

export function SplashScreen({ onPlay }: SplashScreenProps) {
  return (
    <div className="relative min-h-screen bg-fog">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <SoundSettings />
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-10 text-center">
        <div className="animate-fade-up">
          <Logo size={72} />
        </div>
        <h1 className="mt-6 font-display text-7xl font-bold leading-none tracking-tight animate-fade-up" style={{ animationDelay: '0.12s' }}>
          Lifeline
        </h1>
        <p className="mt-4 max-w-md text-lg text-ink2 animate-fade-up" style={{ animationDelay: '0.24s' }}>
          Eighteen years old, $100, and a whole city to figure out. Make it count.
        </p>

        <div className="animate-fade-up" style={{ animationDelay: '0.36s' }}>
          <button type="button" onClick={onPlay} data-sfx="start" className="btn-primary mt-10 px-10 py-3.5 text-lg">
            <Play size={20} aria-hidden /> Play
          </button>
        </div>
      </div>
    </div>
  )
}