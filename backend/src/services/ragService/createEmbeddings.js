
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateEmbeddings(documents) {
  const results = [];

  for (const doc of documents) {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: `title: none | text: ${doc.text}`,
      config: {
        outputDimensionality: 768,
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length !== 768) {
      throw new Error(
        `Embedding generation failed for chunk ${doc.chunkIndex}`
      );
    }

    results.push({
      ...doc,
      embedding,
    });
  }

  return results;
}
