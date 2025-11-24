import { z } from "zod";

export const submitAnswerSchema = z.object({
  questionPaperId: z
    .string()
    .uuid("Invalid Question Paper ID."),

  answerSheetFiles: z.array(
    z.object({
      fileUrl: z.string().url("Invalid file URL."),
      mimeType: z.string(),
    })
  ).min(1, "At least one answer sheet file is required."),
});

export const retryAnswerSchema = z.object({
  id: z.string().uuid("Invalid AnswerSheet ID."),
});
