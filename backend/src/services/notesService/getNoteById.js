import Note from "../../../models/Note.js"
export async function getNoteById(req, res) {

    try {
        const note = await Note.findById(req.params.id)
        if (!note){
            res.status(404).json({message:"Note not found"})
        }
        else{
            res.status(200).json(note)
        }
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"})   
    }
    
}