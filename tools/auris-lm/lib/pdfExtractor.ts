// ============================================================
// PDF Text Extractor (server-only)
// ============================================================

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Lazy require to avoid module-level side-effects in pdf-parse
    // (some versions attempt to read test fixture files at import time,
    //  which crashes the entire route module in production containers).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse") as (
      dataBuffer: Buffer,
      options?: Record<string, unknown>
    ) => Promise<{ text: string; numpages: number }>;
    const data = await pdfParse(buffer);
    return data.text ?? "";
  } catch (err) {
    console.error("[AurisLM] PDF extraction error:", err);
    throw new Error("No se pudo extraer el texto del PDF.");
  }
}
