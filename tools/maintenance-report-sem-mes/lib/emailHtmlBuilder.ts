// ============================================================
// EMAIL HTML BUILDER - Generates email-safe HTML from report data
// Data-driven approach: no DOM parsing, full control over output
// Compatible with Outlook, Gmail, Apple Mail
// ============================================================
import type {
  ReportAggregations,
  AIReportContent,
  AssetSummary,
  OTTypeSummary,
  WorkerSummary,
} from "../types";
import { formatHours } from "./timeParser";
import { formatDateRange } from "./dateUtils";

const FONT =
  "Segoe UI, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif";
const MAX_WIDTH = "700px";
const COLOR_TEXT = "#1a1a1a";
const COLOR_MUTED = "#6b7280";
const COLOR_BORDER = "#e5e7eb";
const COLOR_BG_LIGHT = "#f9fafb";

function hr() {
  return `<hr style="border:none;border-top:1px solid ${COLOR_BORDER};margin:24px 0;">`;
}

function heading(text: string, level: 2 | 3 = 2) {
  const size = level === 2 ? "18px" : "15px";
  return `<h${level} style="font-size:${size};font-weight:600;margin:0 0 12px 0;color:${COLOR_TEXT};font-family:${FONT};">${text}</h${level}>`;
}

function paragraph(text: string, style = "") {
  return `<p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:${COLOR_MUTED};font-family:${FONT};${style}">${text}</p>`;
}

function aiBlock(text: string) {
  return `<div style="margin:12px 0;padding:12px 16px;background:#faf5ff;border-left:3px solid #a855f7;border-radius:0 6px 6px 0;">
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b21a8;font-family:${FONT};">${text}</p>
  </div>`;
}

function statCard(label: string, value: string | number, color: string) {
  return `<div style="display:inline-block;vertical-align:top;width:140px;padding:12px 16px;margin:0 8px 8px 0;background:${COLOR_BG_LIGHT};border:1px solid ${COLOR_BORDER};border-radius:8px;border-top:3px solid ${color};">
    <span style="font-size:11px;color:${COLOR_MUTED};font-family:${FONT};text-transform:uppercase;letter-spacing:0.5px;">${label}</span><br/>
    <strong style="font-size:20px;color:${COLOR_TEXT};font-family:${FONT};">${value}</strong>
  </div>`;
}

