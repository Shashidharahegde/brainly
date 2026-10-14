import Note from "../../../models/Note.js";
import { noteQueue } from "../../queues/noteQueue.js";


export async function createNote(req, res) {
  //user need to send a title and content
  let note;
  try {
    const { title, content, tags } = req.body;
    const media = req.body.media || null;
    note = await Note.create({
      title,
      content,
      media,
      tags,
    });
    // res.status(201).json(note)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create note",
    });
  }

  //Here, id is transported from Express api to the worker.
  //The worker then pulls the note from the db

  try {
    const job = await noteQueue.add(
      "process-note",
      {
        noteId: note._id.toString(),
      },
      {
        attempts: 4,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    // console.log("New note detected\n Job added: ", job.id);
    return res.status(201).json({
      message: "Note created successfully",
      note,
      jobId: job.id,
    });
  } catch (error) {
    // console.error("Note saved, but job enqueue failed:", error);

    return res.status(201).json({
      message: "Note saved, but background processing could not be scheduled",
      note,
      processingQueued: false,
  });
}
}
