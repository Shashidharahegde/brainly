
import { GoogleGenAI } from "@google/genai";
import NoteChunk from "../../../models/NoteChunk.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function retrieveChunks(question) {

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
        numCandidates: 100,
        limit: 5,
      },
    },
    {
      $project: {
        _id: 0,
        noteId: 1,
        chunkIndex: 1,
        text: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return chunks;
}
