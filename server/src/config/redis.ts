import { Redis } from "ioredis";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config({ path: ".env.development" });
if (!process.env.REDIS_URL) {
  logger.error("Queue system will not work.");
  process.exit(1);
}

export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  logger.info("Connected to Redis successfully.");
});

redisConnection.on("error", (err) => {
  logger.error(err);
});
