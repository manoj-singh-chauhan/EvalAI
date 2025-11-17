import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const answerQueue = new Queue("answer-evaluation", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
