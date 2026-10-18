import mongoose from "mongoose";
import Chat from "../../../models/Chat.js";
import ChatMessage from "../../../models/ChatMessage.js";

export async function getChatById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.chatId)) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      ownerId: req.user.userId,
    }).lean();

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await ChatMessage.find({
      chatId: chat._id,
      ownerId: req.user.userId,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ chat, messages });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ message: "Unable to load conversation" });
  }
}
