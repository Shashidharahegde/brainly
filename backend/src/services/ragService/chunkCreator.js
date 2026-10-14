import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunckCreator(id, text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitText(text);
  // console.log(chunks);

  const documents = chunks.map((chunk, index) => ({
    id,
    chunkIndex: index,
    text: chunk,
  }));

  return documents;
}
