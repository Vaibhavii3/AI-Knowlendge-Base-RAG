const hybridSearch = require("../services/hybridSearchService");
const Metric = require("../models/metric.model");

exports.searchDocuments = async (req, res) => {
  try {

    const { query } = req.body;

    const results = await hybridSearch(query);

    Metric.increment("searchQueries").catch((e) =>
      console.error("Metric increment failed:", e.message)
    );

    res.json({
      success: true,
      results
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};