import { useEffect } from 'react'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={clsx('relative bg-svep-surface border border-svep-border rounded-xl w-full max-w-lg', className)}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-svep-border">
            <h2 className="text-lg font-semibold text-svep-primary">{title}</h2>
            <button onClick={onClose} className="text-svep-tertiary hover:text-svep-primary transition-colors text-xl leading-none">×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
