import { Request, Response } from "express";
import { QuestionService } from "./question.service";
import logger from "../../config/logger";
import { v2 as cloudinary } from "cloudinary";
import QuestionPaper from "./question.model";
import Question from "./questionDetail.model";
import {
  typedQuestionSchema,
  fileJobSchema,
  retrySchema,
} from "./question.validation";
import { CreditsService } from "../billing/credits.service";
import { v4 as uuidv4 } from "uuid";
import { ActivityService } from "../activity/activity.service";

export class QuestionController {
  static async getUploadSignature(req: Request, res: Response) {
    try {
      const { fileName, fileSize, mimeType } = req.body;
      // logger.info({ body: req.body }, "Upload signature request received");
      const jobId = uuidv4();

      if (!fileName || !fileSize || !mimeType) {
        return res.status(400).json({
          success: false,
          message: "fileName, fileSize, mimeType and customJobId are required.",
        });
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (fileSize > MAX_SIZE) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum allowed size is ${MAX_SIZE} MB.`,
        });
      }

      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowed.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          message: "Only PDF or image files are allowed.",
        });
      }

      const folder = `ai-eval/job_${jobId}`;
      const timestamp = Math.round(Date.now() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!,
      );

      // logger.info({ signature }, "Cloudinary upload signature generated");

      return res.status(200).json({
        success: true,
        jobId: jobId,
        folder,
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Could not generate upload signature.",
      });
    }
  }

  static async submitFileJob(req: Request, res: Response) {
    try {
      const { jobId, fileUrl, mimeType } = req.body;

      if (!jobId || !fileUrl || !mimeType) {
        return res.status(400).json({
          success: false,
          message: "jobId, fileUrl and mimeType are required.",
        });
      }

      const userId = req.auth?.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const balance = await CreditsService.getBalance(userId);
      if (balance.plan === "free" && balance.credits <= 1) {
        return res.status(403).json({
          success: false,
          error_code: "DAILY_LIMIT_EXCEEDED",
          message: "You have exhausted your daily credits.",
        });
      }

      const record = await QuestionPaper.create({
        id: jobId, // Primary Key
        mode: "upload",
        status: "pending",
        createdBy: userId,
        fileUrl,
        fileMimeType: mimeType,
      });

      // logger.info({ recordId: record.id }, "Question paper record created");

      await QuestionService.scheduleQuestionJob({
        type: "file",
        recordId: record.id,
        data: { fileUrl, mimeType },
        userId,
      });

      return res.status(200).json({
        success: true,
        id: record.id,
        message: "File uploaded successfully. Analyzing your paper...",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to submit file job.",
      });
    }
  }

  static async submitTypedJob(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const parsed = typedQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
        });
      }

      const { text } = parsed.data;

      const balance = await CreditsService.getBalance(userId);

      if (balance.plan === "free" && balance.credits <= 1) {
        return res.status(403).json({
          success: false,
          error_code: "DAILY_LIMIT_EXCEEDED",
          message:
            "You have exhausted your daily credits. Upgrade plan to continue.",
        });
      }

      const record = await QuestionPaper.create({
        mode: "typed",
        rawText: text,
        status: "pending",
        createdBy: userId,
      });

      await QuestionService.scheduleQuestionJob({
        type: "text",
        recordId: record.id,
        data: text,
        userId,
      });

      await ActivityService.log(userId, {
        type: "SUBMISSION",
        status: "info",
        title: "Text Submitted",
        description: "Your typed questions are being analyzed by AI.",
        linkId: record.id,
      });

      return res.status(202).json({
        success: true,
        id: record.id,
        message: "We're analyzing your question now.",
      });
    } catch (error: any) {
      // logger.error(`Controller Error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || "Typed submission failed.",
      });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const record = await QuestionPaper.findByPk(id, {
        include: [
          {
            model: Question,
            as: "questions",
          },
        ],
        order: [[{ model: Question, as: "questions" }, "number", "ASC"]],
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      logger.error(`Status Error: ${error.message}`);
      return res.status(500).json({
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

      if (record.retryCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum retry attempts reached for this question paper.",
        });
      }

      const balance = await CreditsService.getBalance(record.createdBy);

      if (balance.plan === "free" && balance.credits <= 0) {
        return res.status(403).json({
          success: false,
          error_code: "DAILY_LIMIT_EXCEEDED",
          message: "Insufficient credits to retry.",
        });
      }

      await record.update({
        retryCount: record.retryCount + 1,
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
                mimeType: record.fileMimeType || "application/pdf",
              }
            : record.rawText || "",
        userId: record.createdBy,
      });

      return res.status(200).json({
        success: true,
        message: "Retrying…",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retry job.",
      });
    }
  }

  static async updateQuestions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { questions } = req.body;

      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: "Questions must be an array.",
        });
      }

      const record = await QuestionPaper.findByPk(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Question paper not found.",
        });
      }

      const cleaned = questions.map((q, i) => ({
        number: q.number || i + 1,
        text: q.text,
        marks: q.marks ? Number(q.marks) : null,
        flagged: q.marks ? false : true,
      }));

      const totalMarks = cleaned.reduce((sum, q) => sum + (q.marks || 0), 0);

      await Question.destroy({
        where: { questionPaperId: id },
      });

      for (const q of cleaned) {
        await Question.create({
          questionPaperId: id,
          number: q.number,
          text: q.text,
          marks: q.marks,
          flagged: q.flagged,
        });
      }

      await record.update({ totalMarks });

      return res.status(200).json({
        success: true,
        message: "Questions updated successfully.",
        totalMarks,
        questionsInserted: cleaned.length,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to update questions.",
      });
    }
  }
}
