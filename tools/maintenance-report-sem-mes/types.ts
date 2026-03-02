// ============================================================
// MAINTENANCE REPORT SEM-MES - Type Definitions
// Pigmea Reporte Semanal/Mensual de Mano de Obra
// ============================================================

export interface LaborRecord {
  informeManoDeObra: string;
  ordenDeTrabajo: string;
  fechaPrevista: string;
  fechaDeInicio: string;
  fechaDeFin: string;
  descripcion: string;
  tipoDeOT: string;
  tipoDeActivo: string;
  activo: string;
  taller: string;
  trabajador: string;
  tiempoTotal: string;
  observaciones: string;
  planDeMantenimiento: string;
  observacionesOT: string;
  observacionesPM: string;
  observacionesTareas: string;
  tarea: string;
  descripcionTareas: string;
}

export type PeriodType = "semanal" | "mensual" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AssetSummary {
  activo: string;
  totalHours: number;
  otCount: number;
  recordCount: number;
}

export interface OTTypeSummary {
  tipoDeOT: string;
  otCount: number;
  totalHours: number;
  avgHours: number;
  recordCount: number;
}

export interface WorkerSummary {
  worker: string;
  otCount: number;
  totalHours: number;
  recordCount: number;
}

export interface ReportAggregations {
  totalOTs: number;
  totalHours: number;
  uniqueOTs: number;
  assets: AssetSummary[];
  otTypes: OTTypeSummary[];
  workers: WorkerSummary[];
  periodType: PeriodType;
  dateRange: DateRange;
  filteredRecords: number;
}

export interface AIReportContent {
  executiveSummary: string;
  assetAnalysis: string;
  otTypeAnalysis: string;
  workerAnalysis: string;
  conclusions: string[];
  recommendations: string[];
}

export interface SemMesReportMetrics {
  generatedAt: string;
  periodType: PeriodType;
  dateRangeStart: string;
  dateRangeEnd: string;
  totalOTs: number;
  uniqueOTs: number;
  totalHours: number;
  assets: AssetSummary[];
  otTypes: OTTypeSummary[];
  workers: WorkerSummary[];
  aiContent: AIReportContent | null;
}

export interface SavedSemMesReport {
  id: string;
  periodType: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  csvFileName: string;
  createdAt: string;
  updatedAt: string;
  metrics: SemMesReportMetrics;
  notes: string;
}
