import Note from "../../../models/Note.js";

export async function getNotes (req, res) {
    try {
        const notes = await Note.find().sort({createdAt: -1})
        res.status(201).json(notes)
    } catch (error) {
        res.status(500).json(error)
    }
    
}
