import { Request, Response } from "express";
import { ActivityService } from "./activity.service";

export class ActivityController {
  static async getMyActivity(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;
      // const userId = "user_36EM71F3PBF3X71L0BI108mXB70";
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const activities = await ActivityService.getAll(userId);

      return res.status(200).json({
        success: true,
        activities
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}