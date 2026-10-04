import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, FileText, Menu, Search, Upload } from 'lucide-react'
import useClickOutside from '../../utils/useClickOutside'
import { timeAgo } from '../../utils/format'
import Tooltip from '../ui/Tooltip'

function ActivityBell({ documents }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  const recent = documents.slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <Tooltip label="Recent activity" side="bottom">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Recent activity"
          className={`relative rounded-xl border border-slate-200/90 bg-white p-2.5 text-slate-500 transition-all hover:border-brand-200 hover:text-brand-600 hover:shadow-sm ${
            open ? 'border-brand-300 text-brand-600 shadow-sm' : ''
          }`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {recent.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-[9px] font-bold text-white ring-2 ring-white">
              {recent.length}
            </span>
          )}
        </button>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-card-hover)]"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">Activity</p>
              <p className="text-xs text-slate-500">Recently ingested documents</p>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {recent.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">
                  No activity yet — upload your first PDF.
                </p>
              ) : (
                recent.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{doc.title}</p>
                      <p className="text-[11px] text-slate-400">{timeAgo(doc.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AiStatusPill({ status }) {
  const config = {
    active: { label: 'AI Engine Active', dot: 'bg-success', ring: 'ring-success/20', text: 'text-success' },
    partial: { label: 'AI Partially Configured', dot: 'bg-amber-500', ring: 'ring-amber-500/20', text: 'text-amber-600' },
    offline: { label: 'AI Engine Offline', dot: 'bg-red-500', ring: 'ring-red-500/20', text: 'text-red-600' },
    checking: { label: 'Checking AI Engine…', dot: 'bg-slate-400', ring: 'ring-slate-400/20', text: 'text-slate-500' },
  }[status]

  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 shadow-sm md:flex"
      title="Live status of the RAG engine configuration"
    >
      <span className="relative flex h-2 w-2">
        {status === 'active' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
    </div>
  )
}

export default function Header({ aiStatus, documents, onGlobalSearch, onUploadClick, onOpenSidebar }) {
  const [query, setQuery] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    onGlobalSearch(query.trim())
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-slate-500 transition-colors hover:text-ink lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl">
            Knowledge <span className="text-gradient">Hub</span>
          </h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            Manage documents, explore knowledge, and get AI-powered answers.
          </p>
        </div>

        <form onSubmit={submit} className="relative hidden sm:block" role="search">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge base…"
            aria-label="Global search"
            className="w-48 rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm transition-all placeholder:text-slate-400 focus:w-64 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 lg:w-60 lg:focus:w-80"
          />
        </form>

        <AiStatusPill status={aiStatus} />
        <ActivityBell documents={documents} />

        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-[0.98] sm:px-4"
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Upload Document</span>
        </button>
      </div>
    </header>
  )
}
