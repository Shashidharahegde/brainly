// split the text into managable chunks

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function processRAG({id, text}) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitText(text);

  const documents = chunks.map((chunk, index) => ({
    noteId,
    chunkIndex: index,
    text: chunk,
  }));

  return documents
}
