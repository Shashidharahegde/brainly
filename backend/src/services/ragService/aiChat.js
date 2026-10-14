import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { retrieveChunks } from "../ragService/retriveChunks.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function aiChat(req, res) {
  try {
    const {message}  = req.body;

    if (!message) {
      return res.status(400).json({
        message: "A question is required",
      });
    }

    // 1. Retrieve relevant chunks
    const chunks = await retrieveChunks(message);

    // 2. Convert the chunks into context text
    let context = "";

    for (const chunk of chunks) {
      context += chunk.text + "\n\n";
    }

    // 3. Ask Gemini using the retrieved context
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      config: {
        systemInstruction: `
          You are an AI assistant for a personal knowledge management app.
          Answer questions using the provided notes when relevant.
          If the notes do not contain the answer, clearly say so.
          Do not invent information and claim it came from the notes.
        `,
      },
      contents: `
        Context from the user's notes:
        ${context || "No relevant notes were found."}

        User's question:
        ${message}
      `,
    });

    return res.status(200).json({
      answer: response.text,
      retrievedChunks: chunks.length,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      message: "Failed to generate an answer",
    });
  }
}