// ============================================================
// REPORT CALCULATOR - Core business logic
// ============================================================
import type { OTRecord, ReportMetrics, LatePreventive, MiguelCheckResult } from "../types";
import {
  parseMadridDate,
  businessDaysBetween,
  getPreviousBusinessDay,
  isSameDay,
  formatDate,
} from "./dateUtils";

const LATE_PM_THRESHOLD_DAYS = 3;
const CURRENT_YEAR = new Date().getFullYear();

export function calculateMetrics(records: OTRecord[]): Omit<ReportMetrics, "aiAnalyzed" | "aiResults" | "badDescriptions" | "badObservaciones"> {
  const now = new Date();
  const yesterday = getPreviousBusinessDay(now);

  // 1. Preventivos pendientes (Estado = "Nuevo")
  const pendingPMs = records.filter((r) => r.estado.trim() === "Nuevo").length;

  // 2. Preventivos atrasados: Estado="Nuevo" + >3 business days since creation
  const latePreventivesList: LatePreventive[] = [];
  for (const r of records) {
    if (r.estado.trim() !== "Nuevo") continue;
    const created = parseMadridDate(r.fecha);
    if (!created) continue;
    const days = businessDaysBetween(created, now);
    if (days > LATE_PM_THRESHOLD_DAYS) {
      latePreventivesList.push({
        ordenDeTrabajo: r.ordenDeTrabajo,
        descripcion: r.descripcion,
        fecha: r.fecha,
        diasHabiles: days,
      });
    }
  }

  // Date range label for late PMs
  let latePMsDateRange: string | null = null;
  if (latePreventivesList.length > 0) {
    const dates = latePreventivesList
      .map((l) => parseMadridDate(l.fecha))
      .filter(Boolean) as Date[];
    if (dates.length > 0) {
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())));
      const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleString("es-ES", { month: "short" })}`;
      latePMsDateRange = min.getTime() === max.getTime() ? fmt(min) : `${fmt(min)} - ${fmt(max)}`;
    }
  }

  // 3. OT en Espera
  const waitingOTs = records.filter((r) =>
    r.estado.trim().toLowerCase().includes("espera")
  ).length;

  // 4. OT en curso
  const inProgressOTs = records.filter((r) =>
    r.estado.trim().toLowerCase().includes("curso") ||
    r.estado.trim().toLowerCase() === "en progreso"
  ).length;

  // 5. OT terminadas ayer (Fecha de Fin de SLA = previous business day)
  const completedYesterday = records.filter((r) => {
    const finDate = parseMadridDate(r.fechaDeFinDeSLA);
    if (!finDate) return false;
    return isSameDay(finDate, yesterday);
  }).length;

  // 6. Revisiones por Miguel (Observaciones contains "miguel", current year only)
  const currentYearRecords = records.filter((r) => {
    const d = parseMadridDate(r.fecha) ?? parseMadridDate(r.fechaDeInicioDeSLA);
    return d ? d.getFullYear() >= CURRENT_YEAR : false;
  });

  const miguelChecks: MiguelCheckResult[] = currentYearRecords.map((r) => ({
    ordenDeTrabajo: r.ordenDeTrabajo,
    descripcion: r.descripcion,
    observaciones: r.observaciones,
    hasMiguel: /miguel/i.test(r.observaciones),
  }));

  const miguelTotalReviewed = miguelChecks.filter((m) => m.hasMiguel).length;
  const miguelPendingList = miguelChecks.filter((m) => !m.hasMiguel);
  const miguelPendingCount = miguelPendingList.length;

  return {
    date: now.toISOString(),
    pendingPMs,
    latePMs: latePreventivesList.length,
    latePMsDateRange,
    waitingOTs,
    inProgressOTs,
    completedYesterday,
    completedYesterdayDate: formatDate(yesterday),
    miguelTotalReviewed,
    miguelPendingCount,
    miguelPendingList,
    latePreventivesList,
  };
}
