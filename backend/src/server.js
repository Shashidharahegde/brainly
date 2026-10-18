import express from "express"
import notesRoutes from "./routes/notesRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import  {connectDB}  from "./config/db.js"
import dotenv from "dotenv"
import limiter from "./config/rateLimitter.js"
import cors from "cors"
import { PDF_UPLOAD_DIR } from "./utils/pdfFiles.js"
import authRoutes from "./routes/authRoutes.js"

import { authMiddleware } from "../middleware/authMiddleware.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5001
const Frontend = process.env.FRONTEND
connectDB()

app.use(cors({
    origin: Frontend,
    allowedHeaders: ['Content-Type', 'Authorization']
}
))


app.use(limiter)
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use(authMiddleware)
app.use("/uploads", express.static(PDF_UPLOAD_DIR))


app.use("/api/notes", notesRoutes)
app.use("/api/chat", aiRoutes)
app.listen(PORT, ()=>{console.log("Server Started on PORT:", PORT)})
