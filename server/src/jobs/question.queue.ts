import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const questionQueue = new Queue("question-creation", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  },
});
