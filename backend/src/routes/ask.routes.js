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
 *     summary: Ask a question (RAG)
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
 *                 example: "Backend API phases kya hain?"
 *     responses:
 *       200:
 *         description: Answer with sources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 answer: { type: string }
 *                 sources:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Chunk"
 *             example:
 *               success: true
 *               answer: "Backend API ke phases generally Requirements & Planning, API Design, Implementation, Testing, aur Deployment & Monitoring hote hain."
 *               sources:
 *                 - _id: "65f1c2a9b3f1a2c3d4e5f001"
 *                   documentId: "65f1c2a9b3f1a2c3d4e5f678"
 *                   chunkIndex: 0
 *                   text: "Phase 1: Requirements & Planning..."
 *       401:
 *         description: Missing/invalid token
 */
router.post("/ask", authMiddleware, askAI);

module.exports = router;