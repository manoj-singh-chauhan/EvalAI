import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db";
import questionRoutes from "./modules/question/question.routes";
import answerRoutes from "./modules/answer/answer.routes";
import resultRoutes from "./modules/results/results.routes";
import cors from "cors";
import { printRoutes } from "./utils/printRoutes";
import { sequelize } from "./config/db";
import { redisConnection } from "./config/redis";

import "./config/cloudinaryUpload";
import "./jobs/answer.worker";
import "./jobs/question.worker";

dotenv.config({ path: ".env.development" });
const app = express();
connectDB();

const corsOptions = {
  origin: process.env.FRONTEND_URL!,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/health",async (_req, res) => {
  const health = {
    server: "ok",
    timestamp: new Date(),
    database: "unknown",
    redis: "unknown",
  };

  try {
    await sequelize.authenticate();
    health.database = "ok";
  } catch {
    health.database = "down";
  }


  try {
    const pong = await redisConnection.ping();
    health.redis = pong === "PONG" ? "ok" : "down";
  } catch {
    health.redis = "down";
  }

  const statusCode =
    health.database === "ok" && health.redis === "ok" ? 200 : 500;

  res.status(statusCode).json(health);
});

app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/results", resultRoutes);


printRoutes(app);


export default app;