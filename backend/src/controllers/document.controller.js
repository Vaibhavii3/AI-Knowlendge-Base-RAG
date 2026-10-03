const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const PDFDocument = require("pdfkit");

const Document = require("../models/document.model");
const Chunk = require("../models/chunk.model");
const { chunkText } = require("../utils/chunkText");
const { generateEmbeddings } = require("../services/embedding.service");

const to1dEmbedding = (embedding) => {
  if (!Array.isArray(embedding)) return [];
  if (!Array.isArray(embedding[0])) return embedding;
  return embedding[0];
};

const meanEmbedding = (vectors) => {
  const vecs = vectors.filter((v) => Array.isArray(v) && v.length > 0);
  if (vecs.length === 0) return [];

  const dim = vecs[0].length;
  const sum = new Array(dim).fill(0);

  for (const v of vecs) {
    if (v.length !== dim) continue;
    for (let i = 0; i < dim; i++) sum[i] += v[i];
  }

  for (let i = 0; i < dim; i++) sum[i] /= vecs.length;
  return sum;
};

const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
};

const createDemoPdfBuffer = async () => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  return await new Promise((resolve, reject) => {
    doc.on("data", (d) => chunks.push(d));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Backend API Phases (Demo Document)", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(
      [
        "This is a demo PDF used for testing the AI Knowledge Base API.",
        "",
        "Phase 1: Requirements & Planning",
        "- Define endpoints and user stories",
        "- Choose authentication (JWT) and data model",
        "",
        "Phase 2: API Design",
        "- REST routes, request/response schemas",
        "- Error handling, validation, pagination",
        "",
        "Phase 3: Implementation",
        "- Controllers, services, database models",
        "- Middleware (auth, upload)",
        "",
        "Phase 4: Testing",
        "- Unit/integration testing with Postman",
        "- Edge cases: invalid token, missing fields",
        "",
        "Phase 5: Deployment & Monitoring",
        "- Environment variables, logs, metrics",
        "- Rate limiting, security hardening"
      ].join("\n")
    );

    doc.end();
  });
};

const ingestPdfBuffer = async ({ fileBuffer, title, fileUrl, fileType, uploadedBy }) => {
  const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
  const pdfData = await parser.getText();
  await parser.destroy();
  const extractedText = pdfData?.text || "";

  const chunks = chunkText(extractedText).filter((c) => c && c.trim().length > 0);

  const document = await Document.create({
    title,
    fileUrl,
    fileType,
    uploadedBy,
    extractedText
  });

  const chunkEmbeddings = (await generateEmbeddings(chunks)).map(to1dEmbedding);

  await Chunk.insertMany(
    chunks.map((text, i) => ({
      documentId: document._id,
      text,
      embedding: chunkEmbeddings[i],
      chunkIndex: i
    }))
  );

  const docEmbedding = meanEmbedding(chunkEmbeddings);
  if (docEmbedding.length > 0) {
    await Document.updateOne({ _id: document._id }, { $set: { embeddings: docEmbedding } });
  }

  return { document, chunksCreated: chunks.length };
};


exports.uploadDocument = async (req, res) => {
  try {

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required (field name: file)" });
    }

    const fileBuffer = fs.readFileSync(file.path);
    const { document, chunksCreated } = await ingestPdfBuffer({
      fileBuffer,
      title: file.originalname,
      fileUrl: file.path,
      fileType: file.mimetype,
      uploadedBy: req.user._id
    });

    return res.json({
      message: "Document uploaded and chunked successfully",
      documentId: document._id,
      chunksCreated
    });

  } catch (error) {
    console.error("Error in uploadDocument:", error);
    console.error(error?.stack);
    return res.status(500).json({ error: error.message });
  }
};

exports.downloadDemoPdf = async (req, res) => {
  try {
    const buffer = await createDemoPdfBuffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="BACKEND_API_PHASES_DEMO.pdf"');
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.ingestDemoPdf = async (req, res) => {
  try {
    const buffer = await createDemoPdfBuffer();
    const uploadsDir = await ensureUploadsDir();
    const fileName = `demo-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const { document, chunksCreated } = await ingestPdfBuffer({
      fileBuffer: buffer,
      title: "BACKEND_API_PHASES_DEMO.pdf",
      fileUrl: filePath,
      fileType: "application/pdf",
      uploadedBy: req.user._id
    });

    return res.json({
      message: "Demo PDF ingested successfully",
      documentId: document._id,
      chunksCreated
    });
  } catch (error) {
    console.error("Error in ingestDemoPdf:", error);
    console.error(error?.stack);
    return res.status(500).json({ error: error.message });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    const documents = await Document.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-extractedText -embeddings");

    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listChunks = async (req, res) => {
  try {
    const limitRaw = Number(req.query.limit ?? 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 10;

    const chunks = await Chunk.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({ text: 1, documentId: 1, chunkIndex: 1, createdAt: 1 });

    return res.json({ chunks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.searchDocuments = async (req, res) => {
  try {

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const documents = await Document.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.json({
      results: documents,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.vectorSearch = async (req, res) => {
  try {

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const queryEmbedding = await generateEmbedding(query);

    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "document_vector_index",
          path: "embeddings",
          queryVector: to1dEmbedding(queryEmbedding),
          numCandidates: 100,
          limit: 5,
        },
      },
    ]);

    res.json({
      results,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchChunks = async (req, res) => {
  try {

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    let vectorResults = [];
    try {
      const queryEmbedding = await generateEmbedding(query);

      vectorResults = await Chunk.aggregate([
        {
          $vectorSearch: {
            index: "chunk_vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 5
          }
        }
      ]);
    } catch (e) {
      // If vector search fails (e.g., index not available), fall back to keyword only
      console.error("Vector search on chunks failed, falling back to keyword search:", e.message);
    }

    let keywordResults = [];
    try {
      keywordResults = await Chunk.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .lean();
    } catch (e) {
      // ignore text index errors; vector results may still exist
      console.error("Text search on chunks failed:", e.message);
    }

    const combined = [...vectorResults, ...keywordResults];

    res.json({
      chunks: combined
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};