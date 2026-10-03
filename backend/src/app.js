const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const searchRoutes = require("./routes/search.routes");
const askRoutes = require("./routes/ask.routes");
const { createSwaggerSpec } = require("./config/swagger");

const app = express();

app.use(cors());
app.use(express.json());

const swaggerSpec = createSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", askRoutes);

app.get("/", (req, res) => {
  res.send("AI Knowledge Base API running");
});

module.exports = app;