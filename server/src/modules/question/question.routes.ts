import express from "express";
import { QuestionController } from "./question.controller"; 

const router = express.Router();

router.get(
  "/get-upload-signature",
  QuestionController.getUploadSignature
);

router.post(
  "/submit-file-job",
  QuestionController.submitFileJob 
);

router.post(
  "/submit-typed-job",
  QuestionController.submitTypedJob
);

router.get(
  "/:id", 
  QuestionController.getStatus
);

router.post(
  "/:id/retry", 
  QuestionController.retryJob
);

export default router;