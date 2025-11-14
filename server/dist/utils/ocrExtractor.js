"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromImage = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const extractTextFromImage = async (imageUrl) => {
    const result = await tesseract_js_1.default.recognize(imageUrl, "eng");
    return result.data.text;
};
exports.extractTextFromImage = extractTextFromImage;
