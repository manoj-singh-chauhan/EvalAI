import QuestionPaper from "./question.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { questionQueue } from "../../jobs/question.queue";
import logger from "../../config/logger";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
// const model = ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

interface FileJobData {
  fileUrl: string;
  mimeType: string;
}

type JobData = FileJobData | string;

export class QuestionService {
  static async scheduleQuestionJob(job: {
    type: string;
    recordId: number;
    data: JobData;
  }) {
    await questionQueue.add(`create-question-${job.type}`, job);
    logger.info(`Job type '${job.type}' added with recordId ${job.recordId}`);
  }

  static async processQuestionJob(
    type: "file" | "text",
    recordId: number,
    data: JobData
  ) {
    const record = await QuestionPaper.findByPk(recordId);
    if (!record) {
      logger.error("Record not found for processing");
      return;
    }

    await record.update({ status: "processing", errorMessage: null });

    try {
      let parsedData: { questions: any[]; totalMarks: number };
      let fileUrl: string | null = null;

      
      const jsonConfig = {
        generationConfig: {
          responseMimeType: "application/json",
        },
      };

      if (type === "file") {
        const fileData = data as FileJobData;

        fileUrl = fileData.fileUrl;
        logger.info(`Downloading file ${fileUrl}`);

        const fileBuffer = await downloadFile(fileUrl);
        const base64File = fileBuffer.toString("base64");

        logger.info("Sending PDF directly to Gemini (in JSON mode)...");

        const aiRes = await model.generateContent({
          ...jsonConfig,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "Extract ALL questions and total marks from this question paper. " +
                    "Return ONLY pure JSON:\n\n" +
                    '{ "questions": [ {"question": "...", "marks": number} ], "totalMarks": number }',
                },
                {
                  inlineData: {
                    mimeType: fileData.mimeType,
                    data: base64File,
                  },
                },
              ],
            },
          ],
        });

        
        parsedData = JSON.parse(aiRes.response.text());
      } else {
        const rawText = data as string;

        logger.info("Sending typed question text to Gemini (in JSON mode)...");

        const aiRes = await model.generateContent({
          ...jsonConfig,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "Extract questions and marks from the following text. " +
                    "Return ONLY JSON:\n\n" +
                    '{ "questions": [ {"question": "...", "marks": number} ], "totalMarks": number }\n\n' +
                    rawText,
                },
              ],
            },
          ],
        });

        parsedData = JSON.parse(aiRes.response.text());
      }

      if (!parsedData.questions || parsedData.questions.length === 0) {
        throw new Error("AI returned no valid questions.");
      }

      logger.info(`${parsedData.questions.length} questions found.`);

      await record.update({
        questions: parsedData.questions,
        totalMarks: parsedData.totalMarks || 0,
        status: "completed",
        errorMessage: null,
      });

      return record;
    } catch (err: any) {
      logger.error(`Job failed: ${err.message}`);

      await record.update({
        status: "failed",
        errorMessage: err.message,
      });

      return;
    }
  }
}