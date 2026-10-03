const Chunk = require("../models/chunk.model");
const { generateEmbedding } = require("./embedding.service");

// standard RRF constant (Cormack et al., 2009): dampens single-list top ranks
// so agreement between the two retrievers matters more than position in one
const RRF_K = 60;

const rrfFuse = (resultLists) => {
  const fused = new Map();

  for (const results of resultLists) {
    results.forEach((chunk, i) => {
      const id = String(chunk._id);
      const contribution = 1 / (RRF_K + i + 1);
      const entry = fused.get(id) || { chunk, score: 0 };
      entry.score += contribution;
      fused.set(id, entry);
    });
  }

  return [...fused.values()].sort((a, b) => b.score - a.score);
};

const hybridSearch = async (query, limit = 5) => {
  const queryEmbedding = await generateEmbedding(query);

  const vectorResults = await Chunk.aggregate([
    {
      $vectorSearch: {
        queryVector: queryEmbedding,
        path: "embedding",
        numCandidates: 100,
        limit,
        index: "chunk_vector_index",
      },
    },
    // keep the 384-dim vector out of the response payload
    { $project: { text: 1, documentId: 1, chunkIndex: 1, createdAt: 1 } },
  ]).catch((e) => {
    // no Atlas / missing index: degrade to keyword-only instead of failing
    console.error("Vector search unavailable, using keyword only:", e.message);
    return [];
  });

  const keywordResults = await Chunk.find(
    { $text: { $search: query } },
    {
      score: { $meta: "textScore" },
      text: 1,
      documentId: 1,
      chunkIndex: 1,
      createdAt: 1,
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean()
    .catch((e) => {
      console.error("Keyword search failed:", e.message);
      return [];
    });

  if (!vectorResults.length && !keywordResults.length) {
    throw new Error("Both vector and keyword search failed");
  }

  return rrfFuse([vectorResults, keywordResults]);
};

module.exports = hybridSearch;
module.exports.rrfFuse = rrfFuse;
