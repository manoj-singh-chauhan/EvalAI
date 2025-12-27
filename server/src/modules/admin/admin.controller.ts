import { Request, Response } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import QuestionPaper from "../question/question.model";
import AnswerSheet from "../answer/answer.model";

export class AdminController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await clerkClient.users.getUserList({ limit: 100 });

      const cleanedUsers = users.map((u: any) => ({
        id: u.id,
        name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
        email: u.emailAddresses?.[0]?.emailAddress,
        role: u.publicMetadata?.role ?? "user",
        joinedAt: u.createdAt,
        lastActiveAt: u.lastSignInAt,
        status: u.banned ? "blocked" : "active",
        imageUrl: u.imageUrl,
      }));
      return res.json({
        success: true,
        users: cleanedUsers,
      });
    } catch (error: any) {
      console.error("Clerk getAllUsers error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch users from Clerk",
      });
    }
  }

  static async getUserActivity(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const questionPapers = await QuestionPaper.findAll({
      where: { createdBy: userId },
      attributes: ["id", "status", "mode", "totalMarks", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const paperIds = questionPapers.map((p) => p.id);

    const answerSheets = await AnswerSheet.findAll({
      where: { questionPaperId: paperIds },
      attributes: ["id", "status", "totalScore", "createdAt"],
    });

    const summary = {
      totalQuestionPapers: questionPapers.length,
      completedPapers: questionPapers.filter((p) => p.status === "completed")
        .length,
      failedPapers: questionPapers.filter((p) => p.status === "failed").length,
      pendingPapers: questionPapers.filter(
        (p) => p.status === "pending" || p.status === "processing"
      ).length,

      totalAnswerSheets: answerSheets.length,
      completedAnswerSheets: answerSheets.filter(
        (a) => a.status === "completed"
      ).length,
      failedAnswerSheets: answerSheets.filter((a) => a.status === "failed")
        .length,
    };

    const recentSubmissions = questionPapers.slice(0, 5).map((p) => ({
      id: p.id,
      status: p.status,
      mode: p.mode,
      totalMarks: p.totalMarks,
      createdAt: p.createdAt,
    }));

    const failureRate =
      summary.totalQuestionPapers === 0
        ? 0
        : Math.round(
            (summary.failedPapers / summary.totalQuestionPapers) * 100
          );

    const health = {
      failureRate,
      hasIssues: summary.failedPapers > 0 || summary.failedAnswerSheets > 0,
    };

    return res.json({
      success: true,
      userId,
      summary,
      recentSubmissions,
      health,
    });
  }
}