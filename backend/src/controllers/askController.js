const askQuestion = require("../services/ragService");
const Metric = require("../models/metric.model");
const Chat = require("../models/chat.model");

const HISTORY_TURNS = 6;

const findOrCreateChat = async (userId, chatId, firstQuestion) => {
  if (chatId) {
    const existing = await Chat.findOne({ _id: chatId, user: userId });
    if (existing) return existing;
  }
  return Chat.create({
    user: userId,
    title: (firstQuestion || "New chat").slice(0, 80),
    messages: []
  });
};

exports.askAI = async (req, res) => {
  try {
    const { question, mode = "detailed", stream, chatId } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const cleanQuestion = question.trim();
    const cleanMode = mode === "short" ? "short" : "detailed";

    const chat = await findOrCreateChat(req.user._id, chatId, cleanQuestion);

    // history comes from the stored conversation, not the client
    const history = (chat.messages || [])
      .slice(-HISTORY_TURNS)
      .map(({ role, text }) => ({ role, text }));

    const options = { mode: cleanMode, history };

    Metric.increment("aiQueries").catch((e) =>
      console.error("Metric increment failed:", e.message)
    );

    if (stream) {
      const { sources, stream: deltas } = await askQuestion.streamWithContext(cleanQuestion, options);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders?.();

      let closed = false;
      req.on("close", () => { closed = true; });

      res.write(`data: ${JSON.stringify({ chatId: chat._id, sources })}\n\n`);

      let full = "";
      let failed = false;

      try {
        for await (const delta of deltas) {
          if (closed) break;
          full += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
        if (!closed) res.write("data: [DONE]\n\n");
      } catch (error) {
        failed = true;
        console.error("Groq stream error:", error.message);
        if (!closed) {
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        }
      }

      // persist the turn even if the tab closed mid-answer
      if (!failed && (full || closed)) {
        chat.messages.push(
          { role: "user", text: cleanQuestion },
          { role: "assistant", text: full, mode: cleanMode, sources }
        );
        await chat.save();
      }

      return res.end();
    }

    const { answer, sources } = await askQuestion(cleanQuestion, options);

    chat.messages.push(
      { role: "user", text: cleanQuestion },
      { role: "assistant", text: answer, mode: cleanMode, sources }
    );
    await chat.save();

    res.json({
      success: true,
      chatId: chat._id,
      answer,
      sources
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
