const swaggerJSDoc = require("swagger-jsdoc");

const createSwaggerSpec = () => {
  const PORT = process.env.PORT || 5000;
  const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;

  const options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "AI Knowledge Base API",
        version: "1.0.0",
        description:
          "Backend AI knowledge base: PDF ingestion, chunking, embeddings, hybrid search, and RAG Q&A.",
      },
      servers: [{ url: serverUrl }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          User: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["user", "admin"] },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Document: {
            type: "object",
            properties: {
              _id: { type: "string" },
              title: { type: "string" },
              fileUrl: { type: "string" },
              fileType: { type: "string" },
              uploadedBy: { type: "string" },
              extractedText: { type: "string" },
              embeddings: {
                type: "array",
                items: { type: "number" },
                description: "384-dim vector (may be omitted in responses)",
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Chunk: {
            type: "object",
            properties: {
              _id: { type: "string" },
              documentId: { type: "string" },
              chunkIndex: { type: "integer" },
              text: { type: "string" },
              embedding: {
                type: "array",
                items: { type: "number" },
                description: "384-dim vector (may be omitted in responses)",
              },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    apis: [
      "./src/routes/*.js",
      "./src/controllers/*.js",
      "./src/models/*.js",
    ],
  };

  return swaggerJSDoc(options);
};

module.exports = { createSwaggerSpec };

