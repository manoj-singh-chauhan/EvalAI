import { z } from "zod";

export const typedQuestionSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required.")
    .min(10, "Question text must be at least 10 characters."),
});

export const fileJobSchema = z.object({
  fileUrl: z.string().min(1, "File URL is required.").url("Invalid file URL."),

  mimeType: z
    .string()
    .min(1, "MimeType is required.")
    .min(3, "Invalid mimeType."),
});

// export const retrySchema = z.object({
//   id: z
//     .string()
//     .min(1, "ID is required.")
//     .refine((val) => !isNaN(Number(val)), "Invalid ID format."),
// });

export const retrySchema = z.object({
  id: z.string().uuid("Invalid ID format."),
});
