const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/stats.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @openapi
 * /api/stats:
 *   get:
 *     tags: [Stats]
 *     summary: Dashboard statistics (documents, chunks, query counters, AI config)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats summary
 *       401:
 *         description: Missing/invalid token
 */
router.get("/", authMiddleware, getStats);

module.exports = router;
