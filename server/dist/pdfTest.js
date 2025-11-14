"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const pdfParse = require("pdf-parse");
const ocrExtractor_1 = require("./utils/ocrExtractor"); // already in your project
const filePath = "./rightpdf.pdf";
(async () => {
    try {
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const data = await pdfParse(fileBuffer);
        let text = data.text.trim();
        if (!text || text.length < 10) {
            console.log("⚠️ No text layer found — using OCR...");
            // upload or convert to image(s) before OCR if needed
            // assuming extractTextFromImage accepts a file path or URL
            text = await (0, ocrExtractor_1.extractTextFromImage)(filePath);
        }
        console.log("\n✅ Extracted Text:");
        console.log(text.slice(0, 500));
    }
    catch (err) {
        console.error("❌ Error parsing PDF:", err.message);
    }
})();
