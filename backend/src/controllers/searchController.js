const hybridSearch = require("../services/hybridSearchService");

exports.searchDocuments = async (req, res) => {
  try {

    const { query } = req.body;

    const results = await hybridSearch(query);

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