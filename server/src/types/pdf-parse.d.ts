declare module "pdf-parse" {
  interface PDFData {
    text: string;
    info?: any;
    metadata?: any;
    version?: string;
    numpages?: number;
    numrender?: number;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;

  export = pdfParse;
}
