import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { AnswerService } from "../modules/answer/answer.service";
import logger from "../config/logger";
import { io } from "../server";

const QUEUE_NAME = "answer-evaluation";

export const answerWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { recordId, questionPaperId, answerSheetFiles } = job.data;

    io.emit(`answer-status-${recordId}`, { message: "Worker picked your job…" });

    try {
      return await AnswerService.processAnswerJob(
        recordId,
        questionPaperId,
        answerSheetFiles
      );
    } catch (error: any) {
      io.emit(`answer-status-${recordId}`, {
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

answerWorker.on("completed", () => {
  logger.info("Answer evaluation job completed.");
});

answerWorker.on("failed", (job, err) => {
  logger.error(`Answer job FAILED: ${err.message}`);
});
