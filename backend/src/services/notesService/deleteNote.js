import Note from "../../../models/Note.js"

export async function deleteNote (req, res) {
    try {
        const id  = req.params.id
        const note = await Note.findByIdAndDelete(id)
        res.status(200).send(note)
        if (!note){
            return res.status(404).json({
                msg: "Note not found!"
            })
        }
    } catch (error) {
        res.status(500).json({
            msg: "Internal Server error"
        })
    }
    
}