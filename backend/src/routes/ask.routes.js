const express = require("express");
const router = express.Router();

const { askAI } = require("../controllers/askController");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @openapi
 * tags:
 *   - name: AI
 *     description: RAG Q&A endpoints
 */

/**
 * @openapi
 * /api/ai/ask:
 *   post:
 *     tags: [AI]
 *     summary: Ask a question (RAG, optional SSE streaming)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 example: "What are the backend API phases?"
 *               mode:
 *                 type: string
 *                 enum: [short, detailed]
 *                 default: detailed
 *               history:
 *                 type: array
 *                 description: Last few turns for follow-up questions
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     text: { type: string }
 *               stream:
 *                 type: boolean
 *                 default: false
 *                 description: When true, responds with text/event-stream (sources event, delta events, [DONE])
 *     responses:
 *       200:
 *         description: Answer with sources (JSON), or SSE stream when stream=true
 *       401:
 *         description: Missing/invalid token
 */
router.post("/ask", authMiddleware, askAI);

module.exports = router;