"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./config/logger"));
dotenv_1.default.config({ path: ".env.development" });
const apiKey = process.env.GEMINI_API_KEY;
const model = new generative_ai_1.GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: "gemini-2.5-pro",
});
(async () => {
    try {
        const prompt = "Hello Gemini! can you give me basic server code in node expresss";
        const result = await model.generateContent(prompt);
        logger_1.default.info(result.response.text());
    }
    catch (error) {
        logger_1.default.error(error);
    }
})();
