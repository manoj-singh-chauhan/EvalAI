"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMode = exports.uploadQuestionSchema = exports.typedQuestionSchema = void 0;
const zod_1 = require("zod");
/**
 * ✅ Validation for typed question paper input
 * Used when user types questions manually (text format)
 */
exports.typedQuestionSchema = zod_1.z.object({
    mode: zod_1.z.literal("typed"),
    text: zod_1.z
        .string()
        .min(10, "Question paper text must contain at least 10 characters"),
});
/**
 * ✅ Validation for upload-based submission
 * Used when user uploads PDF/Image file
 */
exports.uploadQuestionSchema = zod_1.z.object({
    body: zod_1.z.object({
        mode: zod_1.z.literal("upload"),
    }),
});
/**
 * ✅ Utility function (optional)
 * You can reuse this anywhere to verify mode type easily
 */
const validateMode = (mode) => {
    if (mode !== "typed" && mode !== "upload") {
        throw new Error("Invalid mode! Only 'typed' or 'upload' are supported.");
    }
};
exports.validateMode = validateMode;
