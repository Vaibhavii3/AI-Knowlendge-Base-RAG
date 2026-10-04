const Chat = require("../models/chat.model");

exports.listChats = async (req, res) => {
  try {
    const chats = await Chat.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { updatedAt: -1 } },
      { $limit: 30 },
      { $project: { title: 1, updatedAt: 1, messageCount: { $size: "$messages" } } }
    ]);

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const result = await Chat.deleteOne({ _id: req.params.id, user: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted", chatId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
