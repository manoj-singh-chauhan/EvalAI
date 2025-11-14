"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerController = void 0;
const answer_service_1 = require("./answer.service");
class AnswerController {
    static async submit(req, res) {
        try {
            const { questionPaperId, answers } = req.body;
            const result = await answer_service_1.AnswerService.evaluateAnswers(questionPaperId, answers);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getByPaper(req, res) {
        try {
            const { paperId } = req.params;
            const result = await answer_service_1.AnswerService.getAnswersByPaper(paperId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AnswerController = AnswerController;
