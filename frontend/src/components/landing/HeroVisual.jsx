import { motion, useReducedMotion } from 'framer-motion'
import { BrainCircuit, FileText, Search, Sparkles } from 'lucide-react'

function Float({ delay = 0, duration = 6, className = '', children }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

function DocPanel() {
  return (
    <Float duration={7} className="relative">
      {/* ghost cards for depth */}
      <div aria-hidden="true" className="absolute -left-4 top-5 h-full w-full -rotate-6 rounded-2xl border border-slate-200 bg-white/50" />
      <div aria-hidden="true" className="absolute -left-2 top-2.5 h-full w-full -rotate-3 rounded-2xl border border-slate-200 bg-white/70" />

      <div className="relative w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0 24px 60px -28px rgb(4 120 87 / 0.3)]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <FileText className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">backend-api-spec.pdf</p>
            <p className="font-mono text-[10px] text-slate-400">1.2 MB · PDF</p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-500">
            12 chunks
          </span>
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[9px] font-medium text-brand-700">
            indexed
          </span>
        </div>

        <div className="mt-3.5">
          <div className="mb-1.5 flex items-center justify-between text-[9px] font-medium text-slate-400">
            <span>Embedding chunks</span>
            <span className="font-mono">12 / 12</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,transparent,#059669,#14b8a6,transparent)] bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      </div>
    </Float>
  )
}

function FlowConnector() {
  return (
    <div aria-hidden="true" className="mx-1 hidden w-16 shrink-0 lg:block">
      <svg viewBox="0 0 64 24" className="h-6 w-full" fill="none">
        <circle cx="3" cy="12" r="2.5" fill="#14b8a6" />
        <line
          x1="8"
          y1="12"
          x2="56"
          y2="12"
          stroke="#5eead4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="5 7"
          className="animate-dash"
        />
        <circle cx="61" cy="12" r="2.5" fill="#0d9488" />
      </svg>
    </div>
  )
}

const CHUNK_PATHS = [
  { d: 'M112 112 L36 22', stroke: '#a7f3d0' },
  { d: 'M112 112 L188 34', stroke: '#99f6e4', flow: true },
  { d: 'M112 112 L28 182', stroke: '#ddd6fe' },
  { d: 'M112 112 L186 202', stroke: '#bae6fd' },
]

function ChunkChip({ className, tint }) {
  return (
    <div className={`absolute w-[52px] rounded-lg border bg-white px-1.5 py-1.5 shadow-sm ${tint} ${className}`}>
      <div className="h-1 w-8 rounded-full bg-slate-200" />
      <div className="mt-1 h-1 w-6 rounded-full bg-slate-100" />
    </div>
  )
}

function CoreCluster() {
  const reduce = useReducedMotion()
  return (
    <div className="relative h-52 w-52 shrink-0 sm:h-60 sm:w-60">
      <svg viewBox="0 0 224 224" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        {CHUNK_PATHS.map(({ d, stroke, flow }) => (
          <path
            key={d}
            d={d}
            stroke={stroke}
            strokeWidth="1.5"
            strokeDasharray={flow ? '4 6' : undefined}
            className={flow ? 'animate-dash' : undefined}
          />
        ))}
      </svg>

      <div
        aria-hidden="true"
        className={`absolute inset-3 rounded-full border border-dashed border-brand-200 ${reduce ? '' : 'animate-orbit'}`}
      />

      <ChunkChip className="left-[8px] top-[2px]" tint="border-violet-200 bg-violet-50/80" />
      <ChunkChip className="right-[2px] top-[12px]" tint="border-brand-200 bg-brand-50/70" />
      <ChunkChip className="bottom-[20px] left-0" tint="border-sky-200 bg-sky-50/70" />
      <ChunkChip className="bottom-[0px] right-[8px]" tint="border-slate-200 bg-white" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div aria-hidden="true" className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-400/40 to-accent-400/40 blur-xl" />
        <span aria-hidden="true" className="absolute -inset-1.5 animate-pulse rounded-2xl bg-brand-400/25" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-accent-500 text-white shadow-[var(--shadow-glow)]">
          <BrainCircuit className="h-7 w-7" />
        </div>
      </div>

      <p className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 font-mono text-[9px] tracking-wide text-slate-400">
        all-MiniLM-L6-v2 · 384-dim
      </p>
    </div>
  )
}

function AnswerPanel() {
  return (
    <Float duration={8} delay={0.8} className="relative">
      <div className="w-72 max-w-full rounded-2xl border border-slate-200 bg-white shadow-[0 24px 60px -28px rgb(4 120 87 / 0.3)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Ask AI
          </span>
          <Sparkles className="h-3 w-3 text-brand-600" />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
            <span className="flex-1 truncate text-[11px] text-slate-500">
              What are the backend API phases?
            </span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-white">
              <Search className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="mt-3 text-[11px] leading-relaxed text-slate-600">
            The backend API moves through five phases — requirements &amp; planning, API design,
            implementation, testing, and deployment with monitoring
            <sup className="ml-0.5 rounded bg-brand-50 px-1 font-mono text-[8px] font-bold text-brand-700">1</sup>
            . Testing covers unit and integration flows plus edge cases like invalid tokens
            <sup className="ml-0.5 rounded bg-brand-50 px-1 font-mono text-[8px] font-bold text-brand-700">2</sup>
            .
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-1 text-[9px] font-medium text-brand-700 ring-1 ring-brand-100">
              <FileText className="h-2.5 w-2.5" />
              backend-api-spec.pdf · c3
            </span>
            <span className="rounded-md bg-violet-50 px-1.5 py-1 font-mono text-[9px] font-medium text-violet-600 ring-1 ring-violet-100">
              RRF 0.0316
            </span>
          </div>
        </div>
      </div>
    </Float>
  )
}

export default function HeroVisual() {
  return (
    <div className="relative mt-16 sm:mt-20">
      {/* atmosphere */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-10 bottom-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(209,250,229,0.75),transparent)]" />
        <div className="absolute left-[12%] top-10 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.16),transparent)]" />
        <div className="absolute right-[10%] top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(186,230,253,0.35),transparent)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgb(148_163_184_/_0.16)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-0"
      >
        <DocPanel />
        <FlowConnector />
        <CoreCluster />
        <FlowConnector />
        <AnswerPanel />
      </motion.div>

      <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">
        documents → chunks → vectors → grounded answers
      </p>
    </div>
  )
}
