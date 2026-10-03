import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState(null)
  const [ingestingDemo, setIngestingDemo] = useState(false)
  const fileInputRef = useRef(null)

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/documents')
      setDocuments(data.documents)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to load documents' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setMessage(null)
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
      setMessage({
        type: 'success',
        text: `Ingested "${file.name}" — ${data.chunksCreated} chunks created`,
      })
      await loadDocuments()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed' })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDemoIngest = async () => {
    setMessage(null)
    setIngestingDemo(true)
    try {
      const { data } = await api.post('/documents/demo-ingest')
      setMessage({
        type: 'success',
        text: `Demo PDF ingested — ${data.chunksCreated} chunks created`,
      })
      await loadDocuments()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Demo ingest failed' })
    } finally {
      setIngestingDemo(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Documents</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload PDFs to ingest them into the knowledge base.
          </p>
        </div>
        <button
          onClick={handleDemoIngest}
          disabled={ingestingDemo}
          className="rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-50"
        >
          {ingestingDemo ? 'Ingesting…' : 'Ingest demo PDF'}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <label
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-10 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 ${
          uploading ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <svg
          className="mb-3 h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          {uploading ? `Uploading… ${progress}%` : 'Click to upload a PDF'}
        </p>
        <p className="mt-1 text-xs text-gray-400">PDF only — text is extracted, chunked, and embedded</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {uploading && progress > 0 && (
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                  No documents yet — upload a PDF or ingest the demo document.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900">
                    {doc.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{doc.fileType}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(doc.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
