import mongoose from "mongoose";


const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    media:{
        type: String
    },
    // shareId: {
    //     type: String,
    //     unique: true,
    //     required: true
    // }
},
{
    timestamps: true
})

const Note = mongoose.model("Note", noteSchema)

export default Note