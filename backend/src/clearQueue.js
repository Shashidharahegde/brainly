import { Queue } from "bullmq";
import { connection } from "./config/redis.js"; // Use your Redis connection

const queue = new Queue("notes", { connection });

try {
  await queue.obliterate({force: true});

  console.log("Queue cleared successfully");
} catch (error) {
  console.error("Failed to clear queue:", error);
} finally {
  await queue.close();
}