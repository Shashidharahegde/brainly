import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { getPdfPath } from "../../utils/pdfFiles.js";

export async function extractPdfText(pdf) {
  if (!pdf?.filename) return "";

  const data = await readFile(getPdfPath(pdf.filename));
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const text = result.text?.trim() ?? "";
    if (!text) {
      throw new Error(`No extractable text found in PDF: ${pdf.originalName}`);
    }
    return text;
  } finally {
    await parser.destroy();
  }
}
