import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import logger from "../config/logger";

dotenv.config({ path: ".env.development" });

const apiKey = process.env.GEMINI_API_KEY as string;
const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
  model: "gemini-2.5-pro",
});

(async () => {
  try {
    const prompt = "Hello Gemini! can you give me basic server code in expresss";
    const result = await model.generateContent(prompt);
    logger.info(result.response.text());
  } catch (error) {
    logger.error(error);
  }
})();
