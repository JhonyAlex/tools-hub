// ============================================================
// DocChat - Text Extractor (server-only)
// Supports PDF, TXT, MD, JS, TS, CSV, and other plain text formats
// ============================================================

import pdfParse from "pdf-parse";

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

export async function extractText(
    buffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<string> {
    // PDF extraction
    if (isPdf(mimeType, fileName)) {
        try {
            const data = await pdfParse(buffer, { max: 0 });
            const text = data.text ?? "";
            if (!text.trim()) {
                throw new Error(
                    "El PDF no contiene texto seleccionable. " +
                    "Puede ser un documento escaneado (imagen)."
                );
            }
            return text;
        } catch (err) {
            console.error("[DocChat] PDF extraction error:", err);
            const msg = err instanceof Error ? err.message : "No se pudo extraer el texto del PDF.";
            throw new Error(msg);
        }
    }

    // Plain text extraction
    if (isPlainText(mimeType, fileName)) {
        const text = buffer.toString("utf-8");
        if (!text.trim()) {
            throw new Error("El archivo está vacío.");
        }
        return text;
    }

    throw new Error(
        `Formato no soportado: ${mimeType} (${fileName}). ` +
        "Formatos válidos: PDF, TXT, MD, JS, TS, CSV, JSON, etc."
    );
}
