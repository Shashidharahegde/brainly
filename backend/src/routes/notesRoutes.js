import express from "express"
import notesService from "../services/notesService"
import { getNotes } from "../services/notesService/getNote"
import { createNote } from "../services/notesService/createNote"
import { editNote } from "../services/notesService/editNote"
import { deleteNote } from "../services/notesService/deleteNote"

const router = express.Router()

router.use(express.json)


router.get("/", getNotes)

router.post("/", createNote)

router.put(":id", editNote)

router.delete(":id", deleteNote)


