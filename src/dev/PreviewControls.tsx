import { useState } from 'react'
import { Eye } from 'lucide-react'

interface Props {
  onShowEvent: () => void
  onShowEnd: () => void
  onShowStart: () => void
  onShowConfirm: () => void
  onToast: (tone: 'success' | 'error' | 'info') => void
}

/** DEV ONLY. Lets you preview overlay screens without game logic. Delete on integration. */
export function PreviewControls(p: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button type="button" className="btn-quiet bg-paper" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Eye size={16} aria-hidden /> UI preview
      </button>
      {open && (
        <div className="panel mt-2 flex w-48 flex-col gap-1.5 p-2 shadow-lg">
          <button type="button" className="btn-quiet" onClick={p.onShowStart}>Start screen</button>
          <button type="button" className="btn-quiet" onClick={p.onShowEvent}>Random event</button>
          <button type="button" className="btn-quiet" onClick={p.onShowConfirm}>New game confirm</button>
          <button type="button" className="btn-quiet" onClick={p.onShowEnd}>Life summary</button>
          <button type="button" className="btn-quiet" onClick={() => p.onToast('success')}>Success toast</button>
          <button type="button" className="btn-quiet" onClick={() => p.onToast('error')}>Error toast</button>
        </div>
      )}
    </div>
  )
}
