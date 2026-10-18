import Chat from "../../../models/Chat.js";
import ChatMessage from "../../../models/ChatMessage.js";
import { aiChat } from "../ragService/aiChat.js";

//capture the user query
export async function createNewChat(req, res) {
  try {
    let { query } = req.body;

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ message: "Query is required" });
    }

    query = query.trim();

    const chat = await Chat.create({
      ownerId: req.user.userId,
      title: query.slice(0, 57),
    });

    await ChatMessage.create({
      ownerId: req.user.userId,
      chatId: chat._id,
      role: "user",
      content: query,
    });

    const history = [];

    const answer = await aiChat({
      query: query,
      history,
      ownerId: req.user.userId,
    });

    const response = answer.answer

    await ChatMessage.create({
      ownerId: req.user.userId,
      chatId: chat._id,
      role: "assistant",
      content: response,
    });

    await Chat.updateOne(
      { _id: chat._id, ownerId: req.user.userId },
      { lastMessageAt: new Date() },
    );

    res.status(201).json({ msg: "Success", chatId: chat._id, title: chat.title, answer });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
}
