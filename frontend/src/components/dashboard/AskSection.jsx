import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlignLeft,
  Bot,
  Check,
  ChevronDown,
  Copy,
  FileText,
  History,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import api from '../../api/client'
import { useToast } from '../ui/Toast'
import useClickOutside from '../../utils/useClickOutside'
import { timeAgo } from '../../utils/format'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const CHAT_ID_KEY = 'kb-active-chat-id'

const SUGGESTED_QUESTIONS = [
  'What are the backend API phases?',
  'Summarize my uploaded documents',
  'What testing steps are recommended?',
]

function ChatHistoryMenu({ chats, activeChatId, onLoad, onDelete, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-label="Chat history"
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-semibold transition-all disabled:opacity-50 ${
          open
            ? 'border-brand-300 bg-brand-50/60 text-brand-700'
            : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:text-ink'
        }`}
      >
        <History className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">History</span>
        {chats.length > 0 && (
          <span className="rounded-full bg-brand-500 px-1.5 text-[9px] font-bold text-white">
            {chats.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-card-hover)] sm:w-80"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">Your conversations</p>
              <p className="text-[11px] text-slate-400">Saved automatically as you chat</p>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {chats.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-slate-400">
                  No conversations yet — ask your first question.
                </p>
              ) : (
                chats.map((c) => (
                  <div
                    key={c._id}
                    className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-50 ${
                      c._id === activeChatId ? 'bg-brand-50/70' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        onLoad(c._id)
                        setOpen(false)
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          c._id === activeChatId ? 'bg-brand-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {c.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.messageCount} messages · {timeAgo(c.updatedAt)}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() => onDelete(c._id)}
                      aria-label={`Delete chat: ${c.title}`}
                      className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:text-slate-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Sources({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null

  return (
    <div className="mt-3 border-t border-slate-100 pt-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
      >
        Sources ({sources.length})
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open && 'rotate-180'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {sources.map((src, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <FileText className="h-3 w-3 text-brand-500" />
                      {src.chunk?.documentTitle || `Source #${i + 1}`}
                    </span>
                    <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand-600">
                      score {src.score?.toFixed(4)}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        src.inContext
                          ? 'bg-success/10 text-success'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {src.inContext ? 'in context' : 'not in context'}
                    </span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap leading-relaxed text-slate-500">
                    {src.chunk?.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div className="relative shrink-0">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 opacity-30 blur-sm" />
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md">
        <Bot className="h-4 w-4" />
      </div>
    </div>
  )
}

function MessageBubble({ msg, index, onCopy }) {
  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-end justify-end gap-2.5"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-brand-500 to-accent-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-md">
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <User className="h-4 w-4" />
        </div>
      </motion.div>
    )
  }

  const streaming = msg.streaming

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5"
    >
      <AssistantAvatar />
      <div
        className={`max-w-[85%] rounded-2xl rounded-tl-md border px-4 py-3 text-sm leading-relaxed shadow-sm ${
          msg.isError
            ? 'border-red-100 bg-red-50/80 text-red-700'
            : 'border-slate-200/80 bg-white text-slate-700'
        }`}
      >
        {streaming && !msg.text ? (
          <div className="flex items-center gap-1.5 py-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-brand-400"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
              />
            ))}
            <span className="ml-1.5 text-xs text-slate-400">Searching your documents…</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">
            {msg.text}
            {streaming && msg.text && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-brand-500" />
            )}
          </p>
        )}
        {!streaming && !msg.isError && (
          <>
            <Sources sources={msg.sources} />
            <div className="mt-2.5 flex justify-end">
              <button
                onClick={() => onCopy(msg.text, index)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Copy answer"
              >
                {msg.copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {msg.copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function EmptyChat({ onSuggestion }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="relative">
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-400 via-accent-400 to-sky-400 opacity-20 blur-2xl" />
        <div className="relative flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-xl">
          <Sparkles className="h-8 w-8" />
        </div>
      </div>
      <h3 className="mt-5 text-base font-bold text-ink">Your AI knowledge assistant</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
        Answers stream in live, grounded in your documents — every conversation is saved to your
        history.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-md"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function ModeToggle({ mode, onChange, disabled }) {
  const modes = [
    { id: 'short', label: 'Short', icon: AlignLeft },
    { id: 'detailed', label: 'Detailed', icon: Sparkles },
  ]

  return (
    <div
      role="radiogroup"
      aria-label="Answer length"
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50/70 p-0.5"
    >
      {modes.map(({ id, label, icon: Icon }) => {
        const active = mode === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            title={id === 'short' ? 'Crisp 4-5 sentence answers' : 'Thorough, structured answers'}
            className={`flex items-center gap-1 rounded-[0.6rem] px-2.5 py-2 text-[11px] font-semibold transition-all disabled:opacity-50 ${
              active
                ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-ink'
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function AskSection({ onAsked }) {
  const toast = useToast()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('detailed')
  const [pending, setPending] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [chats, setChats] = useState([])
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  useEffect(scrollToBottom, [messages, pending])

  const loadChats = useCallback(async () => {
    try {
      const { data } = await api.get('/chats')
      setChats(data.chats)
    } catch {
      /* list refresh is non-critical */
    }
  }, [])

  const loadChat = useCallback(
    async (id) => {
      try {
        const { data } = await api.get(`/chats/${id}`)
        setChatId(id)
        localStorage.setItem(CHAT_ID_KEY, id)
        setMessages(
          (data.chat.messages || []).map(({ role, text, sources }) => ({
            role,
            text,
            sources,
          })),
        )
      } catch (err) {
        if (err.response?.status === 404) {
          localStorage.removeItem(CHAT_ID_KEY)
          setChatId(null)
        } else {
          toast.error('Could not load that conversation.')
        }
      }
    },
    [toast],
  )

  const startNewChat = useCallback(() => {
    setChatId(null)
    setMessages([])
    localStorage.removeItem(CHAT_ID_KEY)
  }, [])

  const deleteChat = useCallback(
    async (id) => {
      try {
        await api.delete(`/chats/${id}`)
        if (id === chatId) startNewChat()
        toast.success('Conversation deleted')
        loadChats()
      } catch {
        toast.error('Could not delete that conversation.')
      }
    },
    [chatId, startNewChat, toast, loadChats],
  )

  useEffect(() => {
    loadChats()
    const saved = localStorage.getItem(CHAT_ID_KEY)
    if (saved) loadChat(saved)
  }, [loadChats, loadChat])

  const handleCopy = (text, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setMessages((m) => m.map((msg, i) => (i === index ? { ...msg, copied: true } : msg)))
        setTimeout(
          () => setMessages((m) => m.map((msg, i) => (i === index ? { ...msg, copied: false } : msg))),
          1600,
        )
      })
      .catch(() => toast.error('Could not copy to clipboard.'))
  }

  const updateStreamingText = (delta) => {
    setMessages((m) =>
      m.map((msg, i) =>
        i === m.length - 1 && msg.streaming ? { ...msg, text: msg.text + delta } : msg,
      ),
    )
  }

  const send = async (questionArg) => {
    const q = (questionArg ?? input).trim()
    if (!q || pending) return

    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: '', streaming: true }])
    setPending(true)
    scrollToBottom()

    try {
      const res = await fetch(`${API_BASE}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ question: q, mode, chatId, stream: true }),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'AI request failed. Please try again.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let sources = []

      const handleEvent = (payload) => {
        if (payload === '[DONE]') return
        const evt = JSON.parse(payload)
        if (evt.chatId) {
          setChatId(evt.chatId)
          localStorage.setItem(CHAT_ID_KEY, evt.chatId)
        }
        if (evt.sources) sources = evt.sources
        else if (evt.delta) updateStreamingText(evt.delta)
        else if (evt.error) throw new Error(evt.error)
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        for (const part of parts) {
          const line = part.trim()
          if (line.startsWith('data:')) handleEvent(line.slice(5).trim())
        }
      }

      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1
            ? {
                ...msg,
                streaming: false,
                sources,
                text: msg.text || 'No response was generated. Please try again.',
              }
            : msg,
        ),
      )
      onAsked?.()
      loadChats()
    } catch (err) {
      const errorText = err.message || 'Something went wrong. Please try again.'
      setMessages((m) => {
        const last = m[m.length - 1]
        if (last?.streaming) {
          return m.map((msg, i) =>
            i === m.length - 1 ? { role: 'assistant', text: errorText, isError: true } : msg,
          )
        }
        return [...m, { role: 'assistant', text: errorText, isError: true }]
      })
      toast.error(errorText)
    } finally {
      setPending(false)
    }
  }

  return (
    <section id="ask" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-brand-50/70 via-accent-50/50 to-sky-50/40 px-5 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              Ask Your Knowledge Base
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Live-streamed answers grounded in your uploaded documents.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ChatHistoryMenu
              chats={chats}
              activeChatId={chatId}
              onLoad={loadChat}
              onDelete={deleteChat}
              disabled={pending}
            />
            <button
              onClick={startNewChat}
              disabled={pending || (!chatId && messages.length === 0)}
              aria-label="Start a new chat"
              title="Start a new chat"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-40"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            className="h-[440px] overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.14)_1px,transparent_0)] [background-size:22px_22px] p-4 sm:p-5"
            aria-live="polite"
          >
            {messages.length === 0 && !pending ? (
              <EmptyChat onSuggestion={(q) => send(q)} />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} index={i} onCopy={handleCopy} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-100 bg-white px-4 py-3.5 sm:px-5">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="mx-auto flex max-w-3xl items-center gap-2"
            >
              <ModeToggle mode={mode} onChange={setMode} disabled={pending} />
              <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50/60 px-4 transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={pending ? 'Generating answer…' : 'Ask a question about your documents…'}
                  aria-label="Ask the knowledge base"
                  disabled={pending}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:brightness-100"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
