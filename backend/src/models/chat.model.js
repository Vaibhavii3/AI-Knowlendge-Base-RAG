const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    text: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      enum: ["short", "detailed"]
    },
    sources: {
      type: [mongoose.Schema.Types.Mixed]
    },
    at: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      default: "New chat",
      maxlength: 120
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
