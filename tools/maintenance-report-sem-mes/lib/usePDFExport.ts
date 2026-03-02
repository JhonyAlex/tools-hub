// ============================================================
// PDF EXPORT HOOK - Uses browser print to generate PDFs with selectable text
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
        // Collect all stylesheets from the current document
        const styleSheets = Array.from(document.styleSheets);
        let cssText = "";
        for (const sheet of styleSheets) {
          try {
            const rules = Array.from(sheet.cssRules);
            for (const rule of rules) {
              cssText += rule.cssText + "\n";
            }
          } catch {
            // Cross-origin stylesheets can't be read; fetch via link href
            if (sheet.href) {
              try {
                const res = await fetch(sheet.href);
                cssText += await res.text();
              } catch {
                // skip unreachable sheets
              }
            }
          }
        }

        // Generate filename for the title
        const dateStr = dateRange
          ? new Date(dateRange.start).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        const fileName = `reporte-${periodType ?? "custom"}-${dateStr}`;

        // Create a hidden iframe
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.top = "-10000px";
        iframe.style.left = "-10000px";
        iframe.style.width = "210mm";
        iframe.style.height = "297mm";
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          document.body.removeChild(iframe);
          return;
        }

        // Clone the report content
        const reportClone = reportRef.current.cloneNode(true) as HTMLElement;

        // Convert canvas elements to images (for charts)
        const originalCanvases = reportRef.current.querySelectorAll("canvas");
        const clonedCanvases = reportClone.querySelectorAll("canvas");
        originalCanvases.forEach((originalCanvas, i) => {
          try {
            const img = document.createElement("img");
            img.src = originalCanvas.toDataURL("image/png");
            img.style.width = "100%";
            img.style.height = "auto";
            clonedCanvases[i]?.parentNode?.replaceChild(img, clonedCanvases[i]);
          } catch {
            // canvas tainted or empty, skip
          }
        });

        // Write the iframe document
        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${fileName}</title>
  <style>
    ${cssText}

    /* Print-specific overrides */
    @media print {
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }

    /* Base reset for print view */
    html, body {
      margin: 0;
      padding: 0;
      background: white !important;
      color: black !important;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    body {
      padding: 10mm;
    }

    /* Ensure dark mode classes don't apply in print */
    .dark { color-scheme: light !important; }

    /* Allow page breaks between sections */
    .space-y-6 > * {
      break-inside: avoid;
    }

    /* Ensure tables and cards don't break awkwardly */
    table, .rounded-xl, .rounded-lg, [class*="card"] {
      break-inside: avoid;
    }

    /* Override any background/text colors for readability */
    [class*="dark:"] {
      background-color: inherit !important;
    }

    /* Make borders visible in print */
    [class*="border"] {
      border-color: #e5e7eb !important;
    }

    /* Ensure text colors are dark for print */
    [class*="text-muted"] {
      color: #6b7280 !important;
    }

    /* Chart images */
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${reportClone.outerHTML}
</body>
</html>`);
        iframeDoc.close();

        // Wait for images and styles to load
        await new Promise<void>((resolve) => {
          const images = iframeDoc.querySelectorAll("img");
          if (images.length === 0) {
            setTimeout(resolve, 300);
            return;
          }
          let loaded = 0;
          const check = () => {
            loaded++;
            if (loaded >= images.length) resolve();
          };
          images.forEach((img) => {
            if (img.complete) {
              check();
            } else {
              img.onload = check;
              img.onerror = check;
            }
          });
          // Fallback timeout
          setTimeout(resolve, 3000);
        });

        // Trigger print on the iframe
        iframe.contentWindow?.print();

        // Clean up after a delay to let the print dialog finish
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
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
