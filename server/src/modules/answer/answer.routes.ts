import express from "express";
import { AnswerController } from "./answer.controller";

const router = express.Router();

router.get("/get-upload-signature", AnswerController.getUploadSignature);

router.post("/submit-files/:paperId", AnswerController.submitFileJobs);

router.post("/submit-typed/:paperId", AnswerController.submitTypedJob);

export default router;
