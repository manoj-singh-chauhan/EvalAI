"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerService = void 0;
const answer_model_1 = __importDefault(require("./answer.model"));
const question_model_1 = __importDefault(require("../modules/question.model"));
const generative_ai_1 = require("@google/generative-ai");
const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
class AnswerService {
    static async evaluateAnswers(questionPaperId, answers) {
        const paper = await question_model_1.default.findByPk(questionPaperId);
        if (!paper)
            throw new Error("Question paper not found.");
        const questions = paper.questions;
        const prompt = `
You are a strict but fair evaluator.
Compare each student's answer with the correct question.
Give marks based on understanding, correctness, and clarity.
Return JSON only.

Example:
{
  "evaluation": [
    { "qNo": 1, "score": 4, "feedback": "Good explanation but missed one point" },
    { "qNo": 2, "score": 9, "feedback": "Excellent and complete answer" }
  ],
  "totalScore": 13
}

Questions:
${JSON.stringify(questions, null, 2)}

Answers:
${JSON.stringify(answers, null, 2)}
`;
        const aiRes = await model.generateContent(prompt);
        const text = aiRes.response.text().replace(/```json|```/g, "").trim();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            throw new Error("Failed to parse AI response. Try again.");
        }
        const saved = await answer_model_1.default.create({
            questionPaperId,
            answers,
            totalScore: parsed.totalScore,
            feedback: JSON.stringify(parsed.evaluation),
        });
        return saved;
    }
    static async getAnswersByPaper(paperId) {
        return await answer_model_1.default.findOne({ where: { questionPaperId: paperId } });
    }
}
exports.AnswerService = AnswerService;
