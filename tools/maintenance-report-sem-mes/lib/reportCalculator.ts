// ============================================================
// REPORT CALCULATOR - Filters, deduplicates, and aggregates
// ============================================================
import type {
  LaborRecord,
  ReportAggregations,
  AssetSummary,
  OTTypeSummary,
  WorkerSummary,
  DateRange,
  PeriodType,
} from "../types";
import { parseMadridDate, isDateInRange } from "./dateUtils";
import { parseTiempoTotal } from "./timeParser";
import { transformWorkerName } from "./workerTransform";

/**
 * Deduplicate records by Informe de Mano de Obra + Orden de Trabajo.
 */
function deduplicateRecords(records: LaborRecord[]): LaborRecord[] {
  const seen = new Set<string>();
  return records.filter((r) => {
    const key = `${r.informeManoDeObra}|${r.ordenDeTrabajo}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function calculateReport(
  records: LaborRecord[],
  dateRange: DateRange,
  periodType: PeriodType
): ReportAggregations {
  // 1. Deduplicate
  const unique = deduplicateRecords(records);

  // 2. Filter by "Fecha de Fin" within dateRange
  const filtered = unique.filter((r) => {
    const fechaFin = parseMadridDate(r.fechaDeFin);
    if (!fechaFin) return false;
    return isDateInRange(fechaFin, dateRange.start, dateRange.end);
  });

  // 3. Enrich with transformed worker names and parsed hours
  const enriched = filtered.map((r) => ({
    ...r,
    workerName: transformWorkerName(r.trabajador, r.observacionesOT),
    hours: parseTiempoTotal(r.tiempoTotal),
  }));

  // 4. Totals
  const totalOTs = enriched.length;
  const uniqueOTs = new Set(enriched.map((r) => r.ordenDeTrabajo)).size;
  const totalHours = enriched.reduce((sum, r) => sum + r.hours, 0);

  // 5. Aggregate by Asset
  const assetMap = new Map<string, { hours: number; otSet: Set<string> }>();
  for (const r of enriched) {
    const key = r.activo || "(Sin activo)";
    const entry = assetMap.get(key) ?? { hours: 0, otSet: new Set() };
    entry.hours += r.hours;
    entry.otSet.add(r.ordenDeTrabajo);
    assetMap.set(key, entry);
  }
  const assets: AssetSummary[] = Array.from(assetMap.entries())
    .map(([activo, data]) => ({
      activo,
      totalHours: Math.round(data.hours * 100) / 100,
      otCount: data.otSet.size,
    }))
    .sort((a, b) => b.totalHours - a.totalHours);

  // 6. Aggregate by OT Type
  const typeMap = new Map<string, { hours: number; otSet: Set<string> }>();
  for (const r of enriched) {
    const key = r.tipoDeOT || "(Sin tipo)";
    const entry = typeMap.get(key) ?? { hours: 0, otSet: new Set() };
    entry.hours += r.hours;
    entry.otSet.add(r.ordenDeTrabajo);
    typeMap.set(key, entry);
  }
  const otTypes: OTTypeSummary[] = Array.from(typeMap.entries())
    .map(([tipoDeOT, data]) => ({
      tipoDeOT,
      otCount: data.otSet.size,
      totalHours: Math.round(data.hours * 100) / 100,
      avgHours:
        data.otSet.size > 0
          ? Math.round((data.hours / data.otSet.size) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.otCount - a.otCount);

  // 7. Aggregate by Worker (transformed names)
  const workerMap = new Map<string, { hours: number; otSet: Set<string> }>();
  for (const r of enriched) {
    const key = r.workerName;
    const entry = workerMap.get(key) ?? { hours: 0, otSet: new Set() };
    entry.hours += r.hours;
    entry.otSet.add(r.ordenDeTrabajo);
    workerMap.set(key, entry);
  }
  const workers: WorkerSummary[] = Array.from(workerMap.entries())
    .map(([worker, data]) => ({
      worker,
      otCount: data.otSet.size,
      totalHours: Math.round(data.hours * 100) / 100,
    }))
    .sort((a, b) => b.totalHours - a.totalHours);

  return {
    totalOTs,
    uniqueOTs,
    totalHours: Math.round(totalHours * 100) / 100,
    assets,
    otTypes,
    workers,
    periodType,
    dateRange,
    filteredRecords: filtered.length,
  };
}
