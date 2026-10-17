import Chat from "../../../models/Chat.js";
import ChatMessage from "../../../models/ChatMessage.js";
import { aiChat } from "../ragService/aiChat.js";

//capture the user query
export async function createNewChat(req, res) {
  try {
    let { query } = req.body;

    // if (typeof query !== "string" || !query.trim()) {
    //   return res.status(400).json({
    //     msg: "Query is required",
    //   });
    // }

    query = query.trim();

    const chat = await Chat.create({
      title: query.slice(0, 57),
    });

    await ChatMessage.create({
      chatId: chat._id,
      role: "user",
      content: query,
    });

    let history = [];

    const answer = await aiChat({
      query: query,
      history,
    });

    const response = answer.answer

    await ChatMessage.create({
      chatId: chat._id,
      role: "assistant",
      content: response,
    });

    res.status(201).json({ msg: "Success", chatId: chat._id, title: chat.title, answer });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
}
