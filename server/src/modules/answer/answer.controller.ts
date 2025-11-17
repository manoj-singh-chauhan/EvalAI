import { Request, Response } from "express";
import { submitAnswerSchema, retryAnswerSchema } from "./answer.validation";
import AnswerSheet from "./answer.model";
import { v2 as cloudinary } from "cloudinary";
import { AnswerService } from "./answer.service";
import logger from "../../config/logger";

export class AnswerController {
    static async getUploadSignature(req: Request, res: Response) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = "answer-sheets";
  
        const signature = cloudinary.utils.api_sign_request(
          { timestamp, folder },
          process.env.CLOUDINARY_API_SECRET!
        );
  
        res.status(200).json({
          success: true,
          timestamp,
          signature,
          folder,
          apiKey: process.env.CLOUDINARY_API_KEY!,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        });
      } catch (error: any) {
        logger.error(`Signature Error (Question): ${error.message}`);
        res.status(500).json({
          success: false,
  
          message: "Could not get upload signature.",
        });
      }
    }

  static async submitAnswerSheet(req: Request, res: Response) {
    try {
      const parsed = submitAnswerSchema.safeParse(req.body);
      console.log(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
        });
      }

      const { questionPaperId, answerSheetFiles } = parsed.data;
      console.log(parsed.data);

      // const record = await AnswerSheet.create({
      //   questionPaperId,
      //   answerSheetFiles,
      //   status: "pending",
      // });

      
      // await AnswerService.scheduleAnswerJob({
      //   recordId: record.id,
      //   questionPaperId,
      //   answerSheetFiles,
      // });

      // return res.status(202).json({
      //   success: true,
      //   id: record.id,
      //   message: "Answer sheet received. We're evaluating it…",
      // });

      // answerSheetFiles = [file1, file2, file3...]

      const createdRecords = [];

      for (const singleFile of answerSheetFiles) {
        const record = await AnswerSheet.create({
          questionPaperId,
          answerSheetFiles: [singleFile], 
          status: "pending",
        });

        await AnswerService.scheduleAnswerJob({
          recordId: record.id,
          questionPaperId,
          answerSheetFiles: [singleFile],
        });

        createdRecords.push(record.id);
      }

      return res.status(202).json({
        success: true,
        ids: createdRecords,
        message: "Answer sheets received. Evaluating...",
      });

    } catch (error: any) {
      logger.error(`AnswerController Submit Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Failed to submit answer sheet.",
      });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await AnswerSheet.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "AnswerSheet record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      logger.error(`AnswerController Status Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve status.",
      });
    }
  }

  static async retryJob(req: Request, res: Response) {
    try {
      const parsed = retryAnswerSchema.safeParse(req.params);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
        });
      }
      
      const { id } = parsed.data;

      const record = await AnswerSheet.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "AnswerSheet not found.",
        });
      }

      if (record.status !== "failed") {
        return res.status(400).json({
          success: false,
          message: "Only failed jobs can be retried.",
        });
      }

      await record.update({
        status: "pending",
        errorMessage: null,
      });

      await AnswerService.scheduleAnswerJob({
        recordId: record.id,
        questionPaperId: record.questionPaperId,
        answerSheetFiles: record.answerSheetFiles,
      });

      return res.status(200).json({
        success: true,
        message: "Retry started. Please wait…",
      });
    } catch (error: any) {
      logger.error(`AnswerController Retry Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Failed to retry job.",
      });
    }
  }
}