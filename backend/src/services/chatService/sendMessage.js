import Chat from "../../../models/Chat.js";
import ChatMessage from "../../../models/ChatMessage.js";
import { aiChat } from "../ragService/aiChat.js";

export default async function sendMessage(req, res) {

   try {

    const { chatId } = req.params;
    const { query } = req.body;

    const currentChat = await Chat.findById(chatId);
    if (!currentChat) {
      throw new Error("Chat not found");
    }

    const previousMessages = await ChatMessage.find({
      chatId: currentChat._id,
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
      chatId: currentChat._id,
      role: "user",
      content: query,
    });

    const response = await aiChat({
      query: query,
      history: history,
    });

    const answer = response.answer

    await ChatMessage.create({
      chatId: currentChat._id,
      role: "assistant",
      content: answer,
    });

    res.status(201).json({ chatId: currentChat._id, answer });
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  } }
