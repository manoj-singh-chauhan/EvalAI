import { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const data = await AdminService.getAllUsers(req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  }

  static async getUserActivity(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 8;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const data = await AdminService.getUserActivity(userId, page, limit);

      res.json({
        success: true,
        userId,
        ...data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user activity",
      });
    }
  }

  static async searchUsers(req: Request, res: Response) {
    try {
      const data = await AdminService.getAllUsers(req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to search users",
      });
    }
  }
}
