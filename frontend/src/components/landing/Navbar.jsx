import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#stack', label: 'Stack' },
]

export default function Navbar() {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed inset-x-0 top-4 z-40 px-4">
      <nav className="mx-auto flex max-w-4xl items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 py-2.5 pl-4 pr-2.5 shadow-[0 1px 2px rgb(17 24 39 / 0.04), 0 12px 32px -16px rgb(4 120 87 / 0.18)] backdrop-blur-xl">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="AI Knowledge Base home">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-gradient-to-br from-brand-700 to-accent-500 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <BrainCircuit className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-ink">
            AI Knowledge<span className="text-brand-600">Base</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          {token ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-[var(--shadow-glow)]"
            >
              Open Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-[var(--shadow-glow)]"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-xl md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 flex gap-2 border-t border-slate-100 p-2 pt-3">
              {token ? (
                <Link
                  to="/dashboard"
                  className="flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
