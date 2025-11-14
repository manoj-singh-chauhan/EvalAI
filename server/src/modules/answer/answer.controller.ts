import { Request, Response } from "express";
import { AnswerService } from "./answer.service";
import logger from "../../config/logger";

import { v2 as cloudinary } from "cloudinary";

export class AnswerController {
  static async getUploadSignature(req: Request, res: Response) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = "answer-sheets";

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          folder: folder,
        },
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
      logger.error(`Signature Error: ${error.message}`);
      res
        .status(500)
        .json({ success: false, message: "Could not get upload signature." });
    }
  }

  static async submitFileJobs(req: Request, res: Response) {
    try {
      const paperId = Number(req.params.paperId);

      const { files } = req.body as {
        files: { fileUrl: string; mimeType: string }[];
      };

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No file URLs provided." });
      }

      logger.info(
        `Controller: Received ${files.length} file URLs for paper ${paperId}. Creating jobs...`
      );

      const jobs = files.map((file) => ({
        paperId: paperId,
        type: "file",
        data: {
          fileUrl: file.fileUrl,
          mimeType: file.mimeType,
        },
      }));

      await AnswerService.scheduleEvaluation(jobs);

      res.status(202).json({
        success: true,
        message: `${jobs.length} files accepted for evaluation. You will be notified.`,
        jobCount: jobs.length,
      });
    } catch (error: any) {
      logger.error(`Controller Error (File Jobs): ${error.message}`);
      res
        .status(500)
        .json({ success: false, message: "File job submission failed." });
    }
  }

  static async submitTypedJob(req: Request, res: Response) {
    try {
      const paperId = Number(req.params.paperId);
      const { text } = req.body;

      if (!text || text.trim().length < 10) {
        return res
          .status(400)
          .json({ success: false, message: "Answer text is too short." });
      }

      logger.info(`Controller: Received typed answer for paper ${paperId}.`);

      const job = {
        paperId: paperId,
        type: "text",
        data: text,
      };

      await AnswerService.scheduleEvaluation([job]);

      res.status(202).json({
        success: true,
        message: "Typed answer accepted for evaluation. You will be notified.",
      });
    } catch (error: any) {
      logger.error(`Controller Error (Typed): ${error.message}`);
      res
        .status(500)
        .json({ success: false, message: "Typed answer submission failed." });
    }
  }
}
