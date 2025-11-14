"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuestionExtractionPrompt = void 0;
const buildQuestionExtractionPrompt = (rawText) => `
You are an assistant that extracts structured exam questions from text.
Convert the following into clean JSON only (no extra text).

Text:
${rawText}

Return JSON in this exact format:
{
  "title": "Exam Title",
  "questions": [
    { "qNo": 1, "text": "Question text", "marks": 5 }
  ],
  "totalMarks": 50
}
`;
exports.buildQuestionExtractionPrompt = buildQuestionExtractionPrompt;
