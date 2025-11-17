import AnswerSheet from "./answer.model";
import QuestionPaper from "../question/question.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { answerQueue } from "../../jobs/answer.queue";
import logger from "../../config/logger";
import { io } from "../../server";
import { ANSWER_EVAL_PROMPT } from "../../utils/prompt";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });

export class AnswerService {
  static emitStatus(recordId: number, message: string) {
    io.emit(`answer-status-${recordId}`, { message });
  }

  
  static async scheduleAnswerJob(job: {
    recordId: number;
    questionPaperId: number;
    answerSheetFiles: { fileUrl: string; mimeType: string }[];
  }) {
    await answerQueue.add(`evaluate-answer`, job);
    logger.info(`Answer job added for record ${job.recordId}`);
  }

  
  static async processAnswerJob(
    recordId: number,
    questionPaperId: number,
    answerSheetFiles: { fileUrl: string; mimeType: string }[]
  ) {
    const record = await AnswerSheet.findByPk(recordId);
    if (!record) return;

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(recordId, "Processing answer sheet…");

    try {
      const qp = await QuestionPaper.findByPk(questionPaperId);
      if (!qp) throw new Error("Question paper not found.");

      const questions = qp.questions;
      if (!questions?.length) throw new Error("No questions found.");

      this.emitStatus(recordId, "Downloading answer sheet pages…");

      const pagesBase64 = [];

      
      for (const file of answerSheetFiles) {
        const buffer = await downloadFile(file.fileUrl);
        pagesBase64.push(buffer.toString("base64"));
      }

      this.emitStatus(recordId, "Extracting text from answer sheets…");

      const aiRes = await model.generateContent({
        generationConfig: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: ANSWER_EVAL_PROMPT },
              { text: JSON.stringify({ questions, pagesBase64 }) },
            ],
          },
        ],
      });

      this.emitStatus(recordId, "AI evaluation completed.");

      const parsed = JSON.parse(aiRes.response.text());

      const { answers, totalScore, feedback } = parsed;
      console.log(parsed);

      this.emitStatus(recordId, "Saving evaluation results…");

      await record.update({
        answers,
        totalScore,
        feedback,
        status: "completed",
      });

      this.emitStatus(recordId, "Completed successfully!");
      return record;
    } catch (err: any) {
      logger.error(`Answer job failed: ${err.message}`);

      await record.update({
        status: "failed",
        errorMessage: err.message,
      });

      this.emitStatus(recordId, "Failed: " + err.message);
      return;
    }
  }
}
