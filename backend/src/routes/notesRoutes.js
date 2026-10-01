import express from "express"
import { getNotes } from "../services/notesService/getNotes.js"
import { createNote } from "../services/notesService/createNote.js"
import { editNote } from "../services/notesService/editNote.js"
import { deleteNote } from "../services/notesService/deleteNote.js"

const router = express.Router()

router.get("/", getNotes)
router.post("/", createNote)
router.put(":id", editNote)
router.delete(":id", deleteNote)


export default router