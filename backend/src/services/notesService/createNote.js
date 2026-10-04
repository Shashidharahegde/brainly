import Note from "../../../models/Note.js"

export async function createNote (req, res) {
    //user need to send a title and content
    try {
        const {title, content} = req.body
        const media = req.body.media || null
        const note = await Note.create({
            title,
            content,
            media
        })
        res.status(201).json(note)
    } catch (error) {
        res.error("Internal Error", error)
    }
    
}