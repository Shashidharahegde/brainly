import Note from "../../../models/Note.js"
// import knowledgeBase from "../ragService/knowledgeBase.js"
export async function createNote (req, res) {
    //user need to send a title and content
    try {
        const {title, content, tags} = req.body
        const media = req.body.media || null
        const note = await Note.create({
            title,
            content,
            media,
            tags
        })
        res.status(201).json(note)

    } catch (error) {
        console.log(error)
        res.json({error})
    }
    
}