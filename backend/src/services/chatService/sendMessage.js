import Chat from "../../../models/Chat.js";
import ChatMessage from "../../../models/ChatMessage.js";
import { aiChat } from "../ragService/aiChat.js";

export default async function sendMessage(req, res) {

   try {

    const { chatId } = req.params;
    const { query } = req.body;

    const currentChat = await Chat.findOne({ _id: chatId, ownerId: req.user.userId });
    if (!currentChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const previousMessages = await ChatMessage.find({
      chatId: currentChat._id,
      ownerId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

      previousMessages.reverse();

    const history = previousMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      content: msg.content,
    }));

    if (typeof query !== "string" || !query.trim()) {
      throw new Error("Query is required") 
    };


    await ChatMessage.create({
      ownerId: req.user.userId,
      chatId: currentChat._id,
      role: "user",
      content: query,
    });

    const response = await aiChat({
      query: query,
      history: history,
      ownerId: req.user.userId,
    });

    const answer = response.answer

    await ChatMessage.create({
      ownerId: req.user.userId,
      chatId: currentChat._id,
      role: "assistant",
      content: answer,
    });

    await Chat.updateOne(
      { _id: currentChat._id, ownerId: req.user.userId },
      { lastMessageAt: new Date() },
    );

    res.status(201).json({ chatId: currentChat._id, answer });
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  } }
