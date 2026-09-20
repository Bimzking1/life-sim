import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

/** Must match the pre-paint script in index.html exactly. */
const THEME_STORAGE_KEY = 'lifeline:theme'

function currentTheme(): 'dark' | 'light' {
  // Dark is the default (index.html pre-paint + CSS :root.dark). The 'light'
  // class is only ever present when the user explicitly chose light mode.
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

interface ThemeToggleProps {
  /** Lucide icon size in px. */
  size?: number
  /** Extra button classes. */
  className?: string
}

export function ThemeToggle({ size = 16, className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(currentTheme)

  useEffect(() => {
    const root = document.documentElement
    const light = theme === 'light'
    root.classList.toggle('light', light)
    root.classList.toggle('dark', !light)
    root.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* storage unavailable — theme still applies for this tab */
    }
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rule bg-paper text-ink2 transition-colors hover:bg-fog hover:text-ink ${className ?? ''}`}
      aria-label={next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <Icon size={size} aria-hidden />
    </button>
  )
}
