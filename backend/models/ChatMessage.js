
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    sources: [
      {
        noteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Note",
        },
        title: String,
        excerpt: String,
        chunkIndex: Number,
        score: Number,
      },
    ],
  },
  { timestamps: true }
);

chatMessageSchema.index({ ownerId: 1, chatId: 1, createdAt: 1 });

const ChatMessage = mongoose.model(
  "ChatMessage",
  chatMessageSchema
);

export default ChatMessage;
