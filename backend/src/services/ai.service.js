// src/services/ai.service.js
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const lengthRules = {
  short:
    "Answer in at most 4-5 sentences, or up to 5 short bullet lines. Be crisp and cut all filler.",
  detailed:
    "Give a thorough, well-structured answer in short paragraphs or simple dash bullets. Cover every relevant part of the extracts.",
};

const buildMessages = (context, question, mode = "detailed", history = []) => {
  const system = [
    "You are a precise knowledge-base assistant answering from an indexed document library.",
    "Answer ONLY using the numbered document extracts provided in the user message.",
    "If the extracts do not contain the answer, reply exactly with: \"This isn't covered in your uploaded documents.\" followed by one short sentence naming what kind of document would help.",
    "When you use an extract, cite it inline with its number in square brackets, like [1] or [2].",
    "Write plain text only — never use markdown symbols such as **, ##, backticks, or tables. Use simple dashes (-) for bullets and short paragraphs.",
    "Never invent facts that are not in the extracts.",
    lengthRules[mode] || lengthRules.detailed,
  ].join(" ");

  const messages = [{ role: "system", content: system }];

  for (const h of history || []) {
    if (h && typeof h.text === "string" && h.text.trim()) {
      messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.text.slice(0, 1000) });
    }
  }

  messages.push({
    role: "user",
    content: `Document extracts:\n${context}\n\nQuestion: ${question}`,
  });

  return messages;
};

const groqBody = (messages, stream, mode) => ({
  model: MODEL,
  messages,
  temperature: 0.3,
  max_tokens: mode === "short" ? 500 : 1400,
  stream,
});

const groqHeaders = () => ({
  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  "Content-Type": "application/json",
});

const groqError = (data, message) =>
  new Error("Groq error: " + JSON.stringify(data || message));

exports.askAI = async (context, question, { mode = "detailed", history = [] } = {}) => {
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: groqHeaders(),
      body: JSON.stringify(groqBody(buildMessages(context, question, mode, history), false, mode)),
    });

    const data = await response.json();
    if (!response.ok) throw groqError(data);

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Groq askAI error:", error.message);
      throw new Error("Groq error: " + error.message);
    }
    console.error("Groq askAI error:", error.message);
    throw error;
  }
};

// yields content deltas from Groq's SSE stream
exports.streamAI = async function* streamAI(context, question, { mode = "detailed", history = [] } = {}) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify(groqBody(buildMessages(context, question, mode, history), true, mode)),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw groqError(null, text || response.statusText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed keep-alive lines
      }
    }
  }
};
