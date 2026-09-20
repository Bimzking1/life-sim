export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-lg bg-line-blue"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" className="h-3/5 w-3/5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="6" cy="18" r="2.4" />
        <circle cx="18" cy="6" r="2.4" />
        <path d="M8 16 L16 8" />
      </svg>
    </span>
  )
}