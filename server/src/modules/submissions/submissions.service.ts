import QuestionPaper from "../question/question.model";
import Question from "../question/questionDetail.model";
import AnswerSheet from "../answer/answer.model";
import AnswerSheetFile from "../answer/answerFile.model";
import EvaluatedAnswer from "../answer/evaluatedAnswer.model";

export class SubmissionService {
  static async getAllSubmissions() {
    const papers = await QuestionPaper.findAll({
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "mode",
        "totalMarks",
        "status",
        "errorMessage",
        "createdAt",
      ],
    });

    return papers.map((p) => ({
      id: p.id,
      mode: p.mode,
      status: p.status,
      marks: p.totalMarks,
      questions: undefined,
      createdAt: p.createdAt,
    }));
  }

  static async getSubmissionDetails(id: string) {
  const paper = await QuestionPaper.findByPk(id, {
    include: [
      {
        model: Question,
        as: "questions",
      }
    ],
    order: [[{ model: Question, as: "questions" }, "number", "ASC"]],
  });

  if (!paper) throw new Error("Submission not found");

  const answers = await AnswerSheet.findAll({
    where: { questionPaperId: id },
    include: [
      { model: AnswerSheetFile, as: "files" },
      { model: EvaluatedAnswer, as: "evaluatedAnswers" },
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

}
      
