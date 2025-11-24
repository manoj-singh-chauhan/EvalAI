import QuestionPaper from "./question.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { questionQueue } from "../../jobs/question.queue";
import logger from "../../config/logger";
import { io } from "../../server";
import { QUESTION_EXTRACTION_PROMPT } from "../../utils/prompt";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
// const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

interface FileJobData {
  fileUrl: string;
  mimeType: string;
}

type JobData = FileJobData | string;

export class QuestionService {
  static emitStatus(recordId: string, message: string) {
    io.emit(`job-status-${recordId}`, { message });
  }

  static async scheduleQuestionJob(job: {
    type: string;
    recordId: string;
    data: JobData;
  }) {
    await questionQueue.add(`create-question-${job.type}`, job);
    logger.info(`Job added: ${job.type}, recordId ${job.recordId}`);
  }

  // static normalizeQuestions(questions: any[]) {
  //   return questions.map((q) => {
  //     const marks = typeof q.marks === "number" ? q.marks : null;

  //     if (marks === null) {
  //       return { ...q, marks: null, flagged: true };
  //     }

  //     return { ...q, marks };
  //   });
  // }

  static normalizeQuestions(questions: any[]) {
    return questions.map((q, index) => {
      const marks = typeof q.marks === "number" ? q.marks : null;

      return {
        number: q.number || index + 1,
        text: q.text || q.question || "",  
        marks,
        flagged: marks === null,
      };
    });
  }


  static async processQuestionJob(
    type: "file" | "text",
    recordId: string,
    data: JobData
  ) {
    const record = await QuestionPaper.findByPk(recordId);
    if (!record) return;

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(recordId, "checking or extracting your question pepar by ai ");

    try {
      let parsedData: { questions: any[]; totalMarks: number };

      const jsonConfig = {
        generationConfig: {
          responseMimeType: "application/json",
        },
      };

      // if (type === "file") {
      //   const { fileUrl } = data as FileJobData;

      //   const buffer = await downloadFile(fileUrl);
      //   const base64 = buffer.toString("base64");

      //   const aiRes = await model.generateContent({
      //     ...jsonConfig,
      //     contents: [
      //       {
      //         role: "user",
      //         parts: [
      //           { text: QUESTION_EXTRACTION_PROMPT },
      //           { text: JSON.stringify({ pagesBase64: [base64] }) },
      //         ],
      //       },
      //     ],
      //   });

      //   parsedData = JSON.parse(aiRes.response.text());
      // }
      if (type === "file") {
        const { fileUrl, mimeType } = data as FileJobData;

        const buffer = await downloadFile(fileUrl);
        const base64 = buffer.toString("base64");

        const aiRes = await model.generateContent({
          ...jsonConfig,
          contents: [
            {
              role: "user",
              parts: [
                { text: QUESTION_EXTRACTION_PROMPT },
                {
                  inlineData: {
                    mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
        });

        // parsedData = JSON.parse(aiRes.response.text());
        const jsonText = aiRes.response.text().trim();

      
        const cleanJson = jsonText.replace(/```json/gi, "").replace(/```/g, "");

        parsedData = JSON.parse(cleanJson);
      } else {
        const text = data as string;

        const aiRes = await model.generateContent({
          ...jsonConfig,
          contents: [
            {
              role: "user",
              parts: [{ text: QUESTION_EXTRACTION_PROMPT + "\n\n" + text }],
            },
          ],
        });

        parsedData = JSON.parse(aiRes.response.text());
      }

      if (!parsedData.questions || parsedData.questions.length === 0) {
        throw new Error("AI returned zero questions.");
      }

      const cleanedQuestions = this.normalizeQuestions(parsedData.questions);
      console.log(cleanedQuestions);

      await record.update({
        questions: cleanedQuestions,
        totalMarks: parsedData.totalMarks,
        status: "completed",
      });

      this.emitStatus(recordId, "Completed successfully!");
    } catch (err: any) {
      logger.error(`Job failed: ${err.message}`);

      await record.update({
        status: "failed",
        errorMessage: err.message,
      });

      this.emitStatus(recordId, "failed: " + err.message);
    }
  }
}