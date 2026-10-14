import express from "express"
import { aiChat } from "../services/ragService/aiChat.js"

const router = express.Router()

router.post('/', aiChat)

export default router