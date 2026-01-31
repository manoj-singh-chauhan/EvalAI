import { Request, Response } from "express";
import { submitAnswerSchema, retryAnswerSchema } from "./answer.validation";
import AnswerSheet from "./answer.model";
import AnswerSheetFile from "./answerFile.model";
import { v2 as cloudinary } from "cloudinary";
import { AnswerService } from "./answer.service";
import logger from "../../config/logger";
import EvaluatedAnswer from "./evaluatedAnswer.model";
import { CreditsService } from "../billing/credits.service";

export class AnswerController {
  static async getUploadSignature(req: Request, res: Response) {
    try {
      const { questionPaperId } = req.params;
      const { fileSize } = req.query;

      if (!questionPaperId) {
        return res.status(400).json({
          success: false,
          message: "questionPaperId is required.",
        });
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (fileSize && Number(fileSize) > MAX_SIZE) {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum allowed size is 10 MB.",
        });
      }

      const folder = `ai-eval/job_${questionPaperId}/answers`;
      const timestamp = Math.round(Date.now() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!,
      );

      // logger.info({ signature }, "Answer upload signature generated");

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
    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const parsed = submitAnswerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message,
      });
    }

    const { questionPaperId, answerSheetFiles, strictnessLevel } = parsed.data;
    const balance = await CreditsService.getBalance(userId);

    if (balance.plan === "free" && balance.credits <= 1) {
      return res.status(403).json({
        success: false,
        error_code: "DAILY_LIMIT_EXCEEDED",
        message:
          "You have exhausted your daily credits. Upgrade plan to continue.",
      });
    }

    const createdIds: string[] = [];

    for (const f of answerSheetFiles) {
      const sheet = await AnswerSheet.create({
        questionPaperId,
        strictnessLevel: strictnessLevel || "moderate",
        status: "pending",
        createdBy: userId,
      });

      await AnswerSheetFile.create({
        answerSheetId: sheet.id,
        fileUrl: f.fileUrl,
        fileType: f.mimeType,
      });

      await AnswerService.scheduleAnswerJob({
        recordId: sheet.id,
        questionPaperId,
        answerSheetFiles: [{ fileUrl: f.fileUrl, mimeType: f.mimeType }],
      });

      createdIds.push(sheet.id);
    }

    return res.status(202).json({
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
          { model: AnswerSheetFile, as: "files" },
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
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

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

      if (sheet.createdBy !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to retry this answer sheet",
        });
      }

      if (sheet.status !== "failed") {
        return res.status(400).json({
          success: false,
          message: "Only failed jobs can be retried.",
        });
      }

      const balance = await CreditsService.getBalance(userId);

      if (balance.plan === "free" && balance.credits <= 0) {
        return res.status(403).json({
          success: false,
          error_code: "DAILY_LIMIT_EXCEEDED",
          message: "Insufficient credits to retry.",
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