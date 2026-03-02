// ============================================================
// PDF Text Extractor (server-only)
// ============================================================

// pdf-parse ESM/CJS interop – the ESM build has no default export,
// but the CJS runtime module does; @ts-expect-error suppresses the type error.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (
  dataBuffer: Buffer,
  options?: Record<string, unknown>
) => Promise<{ text: string; numpages: number }>;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text ?? "";
  } catch (err) {
    console.error("[AurisLM] PDF extraction error:", err);
    throw new Error("No se pudo extraer el texto del PDF.");
  }
}
