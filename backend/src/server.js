import express from "express"
import notesRoutes from "./routes/notesRoutes.js"
import  {connectDB}  from "./config/db.js"
import dotenv from "dotenv"
import limiter from "./config/rateLimitter.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5001
connectDB()

app.use(limiter)
app.use(express.json())

app.use("/api/notes", notesRoutes)

app.listen(PORT, ()=>{console.log("Server Started on PORT:", PORT)})