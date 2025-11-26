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

export class QuestionController {
  // static async getUploadSignature(req: Request, res: Response) {
  //   try {
  //     const timestamp = Math.round(Date.now() / 1000);
  //     const folder = "question-papers";

  //     const signature = cloudinary.utils.api_sign_request(
  //       { timestamp, folder },
  //       process.env.CLOUDINARY_API_SECRET!
  //     );

  //     res.status(200).json({
  //       success: true,
  //       timestamp,
  //       signature,
  //       folder,
  //       apiKey: process.env.CLOUDINARY_API_KEY!,
  //       cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  //     });
  //   } catch (error: any) {
  //     logger.error(`Signature Error (Question): ${error.message}`);
  //     res.status(500).json({
  //       success: false,
  //       message: "Could not get upload signature.",
  //     });
  //   }
  // }

  static async getUploadSignature(req: Request, res: Response) {
    try {
      const record = await QuestionPaper.create({
        mode: "upload",
        status: "pending",
      });

      const jobId = record.id;

      const folder = `ai-eval/job_${jobId}`;

      const timestamp = Math.round(Date.now() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!
      );

      return res.status(200).json({
        success: true,
        jobId,
        folder,
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Could not generate upload signature.",
      });
    }
  }

  // static async submitFileJob(req: Request, res: Response) {
  //   try {
  //     const parsed = fileJobSchema.safeParse(req.body);
  //     if (!parsed.success) {
  //       return res.status(400).json({
  //         success: false,
  //         message: parsed.error.issues[0].message,
  //       });
  //     }

  //     const { fileUrl, mimeType } = parsed.data;

  //     const record = await QuestionPaper.create({
  //       mode: "upload",
  //       fileUrl,
  //       fileMimeType: mimeType,
  //       status: "pending",
  //     });

  //     await QuestionService.scheduleQuestionJob({
  //       type: "file",
  //       recordId: record.id,
  //       data: { fileUrl, mimeType },
  //     });

  //     return res.status(202).json({
  //       success: true,
  //       id: record.id,
  //       message:
  //         "Your file has been uploaded successfully. We're analyzing it.",
  //     });
  //   } catch (error: any) {
  //     logger.error(`Controller Error: ${error.message}`);
  //     res.status(500).json({
  //       success: false,
  //       message: "File job submission failed.",
  //     });
  //   }
  // }

  static async submitFileJob(req: Request, res: Response) {
    try {
      const { jobId, fileUrl, mimeType } = req.body;

      if (!jobId || !fileUrl || !mimeType) {
        return res.status(400).json({
          success: false,
          message: "jobId, fileUrl and mimeType are required.",
        });
      }

      const record = await QuestionPaper.findByPk(jobId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Invalid jobId.",
        });
      }

      await record.update({
        fileUrl,
        fileMimeType: mimeType,
        mode: "upload",
      });

      await QuestionService.scheduleQuestionJob({
        type: "file",
        recordId: jobId,
        data: { fileUrl, mimeType },
      });

      return res.status(200).json({
        success: true,
        id: jobId,
        message: "File uploaded successfully. Analyzing your paper...",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to submit file job.",
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
        message: "We're analyzing your question now.",
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
                mimeType: record.fileMimeType || "application/pdf",
              }
            : record.rawText || "",
      });

      return res.status(200).json({
        success: true,
        message: "Retrying…",
      });
    } catch (error: any) {
      logger.error(`Retry Error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to retry job.",
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
