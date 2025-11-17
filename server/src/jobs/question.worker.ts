import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { QuestionService } from "../modules/question/question.service";
import logger from "../config/logger";
import { io } from "../server";

const QUEUE_NAME = "question-creation";

export const questionWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { type, recordId, data } = job.data;

    io.emit(`job-status-${recordId}`, { message: "Processing started..." });

    try {
      const result = await QuestionService.processQuestionJob(
        type,
        recordId,
        data
      );

      // io.emit(`job-status-${recordId}`, {
      //   message: "question pepar extracted successfully",
      // });

      return result;
    } catch (error: any) {
      io.emit(`job-status-${recordId}`, {
        message: "Worker failed: " + error.message,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

questionWorker.on("completed", (job) => {
  logger.info(`job finished.`);
});

questionWorker.on("failed", (job, err) => {
  logger.error(`Job FAILED: ${err.message}`);
});
