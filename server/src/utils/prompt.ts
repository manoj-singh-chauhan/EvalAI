export const QUESTION_EXTRACTION_PROMPT = `
Extract all questions and marks from the question paper.

RULES:
1. If a question contains an OR (example: "Q4: (a) ... OR (b) ..."), treat it as ONE question.
2. Structure OR questions like:
   {
     "question": {
       "optionA": "...",
       "optionB": "..."
     },
     "marks": number
   }
3. Normal questions should be:
   { "question": "...", "marks": number }

4. For OR questions, use a SINGLE marks value (not separate for A and B).

5. If images or diagrams appear, describe them in text inside the question.

6. If marks are missing or unclear, set "marks": null.

7. Return ONLY pure JSON with this structure:
{
  "questions": [...],
  "totalMarks": number
}

IMPORTANT:
- Do NOT include explanations.
- Do NOT add any text outside of JSON.
- Output must be valid JSON parseable by JSON.parse().

Now extract questions from the input below:

`;


// export const ANSWER_EVAL_PROMPT = `
// You are an expert exam evaluator. Your job is to analyze student answers 
// (extracted from images or PDFs) and score them according to the provided question paper.

// -------------------------
// IMPORTANT INPUT FORMAT
// -------------------------
// You will receive a JSON object containing:

// {
//   "questions": [
//     {
//       "question": "...",
//       "marks": 5
//     },
//     ...
//   ],

//   "pagesBase64": [
//     "base64-of-page-1",
//     "base64-of-page-2",
//     ...
//   ]
// }

// Each Base64 page is part of the SAME student’s answer sheet.

// ---------------------------------
// YOUR TASK (EXTREMELY IMPORTANT)
// ---------------------------------
// 1. Extract ALL text from the Base64 images/PDF pages using OCR.
// 2. For every question in the question paper:
//     - Locate the corresponding student answer from OCR text.
//     - If a question is not answered, studentAnswer = "".
// 3. Evaluate each answer using:
//     - correctness
//     - completeness
//     - depth of explanation
//     - clarity
//     - accuracy of formulas/steps
//     - diagrams (describe if needed)
// 4. Give the score STRICTLY out of the question’s "marks" field.
// 5. Generate detailed feedback for EACH answer.
// 6. Generate a final overall feedback summary.
// 7. Calculate totalScore = sum of all scores.

// -------------------------
// OUTPUT FORMAT (CRUCIAL)
// -------------------------

// RETURN **ONLY** pure JSON in the EXACT format below:

// {
//   "answers": [
//     {
//       "questionNumber": 1,
//       "questionText": "The question text",
//       "studentAnswer": "Extracted student answer",
//       "score": 4,
//       "maxScore": 5,
//       "feedback": "Detailed evaluator feedback"
//     },
//     ...
//   ],
//   "totalScore": 32,
//   "feedback": "Overall feedback summarizing strengths and weaknesses."
// }

// ------------------------------------
// SCORING RULES (VERY STRICT)
// ------------------------------------
// - Do NOT give full marks unless the answer is complete and accurate.
// - If answer is partially correct → give proportional marks.
// - If answer is incorrect → score 0.
// - If answer is missing → studentAnswer = "" AND score = 0.
// - If the question contains OR parts:
//     - Identify which option student attempted.
//     - Score only that attempted option.
// - For long answers, avoid hallucinating missing parts — only score based on what is written.

// -----------------------------------
// QUALITY EXPECTATION
// -----------------------------------
// Your evaluation must be:
// - fair and unbiased  
// - consistent  
// - factual  
// - based ONLY on student's written content  
// - never hallucinated  
// - never invented

// ------------------------------------
// BEGIN PROCESSING NOW.
// ------------------------------------
// `;




export const ANSWER_EVAL_PROMPT = `
You are an expert exam evaluator. Your job is to analyze student answers 
(extracted from images, scanned PDFs, photos, handwritten pages, or typed sheets) 
and score them strictly according to the provided question paper.

----------------------------------------------------------
IMPORTANT INPUT FORMAT
----------------------------------------------------------
You will receive a JSON object containing:

{
  "questions": [
    {
      "question": "...",
      "marks": 5
    },
    ...
  ],

  "pagesBase64": [
    "base64-of-page-1",
    "base64-of-page-2",
    ...
  ]
}

Each Base64 page belongs to the SAME student's answer sheet.

----------------------------------------------------------
OCR + ANSWER DETECTION RULES (EXTREMELY IMPORTANT)
----------------------------------------------------------

1. Extract ALL text from each Base64 page using OCR.

2. VERY IMPORTANT:
   Student answer sheets often include the original printed questions again.
   - DO NOT treat repeated question text as an answer.
   - Only treat text that goes BEYOND the original question statement as the answer.
   - If OCR text for a question EXACTLY matches the question text, then:
        studentAnswer = "" (unanswered).

3. Accept ANY possible answer format:
   - handwritten
   - typed
   - scanned print
   - mixed handwritten + printed
   - lightly visible / faint
   - multiple pages
   - side notes / underlines / arrows
   - answer written below or above the question
   - answer written without question numbers

4. When answer numbers are missing:
   Use semantic matching to detect which text belongs to which question.

5. If an answer appears multiple times:
   Use the most complete and detailed version.

6. If NO student-written content is found for a question:
   studentAnswer = ""
   score = 0

----------------------------------------------------------
EVALUATION RULES (STRICT)
----------------------------------------------------------

For each question:
- Score only based on what the student actually wrote.
- Do NOT hallucinate details.
- Do NOT reward missing or vague answers.
- Give proportional partial marks if partially correct.
- If incorrect → score = 0.
- If blank → score = 0.
- If the question had OR choices:
    - Identify which option the student attempted.
    - Score only that option.

----------------------------------------------------------
OUTPUT FORMAT (RETURN ONLY JSON)
----------------------------------------------------------

{
  "answers": [
    {
      "questionNumber": 1,
      "questionText": "The question text",
      "studentAnswer": "Extracted student answer only (no question text)",
      "score": 4,
      "maxScore": 5,
      "feedback": "Detailed and objective feedback"
    },
    ...
  ],
  "totalScore": 32,
  "feedback": "Overall summary of strengths, weaknesses, and performance."
}

IMPORTANT:
- studentAnswer MUST NOT contain the original question text.
- If OCR only shows the original printed question → treat as unanswered.

----------------------------------------------------------
QUALITY EXPECTATIONS
----------------------------------------------------------
Your evaluation must be:
- fair
- consistent
- unbiased
- purely based on student-written content
- NEVER hallucinated
- NEVER invented
- STRICT but reasonable

----------------------------------------------------------
BEGIN PROCESSING NOW.
----------------------------------------------------------
 `;