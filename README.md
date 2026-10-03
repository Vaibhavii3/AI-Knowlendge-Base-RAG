This project is an **AI knowledge base** that turns PDFs into a searchable, question-answering system using **retrieval-augmented generation (RAG)** — with a full web UI on top.

You can:
- Register / log in,
- Upload PDFs (or ingest a built-in demo PDF),
- Automatically extract, chunk, and embed the text,
- Search semantically + by keyword (hybrid, RRF-fused),
- And chat with an AI that answers from your documents and shows its sources.

---

## Project structure

```
AI-Knowlendge-Base-RAG/
├── backend/    Express + MongoDB Atlas API (RAG pipeline)
│   ├── src/
│   │   ├── server.js        entry point (Mongo connect, listens on PORT)
│   │   ├── app.js           express app, CORS, Swagger UI, routers
│   │   ├── config/          db, swagger
│   │   ├── controllers/     auth, documents, search, ask
│   │   ├── middlewares/     JWT auth, multer upload
│   │   ├── models/          user, document, chunk
│   │   ├── routes/          /api/auth, /api/documents, /api/search, /api/ai
│   │   ├── services/        embeddings, hybrid search (RRF), RAG, Groq
│   │   └── utils/           sentence-aware chunker
│   └── uploads/             stored PDFs (gitignored)
├── frontend/   React + Vite + Tailwind CSS v4 web app
│   └── src/
│       ├── api/client.js    axios instance (base URL, JWT interceptor, 401 redirect)
│       ├── context/         AuthContext (token + user in localStorage)
│       ├── components/      Layout (sidebar), ProtectedRoute
│       └── pages/           Login, Register, Documents, Search, Ask
├── docs/       design notes
└── package.json  root dev runner (concurrently)
```

## Getting started

```bash
npm run install:all   # installs root, backend, and frontend deps
npm run dev           # starts backend (:5000) + frontend (:5173) together
```

Open the app at **http://localhost:5173**.
Swagger API docs: **http://localhost:5000/api-docs**

In dev, the frontend proxies `/api/*` to `http://localhost:5000` (see `frontend/vite.config.js`), so no CORS setup is needed.

### Environment variables

`backend/.env`:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `SERVER_URL` | Public URL used in Swagger docs |
| `MONGO_URI` | MongoDB Atlas connection string (Atlas **vector search** indexes required: `chunk_vector_index`, `document_vector_index`) |
| `JWT_SECRET` | Signing secret for auth tokens |
| `HF_API_KEY` | Hugging Face token (embeddings: `sentence-transformers/all-MiniLM-L6-v2`) |
| `GROQ_API_KEY` | Groq API key (LLM: `llama-3.1-8b-instant`) |

`frontend/.env` (optional):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Override API base URL (defaults to `/api`, proxied in dev) |

---

## What the app does

- **Auth (JWT)** — register, login, protected routes via bearer token. The frontend auto-logs-in after registration and redirects to login on any 401.
- **Document → knowledge pipeline** — PDF upload → text extraction → overlapping chunking → 384-dim Hugging Face embeddings → stored in MongoDB (documents + chunks).
- **Hybrid search** — MongoDB Atlas `$vectorSearch` + text-index keyword search, fused with Reciprocal Rank Fusion (k = 60).
- **RAG Q&A** — question → hybrid retrieval → token-budgeted context (~3000 tokens) → Groq LLaMA-3.1 answer, returned with ranked source chunks (each marked whether it made it into the context window).

## API summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Get JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/documents` | ✓ | List ingested documents |
| POST | `/api/documents/upload` | ✓ | Upload + ingest PDF |
| POST | `/api/documents/demo-ingest` | ✓ | Ingest built-in demo PDF |
| GET | `/api/documents/chunks` | ✓ | Recent chunks |
| POST | `/api/search/search` | ✓ | Hybrid (vector + keyword) chunk search |
| POST | `/api/ai/ask` | ✓ | RAG question answering |

---

## Why this project matters (what it shows)

- A **production-style backend API**: auth, error handling, env configuration, Swagger docs.
- A full **RAG pipeline** end-to-end: ingestion, embeddings, vector + keyword retrieval, RRF fusion, and LLM prompting with context budgeting.
- A clean **frontend** on top: React + Tailwind, JWT auth flow, file upload with progress, search UI, and a chat UI with visible sources.
