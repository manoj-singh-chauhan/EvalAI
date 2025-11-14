// import { QuestionPaper } from "../question/question.model";
// import AnswerSheet from "./answer.model";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { extractTextFromFile } from "../../utils/textExtractor"; 
// import { buildEvaluationPrompt } from "../../utils/aiPromptBuilder"; 
// import { evaluationQueue } from "../../jobs/job.queues"; 
// import { downloadFile } from "../../utils/fileDownloader"; 
// import logger from "../../config/logger";

// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });


// interface FileJobData {
//   fileUrl: string;
//   mimeType: string;
// }
// type JobData = FileJobData | string; 

// export class AnswerService {

//   static async scheduleEvaluation(jobs: any[]) {
    
//     const bulkJobs = jobs.map((job) => ({
//       name: `evaluate-${job.type}-paper-${job.paperId}`,
//       data: job,
//     }));

    
//     await evaluationQueue.addBulk(bulkJobs);
//     logger.info(`Service: ${jobs.length} add on jobs queue`);
//   }


//   static async processEvaluation(
//     paperId: number,
//     type: "file" | "text",
//     data: JobData
//   ) {
//     logger.info(
//       `Service: Job processing shuru... (Type: ${type}, Paper: ${paperId})`
//     );

    
//     const paper = await QuestionPaper.findByPk(paperId);
//     if (!paper) {
//       throw new Error(`Question Paper ${paperId} not found.`);
//     }
//     const questions = paper.questions; 
//     const totalMarks = paper.totalMarks; 

//     let extractedText = "";
//     let fileUrl = null;

    
//     if (type === "file") {
      
//       const fileData = data as FileJobData;
//       fileUrl = fileData.fileUrl; 
//       logger.info(`Service: File job... ${fileUrl}`);

     
//       const fileBuffer = await downloadFile(fileUrl);

     
//       extractedText = await extractTextFromFile(fileBuffer, fileData.mimeType);
//     } else if (type === "text") {
      
//       logger.info("Service: Typed text job... text seedha mil gaya.");
//       extractedText = data as string;
      
//     }
    

    
//     if (!extractedText || extractedText.trim().length === 0) {
//       logger.warn(
//         `Service: Job (Paper ${paperId}) se koi text extract nahi hua. 0 marks.`
//       );
      
//       return await AnswerSheet.create({
//         questionPaperId: paperId,
//         fileUrl: fileUrl,
//         extractedText: "",
//         evaluationResult: { error: "No text extracted from answer sheet." },
//         marksAwarded: 0,
//       });
//     }

//     logger.info(
//       `Service: AI ko grading ke liye bhej raha hai (Paper ${paperId})`
//     );
    
//     const prompt = buildEvaluationPrompt(questions, extractedText);

//     let gradedResult: { totalMarksAwarded: number; feedback: any[] };

//     try {
//       const aiRes = await model.generateContent(prompt);
//       const cleanRes = aiRes.response.text().replace(/```json|```/g, "").trim();
//       gradedResult = JSON.parse(cleanRes);
//     } catch (aiError: any) {
//       logger.error(`AI Grading Failed: ${aiError.message}`);
//       return await AnswerSheet.create({
//         questionPaperId: paperId,
//         fileUrl: fileUrl,
//         extractedText: extractedText,
//         evaluationResult: {
//           error: "AI grading failed.",
//           details: aiError.message,
//         },
//         marksAwarded: 0,
//       });
//     }

    
//     logger.info(
//       `Service: Job complete (Paper ${paperId}). Marks: ${gradedResult.totalMarksAwarded}`
//     );

//     return await AnswerSheet.create({
//       questionPaperId: paperId,
//       fileUrl: fileUrl,
//       extractedText: extractedText,
//       evaluationResult: gradedResult.feedback,
//       marksAwarded: gradedResult.totalMarksAwarded,
//     });
//   }
// }


