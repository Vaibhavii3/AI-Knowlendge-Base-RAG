import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const ACCENTS = {
  success: 'text-success',
  error: 'text-red-600',
  info: 'text-brand-500',
}

const BARS = {
  success: 'bg-success',
  error: 'bg-red-500',
  info: 'bg-brand-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type, text, duration = 4200) => {
      const id = ++idRef.current
      setToasts((t) => [...t.slice(-3), { id, type, text }])
      if (duration) setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  const toast = {
    success: (text, duration) => push('success', text, duration),
    error: (text, duration) => push('error', text, duration),
    info: (text, duration) => push('info', text, duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5"
      >
        <AnimatePresence>
          {toasts.map(({ id, type, text }) => {
            const Icon = ICONS[type]
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-3.5 pl-4 pr-2.5 shadow-[var(--shadow-card-hover)] backdrop-blur"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${BARS[type]}`} />
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ACCENTS[type]}`} />
                <p className="flex-1 text-sm leading-snug text-ink">{text}</p>
                <button
                  onClick={() => dismiss(id)}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
