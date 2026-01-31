import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import logger from "../config/logger";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const role = user?.publicMetadata?.role;

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch (error) {
    logger.error(
      { err: error, userId: req.auth?.sub },
      "Admin check error"
    );
    return res.status(500).json({
      success: false,
      message: "Error checking admin status",
    });
  }
};