import QuestionPaper from "./question.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { questionQueue } from "../../jobs/question.queue";
import logger from "../../config/logger";
import { io } from "../../server";
import Question from "./questionDetail.model";
import { QUESTION_EXTRACTION_PROMPT } from "../../utils/prompt";
import { CreditsService } from "../billing/credits.service";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
const model = ai.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "You are a professional exam coordinator. Your job is to extract questions from images or text with 100% accuracy in JSON format."
});

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
    type: "file" | "text";
    recordId: string;
    data: JobData;
    userId: string;
  }) {
    await questionQueue.add(`create-question-${job.type}`, {
      type: job.type,
      recordId: job.recordId,
      data: job.data,
    });
    // logger.info(`Job added: ${job.type}, recordId ${job.recordId}`);
  }

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
    data: JobData,
  ) {
    const record = await QuestionPaper.findByPk(recordId);
    if (!record) return;

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(
      recordId,
      "checking or extracting your question papar by ai ",
    );

    try {
      let parsedData: { 
        questions: any[]; 
        totalMarks: number 
      };
      let totalTokens = 0;
      // const jsonConfig = {
      //   generationConfig: {
      //     responseMimeType: "application/json",
      //   },
      // };

      const jsonConfig = {
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,    
          maxOutputTokens: 4096,
          topP: 0.95,
        },
      };

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
       console.log(aiRes.response.usageMetadata);
       const usage = aiRes.response.usageMetadata;
       totalTokens = usage?.totalTokenCount || 0;



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
        console.log(aiRes.response.usageMetadata);
        const usage = aiRes.response.usageMetadata;
        totalTokens = usage?.totalTokenCount || 0;
        parsedData = JSON.parse(aiRes.response.text());
      }

      if (!parsedData.questions || parsedData.questions.length === 0) {
        throw new Error("AI returned zero questions.");
      }

      const cleanedQuestions = this.normalizeQuestions(parsedData.questions);
      console.log(cleanedQuestions);

      await Question.destroy({
        where: { questionPaperId: recordId },
      });

      for (const q of cleanedQuestions) {
        await Question.create({
          questionPaperId: recordId,
          number: q.number,
          text: q.text,
          marks: q.marks,
          flagged: q.flagged,
        });
      }

      // await record.update({
      //   totalMarks: parsedData.totalMarks,
      //   status: "completed",
      // });
      const creditsToDeduct = Math.ceil(totalTokens / 1000);
      const finalCost = Math.max(1, creditsToDeduct);

      if (record.createdBy) {
          await CreditsService.deductExact(record.createdBy, finalCost, "Question Extraction");
      }

      await record.update({
        totalMarks: parsedData.totalMarks,
        status: "completed",
        retryCount: 0,
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
