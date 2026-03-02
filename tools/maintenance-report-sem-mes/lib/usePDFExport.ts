// ============================================================
// PDF EXPORT HOOK - Captures report as PDF using html2canvas + jsPDF
// ============================================================
import { useCallback, useState } from "react";
import type { PeriodType, DateRange } from "../types";

export function usePDFExport(
  reportRef: React.RefObject<HTMLDivElement | null>
) {
  const [exporting, setExporting] = useState(false);

  const exportPDF = useCallback(
    async (periodType?: PeriodType, dateRange?: DateRange | null) => {
      if (!reportRef.current) return;
      setExporting(true);
      try {
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
          import("html2canvas-pro"),
          import("jspdf"),
        ]);

        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 10;
        const contentWidth = pdfWidth - margin * 2;
        const contentHeight = pdfHeight - margin * 2;

        // Scale image to fit A4 width
        const ratio = contentWidth / (imgWidth / 2); // /2 because scale:2
        const scaledHeight = (imgHeight / 2) * ratio;

        const pdf = new jsPDF("p", "mm", "a4");
        const totalPages = Math.ceil(scaledHeight / contentHeight);

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();

          // Calculate the source crop for this page
          const sourceY = (page * contentHeight) / ratio * 2;
          const sourceHeight = Math.min(
            (contentHeight / ratio) * 2,
            imgHeight - sourceY
          );

          if (sourceHeight <= 0) break;

          // Create a temporary canvas for this page slice
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext("2d");
          if (!ctx) continue;

          ctx.drawImage(
            canvas,
            0,
            sourceY,
            imgWidth,
            sourceHeight,
            0,
            0,
            imgWidth,
            sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL("image/png");
          const pageHeight = (sourceHeight / 2) * ratio;

          pdf.addImage(pageImgData, "PNG", margin, margin, contentWidth, pageHeight);
        }

        // Generate filename
        const dateStr = dateRange
          ? new Date(dateRange.start).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        const fileName = `reporte-${periodType ?? "custom"}-${dateStr}.pdf`;
        pdf.save(fileName);
      } catch (err) {
        console.error("PDF export error:", err);
      } finally {
        setExporting(false);
      }
    },
    [reportRef]
  );

  return { exportPDF, exporting };
}
