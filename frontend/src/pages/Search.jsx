import { useState } from 'react'
import api from '../api/client'

function ResultCard({ result, rank }) {
  const [expanded, setExpanded] = useState(false)
  const { chunk, score } = result
  const text = chunk.text || ''
  const isLong = text.length > 320
  const visible = expanded || !isLong ? text : `${text.slice(0, 320)}…`

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
          {rank}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
          RRF score {score.toFixed(4)}
        </span>
        <span className="text-gray-400">chunk #{chunk.chunkIndex}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{visible}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/search/search', { query: query.trim() })
      setResults(data.results)
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h2 className="text-xl font-bold text-gray-900">Hybrid Search</h2>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Vector + keyword search fused with Reciprocal Rank Fusion over document chunks.
      </p>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the knowledge base…"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      {results !== null && results.length === 0 && !error && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
          No results found.
        </div>
      )}

      <div className="space-y-3">
        {results?.map((result, i) => (
          <ResultCard key={result.chunk._id} result={result} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
