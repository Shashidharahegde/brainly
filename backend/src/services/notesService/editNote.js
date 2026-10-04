import Note from "../../../models/Note.js"

export async function editNote (req, res){
    try {
        const {title, content} = req.body
        const editedNote = await Note.findByIdAndUpdate(req.params.id,{title, content},
            {
                new: true
            }
        )
        if(!editedNote){
            res.status(404).json({message: "Note not found"})
        }
        res.status(200).json({message: "Note updated successfully"})
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"})
    }
}