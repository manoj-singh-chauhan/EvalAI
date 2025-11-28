import { Request, Response } from "express";
import { ResultsService } from "./results.service";

export class ResultsController {
  static async getResults(req: Request, res: Response) {
    try {
      // const paperId = Number(req.params.paperId);
      const paperId = req.params.paperId;
      const data = await ResultsService.getResults(paperId);

      return res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async getQuestionPaper(req: Request, res: Response) {
    try {
      const paperId = req.params.paperId;
      const file = await ResultsService.getQuestionPaper(paperId);

      return res.status(200).json({
        success: true,
        ...file,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async getAnswerSheet(req: Request, res: Response) {
    try {
      const answerId = req.params.answerId;
      const result = await ResultsService.getAnswerSheet(answerId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}
