"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const question_model_1 = __importDefault(require("./question.model"));
const generative_ai_1 = require("@google/generative-ai");
const cloudinaryUpload_1 = require("../../utils/cloudinaryUpload");
const ocrExtractor_1 = require("../../utils/ocrExtractor");
const aiPromptBuilder_1 = require("../../utils/aiPromptBuilder");
// const pdfParse = require("pdf-parse");
const pdfParse = require("pdf-parse");
const pdfToImage_1 = require("../../utils/pdfToImage"); // add this import
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
const cleanText = (text) => text
    .replace(/\r?\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/Q\s*(\d+)/gi, "Q$1.")
    .trim();
const validateQuestionFormat = (text) => {
    const regex = /Q\d+[\.\)]\s*.+\(\d+\s*Marks?\)/i;
    return regex.test(text);
};
class QuestionService {
    static async createTyped(data) {
        try {
            if (!data?.text || data.text.trim().length < 10) {
                throw new Error("Please enter a valid question text.");
            }
            const rawText = cleanText(data.text);
            if (!validateQuestionFormat(rawText)) {
                throw new Error("Invalid format. Please use: Q1. Define Networking (5 Marks)");
            }
            const prompt = `
You are an intelligent question extractor.
Extract all questions and their marks from the following text.
Only include questions that clearly mention marks in parentheses.
If marks are missing, skip that question.
Return **only valid JSON**, no extra text or explanation.

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
            let parsed = { questions: [], totalMarks: 0 };
            let aiFailed = false;
            try {
                const aiRes = await model.generateContent(prompt);
                const text = aiRes.response.text().trim();
                const cleaned = text.replace(/```json|```/g, "").trim();
                parsed = JSON.parse(cleaned);
            }
            catch {
                aiFailed = true;
                console.warn("AI parsing failed, using regex fallback.");
            }
            if (!parsed.questions || parsed.questions.length === 0) {
                const regex = /Q?\s*\d+[\.\)]\s*(.+?)\s*\((\d+)\s*Marks?\)/gi;
                const matches = [];
                let m;
                while ((m = regex.exec(rawText)) !== null) {
                    matches.push({
                        qNo: matches.length + 1,
                        text: m[1].trim(),
                        marks: Number(m[2]),
                    });
                }
                parsed.questions = matches;
                parsed.totalMarks = matches.reduce((a, b) => a + b.marks, 0);
            }
            if (!parsed.questions || parsed.questions.length === 0) {
                throw new Error("Please enter valid format: Q1. Define Computer Network (5 Marks)");
            }
            const invalids = parsed.questions.filter((q) => !q.text || !q.marks || isNaN(q.marks) || q.marks <= 0);
            if (invalids.length > 0) {
                throw new Error(`${invalids.length} question(s) missing marks or invalid format.`);
            }
            const paper = await question_model_1.default.create({
                mode: "typed",
                questions: parsed.questions,
                totalMarks: parsed.totalMarks,
            });
            return {
                success: true,
                data: paper,
                warnings: aiFailed
                    ? ["AI fallback used. Check extracted questions."]
                    : [],
            };
        }
        catch (error) {
            console.error("Typed paper error:", error.message);
            return {
                success: false,
                message: error.message ||
                    "Please enter valid format like: Q1. Define AI (5 Marks)",
            };
        }
    }
    static async createFromUpload(fileBuffer, mimeType) {
        try {
            console.log("Uploading file to Cloudinary...");
            const uploadRes = (await (0, cloudinaryUpload_1.uploadToCloudinary)(fileBuffer, "question-papers"));
            if (!uploadRes?.secure_url) {
                throw new Error("Cloudinary upload failed — no URL returned.");
            }
            const fileUrl = uploadRes.secure_url;
            let extractedText = "";
            console.log("Extracting text from file...");
            //       if (mimeType.includes("pdf")) {
            //   console.log("Extracting PDF using pdf-parse...");
            //   const data = await pdfParse(fileBuffer);
            //   extractedText = data.text?.trim() || "";
            // }else if (mimeType.includes("image")) {
            //         extractedText = await extractTextFromImage(fileUrl);
            //       } else {
            //         throw new Error(
            //           "Unsupported file type. Please upload PDF or Image only."
            //         );
            //       }
            if (mimeType.includes("pdf")) {
                console.log("Extracting PDF using pdf-parse...");
                const data = await pdfParse(fileBuffer);
                extractedText = data.text?.trim() || "";
                if (!extractedText || extractedText.length < 10) {
                    console.log(" No text found — converting PDF pages to images...");
                    const imageList = await (0, pdfToImage_1.convertPdfToImages)(fileBuffer);
                    if (imageList.length === 0)
                        throw new Error("PDF to image conversion failed.");
                    console.log("Running OCR on converted images...");
                    let ocrText = "";
                    for (const imgBuffer of imageList) {
                        try {
                            const { data } = await tesseract_js_1.default.recognize(imgBuffer, "eng");
                            ocrText += data.text + "\n";
                        }
                        catch (err) {
                            console.error("OCR failed on one page:", err.message);
                        }
                    }
                    extractedText = ocrText.trim();
                }
            }
            else if (mimeType.includes("image")) {
                extractedText = await (0, ocrExtractor_1.extractTextFromImage)(fileUrl);
            }
            else {
                throw new Error("Unsupported file type. Please upload PDF or Image only.");
            }
            if (!extractedText || extractedText.length < 20) {
                throw new Error("Failed to extract text. Please upload a clearer document.");
            }
            console.log("Sending extracted text to Gemini for parsing...");
            const prompt = (0, aiPromptBuilder_1.buildQuestionExtractionPrompt)(extractedText);
            const aiRes = await model.generateContent(prompt);
            const textResponse = aiRes.response.text().trim();
            const cleanResponse = textResponse.replace(/```json|```/g, "").trim();
            let parsedData = {};
            try {
                parsedData = JSON.parse(cleanResponse);
            }
            catch {
                console.error("Failed to parse AI response — using fallback.");
                parsedData = { questions: [], totalMarks: 0 };
            }
            if (!parsedData.questions || parsedData.questions.length === 0) {
                throw new Error("No valid questions found in uploaded file. Please check format.");
            }
            const invalids = parsedData.questions.filter((q) => !q.text || !q.marks || isNaN(q.marks) || q.marks <= 0);
            if (invalids.length > 0) {
                throw new Error(`${invalids.length} question(s) missing marks or invalid format.`);
            }
            console.log("Successfully extracted questions!");
            const paper = await question_model_1.default.create({
                mode: "upload",
                fileUrl,
                questions: parsedData.questions,
                totalMarks: parsedData.totalMarks || 0,
            });
            return {
                success: true,
                data: paper,
                extractedFrom: fileUrl,
                message: "File processed successfully!",
            };
        }
        catch (error) {
            console.error("Upload processing failed:", error.message);
            return {
                success: false,
                message: error.message ||
                    "Failed to process uploaded file. Please upload a valid paper.",
            };
        }
    }
}
exports.QuestionService = QuestionService;
