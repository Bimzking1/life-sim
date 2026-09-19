import { Modal } from './Modal'

interface Props {
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return (
    <Modal labelledBy="confirm-title" onEscape={onCancel}>
      <h2 id="confirm-title" className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-ink2">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-quiet" onClick={onCancel}>Keep playing</button>
        <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
