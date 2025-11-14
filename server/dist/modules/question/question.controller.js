"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionController = void 0;
const question_service_1 = require("./question.service");
const question_validation_1 = require("./question.validation");
class QuestionController {
    static async createTyped(req, res) {
        try {
            const validated = question_validation_1.typedQuestionSchema.parse(req.body);
            const result = await question_service_1.QuestionService.createTyped(validated);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async uploadPaper(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded. Please attach a file.",
                });
            }
            question_validation_1.uploadQuestionSchema.parse({
                body: { mode: "upload" },
            });
            const result = await question_service_1.QuestionService.createFromUpload(req.file.buffer, req.file.mimetype);
            return res.status(201).json({
                success: true,
                message: "File uploaded and processed successfully!",
                data: result,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "File upload failed",
            });
        }
    }
}
exports.QuestionController = QuestionController;
