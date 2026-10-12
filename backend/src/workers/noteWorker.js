import {Worker} from "bullmq"
import {connection } from '../config/redis.js'
import {noteProcessor} from '../processors/noteProcessor.js'

import { connectDB } from "../config/db.js";
import "dotenv/config";

await connectDB()

const noteWorker = new Worker(
    //which queue??
    "notes",
    //this is the business logic
    async (job) => {
      const result = await noteProcessor(job.data.noteId)
    console.log("Processing note:", job.data.noteId);
  },

  {connection,
    concurrency: 5,
  }
)

noteWorker.on('completed', (job)=>{
  console.log("Job Done!", job.id, job.name)

  //need to mark the note as done
})

noteWorker.on("failed", (job, err)=>{
  console.log("Job failed", job.id, job.name, err)
})

noteWorker.on("error", (err) => {
  console.error("Worker error:", err);
});
