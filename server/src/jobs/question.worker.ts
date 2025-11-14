import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { QuestionService } from "../modules/question/question.service";
import logger from "../config/logger";

const QUEUE_NAME = "question-creation";

export const questionWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { type, recordId, data } = job.data;

    try {
      logger.info(`Processing job: type=${type}, recordId=${recordId}`);

      const result = await QuestionService.processQuestionJob(type, recordId, data);

      logger.info(`Job ${recordId} completed with ${result?.questions?.length || 0} questions.`);
      return result;
    } catch (error: any) {
      logger.error(`Job ${recordId} failed: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

questionWorker.on("completed", (job) => {
  logger.info(`Finished job ${job.id} successfully.`);
});

questionWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} FAILED: ${err.message}`);
});
