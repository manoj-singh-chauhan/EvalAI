import { Request, Response } from "express";
import { ActivityService } from "./activity.service";

export class ActivityController {
  static async getMyActivity(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;
      // const userId = "user_36EM71F3PBF3X71L0BI108mXB70";
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const result = await ActivityService.getAll(userId, page, limit);

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}