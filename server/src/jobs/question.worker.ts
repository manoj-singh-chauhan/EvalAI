import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { QuestionService } from "../modules/question/question.service";
import logger from "../config/logger";
import { io } from "../server";

const QUEUE_NAME = "question-creation";

interface QuestionJobPayload {
  type: "file" | "text";
  recordId: string;
  data: any;
}

export const questionWorker = new Worker(
  QUEUE_NAME,
  async (job: Job<QuestionJobPayload>) => {
    const { type, recordId, data } = job.data;

    const safeType = type as "file" | "text";

    io.emit(`job-status-${recordId}`, {
      message: "Processing started...",
    });

    try {
      await QuestionService.processQuestionJob(safeType, recordId, data);

      return { status: "done" };
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

questionWorker.on("completed", () => {
  logger.info(`Question job completed.`);
});

questionWorker.on("failed", (_job, err) => {
  logger.error(`Question job FAILED: ${err.message}`);
});
