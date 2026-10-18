import "dotenv/config";
import {Worker} from "bullmq"
import {connection } from '../config/redis.js'
import {noteProcessor} from '../processors/noteProcessor.js'
import Note from "../../models/Note.js";

import { connectDB } from "../config/db.js";

await connectDB()

const noteWorker = new Worker(
    //which queue??
    "notes",
    //this is the business logic
    async (job) => {
      const { noteId, ownerId } = job.data;
      let lastProgress = -1;

      const updateProgress = async (progress) => {
        const nextProgress = Math.min(99, Math.max(0, Math.round(progress)));
        if (nextProgress <= lastProgress) return;
        lastProgress = nextProgress;

        await Note.updateOne(
          { _id: noteId, ownerId },
          { processingStatus: "processing", processingProgress: nextProgress },
        );
        await job.updateProgress(nextProgress);
      };

      console.log("Processing note:", noteId);
      await Note.updateOne(
        { _id: noteId, ownerId },
        { processingStatus: "processing", processingProgress: 0 },
      );
      await job.updateProgress(0);

      const result = await noteProcessor({ ...job.data, onProgress: updateProgress });
      await updateProgress(99);
      return result;
  },

  {connection,
    concurrency: 1,
  }
)

noteWorker.on('completed', (job)=>{
  console.log("Job Done!", job.id, job.name)

  Note.updateOne(
    { _id: job.data.noteId, ownerId: job.data.ownerId },
    { processingStatus: "completed", processingProgress: 100 },
  ).catch((error) => console.error("Unable to mark note processing complete:", error));
})

noteWorker.on("failed", (job, err)=>{
  console.log("Job failed", job.id, job.name, err)
  const isLastAttempt = job.attemptsMade >= (job.opts.attempts || 1);
  if (isLastAttempt) {
    Note.updateOne(
      { _id: job.data.noteId, ownerId: job.data.ownerId },
      { processingStatus: "failed" },
    ).catch((error) => console.error("Unable to mark note processing failed:", error));
  }
})

noteWorker.on("error", (err) => {
  console.error("Worker error:", err);
});
