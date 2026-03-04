// ============================================================
// Document Text Extractor (server-only) — AurisLM
// Soporta PDF (texto + OCR), imágenes (OCR) y texto plano.
// ============================================================
//
// pdf-parse is listed in `serverExternalPackages` in next.config.ts so Next.js
// leaves it as a native require() in the standalone server output instead of
// trying to bundle it with webpack. Using a top-level import here ensures the
// module resolution works correctly at runtime.
import pdfParse from "pdf-parse";
import { ocrFromImage } from "@/core/lib/ocrClient";
import { pdfPagesToPng } from "@/core/lib/pdfToImages";

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Umbral: si el texto plano del PDF tiene menos de 50 chars por página,
// se considera que necesita OCR.
const SPARSE_TEXT_THRESHOLD = 50;

/**
 * Extrae texto de un PDF usando pdf-parse (texto plano).
 * Mantiene compatibilidad con llamadas existentes.
 */
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
    const msg =
      err instanceof Error
        ? err.message
        : "No se pudo extraer el texto del PDF.";
    throw new Error(msg);
  }
}

/**
 * Extrae texto de cualquier documento soportado:
 * - Imágenes (JPEG, PNG, WEBP): OCR directo via modelo de visión.
 * - PDF: Texto plano + OCR de páginas si el texto es escaso/ausente.
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  // ── Imagen directa → OCR ──
  if (IMAGE_MIMES.has(mimeType)) {
    console.log("[AurisLM] Imagen detectada, enviando a OCR...");
    const text = await ocrFromImage(buffer, mimeType);
    if (!text.trim()) {
      throw new Error("No se pudo extraer texto de la imagen.");
    }
    return text;
  }

  // ── PDF → texto plano + OCR si necesario ──
  if (mimeType === "application/pdf") {
    return extractPdfHybrid(buffer);
  }

  // Fallback: no debería llegar aquí si se valida el mimeType antes
  throw new Error(`Tipo no soportado en extractor: ${mimeType}`);
}

/**
 * Extracción híbrida de PDF: texto plano + OCR de páginas.
 */
async function extractPdfHybrid(buffer: Buffer): Promise<string> {
  // 1. Extraer texto plano
  let plainText = "";
  let numPages = 1;

  try {
    const data = await pdfParse(buffer, { max: 0 });
    plainText = (data.text ?? "").trim();
    numPages = data.numpages || 1;
  } catch {
    console.warn("[AurisLM] pdf-parse falló, intentando OCR completo...");
  }

  // 2. Determinar si necesita OCR
  const avgCharsPerPage = plainText.length / numPages;
  const needsOcr = avgCharsPerPage < SPARSE_TEXT_THRESHOLD;

  if (!needsOcr && plainText.length > 0) {
    console.log("[AurisLM] PDF con texto suficiente, omitiendo OCR.");
    return plainText;
  }

  // 3. Renderizar páginas a imágenes y hacer OCR
  console.log(
    `[AurisLM] PDF necesita OCR (${Math.round(avgCharsPerPage)} chars/pág). Renderizando páginas...`
  );

  let ocrText = "";
  try {
    const pageImages = await pdfPagesToPng(buffer);
    const ocrResults = await Promise.all(
      pageImages.map((png) => ocrFromImage(png, "image/png"))
    );
    ocrText = ocrResults.filter(Boolean).join("\n\n");
  } catch (err) {
    console.error("[AurisLM] OCR de páginas falló:", err);
    // Si tenemos algo de texto plano, usarlo como fallback
    if (plainText.length > 0) {
      console.warn("[AurisLM] Usando solo texto plano como fallback.");
      return plainText;
    }
    throw new Error(
      "No se pudo extraer texto del PDF. " +
        "Puede ser un documento escaneado y el servicio de OCR no está disponible."
    );
  }

  // 4. Combinar textos
  if (!plainText) return ocrText;
  if (!ocrText) return plainText;

  // Deduplicar: quitar líneas del OCR que ya aparecen en el texto plano
  const plainLines = new Set(
    plainText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10)
  );

  const uniqueOcrLines = ocrText
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !plainLines.has(trimmed);
    })
    .join("\n");

  if (!uniqueOcrLines.trim()) return plainText;

  return plainText + "\n\n--- Texto extraído por OCR ---\n\n" + uniqueOcrLines;
}
