const hybridSearch = require("./hybridSearchService");
const { askAI } = require("./ai.service");

// ~4 chars per token is the standard estimate for English text
const MAX_CONTEXT_TOKENS = Number(process.env.MAX_CONTEXT_TOKENS) || 3000;

const estimateTokens = (text) => Math.ceil(text.length / 4);

const buildContext = (rankedChunks, maxTokens = MAX_CONTEXT_TOKENS) => {
  const parts = [];
  let used = 0;

  const sources = rankedChunks.map(({ chunk, score }) => {
    const tokens = estimateTokens(chunk.text || "");
    const fits = used + tokens <= maxTokens;
    if (fits) {
      parts.push(chunk.text);
      used += tokens;
    }
    return { chunk, score, inContext: fits };
  });

  return { context: parts.join("\n\n"), sources };
};

const askQuestion = async (question) => {
  const results = await hybridSearch(question);
  const { context, sources } = buildContext(results);
  const answer = await askAI(context, question);
  return { answer, sources };
};

module.exports = askQuestion;
