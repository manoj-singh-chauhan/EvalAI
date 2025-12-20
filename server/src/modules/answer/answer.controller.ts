import { Request, Response } from "express";
import { submitAnswerSchema, retryAnswerSchema } from "./answer.validation";
import AnswerSheet from "./answer.model";
import AnswerSheetFile from "./answerFile.model";
import { v2 as cloudinary } from "cloudinary";
import { AnswerService } from "./answer.service";
import logger from "../../config/logger";
import EvaluatedAnswer from "./evaluatedAnswer.model";

export class AnswerController {

  static async getUploadSignature(req: Request, res: Response) {
    try {
      const { questionPaperId } = req.params;

      if (!questionPaperId) {
        return res.status(400).json({
          success: false,
          message: "questionPaperId is required.",
        });
      }

      const folder = `ai-eval/job_${questionPaperId}/answers`;
      const timestamp = Math.round(Date.now() / 1000);

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
      logger.error(`Signature Error (Answer): ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Could not get upload signature.",
      });
    }
  }


  static async submitAnswerSheet(req: Request, res: Response) {
    const parsed = submitAnswerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message,
      });
    }

    // const { questionPaperId, answerSheetFiles } = parsed.data;
    const { questionPaperId, answerSheetFiles, strictnessLevel } = parsed.data;

    const createdIds: string[] = [];

      for (const f of answerSheetFiles) {
        // const sheet = await AnswerSheet.create({
        //   questionPaperId,
        //   status: "pending",
        // });

      const sheet = await AnswerSheet.create({
        questionPaperId,
        strictnessLevel: strictnessLevel || "moderate",
        status: "pending",
      });

      await AnswerSheetFile.create({
        answerSheetId: sheet.id,
        fileUrl: f.fileUrl,
        fileType: f.mimeType,
      });


      await AnswerService.scheduleAnswerJob({
        recordId: sheet.id,
        questionPaperId,
        answerSheetFiles: [
          { fileUrl: f.fileUrl, mimeType: f.mimeType }
        ],
      });

      createdIds.push(sheet.id);
    }

    res.status(202).json({
      success: true,
      ids: createdIds,
      message: "Answer sheets received. Evaluating...",
    });
  }


  static async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sheet = await AnswerSheet.findByPk(id, {
        include: [
          { model: EvaluatedAnswer, as: "evaluatedAnswers" },
          { model: AnswerSheetFile, as: "files" }
        ],
      });

      if (!sheet) {
        return res.status(404).json({
          success: false,
          message: "AnswerSheet record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: sheet,
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

      const sheet = await AnswerSheet.findByPk(id, {
        include: [{ model: AnswerSheetFile, as: "files" }],
      });

      if (!sheet) {
        return res.status(404).json({
          success: false,
          message: "AnswerSheet not found.",
        });
      }

      if (sheet.status !== "failed") {
        return res.status(400).json({
          success: false,
          message: "Only failed jobs can be retried.",
        });
      }

      await sheet.update({
        status: "pending",
        errorMessage: null,
      });

      const files = sheet.files.map((f: any) => ({
        fileUrl: f.fileUrl,
        mimeType: f.fileType,
      }));

      await AnswerService.scheduleAnswerJob({
        recordId: sheet.id,
        questionPaperId: sheet.questionPaperId,
        answerSheetFiles: files,
      });

      return res.status(200).json({
        success: true,
        message: "Retry. Please wait…",
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
