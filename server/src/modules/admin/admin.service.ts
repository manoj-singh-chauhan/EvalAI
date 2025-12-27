import { clerkClient } from "@clerk/clerk-sdk-node";
import QuestionPaper from "../question/question.model";
import AnswerSheet from "../answer/answer.model";

export class AdminService {
  static async getAllUsers(params: {
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { search = "", role = "all", status = "all" } = params;

    const users = await clerkClient.users.getUserList({ limit: 100 });

    let cleanedUsers = users.map((u: any) => ({
      id: u.id,
      name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
      email: u.emailAddresses?.[0]?.emailAddress,
      role: u.publicMetadata?.role ?? "user",
      joinedAt: u.createdAt,
      lastActiveAt: u.lastSignInAt,
      status: u.banned ? "blocked" : "active",
      imageUrl: u.imageUrl,
    }));

    if (search) {
      const s = search.toLowerCase();
      cleanedUsers = cleanedUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
      );
    }

    if (role !== "all") {
      cleanedUsers = cleanedUsers.filter((u) => u.role === role);
    }

    if (status !== "all") {
      cleanedUsers = cleanedUsers.filter((u) => u.status === status);
    }

    return {
      users: cleanedUsers,
      total: cleanedUsers.length,
    };
  }

  static async getUserActivity(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const { count, rows: questionPapers } = await QuestionPaper.findAndCountAll(
      {
        where: { createdBy: userId },
        attributes: ["id", "status", "mode", "totalMarks", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      }
    );

    const paperIds = questionPapers.map((p) => p.id);

    const answerSheets = await AnswerSheet.findAll({
      where: { questionPaperId: paperIds },
      attributes: ["id", "status", "totalScore", "createdAt"],
    });

    const summary = {
      totalQuestionPapers: count,
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

    const allSubmissions = questionPapers.map((p) => ({
      id: p.id,
      status: p.status,
      mode: p.mode,
      totalMarks: p.totalMarks,
      createdAt: p.createdAt,
    }));

    const failureRate =
      count === 0 ? 0 : Math.round((summary.failedPapers / count) * 100);

    return {
      summary,
      allSubmissions,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      health: {
        failureRate,
        hasIssues: summary.failedPapers > 0 || summary.failedAnswerSheets > 0,
      },
    };
  }
}
