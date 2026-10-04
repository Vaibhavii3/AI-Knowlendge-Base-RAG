import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import StatsCards from '../components/dashboard/StatsCards'
import DocumentsSection from '../components/dashboard/DocumentsSection'
import SearchSection from '../components/dashboard/SearchSection'
import AskSection from '../components/dashboard/AskSection'

const SECTION_IDS = ['documents', 'search', 'ask']

export default function Dashboard() {
  const { logout, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiStatus, setAiStatus] = useState('checking')
  const [activeSection, setActiveSection] = useState('documents')
  const [searchSeed, setSearchSeed] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const uploadInputRef = useRef(null)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/stats')
      setStats(data)
      const { groq, huggingFace } = data.aiConfigured || {}
      setAiStatus(groq && huggingFace ? 'active' : groq || huggingFace ? 'partial' : 'offline')
    } catch {
      setAiStatus('offline')
    }
  }, [])

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await api.get('/documents')
      setDocuments(data.documents)
    } catch {
      /* interceptor handles auth failures; list stays as-is */
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStats(), fetchDocuments()]).finally(() => setLoading(false))
  }, [fetchStats, fetchDocuments])

  const handleDataChanged = useCallback(async () => {
    await Promise.all([fetchStats(), fetchDocuments()])
  }, [fetchStats, fetchDocuments])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleGlobalSearch = (q) => {
    setSearchSeed({ q, id: Date.now() })
    scrollToSection('search')
  }

  return (
    <div className="relative min-h-screen">
      {/* ambient background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-teal-400/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-400/10 blur-3xl" />
      </div>

      <Sidebar
        user={user}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative lg:pl-72">
        <Header
          aiStatus={aiStatus}
          documents={documents}
          onGlobalSearch={handleGlobalSearch}
          onUploadClick={() => uploadInputRef.current?.click()}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Overview
          </p>
          <StatsCards stats={stats} loading={loading} />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <DocumentsSection
                documents={documents}
                loading={loading}
                uploadInputRef={uploadInputRef}
                onDataChanged={handleDataChanged}
              />
            </div>
            <div className="xl:col-span-2">
              <SearchSection
                seed={searchSeed}
                documents={documents}
                onSearched={fetchStats}
              />
            </div>
          </div>

          <div className="mt-6">
            <AskSection onAsked={fetchStats} />
          </div>
        </main>
      </div>
    </div>
  )
}
