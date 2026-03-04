// ============================================================
// DocChat - Text Extractor (server-only)
// Supports PDF, TXT, MD, JS, TS, CSV, images (OCR), and other plain text formats
// ============================================================

import pdfParse from "pdf-parse";
import { ocrFromImage } from "@/core/lib/ocrClient";

const PLAIN_TEXT_MIMES = new Set([
    "text/plain",
    "text/markdown",
    "text/csv",
    "text/javascript",
    "text/typescript",
    "text/html",
    "text/css",
    "text/xml",
    "application/json",
    "application/javascript",
    "application/xml",
]);

const PLAIN_TEXT_EXTENSIONS = new Set([
    ".txt", ".md", ".markdown", ".csv", ".js", ".jsx",
    ".ts", ".tsx", ".html", ".css", ".xml", ".json",
    ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
    ".sh", ".bash", ".py", ".rb", ".go", ".rs", ".java",
    ".c", ".cpp", ".h", ".hpp", ".sql", ".env", ".log",
]);

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Umbral: si el texto plano del PDF tiene menos de 50 chars por página,
// se considera que necesita OCR.
const SPARSE_TEXT_THRESHOLD = 50;

function getExtension(fileName: string): string {
    const dot = fileName.lastIndexOf(".");
    return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function isPlainText(mimeType: string, fileName: string): boolean {
    if (PLAIN_TEXT_MIMES.has(mimeType)) return true;
    if (mimeType.startsWith("text/")) return true;
    return PLAIN_TEXT_EXTENSIONS.has(getExtension(fileName));
}

function isPdf(mimeType: string, fileName: string): boolean {
    return mimeType === "application/pdf" || getExtension(fileName) === ".pdf";
}

function isImage(mimeType: string, fileName: string): boolean {
    if (IMAGE_MIMES.has(mimeType)) return true;
    const ext = getExtension(fileName);
    return [".png", ".jpg", ".jpeg", ".webp"].includes(ext);
}

export async function extractText(
    buffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<string> {
    // ── Imagen → OCR directo ──
    if (isImage(mimeType, fileName)) {
        console.log("[DocChat] Imagen detectada, enviando a OCR...");
        const ocrMime = IMAGE_MIMES.has(mimeType) ? mimeType : "image/png";
        const text = await ocrFromImage(buffer, ocrMime);
        if (!text.trim()) {
            throw new Error("No se pudo extraer texto de la imagen.");
        }
        return text;
    }

    // ── PDF → texto plano + OCR si necesario ──
    if (isPdf(mimeType, fileName)) {
        return extractPdfHybrid(buffer);
    }

    // ── Texto plano ──
    if (isPlainText(mimeType, fileName)) {
        const text = buffer.toString("utf-8");
        if (!text.trim()) {
            throw new Error("El archivo está vacío.");
        }
        return text;
    }

    throw new Error(
        `Formato no soportado: ${mimeType} (${fileName}). ` +
        "Formatos válidos: PDF, TXT, MD, JS, TS, CSV, JSON, Imágenes (PNG, JPG, WEBP), etc."
    );
}

/**
 * Extracción híbrida de PDF: texto plano + OCR de páginas si es necesario.
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
        console.warn("[DocChat] pdf-parse falló, intentando OCR completo...");
    }

    // 2. Determinar si necesita OCR
    const avgCharsPerPage = plainText.length / numPages;
    const needsOcr = avgCharsPerPage < SPARSE_TEXT_THRESHOLD;

    if (!needsOcr && plainText.length > 0) {
        return plainText;
    }

    // 3. Renderizar páginas a imágenes y hacer OCR
    console.log(
        `[DocChat] PDF necesita OCR (${Math.round(avgCharsPerPage)} chars/pág). Renderizando...`
    );

    let ocrText = "";
    try {
        // Dynamic import para evitar problemas en build time
        const { pdfPagesToPng } = await import("@/core/lib/pdfToImages");
        const pageImages = await pdfPagesToPng(buffer);
        const ocrResults = await Promise.all(
            pageImages.map((png) => ocrFromImage(png, "image/png"))
        );
        ocrText = ocrResults.filter(Boolean).join("\n\n");
    } catch (err) {
        console.error("[DocChat] OCR de páginas falló:", err);
        if (plainText.length > 0) {
            console.warn("[DocChat] Usando solo texto plano como fallback.");
            return plainText;
        }
        throw new Error(
            "El PDF no contiene texto seleccionable y el servicio de OCR no está disponible."
        );
    }

    // 4. Combinar textos
    if (!plainText) return ocrText;
    if (!ocrText) return plainText;

    // Deduplicar líneas
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
