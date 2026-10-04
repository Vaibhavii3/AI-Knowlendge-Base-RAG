const hybridSearch = require("./hybridSearchService");
const { askAI, streamAI } = require("./ai.service");

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

  // number the extracts so the model can cite them as [1], [2], ...
  const context = parts.map((text, i) => `[${i + 1}] ${text}`).join("\n\n");

  return { context, sources };
};

const retrieveContext = async (question, limit = 8) => {
  const results = await hybridSearch(question, limit);
  return buildContext(results);
};

const askQuestion = async (question, options = {}) => {
  const { context, sources } = await retrieveContext(question);
  const answer = await askAI(context, question, options);
  return { answer, sources };
};

module.exports = askQuestion;
module.exports.retrieveContext = retrieveContext;
module.exports.streamWithContext = async (question, options = {}) => {
  const { context, sources } = await retrieveContext(question);
  return { sources, stream: streamAI(context, question, options) };
};
