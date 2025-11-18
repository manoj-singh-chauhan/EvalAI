import { Router } from "express";
import { ResultsController } from "./results.controller";

const router = Router();

router.get("/:paperId", ResultsController.getResults);
router.get("/:paperId/question-paper", ResultsController.getQuestionPaper);
router.get("/sheet/:answerId", ResultsController.getAnswerSheet);
export default router;