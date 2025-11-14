import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";
import logger from "../config/logger";
import PDFParser from "pdf2json";


const extractPdfUsingPdf2Json = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err);
    });

    pdfParser.on("pdfParser_dataReady", (data) => {
      let text = "";

      try {
        data.Pages.forEach((page) => {
          page.Texts.forEach((t) => {
            t.R.forEach((r) => {
              text += decodeURIComponent(r.T) + " ";
            });
          });
        });
      } catch (err) {
        return reject("Failed to extract text using pdf2json");
      }

      resolve(text.trim());
    });

    pdfParser.parseBuffer(fileBuffer);
  });
};

export const extractTextFromFile = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  let extractedText = "";
  logger.info(`Extracting text of ${mimeType}`);

  if (mimeType.includes("pdf")) {
    logger.info("Extracting text from PDF using pdf-parse...");

    try {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text?.trim() || "";
    } catch (e) {
      logger.warn("pdf-parse failed. Trying fallback parser pdf2json...");
      extractedText = await extractPdfUsingPdf2Json(fileBuffer);
    }

    if (!extractedText) {
      logger.warn("PDF contained no text. Might be scanned.");
      return "";
    }
  }


  else if (
    mimeType.includes("image") ||
    mimeType.includes("png") ||
    mimeType.includes("jpeg") ||
    mimeType.includes("jpg")
  ) {
    logger.info("Extracting text from image using Tesseract OCR...");

    try {
      const { data } = await Tesseract.recognize(fileBuffer, "eng");
      extractedText = data.text;
    } catch (e: any) {
      logger.error(`Tesseract OCR failed: ${e.message}`);
      throw new Error("Failed to run OCR on image.");
    }
  }


  else {
    logger.warn(`Unsupported file type: ${mimeType}`);
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  return extractedText.trim();
};
