import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/clerk-sdk-node";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    const session = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      issuer: null,
    });

    (req as any).auth = session;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
