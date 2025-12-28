import { Request, Response } from "express";
import { SubmissionService } from "./submissions.service";

export class SubmissionController {
  static async getAllSubmissions(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const mode = req.query.mode as string | undefined;
      const status = req.query.status as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      // const search = req.query.search as string | undefined;

      const filters = {
        mode,
        status,
        startDate,
        endDate,
        // search,
      };

      const data = await SubmissionService.getAllSubmissions(
        userId,
        page,
        limit,
        filters
      );

      return res.status(200).json({
        success: true,
        submissions: data.rows,
        pagination: {
          page,
          limit,
          total: data.count,
          totalPages: Math.ceil(data.count / limit),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getSubmissionDetails(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const data = await SubmissionService.getSubmissionDetails(id);
      return res.status(200).json({ success: true, ...data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteSubmission(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;

      await SubmissionService.deleteSubmission(id, userId);

      return res.status(200).json({
        success: true,
        message: "Submission deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}