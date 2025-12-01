import { Router } from "express";
import { SubmissionController } from "./submissions.controller";

const router = Router();

router.get("/", SubmissionController.getAllSubmissions);
router.get("/:id", SubmissionController.getSubmissionDetails);

export default router;
