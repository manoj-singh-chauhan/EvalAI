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
import { ANSWER_EVAL_PROMPT, ANSWER_EXTRACTION_PROMPT } from "../../utils/prompt";

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
    await answerQueue.add("evaluate-answer", job);
  }

  
  static async extractAnswersFromPage(mimeType: string, base64: string) {
    const aiRes = await model.generateContent({
      generationConfig: { responseMimeType: "application/json" },
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

    const raw = aiRes.response.text().trim();
    const clean = raw.replace(/```json|```/g, "");
    return JSON.parse(clean);
  }

  
  static async evaluateExtractedAnswers(questions: any[], answers: any) {
    const aiRes = await model.generateContent({
      generationConfig: { responseMimeType: "application/json" },
      contents: [
        {
          role: "user",
          parts: [
            { text: ANSWER_EVAL_PROMPT },
            { text: JSON.stringify({ questions, answers }) },
          ],
        },
      ],
    });

    const raw = aiRes.response.text().trim();
    const clean = raw.replace(/```json|```/g, "");
    return JSON.parse(clean);
  }

  
  static async processAnswerJob(
    recordId: string,
    questionPaperId: string,
    _incomingFiles: { fileUrl: string; mimeType: string }[]
  ) {
    const record = await AnswerSheet.findByPk(recordId, {
      include: [{ model: AnswerSheetFile, as: "files" }],
    });

    if (!record) return;

    const answerSheetFiles = record.files.map((f: any) => ({
      fileUrl: f.fileUrl,
      mimeType: f.fileType,
    }));

    await record.update({ status: "processing", errorMessage: null });
    this.emitStatus(recordId, "Reading answer sheet pages…");

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

        const extracted = await this.extractAnswersFromPage(
          f.mimeType,
          base64
        );

        // if (extracted.answers) {
        //   for (const ans of extracted.answers) {
        //     mergedAnswers[ans.questionNumber] = ans.studentAnswer;
        //   }
        // }

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
      const evaluated = await this.evaluateExtractedAnswers(
        questions,
        mergedAnswers
      );

      console.log("Evaluation result:", evaluated);


      if (!evaluated.evaluated) {
        throw new Error("AI did not return evaluation output.");
      }

      
      await EvaluatedAnswer.destroy({ where: { answerSheetId: recordId } });

      for (const ans of evaluated.evaluated) {
        const match = questions.find((q: any) => q.number === ans.questionNumber);

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
