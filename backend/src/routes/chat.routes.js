const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @openapi
 * tags:
 *   - name: Chats
 *     description: Persisted Ask AI conversation history (per user)
 */

/**
 * @openapi
 * /api/chats:
 *   get:
 *     tags: [Chats]
 *     summary: List the user's chats (most recent first)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat summaries with message counts
 *       401:
 *         description: Missing/invalid token
 */
router.get("/", authMiddleware, chatController.listChats);

/**
 * @openapi
 * /api/chats/{id}:
 *   get:
 *     tags: [Chats]
 *     summary: Get one chat with all messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full chat
 *       404:
 *         description: Chat not found
 */
router.get("/:id", authMiddleware, chatController.getChat);

/**
 * @openapi
 * /api/chats/{id}:
 *   delete:
 *     tags: [Chats]
 *     summary: Delete a chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chat deleted
 *       404:
 *         description: Chat not found
 */
router.delete("/:id", authMiddleware, chatController.deleteChat);

module.exports = router;
