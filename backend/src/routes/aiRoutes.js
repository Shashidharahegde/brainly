import express from "express";
import { createNewChat } from "../services/chatService/newChat.js";
import { getChats } from "../services/chatService/getChats.js";
import { getChatById } from "../services/chatService/getChatById.js";
import sendMessage from "../services/chatService/sendMessage.js";
const router = express.Router();

router.get("/", getChats);
router.post("/", createNewChat);
router.get("/:chatId", getChatById);
router.post("/:chatId/messages", sendMessage)

export default router;
