const Document = require("../models/document.model");
const Chunk = require("../models/chunk.model");
const Metric = require("../models/metric.model");

exports.getStats = async (req, res) => {
  try {
    const [documents, chunks, searchMetric, aiMetric] = await Promise.all([
      Document.countDocuments({}),
      Chunk.countDocuments({}),
      Metric.findOne({ key: "searchQueries" }).lean(),
      Metric.findOne({ key: "aiQueries" }).lean()
    ]);

    res.json({
      documents,
      chunks,
      searchQueries: searchMetric?.count || 0,
      aiQueries: aiMetric?.count || 0,
      aiConfigured: {
        groq: Boolean(process.env.GROQ_API_KEY),
        huggingFace: Boolean(process.env.HF_API_KEY)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
