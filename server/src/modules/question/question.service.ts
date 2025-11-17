// import QuestionPaper from "./question.model";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { downloadFile } from "../../utils/fileDownloader";
// import { questionQueue } from "../../jobs/question.queue";
// import logger from "../../config/logger";
// import { io } from "../../server";
// import { QUESTION_EXTRACTION_PROMPT } from "../../utils/prompt";

// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });

// interface FileJobData {
//   fileUrl: string;
//   mimeType: string;
// }

// type JobData = FileJobData | string;

// export class QuestionService {
//   static emitStatus(recordId: number, message: string) {
//     io.emit(`job-status-${recordId}`, { message });
//   }

//   static async scheduleQuestionJob(job: {
//     type: string;
//     recordId: number;
//     data: JobData;
//   }) {
//     await questionQueue.add(`create-question-${job.type}`, job);
//     logger.info(`Job added: ${job.type}, recordId ${job.recordId}`);
//   }

//   // static normalizeQuestions(questions: any[]) {
//   //   return questions.map((q) => {
//   //     const marks = typeof q.marks === "number" ? q.marks : null;
//   //     return {
//   //       ...q,
//   //       marks,
//   //       flagged: marks === null,
//   //     };
//   //   });
//   // }


//   static normalizeQuestions(questions: any[]) {
//   return questions.map((q) => {
//     const marks = typeof q.marks === "number" ? q.marks : null;

//     if (marks === null) {
//       return {
//         ...q,
//         marks: null,
//         flagged: true,   // only when missing
//       };
//     }

//     // marks present → flagged field REMOVE
//     return {
//       ...q,
//       marks,
//     };
//   });
// }


//   static async processQuestionJob(
//     type: "file" | "text",
//     recordId: number,
//     data: JobData
//   ) {
//     const record = await QuestionPaper.findByPk(recordId);
//     if (!record) return;

//     await record.update({ status: "processing", errorMessage: null });
//     this.emitStatus(recordId, "Processing started...");

//     try {
//       let parsedData: { questions: any[]; totalMarks: number };

//       const jsonConfig = {
//         generationConfig: {
//           responseMimeType: "application/json",
//         },
//       };

//       if (type === "file") {
//         const { fileUrl, mimeType } = data as FileJobData;

//         this.emitStatus(recordId, "Downloading file");
//         const buffer = await downloadFile(fileUrl);
//         this.emitStatus(recordId, "Download complete.");

//         const base64 = buffer.toString("base64");

//         this.emitStatus(recordId, "Sending file to AI for extract user question pepar...");

//         const aiRes = await model.generateContent({
//           ...jsonConfig,
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 { text: QUESTION_EXTRACTION_PROMPT },
//                 {
//                   inlineData: {
//                     mimeType,
//                     data: base64,
//                   },
//                 },
//               ],
//             },
//           ],
//         });

//         this.emitStatus(recordId, "AI finished processing.");
//         parsedData = JSON.parse(aiRes.response.text());
//         console.log(parsedData);
//       } else {
//         const text = data as string;

//         this.emitStatus(recordId, "Sending text to AI...");

//         const aiRes = await model.generateContent({
//           ...jsonConfig,
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: QUESTION_EXTRACTION_PROMPT + "\n\n" + text }],
//             },
//           ],
//         });

//         this.emitStatus(recordId, "Gemini finished processing.");
//         parsedData = JSON.parse(aiRes.response.text());
//         console.log(parsedData);
//       }

//       if (!parsedData.questions || parsedData.questions.length === 0) {
//         throw new Error("AI returned zero questions.");
//       }

//       const cleanedQuestions = this.normalizeQuestions(parsedData.questions);

//       this.emitStatus(recordId, "Saving extracted data...");

//       await record.update({
//         questions: cleanedQuestions,
//         totalMarks: parsedData.totalMarks || 0,
//         status: "completed",
//         errorMessage: null,
//       });

//       this.emitStatus(recordId, "Completed successfully!");
//       return record;
//     } catch (err: any) {
//       logger.error(`Job failed: ${err.message}`);

//       await record.update({
//         status: "failed",
//         errorMessage: err.message,
//       });

//       this.emitStatus(recordId, "Failed: " + err.message);
//       return;
//     }
//   }
// }


import QuestionPaper from "./question.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { questionQueue } from "../../jobs/question.queue";
import logger from "../../config/logger";
import { io } from "../../server";
import { QUESTION_EXTRACTION_PROMPT } from "../../utils/prompt";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });

interface FileJobData {
  fileUrl: string;
  mimeType: string;
}

type JobData = FileJobData | string;

export class QuestionService {
  static emitStatus(recordId: number, message: string) {
    io.emit(`job-status-${recordId}`, { message });
  }

  static async scheduleQuestionJob(job: {
    type: string;
    recordId: number;
    data: JobData;
  }) {
    await questionQueue.add(`create-question-${job.type}`, job);
    logger.info(`Job added: ${job.type}, recordId ${job.recordId}`);
  }

  static normalizeQuestions(questions: any[]) {
    return questions.map((q) => {
      const marks = typeof q.marks === "number" ? q.marks : null;
      if (marks === null) {
        return {
          ...q,
          marks: null,
          flagged: true,
        };
      }
      return {
        ...q,
        marks,
      };
    });
  }

  static async processQuestionJob(
    type: "file" | "text",
    recordId: number,
    data: JobData
  ) {
    const record = await QuestionPaper.findByPk(recordId);
    if (!record) return;

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(recordId, "Processing started...");

    try {
      let parsedData: { questions: any[]; totalMarks: number };

      const jsonConfig = {
        generationConfig: {
          responseMimeType: "application/json",
        },
      };

      if (type === "file") {
        const { fileUrl } = data as FileJobData;

        this.emitStatus(recordId, "Downloading file");
        const buffer = await downloadFile(fileUrl);
        this.emitStatus(recordId, "Download complete.");

        const base64 = buffer.toString("base64");

        const aiRes = await model.generateContent({
          ...jsonConfig,
          contents: [
            {
              role: "user",
              parts: [
                { text: QUESTION_EXTRACTION_PROMPT },
                { text: JSON.stringify({ pagesBase64: [base64] }) }
              ],
            },
          ],
        });

        parsedData = JSON.parse(aiRes.response.text());
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
      

      this.emitStatus(recordId, "Saving extracted data...");

      await record.update({
        questions: cleanedQuestions,
        totalMarks: parsedData.totalMarks,
        status: "completed",
        errorMessage: null,
      });

      this.emitStatus(recordId, "Completed successfully!");
      return record;
    } catch (err: any) {
      logger.error(`Job failed: ${err.message}`);

      await record.update({
        status: "failed",
        errorMessage: err.message,
      });

      this.emitStatus(recordId, "Failed: " + err.message);
      return;
    }
  }
}