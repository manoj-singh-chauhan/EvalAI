import { Request, Response } from "express";
import { QuestionService } from "./question.service";
import logger from "../../config/logger";
import { v2 as cloudinary } from "cloudinary";
import QuestionPaper from "./question.model";
import { typedQuestionSchema, fileJobSchema, retrySchema } from "./question.validation";

export class QuestionController {
  static async getUploadSignature(req: Request, res: Response) {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const folder = "question-papers";

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


  static async submitFileJob(req: Request, res: Response) {
    try {
      const parsed = fileJobSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
        });
      }

      const { fileUrl, mimeType } = parsed.data;

      const record = await QuestionPaper.create({
        mode: "upload",
        fileUrl,
        status: "pending",
      });

      await QuestionService.scheduleQuestionJob({
        type: "file",
        recordId: record.id,
        data: { fileUrl, mimeType },
      });

      return res.status(202).json({
        success: true,
        id: record.id,

      
        message:
          "Your file has been uploaded successfully. We're analyzing it — this usually takes a few seconds.",
      });
    } catch (error: any) {
      logger.error(`Controller Error: ${error.message}`);
      res.status(500).json({
        success: false,

        
        message: "File job submission failed.",
      });
    }
  }

  static async submitTypedJob(req: Request, res: Response) {
    try {
      const parsed = typedQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,

          
          message: parsed.error.issues[0].message,
        });
      }

      const { text } = parsed.data;

      const record = await QuestionPaper.create({
        mode: "typed",
        rawText: text,
        status: "pending",
      });

      await QuestionService.scheduleQuestionJob({
        type: "text",
        recordId: record.id,
        data: text,
      });

      return res.status(202).json({
        success: true,
        id: record.id,

        
        message: "Thanks! We're analyzing your question now. This won't take long.",
      });
    } catch (error: any) {
      logger.error(`Controller Error: ${error.message}`);
      res.status(500).json({
        success: false,

        
        message: "Typed submission failed.",
      });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const record = await QuestionPaper.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,

          
          message: "Record not found.",
        });
      }

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      logger.error(`Status Error: ${error.message}`);
      res.status(500).json({
        success: false,

        
        message: "Failed to fetch status.",
      });
    }
  }

  static async retryJob(req: Request, res: Response) {
    try {
      const parsed = retrySchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,

          
          message: parsed.error.issues[0].message,
        });
      }

      const { id } = parsed.data;

      const record = await QuestionPaper.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,

          
          message: "Record not found.",
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


      await QuestionService.scheduleQuestionJob({
        type: record.mode === "upload" ? "file" : "text",
        recordId: record.id,
        data:
          record.mode === "upload"
            ? {
                fileUrl: record.fileUrl || "",
                mimeType: "application/pdf",
              }
            : record.rawText || "",
      });

      return res.status(200).json({
        success: true,

        
        message: "Retrying… we’ll take another look at your job.",
      });
    } catch (error: any) {
      logger.error(`Retry Error: ${error.message}`);
      res.status(500).json({
        success: false,

        
        message: "Failed to retry job.",
      });
    }
  }
}