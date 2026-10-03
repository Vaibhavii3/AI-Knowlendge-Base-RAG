const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

// batches are sent sequentially to stay under HF rate limits
const BATCH_SIZE = 16;

const postEmbeddings = async (inputs) => {
  const response = await axios.post(
    HF_EMBEDDING_URL,
    { inputs },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

exports.generateEmbedding = async (text) => {
  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY is not set in environment");
  }

  try {
    return await postEmbeddings([text]);
  } catch (error) {
    console.error(
      "HF featureExtraction error:",
      error.response?.data || error.message
    );
    throw new Error(
      "Hugging Face error: " +
        JSON.stringify(error.response?.data || error.message)
    );
  }
};

exports.generateEmbeddings = async (texts) => {
  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY is not set in environment");
  }
  if (!texts.length) return [];

  const embeddings = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    try {
      embeddings.push(...(await postEmbeddings(batch)));
    } catch (error) {
      console.error(
        `HF batch embedding error (batch ${i}-${i + batch.length - 1}):`,
        error.response?.data || error.message
      );
      throw new Error(
        "Hugging Face error: " +
          JSON.stringify(error.response?.data || error.message)
      );
    }
  }
  return embeddings;
};
