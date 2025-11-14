import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { AnswerService } from "../modules/answer/answer.service";
import logger from "../config/logger";

const QUEUE_NAME = "evaluation";

export const evaluationWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { paperId, type, data } = job.data;
    logger.info(
      `Processing job ${job.id} (Type: ${type}, Paper: ${paperId})`
    );

    try {
      const result = await AnswerService.processEvaluation(paperId, type, data);

      logger.info(
        ` Job ${job.id} complete. Marks: ${result.marksAwarded}`
      );
      return result;
    } catch (error: any) {
      logger.error(` Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

evaluationWorker.on("completed", (job) => {
  logger.info(`Finished job ${job.id} successfully.`);
});

evaluationWorker.on("failed", (job, err) => {
  logger.error(` Job ${job?.id} failed with ${err.message}`);
});
