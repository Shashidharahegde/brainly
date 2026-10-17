import Note from "../../../models/Note.js"
import NoteChunk from "../../../models/NoteChunk.js"
import { removePdfFile } from "../../utils/pdfFiles.js"

export async function deleteNote (req, res) {
    try {
        const id  = req.params.id
        const note = await Note.findByIdAndDelete(id)
        if (!note){
            return res.status(404).json({
                msg: "Note not found!"
            })
        }
        await Promise.all([
            NoteChunk.deleteMany({ noteId: note._id }),
            removePdfFile(note.pdf?.filename),
            ...(note.obsoletePdfFilenames ?? []).map((filename) => removePdfFile(filename)),
        ])
        return res.status(200).send(note)
    } catch (error) {
        res.status(500).json({
            msg: "Internal Server error"
        })
    }
    
}

export async function deleteNotes(req, res) {
    try {
        const { ids } = req.body
        if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => !/^[a-f\d]{24}$/i.test(id))) {
            return res.status(400).json({ message: "Provide note IDs to delete." })
        }

        const notes = await Note.find({ _id: { $in: ids } })
        if (notes.length === 0) {
            return res.status(404).json({ message: "No notes found." })
        }

        const noteIds = notes.map((note) => note._id)
        await Note.deleteMany({ _id: { $in: noteIds } })
        await Promise.all([
            NoteChunk.deleteMany({ noteId: { $in: noteIds } }),
            ...notes.flatMap((note) => [
                removePdfFile(note.pdf?.filename),
                ...(note.obsoletePdfFilenames ?? []).map((filename) => removePdfFile(filename)),
            ]),
        ])

        return res.status(200).json({ deletedIds: noteIds.map(String) })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}
