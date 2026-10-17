import { errorObject } from "bullmq";
import Note from "../../../models/Note.js";
import { noteQueue } from "../../queues/noteQueue.js";
import { makePdfMetadata, removePdfFile } from "../../utils/pdfFiles.js";

export async function editNote(req, res) {
  let previousPdf;
  try {
    const { title, content } = req.body;
    const tags = typeof req.body.tags === "string"
      ? JSON.parse(req.body.tags)
      : req.body.tags;
    const media = req.body.media || null;
    const currentNote = await Note.findById(req.params.id);
    if (!currentNote) {
      await removePdfFile(req.file?.filename);
      return res.status(404).json({ error: "Note not found" });
    }

    previousPdf = currentNote.pdf?.filename;
    const pdf = req.file
      ? makePdfMetadata(req.file)
      : req.body.removePdf === "true"
        ? null
        : currentNote.pdf;

    const editedNote = await Note.findByIdAndUpdate(req.params.id, {
      title,
      content,
      tags,
      media,
      pdf,
    }, { new: true, runValidators: true });
    if (editedNote) {
      if (previousPdf && previousPdf !== editedNote.pdf?.filename) {
        await removePdfFile(previousPdf).catch(() => {});
      }
      try {
        const job = await noteQueue.add(
          "process-note",
          {
            noteId: editedNote._id.toString(),
          },
          {
            attempts: 4,
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          },
        );

        return res.status(201).json({
          message: "Note updated successfully",
          editedNote,
          jobId: job.id,
        });
      } catch (error) {
        // console.error("Note saved, but job enqueue failed:", error);

        return res.status(201).json({
          message:
            "Note saved, but background processing could not be scheduled",
          editedNote,
          processingQueued: false,
        });
      }
    } else {
      await removePdfFile(req.file?.filename);
      return res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    await removePdfFile(req.file?.filename).catch(() => {});
    res.status(500).json({ message: "Internal Server Error" });
  }
}
