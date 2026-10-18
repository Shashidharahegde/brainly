import Note from "../../../models/Note.js";

export async function getNotes (req, res) {
    try {
        const notes = await Note.find({ ownerId: req.user.userId }).sort({createdAt: -1})
        res.status(200).json(notes)
    } catch (error) {
        res.status(500).json(error)
    }
    
}
