import Note from "../../models/Note.js";
import { processRAG } from "../services/ragService/chunkCreator.js";
export async function noteProcessor(id) {
  const note = await Note.findById(id);

  if (!note) {
    throw new Error(`Note ${id} not found`);
  }

  console.log(note);

  //extract info

  const title = note.title;
  const content = note.content;
  const tags = note.tags || null;

  const extractedText = [title, content, ...(tags || [])]

    .filter(Boolean)
    .join("\n");

     // 3. Pass extracted text to RAG service
  await processRAG({
    noteId: note._id.toString(),
    text: extractedText,
  });

  return {
    noteId,
    status: "processed",
  };
}