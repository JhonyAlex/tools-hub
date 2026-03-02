// ============================================================
// COPY REPORT HOOK - Captures report as image to clipboard
// ============================================================
import { useCallback, useState } from "react";

export function useCopyReport(
  reportRef: React.RefObject<HTMLDivElement | null>
) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAll = useCallback(async () => {
    if (!reportRef.current) return;
    setCopying(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch {
          const text = reportRef.current?.innerText ?? "";
          await navigator.clipboard.writeText(text);
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const text = reportRef.current?.innerText ?? "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  }, [reportRef]);

  return { copyAll, copying, copied };
}