function tableStart(headers: string[]) {
  const ths = headers
    .map(
      (h, i) =>
        `<th style="padding:8px 12px;text-align:${i === 0 ? "left" : "right"};font-weight:600;font-size:11px;color:${COLOR_MUTED};background:${COLOR_BG_LIGHT};border-bottom:2px solid ${COLOR_BORDER};font-family:${FONT};text-transform:uppercase;letter-spacing:0.3px;">${h}</th>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;font-family:${FONT};"><thead><tr>${ths}</tr></thead><tbody>`;
}

function tableRow(cells: (string | number)[], bold0 = true) {
  const tds = cells
    .map(
      (c, i) =>
        `<td style="padding:8px 12px;text-align:${i === 0 ? "left" : "right"};${i === 0 && bold0 ? "font-weight:500;" : ""}border-bottom:1px solid #f3f4f6;color:${COLOR_TEXT};font-family:${FONT};">${c}</td>`
    )
    .join("");
  return `<tr>${tds}</tr>`;
}

function tableEnd() {
  return `</tbody></table>`;
}

function bulletList(items: string[], color = "#22c55e") {
  const lis = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0;padding-left:8px;font-size:14px;line-height:1.6;color:${COLOR_TEXT};font-family:${FONT};list-style:none;">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle;"></span>${item}
    </li>`
    )
    .join("");
  return `<ul style="margin:8px 0;padding:0;">${lis}</ul>`;
}

// ─── Main builder ────────────────────────────────────────────

export function buildEmailFromData(
  agg: ReportAggregations,
  aiContent: AIReportContent | null
): string {
  const sections: string[] = [];

  // ── Header ──
  const periodLabel =
    agg.periodType === "semanal"
      ? "Semanal"
      : agg.periodType === "mensual"
        ? "Mensual"
        : "Personalizado";

  sections.push(`
    <div style="margin-bottom:20px;">
      ${heading("Reporte de Mantenimiento — Mano de Obra")}
      ${paragraph(`Período ${periodLabel}: ${formatDateRange(agg.dateRange.start, agg.dateRange.end)}`, "font-size:13px;color:#374151;")}
    </div>
  `);

  // ── Stats ──
  sections.push(`
    <div style="margin-bottom:8px;">
      ${statCard("OTs únicas", agg.uniqueOTs, "#3b82f6")}
      ${statCard("Registros", agg.filteredRecords, "#8b5cf6")}
      ${statCard("Horas totales", formatHours(agg.totalHours), "#f59e0b")}
      ${statCard("Período", periodLabel, "#22c55e")}
    </div>
  `);

  // ── Resumen Ejecutivo ──
  if (aiContent?.executiveSummary) {
    sections.push(hr());
    sections.push(heading("Resumen Ejecutivo", 3));
    sections.push(
      ...aiContent.executiveSummary
        .split("\n")
        .filter((l) => l.trim())
        .map((line) => paragraph(line))
    );
  }

  // ── Análisis por Activos ──
  if (agg.assets.length > 0) {
    sections.push(hr());
    sections.push(heading("Análisis por Activos", 3));
    sections.push(buildAssetsTable(agg.assets.slice(0, 10)));
    if (aiContent?.assetAnalysis) {
      sections.push(aiBlock(aiContent.assetAnalysis));
    }
  }

  // ── Análisis por Tipo de OT ──
  if (agg.otTypes.length > 0) {
    sections.push(hr());
    sections.push(heading("Análisis por Tipo de OT", 3));
    sections.push(buildOTTypesTable(agg.otTypes));
    if (aiContent?.otTypeAnalysis) {
      sections.push(aiBlock(aiContent.otTypeAnalysis));
    }
  }

  // ── Análisis por Trabajador ──
  if (agg.workers.length > 0) {
    sections.push(hr());
    sections.push(heading("Análisis por Trabajador", 3));
    sections.push(buildWorkersTable(agg.workers));
    if (aiContent?.workerAnalysis) {
      sections.push(aiBlock(aiContent.workerAnalysis));
    }
  }

  // ── Conclusiones ──
  if (aiContent?.conclusions && aiContent.conclusions.length > 0) {
    sections.push(hr());
    sections.push(heading("Hallazgos Clave", 3));
    sections.push(bulletList(aiContent.conclusions, "#22c55e"));
  }

  // ── Recomendaciones ──
  if (aiContent?.recommendations && aiContent.recommendations.length > 0) {
    sections.push(hr());
    sections.push(heading("Recomendaciones", 3));
    sections.push(bulletList(aiContent.recommendations, "#f59e0b"));
  }

  return `<div style="font-family:${FONT};font-size:14px;line-height:1.6;color:${COLOR_TEXT};max-width:${MAX_WIDTH};margin:0 auto;">${sections.join("\n")}</div>`;
}

// ─── Table builders ──────────────────────────────────────────

function buildAssetsTable(assets: AssetSummary[]): string {
  return (
    tableStart(["Activo", "Horas", "OTs", "Reg. M.O."]) +
    assets
      .map((a) =>
        tableRow([a.activo, formatHours(a.totalHours), a.otCount, a.recordCount])
      )
      .join("") +
    tableEnd()
  );
}

function buildOTTypesTable(otTypes: OTTypeSummary[]): string {
  return (
    tableStart(["Tipo de OT", "OTs", "Reg. M.O.", "Horas Totales", "Tiempo Medio"]) +
    otTypes
      .map((t) =>
        tableRow([
          t.tipoDeOT,
          t.otCount,
          t.recordCount,
          formatHours(t.totalHours),
          formatHours(t.avgHours),
        ])
      )
      .join("") +
    tableEnd()
  );
}

function buildWorkersTable(workers: WorkerSummary[]): string {
  return (
    tableStart(["Trabajador", "OTs", "Reg. M.O.", "Horas Totales"]) +
    workers
      .map((w) =>
        tableRow([w.worker, w.otCount, w.recordCount, formatHours(w.totalHours)])
      )
      .join("") +
    tableEnd()
  );
}
