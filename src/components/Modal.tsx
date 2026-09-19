import { useEffect, useRef } from 'react'

interface ModalProps {
  labelledBy: string
  onEscape?: () => void
  wide?: boolean
  children: React.ReactNode
}

/** Minimal accessible modal shell: focus moves in, Escape closes when allowed. */
export function Modal({ labelledBy, onEscape, wide, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('button:not([disabled]), [tabindex]')?.focus()
    return () => previous?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-ink/55 p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onEscape) onEscape()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-panel border border-rule bg-paper p-6 shadow-xl`}
      >
        {children}
      </div>
    </div>
  )
}
