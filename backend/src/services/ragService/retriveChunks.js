
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import NoteChunk from "../../../models/NoteChunk.js";
import { getMediaType } from "../../../../frontend/src/utils/getMediaType.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function retrieveChunks(question, ownerId) {
  if (!ownerId) {
    throw new Error("Owner is required for note retrieval");
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: `title: none | text: ${question}`,
    config: {
      outputDimensionality: 768,
    },
  });

  const queryEmbedding = response.embeddings?.[0]?.values;

  if (!queryEmbedding || queryEmbedding.length !== 768) {
    throw new Error("Failed to generate query embedding");
  }

  // 2. Search for semantically similar chunks
  const chunks = await NoteChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        // ownerId must be configured as a filter field in vector_index.
        filter: { ownerId: new mongoose.Types.ObjectId(ownerId) },
        numCandidates: 100,
        limit: 5,
      },
    },
    {
      $lookup: {
        from: "notes",
        let: { noteId: "$noteId", ownerId: "$ownerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$noteId"] },
                  { $eq: ["$ownerId", "$$ownerId"] },
                ],
              },
            },
          },
          { $project: { title: 1, media: 1, mediaType: 1, "pdf.url": 1 } },
        ],
        as: "note",
      },
    },
    { $match: { "note.0": { $exists: true } } },
    {
      $project: {
        _id: 0,
        noteId: 1,
        chunkIndex: 1,
        text: 1,
        title: { $arrayElemAt: ["$note.title", 0] },
        mediaType: { $arrayElemAt: ["$note.mediaType", 0] },
        url: {
          $ifNull: [
            { $arrayElemAt: ["$note.media", 0] },
            { $arrayElemAt: ["$note.pdf.url", 0] },
          ],
        },
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return chunks.map((chunk) => ({
    ...chunk,
    mediaType: getMediaType(chunk.url) || chunk.mediaType || null,
  }));
}
