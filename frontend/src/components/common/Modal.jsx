import { X } from 'lucide-react'

export default function Modal({ children, isOpen, onClose, title, className = '' }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-10 backdrop-blur-sm">
      <div className={`surface-card max-h-[90vh] w-full max-w-2xl overflow-hidden ${className}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[rgb(var(--text-soft))] transition hover:bg-white/10 hover:text-[rgb(var(--text))]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-73px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
