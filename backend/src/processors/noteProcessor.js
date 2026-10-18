
import Note from "../../models/Note.js";
import orchestrator from "../services/extractionServices/orchestrator.js";
import { processRAG } from "../services/ragService/orchestrator.js";

export async function noteProcessor({ noteId, ownerId, onProgress = async () => {} }) {
  if (!noteId || !ownerId) {
    throw new Error("Note ID and owner ID are required");
  }

  const note = await Note.findOne({ _id: noteId, ownerId });

  if (!note) {
    throw new Error(`Note ${noteId} not found for owner`);
  }

//   console.log(note);

  await onProgress(5);
  const extractedData = await orchestrator(note, onProgress);
  await onProgress(35);
  
  const extractedText = extractedData
    .filter(Boolean)
    .join("\n\n");

  console.log("This is the data received from the orchestrator:", extractedText);

  const ans = await processRAG({
    noteId: note._id.toString(),
    ownerId: note.ownerId.toString(),
    text: extractedText,
    onProgress,
  });

//   console.log(ans);

  return {
    ans,
    status: "processed",
  };
}
