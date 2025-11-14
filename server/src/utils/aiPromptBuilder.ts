export const buildTypedQuestionPrompt = (rawText: string) => `
You are an intelligent question extractor.
Extract all questions and their marks from the following text.
Only include questions that clearly mention marks in parentheses.
If marks are missing, skip that question.
Return only valid JSON — no explanations or notes.

Example format:
{
  "questions": [
    { "qNo": 1, "text": "Define computer network.", "marks": 5 },
    { "qNo": 2, "text": "Explain OSI model.", "marks": 10 }
  ],
  "totalMarks": 15
}

Now extract from this text:
${rawText}
`;


export const buildUploadQuestionPrompt = (rawText: string) => `
You are an expert AI detective specializing in reading messy, OCR-scanned documents.
The following text was extracted from an exam paper using OCR. It is very dirty, contains noise, garbage text, page numbers, and bad formatting.
Your job is to find and extract only the valid questions.

A valid question:
1. Has a question number (like "Q1", "2.", "Question 3").
2. Has question text.
3. Has marks in parentheses (like "(5 Marks)", "(10)", "Marks: 5").

INSTRUCTIONS:
- Read the messy text carefully.
- IGNORE all garbage text that is not a question (like headers, footers, page numbers).
- Find every valid question, even if the OCR is a bit corrupted.
- Extract the question number (as a number), the full text, and the marks (as a number).
- Calculate the 'totalMarks' by adding all extracted marks.
- If you find NO valid questions, return an empty "questions" array.

Return ONLY a valid JSON object in this format. DO NOT write any explanations.

JSON FORMAT:
{
  "questions": [
    { "qNo": 1, "text": "Question text", "marks": 5 }
  ],
  "totalMarks": 50
}

Now, analyze and extract from this messy text:
---
${rawText}
---
`;


export const buildEvaluationPrompt = (
  questions: any,
  answerText: string
) => `
You are an expert AI exam grader. Your task is to evaluate a student's answer sheet based on the provided question paper.

HERE IS THE QUESTION PAPER (in JSON):
${JSON.stringify(questions, null, 2)}

HERE IS THE STUDENT'S ANSWER SHEET (extracted via OCR, may contain noise or bad formatting):
---
${answerText}
---

INSTRUCTIONS:
1.  Read the question paper carefully.
2.  Read the student's answer text.
3.  Match the student's answers to the correct questions. The student might not label them correctly or might answer out of order.
4.  For each question, grade the student's answer based on the question's text and marks. Be fair and strict, like a real teacher.
5.  Provide brief, constructive feedback for each answer.
6.  Calculate the total marks awarded by summing up the marks for each question.
7.  Ensure the 'totalMarksAwarded' is a number.

Return ONLY a valid JSON object in the following format. Do not include any text, markdown, or explanations before or after the JSON.

JSON FORMAT:
{
  "totalMarksAwarded": <Total marks achieved (Number)>,
  "feedback": [
    {
      "qNo": <Question Number (Number)>,
      "marks": <Marks awarded for this question (Number)>,
      "feedback": "<Your feedback for this specific answer (String)>"
    }
  ]
}

Example:
{
  "totalMarksAwarded": 18,
  "feedback": [
    { "qNo": 1, "marks": 3, "feedback": "Good definition, but missed key details about protocols." },
    { "qNo": 2, "marks": 15, "feedback": "Excellent, comprehensive explanation of all layers." }
  ]
}

Now, please grade the provided answer sheet.
`;