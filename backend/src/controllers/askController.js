const askQuestion = require("../services/ragService");

exports.askAI = async (req, res) => {

  try {

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const result = await askQuestion(question);

    res.json({
      success: true,
      answer: result.answer,
      sources: result.sources
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};