import { Request, Response } from "express";
import { SubmissionService } from "./submissions.service";

export class SubmissionController {
  static async getAllSubmissions(req: Request, res: Response) {
    try {
      const data = await SubmissionService.getAllSubmissions();
      return res.status(200).json({ success: true, submissions: data });
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
}
