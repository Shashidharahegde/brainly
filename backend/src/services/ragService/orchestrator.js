// split the text into managable chunks

import { chunckCreator } from "./chunkCreator.js";
import { generateEmbeddings } from "./createEmbeddings.js";

export async function processRAG({noteId, text}) {

    try {
        const chunks = await chunckCreator(noteId, text)
        const embeddings = await generateEmbeddings(chunks)
        return embeddings
    } catch (error) {
        throw error
    }
    

  
}