import { QuestionPaper } from "../question/question.model";
import AnswerSheet from "./answer.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromFile } from "../../utils/textExtractor"; 
import { buildEvaluationPrompt } from "../../utils/aiPromptBuilder"; 
import { evaluationQueue } from "../../jobs/job.queues"; 
import { downloadFile } from "../../utils/fileDownloader"; 
import logger from "../../config/logger";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });


interface FileJobData {
  fileUrl: string;
  mimeType: string;
}
type JobData = FileJobData | string; 

export class AnswerService {

  static async scheduleEvaluation(jobs: any[]) {
    
    const bulkJobs = jobs.map((job) => ({
      name: `evaluate-${job.type}-paper-${job.paperId}`,
      data: job,
    }));

    
    await evaluationQueue.addBulk(bulkJobs);
    logger.info(`Service: ${jobs.length} add on jobs queue`);
  }


  static async processEvaluation(
    paperId: number,
    type: "file" | "text",
    data: JobData
  ) {
    logger.info(
      `Service: Job processing shuru... (Type: ${type}, Paper: ${paperId})`
    );

    
    const paper = await QuestionPaper.findByPk(paperId);
    if (!paper) {
      throw new Error(`Question Paper ${paperId} not found.`);
    }
    const questions = paper.questions; 
    const totalMarks = paper.totalMarks; 

    let extractedText = "";
    let fileUrl = null;

    
    if (type === "file") {
      
      const fileData = data as FileJobData;
      fileUrl = fileData.fileUrl; 
      logger.info(`Service: File job... ${fileUrl}`);

      
      const fileBuffer = await downloadFile(fileUrl);

      
      extractedText = await extractTextFromFile(fileBuffer, fileData.mimeType);
    } else if (type === "text") {
      
      logger.info("Service: Typed text job... text seedha mil gaya.");
      extractedText = data as string;
    
    }
    

    
    if (!extractedText || extractedText.trim().length === 0) {
      logger.warn(
        `Service: Job (Paper ${paperId}) se koi text extract nahi hua. 0 marks.`
      );
      
      return await AnswerSheet.create({
        questionPaperId: paperId,
        fileUrl: fileUrl,
        extractedText: "",
        evaluationResult: { error: "No text extracted from answer sheet." },
        marksAwarded: 0,
      });
    }

    logger.info(
      ` AI ko  bhej rahe hai (Paper ${paperId})`
    );
    
    const prompt = buildEvaluationPrompt(questions, extractedText);

    let gradedResult: { totalMarksAwarded: number; feedback: any[] };

    
    try {
      const aiRes = await model.generateContent(prompt);
      const cleanRes = aiRes.response.text().replace(/```json|```/g, "").trim();

      
      if (!cleanRes.startsWith("{") || !cleanRes.endsWith("}")) {
        
        throw new Error("AI did not return valid JSON. Response: " + cleanRes.substring(0, 100));
      }
      
      gradedResult = JSON.parse(cleanRes);

    } catch (aiError: any) {
      logger.error(`AI Grading Failed: ${aiError.message}`);

      
      const errorMessage = aiError.message.toLowerCase();
      
      if (
        errorMessage.includes("503") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("service unavailable") ||
        errorMessage.includes("500")
      ) {
        logger.warn("AI model overloaded. Throwing error to RETRY job...");
        throw aiError;
      }
 
      logger.error("Permanent AI error or invalid JSON. Saving error record to DB...");
      return await AnswerSheet.create({
        questionPaperId: paperId,
        fileUrl: fileUrl,
        extractedText: extractedText,
        evaluationResult: {
          error: "AI grading failed permanently.",
          details: aiError.message,
        },
        marksAwarded: 0,
      });
    }
    

    
    logger.info(
      `Service: Job complete (Paper ${paperId}). Marks: ${gradedResult.totalMarksAwarded}`
    );

    return await AnswerSheet.create({
      questionPaperId: paperId,
      fileUrl: fileUrl,
      extractedText: extractedText,
      evaluationResult: gradedResult.feedback,
      marksAwarded: gradedResult.totalMarksAwarded,
    });
  }
}