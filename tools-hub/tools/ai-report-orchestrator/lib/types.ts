export type ReportStatus = "processing" | "completed" | "error";

export type ReportPhase =
  | "queued"
  | "reading_documents"
  | "analyzing_data"
  | "generating_charts"
  | "drafting_report"
  | "completed"
  | "error";

export interface ReportConfig {
  scope: "summary" | "operational" | "strategic";
  detailLevel: "low" | "medium" | "high";
  language: "es" | "en";
  exportFormat: "docx" | "pdf" | "md";
}

export interface ReportFile {
  name: string;
  size: number;
  mimeType: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  status: ReportStatus;
  phase: ReportPhase;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends ReportSummary {
  config: ReportConfig;
  files: ReportFile[];
  content: string;
  changeLog: string[];
}
