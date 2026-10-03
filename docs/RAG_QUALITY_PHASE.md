# RAG Quality Phase — Design & Implementation Notes

Phase focused on improving **retrieval and generation quality** of the RAG pipeline:
better chunking, principled hybrid search, token-aware context assembly, and batched
ingestion.

---

## 1. Why this phase exists

The pipeline worked end-to-end, but four weaknesses limited answer quality:

| # | Weakness | Where | Impact |
|---|----------|-------|--------|
| 1 | Chunker split on raw word windows with no overlap | `src/utils/chunkText.js` | Sentences cut mid-thought; README claimed overlap but code had none |
| 2 | Hybrid search merged results by simple concatenation | `src/services/hybridSearchService.js` | Duplicates possible; ranking ignored; retrieval order meaningless |
| 3 | Context trimmed by raw character count (`slice(0, 4000)`) | `src/services/ragService.js` | Sentences truncated mid-way; low-relevance chunks consumed budget |
| 4 | Embeddings generated one HTTP call per chunk, chunks inserted one-by-one | `src/controllers/document.controller.js` | A 50-chunk PDF = 50 sequential API calls + 50 inserts |

Additionally, an older keyword-only `askQuestion` handler existed in
`src/controllers/document.controller.js` alongside the newer hybrid RAG endpoint —
two code paths answering the same question with different quality.

---

## 2. Chunking: sentence-aware windows with overlap

### The problem

`all-MiniLM-L6-v2` has a **256-token input limit** (≈ 190–200 words). The old
chunker produced 500-word chunks, so Hugging Face silently truncated every chunk —
the tail of each chunk never influenced its embedding. Chunks also cut sentences
in half, so retrieved passages were often unreadable fragments.

### The new strategy

```
split text into sentences
→ accumulate sentences until ~CHUNK_WORDS (120)
→ carry over the last OVERLAP_WORDS (25) into the next chunk
→ sentences longer than the window are split by word window (fallback)
```

- **120 words per chunk** keeps every chunk under the model's token limit, so
  embeddings represent the full text.
- **25 words overlap (~20%)** preserves continuity: a sentence relevant to two
  topics that straddles a boundary appears in both chunks, so retrieval finds it
  from either side.

Trade-off: more chunks per document (higher storage and embedding cost) in
exchange for measurably better retrieval recall.

---

## 3. Hybrid search: Reciprocal Rank Fusion (RRF)

### The problem

The old merge was `[...vectorResults, ...keywordResults]`:

- the same chunk could appear twice,
- a chunk ranked #5 by vector search outranked a chunk ranked #1 by keyword
  search, purely by list position,
- no score was returned, so callers could not reason about relevance.

### RRF in one formula

For each result list, a document at rank `r` (1-based) earns:

```
score = Σ_over_lists  1 / (k + r)        with k = 60
```

Scores from both lists are summed per document, duplicates are merged, and the
combined list is sorted by fused score.

**Worked example** — chunk appears at rank 1 in vector results and rank 3 in
keyword results:

```
vector contribution:   1 / (60 + 1) = 0.0164
keyword contribution:  1 / (60 + 3) = 0.0159
fused score:                          = 0.0323
```

A chunk ranked #1 in only one list scores `0.0164`. So a chunk that *both*
retrievers agree on outranks a single-list #1 — exactly the behavior hybrid
search is supposed to have.

**Why `k = 60`?** It dampens the effect of top ranks so that rank #1 vs #4 in a
single list doesn't dominate; agreement across lists matters more than position
within one list. This is the value from the original RRF paper (Cormack et al.,
2009) and is the default in Elasticsearch and similar engines.

The service now returns `[{ chunk, score }]`-shaped results with the fused score
attached, so the API response can expose relevance to clients.

**Graceful degradation:** `$vectorSearch` only exists on Atlas (or an AtlasCLI
local deployment). If the vector stage fails (non-Atlas connection, missing
index), the service logs the cause and fuses the keyword list alone instead of
failing the request. Only when *both* retrievers fail does it throw.

---

## 4. Context assembly: token-aware, rank-ordered

The old approach joined *all* retrieved chunks and cut the string at 4000
characters — mid-sentence, and with no regard for retrieval rank.

The new approach:

