const express = require("express");
const router = express.Router();

const documentController = require("../controllers/document.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

/**
 * @openapi
 * tags:
 *   - name: Documents
 *     description: PDF ingestion, chunk listing, and document/chunk search endpoints
 */

/**
 * @openapi
 * /api/documents/upload:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a PDF and ingest into knowledge base
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded and chunked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 documentId: { type: string }
 *                 chunksCreated: { type: integer }
 *             example:
 *               message: "Document uploaded and chunked successfully"
 *               documentId: "65f1c2a9b3f1a2c3d4e5f678"
 *               chunksCreated: 12
 *       400:
 *         description: Missing file
 *       401:
 *         description: Missing/invalid token
 */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  documentController.uploadDocument
);

/**
 * @openapi
 * /api/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List ingested documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document list (without extractedText/embeddings)
 *       401:
 *         description: Missing/invalid token
 */
router.get(
  "/",
  authMiddleware,
  documentController.listDocuments
);

router.get(
  "/demo-pdf",
  documentController.downloadDemoPdf
);

router.post(
  "/demo-ingest",
  authMiddleware,
  documentController.ingestDemoPdf
);

/**
 * @openapi
 * /api/documents/chunks:
 *   get:
 *     tags: [Documents]
 *     summary: List recent chunks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *         description: Max 50
 *     responses:
 *       200:
 *         description: Chunk list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chunks:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Chunk"
 *             example:
 *               chunks:
 *                 - _id: "65f1c2a9b3f1a2c3d4e5f001"
 *                   documentId: "65f1c2a9b3f1a2c3d4e5f678"
 *                   chunkIndex: 0
 *                   text: "Phase 1: Requirements & Planning..."
 *                   createdAt: "2026-03-10T09:00:00.000Z"
 *       401:
 *         description: Missing/invalid token
 */
router.get(
  "/chunks",
  authMiddleware,
  documentController.listChunks
);

/**
 * @openapi
 * /api/documents/search:
 *   get:
 *     tags: [Documents]
 *     summary: Keyword search over documents (MongoDB text index)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, example: "deployment monitoring" }
 *     responses:
 *       200:
 *         description: Document results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Document"
 *             example:
 *               results:
 *                 - _id: "65f1c2a9b3f1a2c3d4e5f678"
 *                   title: "BACKEND_API_PHASES_DEMO.pdf"
 *                   fileUrl: "uploads/demo-1710000000000.pdf"
 *                   fileType: "application/pdf"
 *                   extractedText: "Phase 1: Requirements & Planning..."
 *                   uploadedBy: "65f1c2a9b3f1a2c3d4e5f111"
 *                   createdAt: "2026-03-10T09:00:00.000Z"
 *                   updatedAt: "2026-03-10T09:00:10.000Z"
 *       400:
 *         description: Missing query
 *       401:
 *         description: Missing/invalid token
 */
router.get(
  "/search",
  authMiddleware,
  documentController.searchDocuments
);

/**
 * @openapi
 * /api/documents/vector-search:
 *   post:
 *     tags: [Documents]
 *     summary: Vector search over documents (MongoDB Atlas vector index)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string, example: "backend api phases" }
 *     responses:
 *       200:
 *         description: Vector search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Document"
 *             example:
 *               results:
 *                 - _id: "65f1c2a9b3f1a2c3d4e5f678"
 *                   title: "BACKEND_API_PHASES_DEMO.pdf"
 *                   fileType: "application/pdf"
 *       400:
 *         description: Missing query
 *       401:
 *         description: Missing/invalid token
 */
router.post(
  "/vector-search",
  authMiddleware,
  documentController.vectorSearch
);

/**
 * @openapi
 * /api/documents/search-chunks:
 *   post:
 *     tags: [Documents]
 *     summary: Hybrid search over chunks (vector + keyword)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string, example: "testing edge cases invalid token" }
 *     responses:
 *       200:
 *         description: Chunk results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chunks:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Chunk"
 *             example:
 *               chunks:
 *                 - _id: "65f1c2a9b3f1a2c3d4e5f001"
 *                   documentId: "65f1c2a9b3f1a2c3d4e5f678"
 *                   chunkIndex: 0
 *                   text: "Phase 1: Requirements & Planning..."
 *       400:
 *         description: Missing query
 *       401:
 *         description: Missing/invalid token
 */
router.post(
  "/search-chunks",
  authMiddleware,
  documentController.searchChunks
);

module.exports = router;