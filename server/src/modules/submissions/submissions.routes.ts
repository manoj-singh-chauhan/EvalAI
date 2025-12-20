import { Router } from "express";
import { SubmissionController } from "./submissions.controller";

const router = Router();

router.get("/", SubmissionController.getAllSubmissions);
router.get("/:id", SubmissionController.getSubmissionDetails);
router.delete("/:id", SubmissionController.deleteSubmission);

export default router;
