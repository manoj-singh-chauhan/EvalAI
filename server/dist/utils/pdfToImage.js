"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPdfToImages = void 0;
const pdf2pic_1 = require("pdf2pic");
const convertPdfToImages = async (fileBuffer) => {
    const convert = (0, pdf2pic_1.fromBuffer)(fileBuffer, {
        density: 150,
        format: "png",
        width: 1200,
        height: 1600,
        responseType: "buffer",
    });
    const images = [];
    for (let i = 1; i <= 3; i++) {
        try {
            const result = await convert(i);
            if (result && result.buffer) {
                images.push(result.buffer);
            }
        }
        catch {
            break;
        }
    }
    return images;
};
exports.convertPdfToImages = convertPdfToImages;
