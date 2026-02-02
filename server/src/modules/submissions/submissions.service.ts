import { Op } from "sequelize";
import QuestionPaper from "../question/question.model";
import Question from "../question/questionDetail.model";
import AnswerSheet from "../answer/answer.model";
import AnswerSheetFile from "../answer/answerFile.model";
import EvaluatedAnswer from "../answer/evaluatedAnswer.model";

interface SubmissionFilters {
  mode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class SubmissionService {
  // static async getAllSubmissions(
  //   userId: string,
  //   page: number,
  //   limit: number,
  //   filters?: SubmissionFilters
  // ) {
  //   const offset = (page - 1) * limit;
  //   const where: any = { createdBy: userId };

  //   if (filters?.mode) {
  //     where.mode = filters.mode;
  //   }

  //   if (filters?.status) {
  //     where.status = filters.status;
  //   }

  //   if (filters?.startDate || filters?.endDate) {
  //     where.createdAt = {};

  //     if (filters.startDate && !isNaN(Date.parse(filters.startDate))) {
  //       where.createdAt[Op.gte] = new Date(filters.startDate);
  //     }

  //     if (filters.endDate && !isNaN(Date.parse(filters.endDate))) {
  //       const endDate = new Date(filters.endDate);
  //       endDate.setHours(23, 59, 59, 999);
  //       where.createdAt[Op.lte] = endDate;
  //     }
  //   }

  //   const result = await QuestionPaper.findAndCountAll({
  //     where,
  //     order: [["createdAt", "DESC"]],
  //     limit,
  //     offset,
  //     attributes: [
  //       "id",
  //       "mode",
  //       "totalMarks",
  //       "status",
  //       "errorMessage",
  //       "createdAt",
  //       "createdBy",
  //     ],
  //   });

  //   return {
  //     count: result.count,
  //     rows: result.rows.map((p) => ({
  //       id: p.id,
  //       mode: p.mode,
  //       status: p.status,
  //       marks: p.totalMarks,
  //       questions: undefined,
  //       createdAt: p.createdAt,
  //       createdBy: p.createdBy,
  //     })),
  //   };
  // }
  static async getAllSubmissions(
    userId: string,
    page: number,
    limit: number,
    filters?: SubmissionFilters,
  ) {
    const offset = (page - 1) * limit;
    const where: any = { createdBy: userId };

    if (filters?.mode) where.mode = filters.mode;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate && !isNaN(Date.parse(filters.startDate))) {
        where.createdAt[Op.gte] = new Date(filters.startDate);
      }
      if (filters.endDate && !isNaN(Date.parse(filters.endDate))) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = endDate;
      }
    }

    const result = await QuestionPaper.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      attributes: [
        "id",
        "mode",
        "totalMarks",
        "status",
        "errorMessage",
        "createdAt",
        "createdBy",
      ],
    });

    const paperIds = result.rows.map((p) => p.id);

    const sheetCounts = (await AnswerSheet.findAll({
      where: { questionPaperId: paperIds },
      attributes: [
        "questionPaperId",
        [
          AnswerSheet.sequelize!.fn("COUNT", AnswerSheet.sequelize!.col("id")),
          "totalSheets",
        ],
      ],
      group: ["questionPaperId"],
      raw: true,
    })) as any[];

    return {
      count: result.count,
      rows: result.rows.map((p) => {
        const countData = sheetCounts.find((c) => c.questionPaperId === p.id);

        return {
          id: p.id,
          mode: p.mode,
          status: p.status,
          marks: p.totalMarks,
          createdAt: p.createdAt,
          createdBy: p.createdBy,
          answerSheetsCount: countData ? parseInt(countData.totalSheets) : 0,
        };
      }),
    };
  }

  static async getSubmissionDetails(id: string) {
    const paper = await QuestionPaper.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
        },
      ],
      order: [[{ model: Question, as: "questions" }, "number", "ASC"]],
    });

    if (!paper) throw new Error("Submission not found");

    const answers = await AnswerSheet.findAll({
      where: { questionPaperId: id },
      include: [
        { 
          model: AnswerSheetFile, 
          as: "files" 
        },
        { 
          model: EvaluatedAnswer, 
          as: "evaluatedAnswers" 
        },
      ],
      order: [["id", "ASC"]],
    });

    return {
      submission: {
        id: paper.id,
        mode: paper.mode,
        totalMarks: paper.totalMarks,
        status: paper.status,
        questions: paper.questions.length,
        errorMessage: paper.errorMessage,
        fileUrl: paper.fileUrl,
        rawText: paper.rawText,
        createdBy: paper.createdBy,

        questionsList: paper.questions.map((q: any) => ({
          id: q.id,
          number: q.number,
          text: q.text,
          marks: q.marks,
          flagged: q.flagged,
        })),
      },
      answerSheets: answers,
    };
  }

  static async deleteSubmission(submissionId: string, userId: string) {
    const paper = await QuestionPaper.findOne({
      where: { id: submissionId, createdBy: userId },
    });

    if (!paper) {
      throw new Error("Submission not found or unauthorized");
    }

    const answerSheets = await AnswerSheet.findAll({
      where: { questionPaperId: submissionId },
    });

    const answerSheetIds = answerSheets.map((a) => a.id);

    await EvaluatedAnswer.destroy({
      where: { answerSheetId: answerSheetIds },
    });

    await AnswerSheetFile.destroy({
      where: { answerSheetId: answerSheetIds },
    });

    await AnswerSheet.destroy({
      where: { questionPaperId: submissionId },
    });

    await QuestionPaper.destroy({
      where: { id: submissionId },
    });
  }
}
