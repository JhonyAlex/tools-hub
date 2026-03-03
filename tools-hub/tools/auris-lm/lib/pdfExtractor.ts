// ============================================================
// PDF Text Extractor (server-only)
// ============================================================
//
// pdf-parse is listed in `serverExternalPackages` in next.config.ts so Next.js
// leaves it as a native require() in the standalone server output instead of
// trying to bundle it with webpack. Using a top-level import here ensures the
// module resolution works correctly at runtime.
import pdfParse from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer, { max: 0 });
    const text = data.text ?? "";
    if (!text.trim()) {
      throw new Error(
        "El PDF no contiene texto seleccionable. " +
        "Puede ser un documento escaneado (imagen). " +
        "Intenta convertirlo a texto antes de subirlo."
      );
    }
    return text;
  } catch (err) {
    console.error("[AurisLM] PDF extraction error:", err);
    const msg = err instanceof Error ? err.message : "No se pudo extraer el texto del PDF.";
    throw new Error(msg);
  }
}

