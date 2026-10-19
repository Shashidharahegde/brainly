//backend/src/queues/noteQueue.js
import {Queue} from 'bullmq'
import { connection } from "../config/redis.js"

export const noteQueue = new Queue("notes", {
  connection,
});