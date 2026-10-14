
import Note from "../../models/Note.js";
import orchestrator from "../services/extractionServices/orchestrator.js";
import { processRAG } from "../services/ragService/orchestrator.js";

export async function noteProcessor(id) {
  const note = await Note.findById(id);

  if (!note) {
    throw new Error(`Note ${id} not found`);
  }

//   console.log(note);

  const extractedData = await orchestrator(note);
  
  const extractedText = extractedData
    .filter(Boolean)
    .join("\n\n");

  console.log("This is the data received from the orchestrator:", extractedText);

  const ans = await processRAG({
    noteId: note._id.toString(),
    text: extractedText,
  });

//   console.log(ans);

  return {
    ans,
    status: "processed",
  };
}
