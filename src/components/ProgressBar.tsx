interface ProgressBarProps {
  label: string
  value: number
  max?: number
  barClass: string
  icon?: React.ReactNode
}

export function ProgressBar({ label, value, max = 100, barClass, icon }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          {icon}
          {label}
        </span>
        <span className="tabular-nums text-ink2">
          {value}/{max}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="mt-1 h-2 overflow-hidden rounded-full bg-rule/60"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
