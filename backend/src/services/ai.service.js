// src/services/ai.service.js
const axios = require("axios");

exports.askAI = async (context, question) => {
  const prompt = `
  Use the following document content to answer the question.

  Document:
  ${context}

  Question:
  ${question}

  Answer clearly.
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // <-- yahan apna naya model ID daalo
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq askAI error:", error.response?.data || error.message);
    throw new Error(
      "Groq error: " +
        JSON.stringify(error.response?.data || error.message)
    );
  }
};