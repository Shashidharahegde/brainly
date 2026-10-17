import express from "express";
import { createNewChat } from "../services/chatService/newChat.js";
// import getChat from "../services/chatService/getChat.js";
import sendMessage from "../services/chatService/sendMessage.js";
const router = express.Router();

router.post("/", createNewChat);
// router.get("/:chatId", getChat);
router.post("/:chatId/messages", sendMessage)

export default router;
