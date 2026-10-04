import { motion } from 'framer-motion'
import { Activity, FileText, Layers, Search } from 'lucide-react'

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-slate-200/80" />
        <div className="h-8 w-16 rounded-lg bg-slate-100" />
      </div>
      <div className="mt-4 h-3 w-24 rounded bg-slate-100" />
    </div>
  )
}

function StatCard({ icon: Icon, value, label, sub, gradient, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-105 ${gradient}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">{children}</div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-ink tabular-nums sm:text-[28px]">{value}</p>
      <p className="mt-0.5 text-[13px] font-medium text-slate-500">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-400">{sub}</p>}
    </motion.div>
  )
}

export default function StatsCards({ stats, loading }) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    )
  }

  const stats_ = stats || { documents: 0, chunks: 0, searchQueries: 0 }
  const groq = stats?.aiConfigured?.groq
  const hf = stats?.aiConfigured?.huggingFace
  const aiActive = groq && hf

  const aiValue = aiActive ? 'Active' : groq || hf ? 'Partial' : 'Offline'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={FileText}
        value={stats_.documents.toLocaleString()}
        label="Documents Indexed"
        sub="PDFs ingested into the base"
        gradient="from-brand-500 to-brand-600"
        delay={0}
      />
      <StatCard
        icon={Layers}
        value={stats_.chunks.toLocaleString()}
        label="Total Chunks"
        sub="Embedded vectors stored"
        gradient="from-teal-500 to-teal-600"
        delay={0.06}
      />
      <StatCard
        icon={Search}
        value={stats_.searchQueries.toLocaleString()}
        label="Search Queries"
        sub="Hybrid RRF searches run"
        gradient="from-accent-500 to-sky-600"
        delay={0.12}
      />
      <StatCard
        icon={Activity}
        value={aiValue}
        label="AI Status"
        sub={
          stats
            ? aiActive
              ? 'Groq LLM + HF embeddings connected'
              : `Missing keys: ${[!groq && 'Groq', !hf && 'HuggingFace'].filter(Boolean).join(', ')}`
            : 'Could not reach the API'
        }
        gradient={aiActive ? 'from-emerald-500 to-green-600' : 'from-slate-400 to-slate-500'}
        delay={0.18}
      >
        {aiActive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success ring-1 ring-success/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Connected
          </span>
        )}
      </StatCard>
    </div>
  )
}
