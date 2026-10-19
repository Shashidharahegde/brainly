//backend/models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
    },
    processingProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
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
