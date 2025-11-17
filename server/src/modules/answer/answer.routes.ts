import express from "express";
import { AnswerController } from "./answer.controller";

const router = express.Router();

router.get(
  "/get-upload-signature",
  AnswerController.getUploadSignature
)

router.post(
  "/submit",
  AnswerController.submitAnswerSheet
);

router.get(
  "/:id",
  AnswerController.getStatus
);

router.post(
  "/:id/retry",
  AnswerController.retryJob
);

export default router;