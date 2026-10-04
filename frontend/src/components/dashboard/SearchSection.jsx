import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, FileSearch, Loader2, Search, SearchX } from 'lucide-react'
import api from '../../api/client'
import { useToast } from '../ui/Toast'

const SUGGESTIONS = ['Business management platform', 'API endpoints', 'System architecture']

function ResultCard({ result, rank, fallbackTitle }) {
  const [expanded, setExpanded] = useState(false)
  const { chunk, score } = result
  const text = chunk.text || ''
  const isLong = text.length > 320
  const visible = expanded || !isLong ? text : `${text.slice(0, 320)}…`
  const title = chunk.documentTitle || fallbackTitle || 'Unknown document'

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(rank * 0.05, 0.25) }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-card)] transition-all hover:border-brand-200 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 text-[11px] font-bold text-white shadow-sm">
          {rank}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-700">
          <FileSearch className="h-3.5 w-3.5 shrink-0 text-teal-500" />
          <span className="truncate">{title}</span>
        </span>
        <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-brand-600 ring-1 ring-brand-100">
          RRF {score.toFixed(4)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          chunk #{chunk.chunkIndex}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">{visible}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          {expanded ? 'Show less' : 'Show more'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded && 'rotate-180'}`} />
        </button>
      )}
    </motion.li>
  )
}

function SkeletonCard() {
  return (
    <li className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-slate-100" />
        <div className="h-3.5 w-32 rounded bg-slate-100" />
        <div className="ml-auto h-5 w-16 rounded-full bg-slate-50" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-11/12 rounded bg-slate-100" />
        <div className="h-3 w-3/5 rounded bg-slate-50" />
      </div>
    </li>
  )
}

export default function SearchSection({ seed, documents, onSearched }) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const runSearch = useCallback(
    async (q) => {
      if (!q.trim()) return
      setLoading(true)
      setHasSearched(true)
      try {
        const { data } = await api.post('/search/search', { query: q.trim() })
        setResults(data.results)
        onSearched?.()
      } catch (err) {
        setResults(null)
        toast.error(err.response?.data?.message || 'Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [onSearched, toast],
  )

  useEffect(() => {
    if (seed) {
      setQuery(seed.q)
      runSearch(seed.q)
    }
  }, [seed, runSearch])

  return (
    <section id="search" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-teal-200/50 to-accent-200/40 blur-3xl" />

        <div className="relative">
          <div className="mb-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-500">
                <Search className="h-4 w-4" />
              </span>
              Explore Your Knowledge
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Find relevant information using vector and keyword search, fused with Reciprocal Rank
              Fusion.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              runSearch(query)
            }}
            className="relative"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-1.5 pl-4 transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
              <Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the knowledge base…"
                aria-label="Hybrid search"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:hover:brightness-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{loading ? 'Searching' : 'Search'}</span>
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s)
                  runSearch(s)
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {loading ? (
              <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </ul>
            ) : results === null && !hasSearched ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-9 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 opacity-20 blur-lg" />
                  <div className="relative flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100">
                    <Search className="h-6 w-6 text-brand-500" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-600">Search across every chunk</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
                  Semantic vector search and keyword search run in parallel, then results are fused
                  into one ranked list.
                </p>
              </div>
            ) : results !== null && results.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-9 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-100">
                  <SearchX className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-600">No results found</p>
                <p className="mt-1 text-xs text-slate-400">
                  Try different keywords or upload more documents.
                </p>
              </div>
            ) : results ? (
              <ul className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {results.map((result, i) => (
                  <ResultCard
                    key={result.chunk._id}
                    result={result}
                    rank={i + 1}
                    fallbackTitle={documents.find((d) => d._id === result.chunk.documentId)?.title}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
