import AnswerSheet from "./answer.model";
import AnswerSheetFile from "./answerFile.model";
import QuestionPaper from "../question/question.model";
import Question from "../question/questionDetail.model";
import EvaluatedAnswer from "./evaluatedAnswer.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { downloadFile } from "../../utils/fileDownloader";
import { answerQueue } from "../../jobs/answer.queue";
import logger from "../../config/logger";
import { io } from "../../server";
import {
  ANSWER_EVAL_PROMPT,
  ANSWER_EXTRACTION_PROMPT,
} from "../../utils/prompt";
import { CreditsService } from "../billing/credits.service";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
const model = ai.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "",
});

export class AnswerService {
  static emitStatus(recordId: string, message: string) {
    io.emit(`answer-status-${recordId}`, { message });
  }

  static async scheduleAnswerJob(job: {
    recordId: string;
    questionPaperId: string;
    answerSheetFiles: { fileUrl: string; mimeType: string }[];
  }) {
    await answerQueue.add("evaluate-answer", {
      recordId: job.recordId,
      questionPaperId: job.questionPaperId,
      answerSheetFiles: job.answerSheetFiles,
    });
  }

  static async extractAnswersFromPage(mimeType: string, base64: string) {
    const aiRes = await model.generateContent({
      generationConfig: {
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: ANSWER_EXTRACTION_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
    });
    logger.info({ usage: aiRes.response.usageMetadata },"Answer extraction usage metadata");
    const usage = aiRes.response.usageMetadata;
    const tokens = usage?.totalTokenCount || 0;
    const raw = aiRes.response.text().trim();
    const clean = raw.replace(/```json|```/g, "");
    return {
      data: JSON.parse(clean),
      tokens: tokens,
    };
  }

  static async evaluateExtractedAnswers(
    questions: any[],
    answers: any,
    strictnessLevel: "lenient" | "moderate" | "strict",
  ) {
    const aiRes = await model.generateContent({
      generationConfig: {
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: ANSWER_EVAL_PROMPT(strictnessLevel) },
            { text: JSON.stringify({ questions, answers }) },
          ],
        },
      ],
    });
    logger.info({ usage: aiRes.response.usageMetadata },"Answer evaluation usage metadata");
    const usage = aiRes.response.usageMetadata;
    const tokens = usage?.totalTokenCount || 0;
    const raw = aiRes.response.text().trim();
    const clean = raw.replace(/```json|```/g, "");
    return {
      data: JSON.parse(clean),
      tokens: tokens,
    };
  }

  static async processAnswerJob(
    recordId: string,
    questionPaperId: string,
    _incomingFiles: { fileUrl: string; mimeType: string }[],
  ) {
    const record = await AnswerSheet.findByPk(recordId, {
      include: [{ model: AnswerSheetFile, as: "files" }],
    });

    if (!record) return;

    if (record.createdBy) {
      const balance = await CreditsService.getBalance(record.createdBy);

      if (balance.plan === "free" && balance.credits <= 0) {
        await record.update({
          status: "failed",
          errorMessage: "Daily credit limit reached.",
        });
        this.emitStatus(recordId, "Failed: Daily limit reached.");
        return;
      }
    }
    const strictnessLevel = record.strictnessLevel;

    const answerSheetFiles = record.files.map((f: any) => ({
      fileUrl: f.fileUrl,
      mimeType: f.fileType,
    }));

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(recordId, "Reading answer sheet pages…");
    let totalJobTokens = 0;
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

      let mergedAnswers: any = {};

      for (const f of answerSheetFiles) {
        const buffer = await downloadFile(f.fileUrl);
        const base64 = buffer.toString("base64");

        const result = await this.extractAnswersFromPage(f.mimeType, base64);
        totalJobTokens += result.tokens;
        const extracted = result.data;

        if (extracted.answers) {
          for (const ans of extracted.answers) {
            // Only set answer if not already stored
            if (!mergedAnswers[ans.questionNumber]) {
              mergedAnswers[ans.questionNumber] = ans.studentAnswer;
            }
          }
        }
      }

      this.emitStatus(recordId, "Evaluating extracted answers…");
      const evalResult = await this.evaluateExtractedAnswers(
        questions,
        mergedAnswers,
        strictnessLevel,
      );
      totalJobTokens += evalResult.tokens;
      const evaluated = evalResult.data;

      console.log("Evaluation result:", evaluated);
      logger.info(evaluated,"Evaluation result:");
      if (!evaluated.evaluated) {
        throw new Error("AI did not return evaluation output.");
      }

      await EvaluatedAnswer.destroy({ where: { answerSheetId: recordId } });

      for (const ans of evaluated.evaluated) {
        const match = questions.find(
          (q: any) => q.number === ans.questionNumber,
        );

        await EvaluatedAnswer.create({
          answerSheetId: recordId,
          questionId: match?.id || null,
          questionNumber: ans.questionNumber,
          questionText: match?.text || "",
          studentAnswer: ans.studentAnswer || "",
          score: ans.score ?? 0,
          maxScore: match?.marks ?? 0,
          feedback: ans.feedback || "",
        });
      }
      const cost = Math.ceil(totalJobTokens / 1000);
      const finalCost = Math.max(1, cost);

      if (record.createdBy) {
        await CreditsService.deductExact(
          record.createdBy,
          finalCost,
          "Answer Evaluation",
        );
      }
      await record.update({
        totalScore: evaluated.totalScore || 0,
        feedback: evaluated.feedback || "",
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
