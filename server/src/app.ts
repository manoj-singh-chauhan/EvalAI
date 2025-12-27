import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import os from "os";
import { connectDB } from "./config/db";
import questionRoutes from "./modules/question/question.routes";
import answerRoutes from "./modules/answer/answer.routes";
import resultRoutes from "./modules/results/results.routes";
import cors from "cors";
import { printRoutes } from "./utils/printRoutes";
import { sequelize } from "./config/db";
import { redisConnection } from "./config/redis";
import submissionRoutes from "./modules/submissions/submissions.routes";
import { requireAuth } from "./middleware/auth.middleware";
import adminRoutes from "./modules/admin/admin.routes";

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

app.get("/api/health", async (_req, res) => {
  const startTime = Date.now();
  
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      percentage: `${Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)}%`
    },
    
    cpu: {
      cores: os.cpus().length,
      loadAverage: os.loadavg()[0].toFixed(2)
    },
    
    services: {
      database: { status: "unknown", responseTime: 0 },
      redis: { status: "unknown", responseTime: 0 }
    }
  };

  try {
    const dbStart = Date.now();
    await sequelize.authenticate();
    health.services.database = {
      status: "connected",
      responseTime: Date.now() - dbStart
    };
  } catch {
    health.services.database.status = "disconnected";
    health.status = "degraded";
  }

  try {
    const redisStart = Date.now();
    const pong = await redisConnection.ping();
    health.services.redis = {
      status: pong === "PONG" ? "connected" : "disconnected",
      responseTime: Date.now() - redisStart
    };
  } catch {
    health.services.redis.status = "disconnected";
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  res.status(statusCode).json({
    ...health,
    responseTime: `${Date.now() - startTime}ms`
  });
});


app.use("/api/questions", requireAuth, questionRoutes);
app.use("/api/answers", requireAuth, answerRoutes);
app.use("/api/results", requireAuth, resultRoutes);
app.use("/api/submissions", requireAuth, submissionRoutes);
app.use("/api/admin",requireAuth, adminRoutes);

printRoutes(app);

export default app;