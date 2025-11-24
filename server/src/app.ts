import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db";
import questionRoutes from "./modules/question/question.routes";
import answerRoutes from "./modules/answer/answer.routes";
import resultRoutes from "./modules/results/results.routes";
import cors from "cors";

import "./utils/cloudinaryUpload";
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

app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/results", resultRoutes);

export default app;
