import { useRef, useState } from 'react'
import api from '../api/client'

function Sources({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
      >
        {open ? 'Hide sources' : `Sources (${sources.length})`}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {sources.map((src, i) => (
            <div key={i} className="rounded-lg bg-gray-50 p-3 text-xs">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold text-gray-700">#{i + 1}</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-600">
                  score {src.score.toFixed(4)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    src.inContext
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {src.inContext ? 'in context' : 'not in context'}
                </span>
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap text-gray-600">{src.chunk?.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Ask() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || pending) return

    setInput('')
    setMessages((m) => [...m, { role: 'user', text: question }])
    setPending(true)
    scrollToBottom()

    try {
      const { data } = await api.post('/ai/ask', { question })
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: data.answer, sources: data.sources },
      ])
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: err.response?.data?.message || 'Something went wrong. Please try again.',
          isError: true,
        },
      ])
    } finally {
      setPending(false)
      scrollToBottom()
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Ask AI</h2>
        <p className="mt-1 text-sm text-gray-500">
          RAG-powered answers grounded in your ingested documents.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
            <p>
              Ask a question about your documents.
              <br />
              e.g. "What are the backend API phases?"
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-indigo-600 text-white'
                  : msg.isError
                    ? 'rounded-bl-sm bg-red-50 text-red-700'
                    : 'rounded-bl-sm border border-gray-200 bg-gray-50 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.role === 'assistant' && !msg.isError && <Sources sources={msg.sources} />}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={pending}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
