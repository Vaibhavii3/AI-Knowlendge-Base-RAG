import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  CloudUpload,
  Download,
  FileText,
  Filter,
  Loader2,
  MoreVertical,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import api from '../../api/client'

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '')
import { useToast } from '../ui/Toast'
import useClickOutside from '../../utils/useClickOutside'
import { formatDate } from '../../utils/format'

function DocMenu({ doc, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Actions for ${doc.title}`}
        aria-expanded={open}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-[var(--shadow-card-hover)]"
          >
            {doc.fileName && (
              <a
                href={`${API_ORIGIN}/uploads/${doc.fileName}`}
                download
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Download className="h-4 w-4 text-slate-400" />
                Download PDF
              </a>
            )}
            <button
              onClick={() => {
                setOpen(false)
                onDelete(doc)
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete document
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DeleteDialog({ doc, busy, onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/50">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-center text-base font-semibold text-ink">Delete this document?</h3>
        <p className="mt-1.5 break-words text-center text-sm text-slate-500">
          "<span className="font-medium text-slate-700">{doc.title}</span>" and all of its embedded
          chunks will be permanently removed.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DocRow({ doc, index, onDelete }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex items-center gap-3.5 rounded-xl border border-transparent px-3 py-3 transition-all hover:border-slate-200/80 hover:bg-slate-50/80"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 text-brand-500 ring-1 ring-brand-100">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{doc.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium uppercase text-slate-500">
            PDF
          </span>
          <span>Uploaded {formatDate(doc.createdAt)}</span>
        </div>
      </div>
      <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success ring-1 ring-success/20 sm:inline-flex">
        <CheckCircle2 className="h-3 w-3" />
        Indexed
      </span>
      <DocMenu doc={doc} onDelete={onDelete} />
    </motion.li>
  )
}

export default function DocumentsSection({ documents, loading, uploadInputRef, onDataChanged }) {
  const toast = useToast()
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [demoLoading, setDemoLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const uploadFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.')
      return
    }

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/documents/upload', formData, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      toast.success(`Ingested "${file.name}" — ${data.chunksCreated} chunks created`)
      await onDataChanged()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    uploadFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (uploading) return
    uploadFile(e.dataTransfer.files?.[0])
  }

  const handleDemoIngest = async () => {
    setDemoLoading(true)
    try {
      const { data } = await api.post('/documents/demo-ingest')
      toast.success(`Demo PDF ingested — ${data.chunksCreated} chunks created`)
      await onDataChanged()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Demo ingest failed')
    } finally {
      setDemoLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/documents/${deleteTarget._id}`)
      toast.success(`Deleted "${deleteTarget.title}"`)
      setDeleteTarget(null)
      await onDataChanged()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = documents.filter((d) =>
    d.title?.toLowerCase().includes(filter.trim().toLowerCase()),
  )

  return (
    <section id="documents" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                <FileText className="h-4 w-4" />
              </span>
              Documents
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">Upload and manage your knowledge base.</p>
          </div>
          <button
            onClick={handleDemoIngest}
            disabled={demoLoading || uploading}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-100 disabled:opacity-50 sm:text-[13px]"
          >
            {demoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {demoLoading ? 'Ingesting…' : 'Ingest Demo PDF'}
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!uploading) setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-all duration-200 ${
            dragOver
              ? 'border-brand-400 bg-brand-50/70 shadow-[var(--shadow-glow)]'
              : 'border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/40'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
          onClick={() => !uploading && uploadInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload a PDF document"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              uploadInputRef.current?.click()
            }
          }}
        >
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-500 opacity-25 blur-lg" />
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-lg transition-transform ${
                dragOver ? 'scale-110' : 'animate-float'
              }`}
            >
              <CloudUpload className="h-7 w-7" />
            </div>
          </div>
          {uploading ? (
            <>
              <p className="text-sm font-semibold text-ink">
                {progress < 100 ? `Uploading… ${progress}%` : 'Extracting, chunking & embedding…'}
              </p>
              <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500 ${
                    progress >= 100 && 'animate-pulse'
                  }`}
                  animate={{ width: `${Math.max(progress, 8)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink">
                Drag &amp; drop your PDF here, or <span className="text-brand-600">browse files</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add PDF documents to expand your AI knowledge base.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-red-500 ring-1 ring-red-100">
                <FileText className="h-3 w-3" />
                PDF only
              </div>
            </>
          )}
          <input
            ref={uploadInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">
            Your library
            <span className="ml-2 font-normal text-slate-400">
              {loading ? 'loading…' : `${filtered.length} of ${documents.length}`}
            </span>
          </p>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter documents…"
              aria-label="Filter documents"
              className="w-40 rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-[13px] transition-all placeholder:text-slate-400 focus:w-52 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 sm:w-48 sm:focus:w-60"
            />
          </div>
        </div>

        {loading ? (
          <ul className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex animate-pulse items-center gap-3.5 px-3 py-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-slate-100" />
                  <div className="h-3 w-1/4 rounded bg-slate-50" />
                </div>
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-100">
              <FileText className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {documents.length === 0
                ? 'No documents yet — upload a PDF or ingest the demo document.'
                : 'No documents match your filter.'}
            </p>
          </div>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {filtered.map((doc, i) => (
              <DocRow key={doc._id} doc={doc} index={i} onDelete={setDeleteTarget} />
            ))}
          </ul>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            doc={deleteTarget}
            busy={deleting}
            onCancel={() => !deleting && setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
