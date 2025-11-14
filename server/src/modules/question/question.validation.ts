import { z } from "zod";

export const typedQuestionSchema = z.object({
  mode: z.literal("typed"),
  text: z
    .string()
    .min(10, "Question paper text must contain at least 10 characters"),
});

export const uploadQuestionSchema = z.object({
  body: z.object({
    mode: z.literal("upload"),
  }),
});

export const validateMode = (mode: string) => {
  if (mode !== "typed" && mode !== "upload") {
    throw new Error("Invalid mode! Only 'typed' or 'upload' are supported.");
  }
};
