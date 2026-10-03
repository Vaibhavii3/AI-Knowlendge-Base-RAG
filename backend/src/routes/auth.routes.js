const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: User registration, login, and current-user endpoints
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Vaibhavi" }
 *               email: { type: string, example: "vaibhavi@example.com" }
 *               password: { type: string, example: "StrongPassword123" }
 *     responses:
 *       201:
 *         description: Registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: "#/components/schemas/User" }
 *             example:
 *               message: "User registered successfully"
 *               user:
 *                 _id: "65f1c2a9b3f1a2c3d4e5f111"
 *                 name: "Vaibhavi"
 *                 email: "vaibhavi@example.com"
 *                 createdAt: "2026-03-10T09:00:00.000Z"
 *                 updatedAt: "2026-03-10T09:00:00.000Z"
 *       400:
 *         description: Validation or already exists
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "vaibhavi@example.com" }
 *               password: { type: string, example: "StrongPassword123" }
 *     responses:
 *       200:
 *         description: Login successful (returns token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 user: { $ref: "#/components/schemas/User" }
 *             example:
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 _id: "65f1c2a9b3f1a2c3d4e5f111"
 *                 name: "Vaibhavi"
 *                 email: "vaibhavi@example.com"
 *       400:
 *         description: Invalid credentials or missing fields
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user from JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: "#/components/schemas/User" }
 *             example:
 *               user:
 *                 _id: "65f1c2a9b3f1a2c3d4e5f111"
 *                 name: "Vaibhavi"
 *                 email: "vaibhavi@example.com"
 *       401:
 *         description: Missing/invalid token
 */
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;