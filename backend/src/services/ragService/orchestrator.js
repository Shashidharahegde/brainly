// split the text into managable chunks

import { chunckCreator } from "./chunkCreator.js";
import { generateEmbeddings } from "./createEmbeddings.js";

import NoteChunk from "../../../models/NoteChunk.js";

export async function processRAG({ noteId, text }) {
  try {
    const chunks = await chunckCreator(noteId, text);
    console.log("Chunks:", chunks);
    const embeddings = await generateEmbeddings(chunks);
    console.log("Embeddings:", embeddings);

    const allChunks= []

    for (const i of embeddings){
        const chunkNote = {
            noteId: i.id,
            chunkIndex: i.chunkIndex,
            text: i.text,
            embedding: i.embedding
        }
        allChunks.push(chunkNote)

    }
    await NoteChunk.deleteMany({ noteId });
    await NoteChunk.insertMany(allChunks);
  } catch (error) {
    throw error;
  }

}
