const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const searchRoutes = require("./routes/search.routes");
const askRoutes = require("./routes/ask.routes");
const statsRoutes = require("./routes/stats.routes");
const chatRoutes = require("./routes/chat.routes");
const { createSwaggerSpec } = require("./config/swagger");

const app = express();

// comma-separated whitelist (e.g. the deployed frontend); unset = allow all (local dev)
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // no-origin requests (curl, Render health checks) always pass
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  })
);
app.use(express.json());

// serve ingested files so the dashboard can offer document downloads
app.use("/uploads", express.static(require("path").join(process.cwd(), "uploads")));

const swaggerSpec = createSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", askRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.send("AI Knowledge Base API running");
});

module.exports = app;