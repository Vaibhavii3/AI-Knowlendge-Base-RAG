import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BrainCircuit, FileText, LogOut, Search, Sparkles, X } from 'lucide-react'
import { initials } from '../../utils/format'

const NAV_ITEMS = [
  { id: 'documents', label: 'Documents', icon: FileText, hint: 'Upload & manage' },
  { id: 'search', label: 'Hybrid Search', icon: Search, hint: 'Vector + keyword' },
  { id: 'ask', label: 'Ask AI', icon: Sparkles, hint: 'RAG answers' },
]

function Branding() {
  return (
    <Link
      to="/"
      title="Back to home"
      className="group flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-slate-50"
    >
      <div className="relative transition-transform duration-300 group-hover:scale-105">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 opacity-40 blur-md" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-md">
          <BrainCircuit className="h-5 w-5" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold tracking-tight text-ink">AI Knowledge Base</p>
        <p className="truncate text-[11px] text-slate-500">Your intelligent knowledge workspace</p>
      </div>
    </Link>
  )
}

function NavList({ activeSection, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1.5 px-3" aria-label="Dashboard sections">
      {NAV_ITEMS.map(({ id, label, icon: Icon, hint }) => {
        const active = activeSection === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={active ? 'true' : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-gradient-to-r from-brand-500/10 via-teal-500/10 to-accent-500/10 text-brand-700 ring-1 ring-brand-500/20'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-500 to-teal-500"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon
              className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                active ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span className="flex-1">{label}</span>
            <span
              className={`text-[10px] font-normal transition-opacity ${
                active ? 'text-brand-400 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'
              }`}
            >
              {hint}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function Profile({ user, onLogout }) {
  return (
    <div className="border-t border-slate-200/80 p-3">
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-brand-50/60 p-2.5 ring-1 ring-slate-200/70">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xs font-bold text-white">
          {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ user, activeSection, onNavigate, onLogout, open, onClose }) {
  return (
    <>
      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-slate-200/80 bg-white/85 backdrop-blur-xl lg:flex">
        <div className="flex flex-col gap-8 pt-6">
          <Branding />
          <NavList activeSection={activeSection} onNavigate={onNavigate} />
        </div>
        <Profile user={user} onLogout={onLogout} />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-white shadow-2xl lg:hidden"
            >
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex items-start justify-between px-4">
                  <Branding />
                  <button
                    onClick={onClose}
                    aria-label="Close menu"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <NavList
                  activeSection={activeSection}
                  onNavigate={(id) => {
                    onNavigate(id)
                    onClose()
                  }}
                />
              </div>
              <Profile user={user} onLogout={onLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
