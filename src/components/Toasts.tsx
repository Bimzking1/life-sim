import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export interface ToastItem {
  id: string
  tone: 'success' | 'error' | 'info'
  text: string
}

const STYLE = {
  success: { cls: 'border-line-green', icon: <CheckCircle2 size={18} className="text-line-green" aria-hidden /> },
  error: { cls: 'border-signal', icon: <AlertTriangle size={18} className="text-signal" aria-hidden /> },
  info: { cls: 'border-line-blue', icon: <Info size={18} className="text-line-blue" aria-hidden /> },
}

export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`flex items-start gap-3 rounded-lg border-l-4 bg-paper p-3 text-sm shadow-lg ${STYLE[t.tone].cls}`}>
          {STYLE[t.tone].icon}
          <p className="flex-1">{t.text}</p>
          <button type="button" aria-label="Dismiss message" onClick={() => onDismiss(t.id)} className="text-ink2 hover:text-ink">
            <X size={16} aria-hidden />
          </button>
        </div>
      ))}
    </div>
  )
}
