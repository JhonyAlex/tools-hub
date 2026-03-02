// ============================================================
// MAINTENANCE REPORT TOOL - Type Definitions
// Pigmea Reporte Diario de Mantenimiento Value Keep
// ============================================================

export interface OTRecord {
  estado: string;
  ordenDeTrabajo: string;
  descripcion: string;
  fecha: string; // creation date
  tipoDeOT: string;
  tipoDeActivo: string;
  activo: string;
  taller: string;
  fechaDeFinEsperada: string;
  nivelDePrioridad: string;
  fechaPrevista: string;
  fechaDeFinDeSLA: string;
  fechaDeInicioDeSLA: string;
  descripcionPlan: string;
  observaciones: string;
  equipamiento2: string;
}

export interface AIAnalysisResult {
  ordenDeTrabajo: string;
  descripcionScore: "good" | "bad" | "unknown";
  descripcionIssue: string | null;
  observacionesScore: "good" | "bad" | "unknown";
  observacionesIssue: string | null;
}

export interface LatePreventive {
  ordenDeTrabajo: string;
  descripcion: string;
  fecha: string;
  diasHabiles: number;
}

export interface MiguelCheckResult {
  ordenDeTrabajo: string;
  descripcion: string;
  observaciones: string;
  hasMiguel: boolean;
}

export interface ReportMetrics {
  date: string; // ISO date of report generation
  pendingPMs: number;
  latePMs: number;
  latePMsDateRange: string | null;
  waitingOTs: number;
  inProgressOTs: number;
  completedYesterday: number;
  completedYesterdayDate: string;
  miguelTotalReviewed: number;
  miguelPendingCount: number;
  miguelPendingList: MiguelCheckResult[];
  aiAnalyzed: boolean;
  aiResults: AIAnalysisResult[];
  badDescriptions: number;
  badObservaciones: number;
  latePreventivesList: LatePreventive[];
}

export interface SavedReport {
  id: string;
  reportDate: string;
  csvFileName: string;
  createdAt: string;
  updatedAt: string;
  metrics: ReportMetrics;
  notes: string;
}
