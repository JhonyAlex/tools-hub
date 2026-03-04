// ============================================================
// PDF to Images — Renderiza páginas de PDF a PNG usando pdfjs-dist + canvas
// ============================================================
// Requiere: npm install pdfjs-dist canvas
// Ambos paquetes deben estar en serverExternalPackages en next.config.ts

import { createCanvas } from "canvas";

const MAX_PAGES = 20;
const RENDER_SCALE = 2; // ~150 DPI para A4

/**
 * Renderiza cada página del PDF como un buffer PNG.
 * Limitado a MAX_PAGES páginas para evitar timeouts y costos excesivos.
 */
export async function pdfPagesToPng(pdfBuffer: Buffer): Promise<Buffer[]> {
  // Dynamic import para evitar problemas de bundling con ESM
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(pdfBuffer);
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  const pageCount = Math.min(doc.numPages, MAX_PAGES);
  const pngBuffers: Buffer[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const nodeCanvas = createCanvas(viewport.width, viewport.height);
    const ctx = nodeCanvas.getContext("2d");

    // node-canvas context es compatible con pdfjs-dist en runtime
    await page.render({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvasContext: ctx as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas: nodeCanvas as any,
      viewport,
    }).promise;

    const pngBuffer = nodeCanvas.toBuffer("image/png");
    pngBuffers.push(pngBuffer);

    page.cleanup();
  }

  await doc.destroy();
  return pngBuffers;
}
