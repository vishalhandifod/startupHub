import { X } from 'lucide-react'
import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function removeToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  function showToast({ title, message, tone = 'info' }) {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => removeToast(id), 4000)
  }

  const value = useMemo(() => ({ showToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-fade-up rounded-3xl border px-4 py-4 shadow-glow backdrop-blur-xl ${
              toast.tone === 'error'
                ? 'border-rose-500/30 bg-rose-500/10'
                : toast.tone === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-white/10 bg-slate-900/80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 text-sm text-[rgb(var(--text-soft))]">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-[rgb(var(--text-soft))] transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
