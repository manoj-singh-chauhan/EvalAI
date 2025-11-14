"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const question_controller_1 = require("./question.controller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/", question_controller_1.QuestionController.createTyped);
router.post("/upload", upload.single("file"), question_controller_1.QuestionController.uploadPaper);
// router.get("/", QuestionController.getAll);
// router.get("/:id", QuestionController.getById);
exports.default = router;