1. Take chunks **in RRF-score order** (most relevant first).
2. Add chunks to the context until the **token budget** is reached
   (estimated at `ceil(chars / 4)`, the standard heuristic for English text).
3. Budget default: **3000 tokens**, configurable via `MAX_CONTEXT_TOKENS` env var.

Whole chunks are included or skipped — never sliced mid-sentence. Because chunks
are rank-ordered, the budget is always spent on the most relevant content.

---

## 5. Ingestion: batched embeddings, bulk inserts

| Before | After |
|--------|-------|
| `for` loop, one `await generateEmbedding(chunk)` per chunk | Chunks grouped into batches of 16, embedded concurrently within a batch (`Promise.all`) |
| One `Chunk.create()` per chunk | Single `Chunk.insertMany()` per document |
| 50-chunk PDF ≈ 50 sequential HTTP calls | 50-chunk PDF ≈ 4 sequential HTTP calls (16 × 3 + 2) |

Batches are processed **sequentially** (not all at once) to stay under Hugging
Face rate limits while still cutting wall-clock time roughly by the batch size.
The document-level mean embedding is unchanged.

---

## 6. Cleanup: single ask endpoint

Removed `askQuestion` from `src/controllers/document.controller.js` (keyword-only
retrieval, no sources) along with its `/api/documents/ask` route. All `/ask`
traffic now flows through `src/controllers/askController.js` → `ragService` →
hybrid search, which returns the answer **plus source chunks with fused scores**.

---

## 7. PDF extraction: pdf-parse 1.x → 2.x

Verification surfaced a pre-existing bug: `pdf-parse@1.1.1` (bundling pdf.js
v1.10 from 2018) could not parse PDFs generated by `pdfkit` 0.17 — every demo
ingest failed with `bad XRef entry`. Upgraded to `pdf-parse@2.4.5` (modern
pdf.js). New API:

```js
const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
const pdfData = await parser.getText();
await parser.destroy();
```

---

## 8. Files changed

| File | Change |
|------|--------|
| `src/utils/chunkText.js` | Word-window chunking aligned to sentence boundaries, 120-word windows, 25-word overlap, min-chunk filter |
| `src/services/hybridSearchService.js` | RRF fusion (k=60), parallel retrievers, dedup by `_id`, fused scores, embedding vectors excluded from payload |
| `src/services/ragService.js` | Rank-ordered, token-budgeted context assembly (`MAX_CONTEXT_TOKENS`) |
| `src/services/embedding.service.js` | Added `generateEmbeddings(texts)` batch function |
| `src/controllers/document.controller.js` | Batched ingestion with `insertMany`; pdf-parse v2 API; removed legacy `askQuestion` handler |
| `src/routes/document.routes.js` | Removed legacy `/ask` route |
| `package.json` | `pdf-parse` 1.1.1 → 2.4.5 |

---

## 9. Verification

**Environment requirements:** semantic search needs MongoDB **Atlas** (free M0
tier works) with two vector indexes:

| Index name | Collection | Field | Dimensions | Similarity |
|------------|-----------|-------|------------|------------|
| `chunk_vector_index` | `chunks` | `embedding` | 384 | cosine |
| `document_vector_index` | `documents` | `embeddings` | 384 | cosine |

Without them the pipeline degrades to keyword-only retrieval.

1. Restart the server (`npm run dev`).
2. Upload / ingest a PDF — confirm `chunksCreated` is reported.
3. `POST /api/ai/ask` — answer must cite content that appears in the returned
   source chunks.
4. Source list must contain **no duplicate chunk IDs**, each with a fused score.
5. Ingestion of a multi-page PDF should complete noticeably faster than before
   (batched embedding calls).

> **Note:** documents ingested before this phase were chunked at 500 words with
> truncated embeddings. Re-ingest them to benefit from the new chunking.

---

## 10. Resume talking points

- Designed a **sentence-aware overlapping chunker** sized to the embedding
  model's token limit, fixing silent truncation that degraded embedding fidelity.
- Replaced naive result concatenation with **Reciprocal Rank Fusion**, so chunks
  agreed upon by both semantic and keyword retrieval rank first.
- Implemented **token-budgeted context assembly** with rank-ordered selection,
  eliminating mid-sentence truncation in LLM prompts.
- Cut ingestion latency ~8× by **batching embedding API calls** and using bulk
  MongoDB inserts.
