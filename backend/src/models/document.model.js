const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    extractedText: {
      type: String,
    },

    embeddings: {
      type: [Number],
    },
  },
  { timestamps: true }
);

documentSchema.index({ extractedText: "text", title: "text" });

module.exports = mongoose.model("Document", documentSchema);