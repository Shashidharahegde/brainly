import express from "express"
import { getNotes } from "../services/notesService/getNotes.js"
import { createNote } from "../services/notesService/createNote.js"
import { editNote } from "../services/notesService/editNote.js"
import { deleteNote, deleteNotes } from "../services/notesService/deleteNote.js"
import { getNoteById } from "../services/notesService/getNoteById.js"
import { receivePdf } from "../utils/pdfFiles.js"
const router = express.Router()

router.get("/", getNotes)
router.get("/:id", getNoteById)
router.post("/", receivePdf, createNote)
router.put("/:id", receivePdf, editNote)
router.delete("/bulk", deleteNotes)
router.delete("/:id", deleteNote)


export default router
