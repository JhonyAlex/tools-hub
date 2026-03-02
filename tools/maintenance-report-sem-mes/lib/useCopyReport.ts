// ============================================================
// COPY REPORT HOOK - Copies report as rich HTML for email
// Data-driven: builds HTML from aggregations, not DOM scraping
// ============================================================
import { useCallback, useState } from "react";
import type { ReportAggregations, AIReportContent } from "../types";
import { buildEmailFromData } from "./emailHtmlBuilder";

export function useCopyReport(
  reportRef: React.RefObject<HTMLDivElement | null>,
  aggregations: ReportAggregations | null,
  aiContent: AIReportContent | null
) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAll = useCallback(async () => {
    if (!aggregations) return;
    setCopying(true);
    try {
      const html = buildEmailFromData(aggregations, aiContent);

      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob(
        [reportRef.current?.innerText ?? ""],
        { type: "text/plain" }
      );

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
      const text = reportRef.current?.innerText ?? "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  }, [reportRef, aggregations, aiContent]);

  return { copyAll, copying, copied };
}
