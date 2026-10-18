
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { retrieveChunks } from "./retriveChunks.js";
import { SYSTEM_PROMPT } from "../../prompts.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function aiChat({ query, history, ownerId }) {
  try {
    if (typeof query !== "string" || !query.trim()) {
      throw new Error("A question is required");
    }

    // 1. Retrieve relevant chunks
    const chunks = await retrieveChunks(query, ownerId);

    // 2. Convert chunks into context text
    const context = chunks
      .map((chunk) => {
        const origin = chunk.mediaType
          ? `Associated external source: ${chunk.mediaType} (the note may also contain user-authored content)`
          : "User-authored note (no external media source is attached)";

        return `${origin}\nNote title: ${chunk.title || "Untitled"}\nMedia type: ${chunk.mediaType || "none"}\nURL: ${chunk.url || "none"}\nRetrieved text: ${chunk.text}`;
      })
      .join("\n\n");

    // 3. Convert history into readable text
    const chatHistory = history
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // 4. Ask Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      contents: `
Previous conversation:
${chatHistory || "No previous conversation."}

Context from the user's notes:
${context || "No relevant notes were found."}

User's question:
${query}
      `,
    });

    return {
      answer: response.text,
      retrievedChunks: chunks.length,
      
    };
  } catch (error) {
    console.error("AI chat error:", error);
    throw error;
  }
}
