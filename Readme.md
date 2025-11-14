1. Who wrote the play "Romeo and Juliet"? (10 Marks)
 2. What is the chemical formula for water? (5 Marks)
 3. Explain the difference between hardware and software. (10 Marks)
 4. What is 15 × 6? (5 Marks)
 5. Define "photosynthesis" in your own words. (15 Marks)
 6. If you have a bag with 5 red balls and 10 blue balls, what is the probability of picking a red ball? (15
 Marks)
 7. What are the primary colors? (20 Marks)

 // import Tesseract from "tesseract.js";
// import pdfParse from "pdf-parse";
// import logger from "../config/logger";

// export const extractTextFromFile = async (
//   fileBuffer: Buffer,
//   mimeType: string
// ): Promise<string> => {
//   let extractedText = "";
//   logger.info(`Extracting text of  ${mimeType}`);

//   if (mimeType.includes("pdf")) {
//     logger.info("Extracting text from PDF using pdf-parse...");
//     try {
//       const data = await pdfParse(fileBuffer);
//       extractedText = data.text?.trim() || "";
//     } catch (e: any) {
//       logger.error(`pdf-parse failed: ${e.message}`);
//       throw new Error("Failed to parse PDF file.");
//     }

//     if (!extractedText) {
//       logger.warn(
//         "PDF contained no text. This might be a scanned (image-only) PDF."
//       );

//       return "";
//     }
//   } else if (
//     mimeType.includes("image") ||
//     mimeType.includes("png") ||
//     mimeType.includes("jpeg")
//   ) {
//     logger.info("Extracting text from image using Tesseract OCR...");
//     try {
//       const { data } = await Tesseract.recognize(fileBuffer, "eng");
//       extractedText = data.text;
//     } catch (e: any) {
//       logger.error(`Tesseract OCR failed: ${e.message}`);
//       throw new Error("Failed to run OCR on image.");
//     }
//   } else {
//     logger.warn(`Unsupported file type: ${mimeType}`);
//     throw new Error(`Unsupported file type: ${mimeType}`);
//   }

//   return extractedText.trim();
// };