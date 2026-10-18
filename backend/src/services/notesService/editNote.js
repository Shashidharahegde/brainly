import { errorObject } from "bullmq";
import Note from "../../../models/Note.js";
import { noteQueue } from "../../queues/noteQueue.js";
import { makePdfMetadata, removePdfFile } from "../../utils/pdfFiles.js";
import { getMediaType } from "../../../../frontend/src/utils/getMediaType.js";

export async function editNote(req, res) {
  let previousPdf;
  try {
    const { title, content } = req.body;
    const tags = typeof req.body.tags === "string"
      ? JSON.parse(req.body.tags)
      : req.body.tags;
    const media = req.body.media || null;
    const detectedMediaType = getMediaType(media);
    const currentNote = await Note.findOne({ _id: req.params.id, ownerId: req.user.userId });
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

    const editedNote = await Note.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.userId }, {
      title,
      content,
      tags,
      media,
      mediaType: detectedMediaType === "pdf" ? "link" : detectedMediaType,
      pdf,
      processingStatus: "pending",
      processingProgress: 0,
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
            ownerId: req.user.userId,
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

        const failedNote = await Note.findOneAndUpdate(
          { _id: editedNote._id, ownerId: req.user.userId },
          { processingStatus: "failed" },
          { new: true },
        ).catch(() => null);

        return res.status(201).json({
          message:
            "Note saved, but background processing could not be scheduled",
          editedNote: failedNote || editedNote,
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
