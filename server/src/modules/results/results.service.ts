import QuestionPaper from "../question/question.model";
import AnswerSheet from "../answer/answer.model";
import EvaluatedAnswer from "../answer/evaluatedAnswer.model";

export class ResultsService {
  static async getResults(paperId: string) {
    const questionPaper = await QuestionPaper.findByPk(paperId, {
      attributes: ["id", "mode", "fileUrl", "totalMarks", "status", "errorMessage"],
    });

    if (!questionPaper) throw new Error("Question paper not found");

    const answers = await AnswerSheet.findAll({
      where: { questionPaperId: paperId },
      attributes: ["id", "status", "totalScore", "errorMessage", "createdAt", "updatedAt"],
      order: [["id", "ASC"]],
    });

    return {
      questionPaper,
      answers,
    };
  }

//   static async getQuestionPaper(paperId: number) {
//     const paper = await QuestionPaper.findByPk(paperId);

//     if (!paper) throw new Error("Question paper not found");

//     return {
//       fileUrl: paper.fileUrl,
//       mimeType: "application/pdf",
//     };
//   }

static async getQuestionPaper(paperId: string) {
  const paper = await QuestionPaper.findByPk(paperId);

  if (!paper) throw new Error("Question paper not found");

  if (paper.mode === "typed") {
    return {
      type: "text",
      rawText: paper.rawText,
    };
  }

  return {
    type: "file",
    fileUrl: paper.fileUrl,
    mimeType: paper.fileMimeType || "application/pdf",
  };
}


  static async getAnswerSheet(answerId: string) {
  const answer = await AnswerSheet.findByPk(answerId, {
    include: [
      {
        model: EvaluatedAnswer,
        as: "evaluatedAnswers",
      },
    ],
  });

  if (!answer) throw new Error("Answer sheet not found");

  return {
    id: answer.id,
    questionPaperId: answer.questionPaperId,
    answerSheetFiles: answer.answerSheetFiles,
    answers: answer.evaluatedAnswers,
    totalScore: answer.totalScore,
    feedback: answer.feedback,
    status: answer.status,
    errorMessage: answer.errorMessage,
  };
}

}