const express = require("express");
const router = express.Router();

const { searchDocuments } = require("../controllers/searchController");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @openapi
 * tags:
 *   - name: Search
 *     description: Search endpoints (keyword/vector/hybrid)
 */

/**
 * @openapi
 * /api/search/search:
 *   post:
 *     tags: [Search]
 *     summary: Search documents/chunks (controller-defined)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "backend api phases"
 *     responses:
 *       200:
 *         description: Search results (hybrid chunk search)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Chunk"
 *             example:
 *               success: true
 *               results:
 *                 - _id: "65f1c2a9b3f1a2c3d4e5f001"
 *                   documentId: "65f1c2a9b3f1a2c3d4e5f678"
 *                   chunkIndex: 0
 *                   text: "Phase 1: Requirements & Planning..."
 *       401:
 *         description: Missing/invalid token
 */
router.post("/search", authMiddleware, searchDocuments);

module.exports = router;