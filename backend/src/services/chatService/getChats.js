import Chat from "../../../models/Chat.js";

export async function getChats(req, res) {
  try {
    const chats = await Chat.find({ ownerId: req.user.userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .select("title lastMessageAt createdAt updatedAt")
      .lean();

    res.status(200).json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Unable to load conversations" });
  }
}
