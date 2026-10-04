import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Atom,
  Bot,
  Braces,
  BrainCircuit,
  Database,
  FileSearch,
  FileText,
  GitMerge,
  KeyRound,
  Layers,
  Server,
  Sparkles,
  Upload,
  Wind,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/landing/Navbar'
import HeroVisual from '../components/landing/HeroVisual'

const YEAR = new Date().getFullYear()

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

function RevealLine({ children, delay = 0 }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
      {/* ambient light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[52rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(209,250,229,0.9),transparent)]" />
        <div className="absolute left-[6%] top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.14),transparent)]" />
        <div className="absolute right-[4%] top-40 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(186,230,253,0.4),transparent)]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-700/80"
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand-400" />
          Retrieval-augmented workspace
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-brand-400" />
        </motion.p>

        <h1 className="mt-7 font-display text-[2.6rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.35rem]">
          <RevealLine delay={0.16}>Turn your documents into</RevealLine>
          <RevealLine delay={0.28}>
            an{' '}
            <span className="text-gradient" style={{ backgroundSize: '200% 100%' }}>
              intelligent knowledge base.
            </span>
          </RevealLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-lg"
        >
          Upload PDFs, search across every chunk with hybrid vector + keyword ranking, and get AI
          answers with citations — all in one premium workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/register"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 to-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-[0.98] sm:w-auto"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="w-full rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-700 sm:w-auto"
          >
            Sign in to your workspace
          </Link>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl">
        <HeroVisual />
      </div>
    </section>
  )
}

const INGEST_STEPS = [
  { label: 'upload', done: true },
  { label: 'extract', done: true },
  { label: 'chunk', done: true },
  { label: 'embed', active: true },
]

function IngestionPreview() {
  return (
    <div className="mt-6 rounded-2xl border border-brand-100 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink">backend-api-spec.pdf</p>
          <p className="font-mono text-[9px] text-slate-400">extracting → chunking → embedding</p>
        </div>
        <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-brand-700">
          12 chunks
        </span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
            className="h-6 rounded-md border border-brand-100 bg-gradient-to-br from-brand-50 to-accent-50/60"
          />
        ))}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,transparent,#059669,#14b8a6,transparent)] bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="mt-2.5 flex gap-1.5">
        {INGEST_STEPS.map((s) => (
          <span
            key={s.label}
            className={`rounded-md px-1.5 py-0.5 font-mono text-[8.5px] font-medium ${
              s.done
                ? 'bg-slate-100 text-slate-400'
                : s.active
                  ? 'bg-brand-100/70 text-brand-700'
                  : 'bg-slate-50 text-slate-300'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const SEARCH_ROWS = [
  { w: '92%', score: '0.0316', tint: 'bg-brand-500' },
  { w: '68%', score: '0.0254', tint: 'bg-accent-500' },
  { w: '44%', score: '0.0182', tint: 'bg-violet-400' },
]

function SearchPreview() {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <span className="flex-1 truncate text-[11px] text-slate-500">testing edge cases…</span>
        <span className="h-3.5 w-px animate-pulse bg-brand-500" />
      </div>
      <div className="mt-3 space-y-2.5">
        {SEARCH_ROWS.map((r, i) => (
          <motion.div
            key={r.score}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.35 }}
            className="flex items-center gap-2.5"
          >
            <span className="font-mono text-[9px] font-bold text-slate-300">{i + 1}</span>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded-full bg-slate-200" style={{ width: r.w }} />
              <div className="h-1.5 w-1/3 rounded-full bg-slate-100" />
            </div>
            <span className="flex items-center gap-1.5">
              <span className={`h-1 w-10 rounded-full ${r.tint} opacity-70`} />
              <span className="font-mono text-[8.5px] text-slate-400">{r.score}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.18em] text-slate-400">
        vector + keyword · RRF fused
      </p>
    </div>
  )
}

function AnswerPreview() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
          <Bot className="h-3.5 w-3.5" />
        </span>
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
          grounded answer
        </span>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-white/85">
        The API moves through five phases — requirements, design, implementation, testing, and
        deployment
        <sup className="ml-1 rounded bg-brand-400/20 px-1 font-mono text-[8px] font-bold text-brand-200">1</sup>
        . Testing covers unit and integration flows with edge cases like invalid tokens
        <sup className="ml-1 rounded bg-brand-400/20 px-1 font-mono text-[8px] font-bold text-brand-200">2</sup>
        .
      </p>
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-[9px] text-brand-200">
          spec.pdf · c3
        </span>
        <span className="rounded-md bg-violet-400/15 px-2 py-1 font-mono text-[9px] text-violet-300">
          RRF 0.0316
        </span>
        <span className="rounded-md bg-sky-400/15 px-2 py-1 font-mono text-[9px] text-sky-300">
          in context
        </span>
      </div>
    </div>
  )
}

function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700/70">
            01 — Features
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.15]">
            Everything your knowledge needs.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            From raw documents to intelligent answers, every part of your knowledge workflow works
            together.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white p-6 sm:p-7 lg:col-span-7"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">
              <Upload className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-bold text-ink">Smart Document Ingestion</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Upload PDFs, extract content, split documents into meaningful chunks, and generate
              embeddings.
            </p>
            <IngestionPreview />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-7 lg:col-span-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-teal-600 ring-1 ring-slate-200">
              <FileSearch className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-bold text-ink">Hybrid Search</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Combine semantic vector search and keyword retrieval with Reciprocal Rank Fusion for
              relevant results.
            </p>
            <SearchPreview />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative overflow-hidden rounded-3xl bg-ink p-6 sm:p-8 lg:col-span-12"
          >
            <div aria-hidden="true" className="absolute inset-0">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
              <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
              <div className="absolute right-1/3 top-0 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-300 ring-1 ring-white/15">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white sm:text-xl">
                  Grounded AI Answers
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Ask questions about your documents and receive contextual answers with relevant
                  citations — every claim traceable to the exact chunk it came from.
                </p>
                <Link
                  to="/register"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition-colors hover:text-brand-200"
                >
                  Try it with your first PDF
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <AnswerPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  {
    icon: Upload,
    title: 'Upload Documents',
    description: 'Add your PDF files to the workspace.',
  },
  {
    icon: Layers,
    title: 'Process & Embed',
    description: 'Extract text, create chunks, and generate embeddings.',
  },
  {
    icon: FileSearch,
    title: 'Retrieve Knowledge',
    description: 'Find relevant content through hybrid search and ranking.',
  },
  {
    icon: Sparkles,
    title: 'Ask & Discover',
    description: 'Get AI-powered responses grounded in your documents.',
  },
]

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 border-y border-slate-200/70 bg-white/60 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700/70">
            02 — How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.15]">
            Four steps from raw PDF to real answers.
          </h2>
        </motion.div>

        <div className="relative mt-14">
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute left-[12%] right-[12%] top-5 hidden h-px origin-left bg-gradient-to-r from-brand-300 via-accent-400 to-violet-300 lg:block"
          />
          <div className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.14 }}
                className="relative flex gap-5 lg:block"
              >
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-[19px] top-14 w-px bg-gradient-to-b from-brand-200 to-transparent lg:hidden"
                  />
                )}
                <div className="relative shrink-0">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 shadow-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="lg:mt-6">
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-300">
                    0{i + 1}
                  </p>
                  <h3 className="mt-1.5 font-display text-base font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const STACK = [
  { icon: Braces, name: 'React 19 + Vite', role: 'Frontend application', detail: 'vite 8 build' },
  { icon: Wind, name: 'Tailwind CSS v4', role: 'Design system', detail: '@theme tokens' },
  { icon: Sparkles, name: 'Framer Motion', role: 'Interaction & motion', detail: 'scroll reveals' },
  { icon: Server, name: 'Node.js + Express', role: 'REST API server', detail: 'express 5' },
  { icon: Database, name: 'MongoDB + Mongoose', role: 'Document & chunk store', detail: 'text indexes' },
  { icon: Atom, name: 'Hugging Face', role: 'Embedding model', detail: 'all-MiniLM-L6-v2 · 384-dim' },
  { icon: Zap, name: 'Groq', role: 'Answer generation', detail: 'gpt-oss-20b' },
  { icon: GitMerge, name: 'RRF Retrieval', role: 'Vector + keyword fusion', detail: 'k = 60' },
  { icon: FileText, name: 'pdf-parse · pdfkit', role: 'PDF ingestion & demo docs', detail: 'server-side' },
  { icon: KeyRound, name: 'JWT + bcrypt', role: 'Auth & sessions', detail: '7-day tokens' },
]

function Stack() {
  return (
    <section id="stack" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700/70">
              03 — Under the hood
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.15]">
              A stack chosen for retrieval.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            Every technology in this product is the one actually running in production code.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-10 grid gap-x-12 lg:grid-cols-2"
        >
          {STACK.map(({ icon: Icon, name, role, detail }, i) => (
            <div
              key={name}
              className="group flex items-center gap-4 border-b border-slate-200/80 py-4 transition-colors first:pt-0 last:border-b-0 hover:bg-slate-50/70 sm:px-3"
            >
              <span className="font-mono text-[10px] font-bold text-slate-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:ring-brand-100">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{name}</p>
                <p className="text-xs text-slate-400">{role}</p>
              </div>
              <code className="hidden rounded-md bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500 ring-1 ring-slate-200 sm:block">
                {detail}
              </code>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Cta() {
  const { token } = useAuth()

  return (
    <section className="px-4 pb-24 pt-4 sm:px-6">
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-800 via-brand-700 to-accent-600 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
      >
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-accent-400/25 blur-3xl" />
          <div className="absolute inset-0 [background-image:radial-gradient(rgba(255_255_255/0.09)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_80%_at_50%_50%,black,transparent)]" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-[2.75rem] sm:leading-[1.12]">
            Your documents have more to say.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
            Bring your knowledge together and discover a smarter way to find answers.
          </p>
          <div className="mt-9">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-800 shadow-xl transition-all hover:bg-brand-50 active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-5 text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 px-4 pb-10 pt-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-gradient-to-br from-brand-700 to-accent-500 text-white shadow-md">
                <BrainCircuit className="h-[18px] w-[18px]" />
              </span>
              <span className="font-display text-[15px] font-bold tracking-tight text-ink">
                AI Knowledge<span className="text-brand-600">Base</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              A retrieval-augmented workspace that turns your PDFs into searchable, quotable
              knowledge — with cited AI answers.
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              documents → chunks → vectors → answers
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#features" className="text-slate-600 transition-colors hover:text-brand-700">Features</a></li>
              <li><a href="#how" className="text-slate-600 transition-colors hover:text-brand-700">How it works</a></li>
              <li><a href="#stack" className="text-slate-600 transition-colors hover:text-brand-700">Technology stack</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Get started</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/login" className="text-slate-600 transition-colors hover:text-brand-700">Sign in</Link></li>
              <li><Link to="/register" className="text-slate-600 transition-colors hover:text-brand-700">Create account</Link></li>
              <li><Link to="/dashboard" className="text-slate-600 transition-colors hover:text-brand-700">Open dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">© {YEAR} AI Knowledge Base. All rights reserved.</p>
          <p className="font-mono text-[10px] text-slate-400">built with react · express · mongodb · groq</p>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stack />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
