const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document"
  },

  chunkIndex: {
    type: Number,
    required: true
  },

  text: {
    type: String,
    required: true
  },

  embedding: {
    type: [Number]
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

chunkSchema.index({ text: "text" });

module.exports = mongoose.model("Chunk", chunkSchema);