// ============================================================
// PDF Text Extractor (server-only)
// ============================================================
//
// pdf-parse (v1 & v2) attempts to read test fixture files at module load
// time when required via its index.js entry point. In production containers
// those fixture files don't exist and the require() throws, which would crash
// the entire route module. We use a lazy require of the internal implementation
// file to avoid that, with a fallback to the top-level export.

type PdfParseResult = { text: string; numpages: number };
type PdfParseFn = (buf: Buffer, opts?: Record<string, unknown>) => Promise<PdfParseResult>;

function loadPdfParse(): PdfParseFn {
  // Try the internal implementation path first (avoids test-file side-effect)
  for (const mod of ["pdf-parse/lib/pdf-parse", "pdf-parse"]) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const m = require(mod) as PdfParseFn | { default: PdfParseFn };
      return typeof m === "function" ? m : m.default;
    } catch {
      // try next path
    }
  }
  throw new Error("pdf-parse module not found");
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = loadPdfParse();
    const data = await pdfParse(buffer, { max: 0 }); // max:0 = all pages
    const text = data.text ?? "";
    if (!text.trim()) throw new Error("El PDF no contiene texto seleccionable (puede ser una imagen escaneada).");
    return text;
  } catch (err) {
    console.error("[AurisLM] PDF extraction error:", err);
    const msg = err instanceof Error ? err.message : "No se pudo extraer el texto del PDF.";
    throw new Error(msg);
  }
}
