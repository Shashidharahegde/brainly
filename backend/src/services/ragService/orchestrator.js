// split the text into managable chunks

import { chunckCreator } from "./chunkCreator.js";
import { generateEmbeddings } from "./createEmbeddings.js";

import NoteChunk from "../../../models/NoteChunk.js";

export async function processRAG({ noteId, ownerId, text, onProgress = async () => {} }) {
  try {
    const chunks = await chunckCreator(noteId, text);
    console.log("Chunks:", chunks);
    await onProgress(40);
    const embeddings = await generateEmbeddings(chunks, async (progress) => {
      await onProgress(40 + progress * 0.5);
    });
    console.log("Embeddings:", embeddings);

    const allChunks= []

    for (const i of embeddings){
        const chunkNote = {
            noteId: i.id,
            ownerId,
            chunkIndex: i.chunkIndex,
            text: i.text,
            embedding: i.embedding
        }
        allChunks.push(chunkNote)

    }
    await NoteChunk.deleteMany({ noteId, ownerId });
    await NoteChunk.insertMany(allChunks);
    await onProgress(98);
  } catch (error) {
    throw error;
  }

}
