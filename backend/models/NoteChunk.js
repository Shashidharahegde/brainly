import mongoose from "mongoose";

const noteChunkSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      required: false,
    },

    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

noteChunkSchema.index(
  { noteId: 1, chunkIndex: 1 },
  { unique: true },
);

const NoteChunk = mongoose.model("NoteChunk", noteChunkSchema);

export default NoteChunk;