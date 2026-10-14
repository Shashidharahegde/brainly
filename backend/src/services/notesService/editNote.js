import { errorObject } from "bullmq";
import Note from "../../../models/Note.js";
import { noteQueue } from "../../queues/noteQueue.js";

export async function editNote(req, res) {
  try {
    const { title, content, tags } = req.body;
    const media = req.body.media || null;

    const editedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, media },
      {
        new: true,
      },
    );
    if (editedNote) {
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
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
