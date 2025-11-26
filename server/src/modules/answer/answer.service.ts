import AnswerSheet from "./answer.model";
import QuestionPaper from "../question/question.model";
import Question from "../question/questionDetail.model";
import EvaluatedAnswer from "./evaluatedAnswer.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { answerQueue } from "../../jobs/answer.queue";
import logger from "../../config/logger";
import { io } from "../../server";
import { ANSWER_EVAL_PROMPT } from "../../utils/prompt";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });

export class AnswerService {
  static emitStatus(recordId: string, message: string) {
    io.emit(`answer-status-${recordId}`, { message });
  }

  static async scheduleAnswerJob(job: {
    recordId: string;
    questionPaperId: string;
    answerSheetFiles: { fileUrl: string; mimeType: string }[];
  }) {
    await answerQueue.add(`evaluate-answer`, job);
  }

  static async processAnswerJob(
    recordId: string,
    questionPaperId: string,
    answerSheetFiles: { fileUrl: string; mimeType: string }[]
  ) {
    const record = await AnswerSheet.findByPk(recordId);
    if (!record) return;

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(recordId, "Processing answer sheet…");

    try {
      const qp = await QuestionPaper.findByPk(questionPaperId, {
        include: [{ model: Question, as: "questions" }],
        order: [[{ model: Question, as: "questions" }, "number", "ASC"]],
      });

      if (!qp) throw new Error("Question paper not found.");
      if (!qp.questions || qp.questions.length === 0)
        throw new Error("No questions found for this paper.");

      const questions = qp.questions.map((q: any) => ({
        id: q.id,
        number: q.number,
        text: q.text,
        marks: q.marks ?? 0,
      }));

      this.emitStatus(recordId, "Reading answer sheet pages…");

      const pagesBase64: string[] = [];
      for (const file of answerSheetFiles) {
        const buffer = await downloadFile(file.fileUrl);
        pagesBase64.push(buffer.toString("base64"));
      }

      this.emitStatus(recordId, "Sending to AI for evaluation…");

      const aiRes = await model.generateContent({
        generationConfig: { responseMimeType: "application/json" },
        contents: [
          {
            role: "user",
            parts: [
              { text: ANSWER_EVAL_PROMPT },
              { text: JSON.stringify({ questions, pagesBase64 }) },
            ],
          },
        ],
      });

      const raw = aiRes.response.text().trim();
      const clean = raw.replace(/```json|```/g, "");
      const parsed = JSON.parse(clean);

      if (!parsed.answers || !Array.isArray(parsed.answers))
        throw new Error("AI did not return valid answers.");

      const normalizedAnswers = parsed.answers.map((ans: any) => {
        const match = questions.find(
          (q: any) => q.number === ans.questionNumber
        );

        return {
          questionId: match?.id || null,
          questionNumber: ans.questionNumber,
          questionText: match?.text || ans.questionText || "",
          studentAnswer: ans.studentAnswer || "",
          score: ans.score ?? 0,
          maxScore: match?.marks ?? 0,
          feedback: ans.feedback || "",
        };
      });

      const totalScore = normalizedAnswers.reduce(
        (sum: number, a: any) => sum + (a.score || 0),
        0
      );

      this.emitStatus(recordId, "Saving normalized results…");

      await EvaluatedAnswer.destroy({
        where: { answerSheetId: recordId },
      });

      for (const ans of normalizedAnswers) {
        await EvaluatedAnswer.create({
          answerSheetId: recordId,
          questionId: ans.questionId,
          questionNumber: ans.questionNumber,
          questionText: ans.questionText,
          studentAnswer: ans.studentAnswer,
          score: ans.score,
          maxScore: ans.maxScore,
          feedback: ans.feedback,
        });
      }

      await record.update({
        totalScore,
        feedback: parsed.feedback || "",
        status: "completed",
      });

      this.emitStatus(recordId, "Completed successfully!");
      return record;
    } catch (err: any) {
      logger.error(`Answer job failed: ${err.message}`);

      await record.update({
        status: "failed",
        errorMessage: err.message,
      });

      this.emitStatus(recordId, "Failed: " + err.message);
      return;
    }
  }
}
