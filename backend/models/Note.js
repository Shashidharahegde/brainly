import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    media: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "youtube", "link"],
      default: null,
    },
    pdf: {
      filename: String,
      originalName: String,
      size: Number,
      url: String,
    },

    // shareId: {
    //     type: String,
    //     unique: true,
    //     required: true
    // }
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
